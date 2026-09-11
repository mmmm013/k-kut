begin;

-- The current split FullMix source list is the sole membership authority for
-- active FM/LT-PIX inventory. Preserve older registry rows as history, but do
-- not allow them to remain active after the source list changes.
with current_fullmix as (
  select disco_track_id
  from public.gpm_stl_current_split_inventory_v2
  where inventory_lane = 'FULLMIX'
)
update public.gpmc_4pe_fm_registry_ee r
set fm_state = 'RETIRED',
    updated_at = now()
where r.fm_state <> 'RETIRED'
  and not exists (
    select 1
    from current_fullmix c
    where c.disco_track_id = r.stl_track_id
  );

-- Add newly listed FullMix tracks and refresh identity metadata for existing
-- Track IDs. Audio fields are intentionally preserved for existing rows and
-- remain unresolved for new rows until an authentic WAV source is verified.
insert into public.gpmc_4pe_fm_registry_ee (
  stl_track_id,
  fm_key,
  track_title,
  artist,
  isrc,
  source_import_id,
  source_lane,
  source_authority,
  wav_url_state,
  fm_state,
  updated_at
)
select
  i.disco_track_id,
  'FM-' || i.disco_track_id,
  i.track_name,
  i.artist,
  i.isrc,
  i.source_import_id,
  'FULLMIX',
  'STL>ALL',
  'AWAITING_STL_ALL_URL',
  'ACTIVE',
  now()
from public.gpm_stl_current_split_inventory_v2 i
where i.inventory_lane = 'FULLMIX'
on conflict (stl_track_id) do update
set fm_key = excluded.fm_key,
    track_title = excluded.track_title,
    artist = excluded.artist,
    isrc = excluded.isrc,
    source_import_id = excluded.source_import_id,
    source_lane = excluded.source_lane,
    source_authority = excluded.source_authority,
    fm_state = 'ACTIVE',
    updated_at = now();

do $$
declare
  active_count integer;
  missing_count integer;
  obsolete_active_count integer;
begin
  select count(*)
  into active_count
  from public.gpmc_4pe_fm_registry_ee
  where fm_state = 'ACTIVE';

  select count(*)
  into missing_count
  from public.gpm_stl_current_split_inventory_v2 i
  left join public.gpmc_4pe_fm_registry_ee r
    on r.stl_track_id = i.disco_track_id
   and r.fm_state = 'ACTIVE'
  where i.inventory_lane = 'FULLMIX'
    and r.stl_track_id is null;

  select count(*)
  into obsolete_active_count
  from public.gpmc_4pe_fm_registry_ee r
  left join public.gpm_stl_current_split_inventory_v2 i
    on i.disco_track_id = r.stl_track_id
   and i.inventory_lane = 'FULLMIX'
  where r.fm_state = 'ACTIVE'
    and i.disco_track_id is null;

  if active_count <> 324 or missing_count <> 0 or obsolete_active_count <> 0 then
    raise exception
      'FM registry reconciliation failed: active=%, missing=%, obsolete_active=%',
      active_count, missing_count, obsolete_active_count;
  end if;
end
$$;

comment on table public.gpmc_4pe_fm_registry_ee is
  'Append-preserving FullMix/LT-PIX registry. ACTIVE membership follows the current GPMx STL FullMix source list exactly; audio requires separately verified authentic WAV authority.';

commit;
