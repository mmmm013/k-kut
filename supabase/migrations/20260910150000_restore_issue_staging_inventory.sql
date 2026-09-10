-- Owner rule: set aside only known issue rows; keep every other split-inventory row moving.
update public.gpm_stl_track_memberships m
set staging_state = 'ACTIVE',
    dup_reasons = '{}'::text[],
    conflict_state = 'CLEAR'
from public.gpm_stl_playlist_imports i
where i.id = m.source_import_id
  and i.is_current
  and i.inventory_lane in ('FULLMIX', 'INSTRO_ONLY');

-- A FullMix row explicitly labeled as instrumental is a lane issue, not usable FullMix inventory.
update public.gpm_stl_track_memberships m
set staging_state = 'DUP',
    dup_reasons = array['WRONG_LANE_INSTRO_LABEL']::text[],
    conflict_state = 'QUARANTINED_LANE_LABEL_CONFLICT'
from public.gpm_stl_playlist_imports i
where i.id = m.source_import_id
  and i.is_current
  and m.inventory_lane = 'FULLMIX'
  and m.track_name ~* '(^|[^a-z])(instro|instrumental|no vocals?)([^a-z]|$)';

-- For an identical Track ID in both lanes, retain one canonical row and set aside only
-- the redundant occurrence. Instrumental-labeled IDs remain in INSTRO_ONLY; all others
-- remain in FullMix. Preserve any lane-issue reason already assigned.
with current_rows as (
  select m.*
  from public.gpm_stl_track_memberships m
  join public.gpm_stl_playlist_imports i on i.id = m.source_import_id
  where i.is_current
    and i.inventory_lane in ('FULLMIX', 'INSTRO_ONLY')
),
duplicate_ids as (
  select
    disco_track_id,
    bool_or(track_name ~* '(^|[^a-z])(instro|instrumental|no vocals?)([^a-z]|$)') as instrumental_named
  from current_rows
  group by disco_track_id
  having count(*) > 1
),
ranked as (
  select
    c.source_import_id,
    c.disco_track_id,
    row_number() over (
      partition by c.disco_track_id
      order by
        case
          when d.instrumental_named then case when c.inventory_lane = 'INSTRO_ONLY' then 0 else 1 end
          else case when c.inventory_lane = 'FULLMIX' then 0 else 1 end
        end,
        c.source_ordinal,
        c.source_import_id
    ) as canonical_rank
  from current_rows c
  join duplicate_ids d using (disco_track_id)
)
update public.gpm_stl_track_memberships m
set staging_state = 'DUP',
    dup_reasons = (
      select array_agg(distinct reason order by reason)
      from unnest(m.dup_reasons || array['DUP_TRACK_ID_REDUNDANT']::text[]) reason
    ),
    conflict_state = 'QUARANTINED_CROSS_LIST'
from ranked r
where r.canonical_rank > 1
  and m.source_import_id = r.source_import_id
  and m.disco_track_id = r.disco_track_id;

-- Keep the legacy private listening registry synchronized to the active current rows.
insert into public.gpm_stl_track_registry (
  disco_track_id,
  track_name,
  album,
  artist,
  isrc,
  classification,
  source_import_id,
  last_seen_at
)
select
  m.disco_track_id,
  m.track_name,
  m.album,
  m.artist,
  m.isrc,
  case
    when m.inventory_lane = 'FULLMIX' then 'VOCAL_LT_PIX_CANDIDATE'
    else 'IN_PIX_CANDIDATE'
  end,
  m.source_import_id,
  now()
from public.gpm_stl_track_memberships m
join public.gpm_stl_playlist_imports i on i.id = m.source_import_id
where i.is_current
  and m.staging_state = 'ACTIVE'
on conflict (disco_track_id) do update
set track_name = excluded.track_name,
    album = excluded.album,
    artist = excluded.artist,
    isrc = excluded.isrc,
    classification = excluded.classification,
    source_import_id = excluded.source_import_id,
    last_seen_at = excluded.last_seen_at;

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
      where m.staging_state = 'ACTIVE'
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
