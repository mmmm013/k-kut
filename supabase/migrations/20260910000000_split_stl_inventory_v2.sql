-- Preserve FullMix and INSTRO-ONLY as separate, append-only GPMx source inventories.
alter table public.gpm_stl_playlist_imports
  add column if not exists inventory_lane text not null default 'LEGACY_COMBINED',
  add column if not exists is_current boolean not null default false,
  add column if not exists source_row_count integer;

alter table public.gpm_stl_playlist_imports
  drop constraint if exists gpm_stl_playlist_imports_inventory_lane_check;
alter table public.gpm_stl_playlist_imports
  add constraint gpm_stl_playlist_imports_inventory_lane_check
  check (inventory_lane in ('LEGACY_COMBINED', 'FULLMIX', 'INSTRO_ONLY'));

create unique index if not exists gpm_stl_one_current_import_per_lane
  on public.gpm_stl_playlist_imports (inventory_lane)
  where is_current;

create table if not exists public.gpm_stl_track_memberships (
  source_import_id uuid not null references public.gpm_stl_playlist_imports(id) on delete restrict,
  disco_track_id text not null,
  inventory_lane text not null check (inventory_lane in ('FULLMIX', 'INSTRO_ONLY')),
  source_ordinal integer not null check (source_ordinal > 0),
  track_name text not null,
  album text,
  artist text,
  isrc text,
  conflict_state text not null default 'CLEAR'
    check (conflict_state in ('CLEAR', 'QUARANTINED_CROSS_LIST', 'QUARANTINED_LANE_LABEL_CONFLICT')),
  source_record jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (source_import_id, disco_track_id)
);

create index if not exists gpm_stl_track_memberships_track_id_idx
  on public.gpm_stl_track_memberships (disco_track_id);
create index if not exists gpm_stl_track_memberships_lane_state_idx
  on public.gpm_stl_track_memberships (inventory_lane, conflict_state);

alter table public.gpm_stl_track_memberships enable row level security;
revoke all on public.gpm_stl_track_memberships from public, anon, authenticated;
grant all on public.gpm_stl_track_memberships to service_role;

create or replace view public.gpm_stl_current_split_inventory_v2
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
  m.conflict_state,
  m.source_record,
  i.source_name,
  i.source_sha256,
  i.received_at
from public.gpm_stl_track_memberships m
join public.gpm_stl_playlist_imports i on i.id = m.source_import_id
where i.is_current and i.inventory_lane = m.inventory_lane;

revoke all on public.gpm_stl_current_split_inventory_v2 from public, anon, authenticated;
grant select on public.gpm_stl_current_split_inventory_v2 to service_role;

comment on table public.gpm_stl_track_memberships is
  'Append-only membership rows for separate FullMix and INSTRO-ONLY GPMx playlist imports. Source lane, not title guessing, determines inventory class.';
comment on column public.gpm_stl_track_memberships.conflict_state is
  'CLEAR rows are usable inventory. Quarantined rows remain preserved but are excluded from operational queues until owner correction.';
