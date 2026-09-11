-- The owner's current FullMix source list is authoritative for lane membership.
-- Never infer FullMix/INSTRO classification from title text.

update public.gpm_stl_track_memberships m
set staging_state = 'ACTIVE',
    dup_reasons = '{}'::text[],
    conflict_state = 'CLEAR'
from public.gpm_stl_playlist_imports i
where i.id = m.source_import_id
  and i.is_current
  and m.inventory_lane = 'FULLMIX';

-- For an exact Track ID repeated across the two current source lists, preserve
-- FullMix as the KUT-source authority and set aside only the redundant
-- INSTRO-ONLY occurrence for later reconciliation.
with repeated_ids as (
  select m.disco_track_id
  from public.gpm_stl_track_memberships m
  join public.gpm_stl_playlist_imports i on i.id = m.source_import_id
  where i.is_current
    and m.inventory_lane in ('FULLMIX', 'INSTRO_ONLY')
  group by m.disco_track_id
  having count(*) > 1
)
update public.gpm_stl_track_memberships m
set staging_state = 'DUP',
    dup_reasons = array['DUP_TRACK_ID_REDUNDANT']::text[],
    conflict_state = 'QUARANTINED_CROSS_LIST'
from public.gpm_stl_playlist_imports i,
     repeated_ids d
where i.id = m.source_import_id
  and i.is_current
  and m.inventory_lane = 'INSTRO_ONLY'
  and m.disco_track_id = d.disco_track_id;

update public.gpm_stl_playlist_imports i
set totals = i.totals || jsonb_build_object(
  'rows', s.rows,
  'active_inventory', s.active_inventory,
  'dup_staged', s.dup_staged,
  'wav_present', s.wav_present,
  'wav_missing', s.wav_missing,
  'kkr_ready', s.kkr_ready
)
from (
  select
    m.source_import_id,
    count(*)::int as rows,
    count(*) filter (where m.staging_state = 'ACTIVE')::int as active_inventory,
    count(*) filter (where m.staging_state = 'DUP')::int as dup_staged,
    count(*) filter (where m.wav_url_state in ('PRESENT_UNVERIFIED', 'VERIFIED'))::int as wav_present,
    count(*) filter (where m.wav_url_state = 'MISSING')::int as wav_missing,
    count(*) filter (
      where m.inventory_lane = 'FULLMIX'
        and m.staging_state = 'ACTIVE'
        and m.wav_url_state = 'VERIFIED'
        and m.wav_url is not null
    )::int as kkr_ready
  from public.gpm_stl_track_memberships m
  join public.gpm_stl_playlist_imports ci on ci.id = m.source_import_id
  where ci.is_current
    and ci.inventory_lane in ('FULLMIX', 'INSTRO_ONLY')
  group by m.source_import_id
) s
where i.id = s.source_import_id;

comment on view public.gpm_stl_current_split_inventory_v2 is
  'Current split GPMx inventory. Source-list membership is authoritative; title text never assigns a lane.';
