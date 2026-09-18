# STL → SSOT ingestion runbook

This package recovers the proven STL intake path already in this repo (`gpm_stl_playlist_imports` + `gpm_stl_track_registry`) and extends it into a deterministic, quarantine-first SSOT publication flow for the newest STL batch.

## What this package adds

- `gpm_stl_playlists` with required `mix_type`, `lane`, `snapshot_ts`, and `source_system`
- `gpm_stl_playlist_items` with the repo’s actual item fields (`stl_id`, `track_key`, `track_name`, `album`, `artist`, `isrc`) and **no guessed `sb_bucket` / `sb_object_path` columns**
- `gpm_stl_authoritative_lineage` as the only approved lineage source for SSOT promotion
- `gpm_stl_playlist_lineage` as the resolved per-snapshot lineage ledger
- `gpm_stl_ingest_quarantine` with required reason codes:
  - `MISSING_TRACK_KEY`
  - `NO_WAV_MATCH`
  - `AMBIGUOUS_WAV_MATCH`
  - `DUP_REGISTRY`
  - `INCOMPLETE_LINEAGE`
- SSOT-only publication views:
  - `gpm_stl_ssot_ready_v1`
  - `gpm_stl_user_ii_surface_v1`
  - `gpm_stl_user_ci_surface_v1`

## Prerequisites

1. Apply Supabase migrations, including:
   - `/home/runner/work/k-kut/k-kut/supabase/migrations/20260908000000_stl_playlist_inventory_v1.sql`
   - `/home/runner/work/k-kut/k-kut/supabase/migrations/20260910190000_stl_ssot_ingestion_package_v1.sql`
2. Prepare the newest STL CSV locally.
3. Prepare authoritative lineage rows before promotion. Every promotable lineage row must have:
   - `sb_object_path`
   - `source_wav_url`
   - `wav_sha256`
   - `source_wav_id`
   - `kut_id`
   - `subfamily_id`
4. Do **not** fabricate `source_wav_url`. Populate `gpm_stl_authoritative_lineage.source_wav_url` only from an approved source column or approved URL construction rule already governed outside this package.

## Exact run order

### 1) Generate the deterministic SQL package for the newest STL batch

```bash
cd /home/runner/work/k-kut/k-kut
node scripts/build-stl-ssot-ingestion-package.mjs \
  --csv /absolute/path/to/newest-stl.csv \
  --output /tmp/newest-stl-ssot-package.sql \
  --source-name "Newest STL Batch.csv" \
  --playlist-name "Newest STL Batch" \
  --mix-type FM_LT_PIX \
  --lane FM_LT_PIX \
  --snapshot-ts 2026-09-10T18:47:00Z \
  --source-system STL
```

This single SQL package performs:

1. snapshot import/upsert into `gpm_stl_playlist_imports`
2. playlist snapshot creation in `gpm_stl_playlists`
3. item staging/load into `gpm_stl_playlist_items`
4. reconcile + quarantine through `gpm_stl_reconcile_playlist_snapshot(...)`
5. guarded SSOT promotion through `gpm_stl_promote_playlist_snapshot(...)`
6. II/CI publication view refresh through `gpm_stl_refresh_user_publication_views()`
7. totals + quarantine reason reporting

### 2) Run the generated SQL package

Run `/tmp/newest-stl-ssot-package.sql` in Supabase SQL Editor or your approved Postgres execution path.

### 3) Seed or refresh authoritative lineage before promotion reruns

Use only approved lineage inserts/upserts. Example shape:

```sql
insert into public.gpm_stl_authoritative_lineage (
  source_system, mix_type, lane, track_key, source_wav_id, sb_object_path, source_wav_url, wav_sha256, kut_id, subfamily_id, mapping_payload
)
values (
  'STL',
  'FM_LT_PIX',
  'FM_LT_PIX',
  'TRACK_KEY_HERE',
  'SOURCE_WAV_ID_HERE',
  'tracks/path/to/file.wav',
  'https://approved.example/storage/v1/object/public/tracks/path/to/file.wav',
  'sha256_here',
  'KK_HERE',
  'SK_HERE',
  '{}'::jsonb
)
on conflict (
  source_system, mix_type, lane, track_key, source_wav_id, kut_id, subfamily_id, wav_sha256, sb_object_path
) do update
set source_wav_url = excluded.source_wav_url,
    mapping_payload = excluded.mapping_payload,
    updated_at = now();
```

After updating authoritative lineage, rerun only the reconcile/promote steps for the snapshot:

```sql
select * from public.gpm_stl_reconcile_playlist_snapshot('<playlist_uuid>');
select * from public.gpm_stl_promote_playlist_snapshot('<playlist_uuid>');
select * from public.gpm_stl_refresh_user_publication_views();
```

## Verification queries

### Snapshot totals

```sql
select * from public.gpm_stl_playlist_pipeline_report('<playlist_uuid>');
```

### Quarantine reason breakdown

```sql
select reason_code, total
from public.gpm_stl_quarantine_reason_report_v1
where playlist_id = '<playlist_uuid>'
order by reason_code;
```

### Promotable rows are lineage-complete only

```sql
select count(*) as promotable_rows
from public.gpm_stl_playlist_lineage lineage
where lineage.playlist_id = '<playlist_uuid>'
  and nullif(btrim(coalesce(lineage.sb_object_path, '')), '') is not null
  and nullif(btrim(coalesce(lineage.source_wav_url, '')), '') is not null
  and nullif(btrim(coalesce(lineage.wav_sha256, '')), '') is not null
  and nullif(btrim(coalesce(lineage.source_wav_id, '')), '') is not null
  and nullif(btrim(coalesce(lineage.kut_id, '')), '') is not null
  and nullif(btrim(coalesce(lineage.subfamily_id, '')), '') is not null
  and not exists (
    select 1
    from public.gpm_stl_ingest_quarantine quarantine
    where quarantine.playlist_id = lineage.playlist_id
      and quarantine.item_id = lineage.item_id
  );
```

### II / CI publication views read only SSOT-ready rows

```sql
select count(*) as ii_rows from public.gpm_stl_user_ii_surface_v1;
select count(*) as ci_rows from public.gpm_stl_user_ci_surface_v1;
select count(*) as ssot_ready_rows from public.gpm_stl_ssot_ready_v1;
```

## Rollback / recovery

- The package is idempotent:
  - imports use `on conflict`
  - playlist snapshots use `on conflict`
  - items use `on conflict`
  - authoritative lineage uses `on conflict`
  - SSOT promotion uses `on conflict (kut_id) do update`
- Reconcile is deterministic for a playlist snapshot: it clears and rebuilds only snapshot-scoped `gpm_stl_playlist_lineage` and `gpm_stl_ingest_quarantine`.
- If a newest-batch run must be replayed, reuse the same `snapshot_ts`, `mix_type`, `lane`, and source file so the same snapshot row is updated instead of duplicated.
- If authoritative lineage changes, rerun reconcile + promote for the existing playlist UUID instead of creating guessed replacement rows.
