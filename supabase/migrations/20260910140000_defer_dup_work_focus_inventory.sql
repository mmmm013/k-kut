-- Owner direction: defer all duplicate work. Keep the complete split source inventory active.
update public.gpm_stl_track_memberships m
set staging_state = 'ACTIVE',
    dup_reasons = '{}'::text[],
    conflict_state = 'CLEAR'
from public.gpm_stl_playlist_imports i
where i.id = m.source_import_id
  and i.is_current
  and i.inventory_lane in ('FULLMIX', 'INSTRO_ONLY');

update public.gpm_stl_playlist_imports i
set totals = i.totals || jsonb_build_object(
  'rows', s.rows,
  'active_inventory', s.rows,
  'dup_staged', 0,
  'wav_present', s.wav_present,
  'wav_missing', s.wav_missing,
  'kkr_ready', s.kkr_ready
)
from (
  select
    m.source_import_id,
    count(*)::int as rows,
    count(*) filter (where m.wav_url_state in ('PRESENT_UNVERIFIED', 'VERIFIED'))::int as wav_present,
    count(*) filter (where m.wav_url_state = 'MISSING')::int as wav_missing,
    count(*) filter (where m.wav_url_state = 'VERIFIED')::int as kkr_ready
  from public.gpm_stl_track_memberships m
  join public.gpm_stl_playlist_imports ci on ci.id = m.source_import_id
  where ci.is_current and ci.inventory_lane in ('FULLMIX', 'INSTRO_ONLY')
  group by m.source_import_id
) s
where i.id = s.source_import_id;