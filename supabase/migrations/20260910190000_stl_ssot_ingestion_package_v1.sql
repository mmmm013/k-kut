-- Authoritative STL -> SSOT ingestion package with quarantine-first promotion and SSOT-only user publication views.
set lock_timeout = '5s';
set statement_timeout = '120s';

create table if not exists public.gpm_stl_playlists (
  id uuid primary key default gen_random_uuid(),
  source_import_id uuid not null references public.gpm_stl_playlist_imports(id) on delete restrict,
  source_name text not null,
  source_system text not null default 'STL',
  playlist_name text not null,
  mix_type text not null,
  lane text not null,
  snapshot_ts timestamptz not null,
  playlist_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source_import_id, playlist_name, mix_type, lane, snapshot_ts)
);

create index if not exists gpm_stl_playlists_snapshot_idx
  on public.gpm_stl_playlists(mix_type, lane, snapshot_ts desc);

create table if not exists public.gpm_stl_playlist_items (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.gpm_stl_playlists(id) on delete cascade,
  source_import_id uuid not null references public.gpm_stl_playlist_imports(id) on delete restrict,
  item_ordinal integer not null check (item_ordinal > 0),
  disco_track_id text not null,
  stl_id text not null,
  track_key text,
  track_name text not null,
  album text,
  artist text,
  isrc text,
  item_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (playlist_id, item_ordinal, stl_id)
);

create index if not exists gpm_stl_playlist_items_track_key_idx
  on public.gpm_stl_playlist_items(playlist_id, track_key);

create table if not exists public.gpm_stl_authoritative_lineage (
  id uuid primary key default gen_random_uuid(),
  source_system text not null default 'STL',
  mix_type text not null,
  lane text not null,
  track_key text not null,
  source_wav_id text not null,
  sb_object_path text not null,
  source_wav_url text not null,
  wav_sha256 text not null,
  kut_id text not null,
  subfamily_id text not null,
  mapping_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists gpm_stl_authoritative_lineage_exact_uq
  on public.gpm_stl_authoritative_lineage(
    source_system, mix_type, lane, track_key, source_wav_id, kut_id, subfamily_id, wav_sha256, sb_object_path
  );

create index if not exists gpm_stl_authoritative_lineage_lookup_idx
  on public.gpm_stl_authoritative_lineage(source_system, mix_type, lane, track_key);

create table if not exists public.gpm_stl_playlist_lineage (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.gpm_stl_playlists(id) on delete cascade,
  item_id uuid not null references public.gpm_stl_playlist_items(id) on delete cascade,
  item_ordinal integer not null,
  source_import_id uuid not null references public.gpm_stl_playlist_imports(id) on delete restrict,
  source_system text not null,
  mix_type text not null,
  lane text not null,
  track_key text not null,
  stl_id text not null,
  source_wav_id text not null,
  sb_object_path text not null,
  source_wav_url text not null,
  wav_sha256 text not null,
  kut_id text not null,
  subfamily_id text not null,
  lineage_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (playlist_id, item_id)
);

create index if not exists gpm_stl_playlist_lineage_playlist_idx
  on public.gpm_stl_playlist_lineage(playlist_id, kut_id);

create table if not exists public.gpm_stl_ingest_quarantine (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.gpm_stl_playlists(id) on delete cascade,
  item_id uuid not null references public.gpm_stl_playlist_items(id) on delete cascade,
  reason_code text not null check (
    reason_code in ('MISSING_TRACK_KEY', 'NO_WAV_MATCH', 'AMBIGUOUS_WAV_MATCH', 'DUP_REGISTRY', 'INCOMPLETE_LINEAGE')
  ),
  reason_detail text not null default '',
  diagnostic_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (playlist_id, item_id, reason_code)
);

create index if not exists gpm_stl_ingest_quarantine_reason_idx
  on public.gpm_stl_ingest_quarantine(playlist_id, reason_code);

create or replace function public.gpm_stl_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists trg_gpm_stl_playlist_items_touch on public.gpm_stl_playlist_items;
create trigger trg_gpm_stl_playlist_items_touch
before update on public.gpm_stl_playlist_items
for each row execute function public.gpm_stl_touch_updated_at();

drop trigger if exists trg_gpm_stl_authoritative_lineage_touch on public.gpm_stl_authoritative_lineage;
create trigger trg_gpm_stl_authoritative_lineage_touch
before update on public.gpm_stl_authoritative_lineage
for each row execute function public.gpm_stl_touch_updated_at();

drop trigger if exists trg_gpm_stl_playlist_lineage_touch on public.gpm_stl_playlist_lineage;
create trigger trg_gpm_stl_playlist_lineage_touch
before update on public.gpm_stl_playlist_lineage
for each row execute function public.gpm_stl_touch_updated_at();

drop trigger if exists trg_gpm_stl_ingest_quarantine_touch on public.gpm_stl_ingest_quarantine;
create trigger trg_gpm_stl_ingest_quarantine_touch
before update on public.gpm_stl_ingest_quarantine
for each row execute function public.gpm_stl_touch_updated_at();

create or replace function public.gpm_stl_reconcile_playlist_snapshot(p_playlist_id uuid)
returns table(metric text, total bigint)
language plpgsql
as $$
begin
  if not exists (select 1 from public.gpm_stl_playlists where id = p_playlist_id) then
    raise exception 'stl_playlist_missing: %', p_playlist_id;
  end if;

  delete from public.gpm_stl_playlist_lineage where playlist_id = p_playlist_id;
  delete from public.gpm_stl_ingest_quarantine where playlist_id = p_playlist_id;

  insert into public.gpm_stl_ingest_quarantine (playlist_id, item_id, reason_code, reason_detail, diagnostic_payload)
  select
    items.playlist_id,
    items.id,
    'MISSING_TRACK_KEY',
    'track_key is required before authoritative lineage can be matched',
    jsonb_build_object('stl_id', items.stl_id, 'track_name', items.track_name, 'item_ordinal', items.item_ordinal)
  from public.gpm_stl_playlist_items items
  where items.playlist_id = p_playlist_id
    and nullif(btrim(coalesce(items.track_key, '')), '') is null
  on conflict (playlist_id, item_id, reason_code) do update
  set reason_detail = excluded.reason_detail,
      diagnostic_payload = excluded.diagnostic_payload,
      updated_at = now();

  with playlist_context as (
    select id, source_system, mix_type, lane
    from public.gpm_stl_playlists
    where id = p_playlist_id
  ), candidate_counts as (
    select
      items.id as item_id,
      count(authoritative.id) as candidate_count
    from public.gpm_stl_playlist_items items
    join playlist_context ctx on ctx.id = items.playlist_id
    left join public.gpm_stl_authoritative_lineage authoritative
      on authoritative.track_key = items.track_key
     and authoritative.mix_type = ctx.mix_type
     and authoritative.lane = ctx.lane
     and authoritative.source_system = ctx.source_system
    where items.playlist_id = p_playlist_id
      and nullif(btrim(coalesce(items.track_key, '')), '') is not null
    group by items.id
  )
  insert into public.gpm_stl_ingest_quarantine (playlist_id, item_id, reason_code, reason_detail, diagnostic_payload)
  select
    p_playlist_id,
    candidate_counts.item_id,
    'NO_WAV_MATCH',
    'authoritative lineage row missing for track_key + mix_type + lane',
    jsonb_build_object('candidate_count', candidate_counts.candidate_count)
  from candidate_counts
  where candidate_counts.candidate_count = 0
  on conflict (playlist_id, item_id, reason_code) do update
  set reason_detail = excluded.reason_detail,
      diagnostic_payload = excluded.diagnostic_payload,
      updated_at = now();

  with playlist_context as (
    select id, source_system, mix_type, lane
    from public.gpm_stl_playlists
    where id = p_playlist_id
  ), candidate_counts as (
    select
      items.id as item_id,
      count(authoritative.id) as candidate_count
    from public.gpm_stl_playlist_items items
    join playlist_context ctx on ctx.id = items.playlist_id
    left join public.gpm_stl_authoritative_lineage authoritative
      on authoritative.track_key = items.track_key
     and authoritative.mix_type = ctx.mix_type
     and authoritative.lane = ctx.lane
     and authoritative.source_system = ctx.source_system
    where items.playlist_id = p_playlist_id
      and nullif(btrim(coalesce(items.track_key, '')), '') is not null
    group by items.id
  )
  insert into public.gpm_stl_ingest_quarantine (playlist_id, item_id, reason_code, reason_detail, diagnostic_payload)
  select
    p_playlist_id,
    candidate_counts.item_id,
    'AMBIGUOUS_WAV_MATCH',
    'more than one authoritative lineage row matched the item',
    jsonb_build_object('candidate_count', candidate_counts.candidate_count)
  from candidate_counts
  where candidate_counts.candidate_count > 1
  on conflict (playlist_id, item_id, reason_code) do update
  set reason_detail = excluded.reason_detail,
      diagnostic_payload = excluded.diagnostic_payload,
      updated_at = now();

  with playlist_context as (
    select id, source_import_id, source_system, mix_type, lane
    from public.gpm_stl_playlists
    where id = p_playlist_id
  ), exact_matches as (
    select
      items.playlist_id,
      items.id as item_id,
      items.item_ordinal,
      items.stl_id,
      items.track_key,
      ctx.source_import_id,
      ctx.source_system,
      ctx.mix_type,
      ctx.lane,
      authoritative.source_wav_id,
      authoritative.sb_object_path,
      authoritative.source_wav_url,
      authoritative.wav_sha256,
      authoritative.kut_id,
      authoritative.subfamily_id,
      authoritative.mapping_payload
    from public.gpm_stl_playlist_items items
    join playlist_context ctx on ctx.id = items.playlist_id
    join public.gpm_stl_authoritative_lineage authoritative
      on authoritative.track_key = items.track_key
     and authoritative.mix_type = ctx.mix_type
     and authoritative.lane = ctx.lane
     and authoritative.source_system = ctx.source_system
    where items.playlist_id = p_playlist_id
      and not exists (
        select 1
        from public.gpm_stl_ingest_quarantine quarantine
        where quarantine.playlist_id = items.playlist_id
          and quarantine.item_id = items.id
      )
  )
  insert into public.gpm_stl_ingest_quarantine (playlist_id, item_id, reason_code, reason_detail, diagnostic_payload)
  select
    exact_matches.playlist_id,
    exact_matches.item_id,
    'INCOMPLETE_LINEAGE',
    'authoritative lineage matched but required SSOT lineage fields were incomplete',
    jsonb_build_object(
      'source_wav_id', exact_matches.source_wav_id,
      'sb_object_path', exact_matches.sb_object_path,
      'source_wav_url', exact_matches.source_wav_url,
      'wav_sha256', exact_matches.wav_sha256,
      'kut_id', exact_matches.kut_id,
      'subfamily_id', exact_matches.subfamily_id
    )
  from exact_matches
  where nullif(btrim(coalesce(exact_matches.source_wav_id, '')), '') is null
     or nullif(btrim(coalesce(exact_matches.sb_object_path, '')), '') is null
     or nullif(btrim(coalesce(exact_matches.source_wav_url, '')), '') is null
     or nullif(btrim(coalesce(exact_matches.wav_sha256, '')), '') is null
     or nullif(btrim(coalesce(exact_matches.kut_id, '')), '') is null
     or nullif(btrim(coalesce(exact_matches.subfamily_id, '')), '') is null
  on conflict (playlist_id, item_id, reason_code) do update
  set reason_detail = excluded.reason_detail,
      diagnostic_payload = excluded.diagnostic_payload,
      updated_at = now();

  with playlist_context as (
    select id, source_import_id, source_system, mix_type, lane
    from public.gpm_stl_playlists
    where id = p_playlist_id
  ), exact_matches as (
    select
      items.playlist_id,
      items.id as item_id,
      items.item_ordinal,
      items.stl_id,
      items.track_key,
      ctx.source_import_id,
      ctx.source_system,
      ctx.mix_type,
      ctx.lane,
      authoritative.source_wav_id,
      authoritative.sb_object_path,
      authoritative.source_wav_url,
      authoritative.wav_sha256,
      authoritative.kut_id,
      authoritative.subfamily_id,
      authoritative.mapping_payload
    from public.gpm_stl_playlist_items items
    join playlist_context ctx on ctx.id = items.playlist_id
    join public.gpm_stl_authoritative_lineage authoritative
      on authoritative.track_key = items.track_key
     and authoritative.mix_type = ctx.mix_type
     and authoritative.lane = ctx.lane
     and authoritative.source_system = ctx.source_system
    where items.playlist_id = p_playlist_id
      and not exists (
        select 1
        from public.gpm_stl_ingest_quarantine quarantine
        where quarantine.playlist_id = items.playlist_id
          and quarantine.item_id = items.id
      )
  )
  insert into public.gpm_stl_playlist_lineage (
    playlist_id, item_id, item_ordinal, source_import_id, source_system, mix_type, lane, track_key, stl_id,
    source_wav_id, sb_object_path, source_wav_url, wav_sha256, kut_id, subfamily_id, lineage_payload
  )
  select
    exact_matches.playlist_id,
    exact_matches.item_id,
    exact_matches.item_ordinal,
    exact_matches.source_import_id,
    exact_matches.source_system,
    exact_matches.mix_type,
    exact_matches.lane,
    exact_matches.track_key,
    exact_matches.stl_id,
    exact_matches.source_wav_id,
    exact_matches.sb_object_path,
    exact_matches.source_wav_url,
    exact_matches.wav_sha256,
    exact_matches.kut_id,
    exact_matches.subfamily_id,
    exact_matches.mapping_payload
  from exact_matches
  on conflict (playlist_id, item_id) do update
  set item_ordinal = excluded.item_ordinal,
      source_import_id = excluded.source_import_id,
      source_system = excluded.source_system,
      mix_type = excluded.mix_type,
      lane = excluded.lane,
      track_key = excluded.track_key,
      stl_id = excluded.stl_id,
      source_wav_id = excluded.source_wav_id,
      sb_object_path = excluded.sb_object_path,
      source_wav_url = excluded.source_wav_url,
      wav_sha256 = excluded.wav_sha256,
      kut_id = excluded.kut_id,
      subfamily_id = excluded.subfamily_id,
      lineage_payload = excluded.lineage_payload,
      updated_at = now();

  with duplicate_kuts as (
    select kut_id
    from public.gpm_stl_playlist_lineage
    where playlist_id = p_playlist_id
    group by kut_id
    having count(*) > 1
  )
  insert into public.gpm_stl_ingest_quarantine (playlist_id, item_id, reason_code, reason_detail, diagnostic_payload)
  select
    lineage.playlist_id,
    lineage.item_id,
    'DUP_REGISTRY',
    'multiple resolved items mapped to the same kut_id inside the snapshot',
    jsonb_build_object('kut_id', lineage.kut_id, 'stl_id', lineage.stl_id, 'track_key', lineage.track_key)
  from public.gpm_stl_playlist_lineage lineage
  join duplicate_kuts dup on dup.kut_id = lineage.kut_id
  on conflict (playlist_id, item_id, reason_code) do update
  set reason_detail = excluded.reason_detail,
      diagnostic_payload = excluded.diagnostic_payload,
      updated_at = now();

  return query
  select 'staged_items'::text, count(*)::bigint
  from public.gpm_stl_playlist_items
  where playlist_id = p_playlist_id
  union all
  select 'resolved_lineage', count(*)::bigint
  from public.gpm_stl_playlist_lineage
  where playlist_id = p_playlist_id
  union all
  select 'quarantined_items', count(distinct item_id)::bigint
  from public.gpm_stl_ingest_quarantine
  where playlist_id = p_playlist_id
  union all
  select reason_code, count(*)::bigint
  from public.gpm_stl_ingest_quarantine
  where playlist_id = p_playlist_id
  group by reason_code
  order by 1;
end
$$;

create or replace function public.gpm_stl_promote_playlist_snapshot(p_playlist_id uuid)
returns table(metric text, total bigint)
language plpgsql
as $$
declare
  target_type text;
  promoted_count bigint := 0;
begin
  if to_regclass('public.ssot_audio_registry') is null then
    raise exception 'ssot_audio_registry_missing';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ssot_audio_registry'
      and column_name in ('kut_id', 'subfamily_id', 'track_key', 'source_system', 'sb_object_path', 'source_wav_url', 'wav_sha256', 'source_wav_id')
    group by table_schema, table_name
    having count(*) = 8
  ) then
    raise exception 'ssot_audio_registry_columns_missing';
  end if;

  select format_type(attributes.atttypid, attributes.atttypmod)
  into target_type
  from pg_attribute attributes
  where attributes.attrelid = 'public.ssot_audio_registry'::regclass
    and attributes.attname = 'source_wav_id'
    and not attributes.attisdropped;

  if target_type is null then
    raise exception 'ssot_audio_registry_source_wav_id_missing';
  end if;

  execute format(
    $sql$
      with promotable as (
        select lineage.*
        from public.gpm_stl_playlist_lineage lineage
        where lineage.playlist_id = $1
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
          )
      ), upserted as (
        insert into public.ssot_audio_registry (
          kut_id, subfamily_id, track_key, source_system, sb_object_path, source_wav_url, wav_sha256, source_wav_id
        )
        select
          promotable.kut_id,
          promotable.subfamily_id,
          promotable.track_key,
          promotable.source_system,
          promotable.sb_object_path,
          promotable.source_wav_url,
          promotable.wav_sha256,
          promotable.source_wav_id::%1$s
        from promotable
        on conflict (kut_id) do update
        set subfamily_id = excluded.subfamily_id,
            track_key = excluded.track_key,
            source_system = excluded.source_system,
            sb_object_path = excluded.sb_object_path,
            source_wav_url = excluded.source_wav_url,
            wav_sha256 = excluded.wav_sha256,
            source_wav_id = excluded.source_wav_id
        returning 1
      )
      select count(*)::bigint from upserted
    $sql$,
    target_type
  )
  using p_playlist_id
  into promoted_count;

  return query
  select 'promotable_rows'::text, count(*)::bigint
  from public.gpm_stl_playlist_lineage lineage
  where lineage.playlist_id = p_playlist_id
    and not exists (
      select 1
      from public.gpm_stl_ingest_quarantine quarantine
      where quarantine.playlist_id = lineage.playlist_id
        and quarantine.item_id = lineage.item_id
    )
  union all
  select 'promoted_to_ssot', promoted_count
  union all
  select 'blocked_by_quarantine', count(distinct item_id)::bigint
  from public.gpm_stl_ingest_quarantine
  where playlist_id = p_playlist_id
  order by 1;
end
$$;

create or replace function public.gpm_stl_refresh_user_publication_views()
returns table(view_name text, refreshed boolean)
language plpgsql
as $$
begin
  if to_regclass('public.ssot_audio_registry') is null then
    raise exception 'ssot_audio_registry_missing';
  end if;

  execute $view$
    create or replace view public.gpm_stl_ssot_ready_v1 as
    select
      ssot.kut_id,
      ssot.subfamily_id,
      ssot.track_key,
      ssot.source_system,
      ssot.sb_object_path,
      ssot.source_wav_url,
      ssot.wav_sha256,
      ssot.source_wav_id
    from public.ssot_audio_registry ssot
    where nullif(btrim(coalesce(ssot.sb_object_path, '')), '') is not null
      and nullif(btrim(coalesce(ssot.source_wav_url, '')), '') is not null
      and nullif(btrim(coalesce(ssot.wav_sha256, '')), '') is not null
      and ssot.source_wav_id is not null
      and nullif(btrim(coalesce(ssot.kut_id, '')), '') is not null
      and nullif(btrim(coalesce(ssot.subfamily_id, '')), '') is not null
  $view$;

  execute $view$
    create or replace view public.gpm_stl_user_ii_surface_v1 as
    select
      kut_id,
      subfamily_id,
      track_key,
      source_system,
      source_wav_url,
      wav_sha256,
      source_wav_id
    from public.gpm_stl_ssot_ready_v1
  $view$;

  execute $view$
    create or replace view public.gpm_stl_user_ci_surface_v1 as
    select
      kut_id,
      subfamily_id,
      track_key,
      source_system,
      sb_object_path,
      source_wav_url,
      wav_sha256,
      source_wav_id
    from public.gpm_stl_ssot_ready_v1
  $view$;

  return query
  values
    ('gpm_stl_ssot_ready_v1', true),
    ('gpm_stl_user_ii_surface_v1', true),
    ('gpm_stl_user_ci_surface_v1', true);
end
$$;

create or replace function public.gpm_stl_playlist_pipeline_report(p_playlist_id uuid)
returns table(metric text, total bigint)
language sql
as $$
  select 'staged_items'::text, count(*)::bigint
  from public.gpm_stl_playlist_items
  where playlist_id = p_playlist_id
  union all
  select 'resolved_lineage', count(*)::bigint
  from public.gpm_stl_playlist_lineage
  where playlist_id = p_playlist_id
  union all
  select 'quarantined_items', count(distinct item_id)::bigint
  from public.gpm_stl_ingest_quarantine
  where playlist_id = p_playlist_id
  union all
  select 'ssot_ready_rows', count(*)::bigint
  from public.gpm_stl_playlist_lineage lineage
  where playlist_id = p_playlist_id
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
    )
  order by 1
$$;

create or replace view public.gpm_stl_quarantine_reason_report_v1 as
select playlist_id, reason_code, count(*)::bigint as total
from public.gpm_stl_ingest_quarantine
group by playlist_id, reason_code;

alter table public.gpm_stl_playlists enable row level security;
alter table public.gpm_stl_playlist_items enable row level security;
alter table public.gpm_stl_authoritative_lineage enable row level security;
alter table public.gpm_stl_playlist_lineage enable row level security;
alter table public.gpm_stl_ingest_quarantine enable row level security;

revoke all on table
  public.gpm_stl_playlists,
  public.gpm_stl_playlist_items,
  public.gpm_stl_authoritative_lineage,
  public.gpm_stl_playlist_lineage,
  public.gpm_stl_ingest_quarantine
from public, anon, authenticated;

grant all on table
  public.gpm_stl_playlists,
  public.gpm_stl_playlist_items,
  public.gpm_stl_authoritative_lineage,
  public.gpm_stl_playlist_lineage,
  public.gpm_stl_ingest_quarantine
to service_role;

do $$
begin
  if to_regclass('public.ssot_audio_registry') is not null then
    perform * from public.gpm_stl_refresh_user_publication_views();
  end if;
end
$$;
