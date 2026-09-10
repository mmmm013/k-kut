alter table public.gpm_stl_track_memberships
  add column if not exists wav_url text,
  add column if not exists wav_url_state text not null default 'MISSING',
  add column if not exists staging_state text not null default 'ACTIVE',
  add column if not exists dup_reasons text[] not null default '{}'::text[];

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'gpm_stl_memberships_wav_url_state_check'
      and conrelid = 'public.gpm_stl_track_memberships'::regclass
  ) then
    alter table public.gpm_stl_track_memberships
      add constraint gpm_stl_memberships_wav_url_state_check
      check (wav_url_state in ('MISSING', 'PRESENT_UNVERIFIED', 'VERIFIED', 'INVALID'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'gpm_stl_memberships_staging_state_check'
      and conrelid = 'public.gpm_stl_track_memberships'::regclass
  ) then
    alter table public.gpm_stl_track_memberships
      add constraint gpm_stl_memberships_staging_state_check
      check (staging_state in ('ACTIVE', 'DUP'));
  end if;
end
$$;

update public.gpm_stl_track_memberships
set wav_url = nullif(btrim(coalesce(
      source_record ->> 'WAV URL',
      source_record ->> 'WAV URL File',
      source_record ->> 'WAV URL file',
      source_record ->> 'WAV'
    )), ''),
    wav_url_state = case
      when nullif(btrim(coalesce(
        source_record ->> 'WAV URL',
        source_record ->> 'WAV URL File',
        source_record ->> 'WAV URL file',
        source_record ->> 'WAV'
      )), '') is null then 'MISSING'
      else 'PRESENT_UNVERIFIED'
    end
where wav_url is null;

update public.gpm_stl_track_memberships m
set staging_state = 'ACTIVE',
    dup_reasons = '{}'::text[],
    conflict_state = 'CLEAR'
from public.gpm_stl_playlist_imports i
where i.id = m.source_import_id
  and i.is_current
  and i.inventory_lane in ('FULLMIX', 'INSTRO_ONLY');

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
    dup_reasons = array['DUP_TRACK_ID_REDUNDANT']::text[],
    conflict_state = 'QUARANTINED_CROSS_LIST'
from ranked r
where r.canonical_rank > 1
  and m.source_import_id = r.source_import_id
  and m.disco_track_id = r.disco_track_id;

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
    count(*) filter (where m.staging_state = 'ACTIVE' and m.wav_url_state = 'VERIFIED')::int as kkr_ready
  from public.gpm_stl_track_memberships m
  join public.gpm_stl_playlist_imports ci on ci.id = m.source_import_id
  where ci.is_current and ci.inventory_lane in ('FULLMIX', 'INSTRO_ONLY')
  group by m.source_import_id
) s
where i.id = s.source_import_id;

drop view if exists public.gpm_stl_kkr_ready_inventory_v1;
drop view if exists public.gpm_stl_dup_staging_v1;
drop view if exists public.gpm_stl_current_split_inventory_v2;

create view public.gpm_stl_current_split_inventory_v2
with (security_invoker = true)
as
select
  m.source_import_id,
  m.disco_track_id,
  m.inventory_lane,
  m.source_ordinal,
  m.track_name,
  m.album,
  m.artist,
  m.isrc,
  m.wav_url,
  m.wav_url_state,
  m.staging_state,
  m.dup_reasons,
  m.conflict_state,
  m.source_record,
  i.source_name,
  i.source_sha256,
  i.received_at
from public.gpm_stl_track_memberships m
join public.gpm_stl_playlist_imports i on i.id = m.source_import_id
where i.is_current
  and i.inventory_lane = m.inventory_lane
  and m.staging_state = 'ACTIVE';

create view public.gpm_stl_dup_staging_v1
with (security_invoker = true)
as
select
  m.source_import_id,
  m.disco_track_id,
  m.inventory_lane,
  m.source_ordinal,
  m.track_name,
  m.album,
  m.artist,
  m.isrc,
  m.wav_url,
  m.wav_url_state,
  m.dup_reasons,
  m.source_record,
  i.source_name,
  i.source_sha256,
  i.received_at
from public.gpm_stl_track_memberships m
join public.gpm_stl_playlist_imports i on i.id = m.source_import_id
where i.is_current
  and i.inventory_lane = m.inventory_lane
  and m.staging_state = 'DUP';

create view public.gpm_stl_kkr_ready_inventory_v1
with (security_invoker = true)
as
select *
from public.gpm_stl_current_split_inventory_v2
where wav_url_state = 'VERIFIED'
  and wav_url is not null;

revoke all on public.gpm_stl_current_split_inventory_v2,
  public.gpm_stl_dup_staging_v1,
  public.gpm_stl_kkr_ready_inventory_v1
from public, anon, authenticated;

grant select on public.gpm_stl_current_split_inventory_v2,
  public.gpm_stl_dup_staging_v1,
  public.gpm_stl_kkr_ready_inventory_v1
to service_role;