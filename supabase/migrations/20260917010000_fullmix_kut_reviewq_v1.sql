-- FullMix-to-KUT review queue. Identity is import UUID + Disco Track ID; titles are display metadata only.
create table if not exists public.gpm_fullmix_kut_reviewq (
  id uuid primary key default gen_random_uuid(),
  fullmix_import_id uuid not null references public.gpm_stl_fullmix_imports(id) on delete restrict,
  disco_track_id text not null,
  source_row_number integer not null,
  source_row jsonb not null,
  candidate_kind text not null default 'FULLMIX_KUT',
  review_state text not null default 'READY_FOR_OWNER_REVIEW',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(fullmix_import_id, disco_track_id)
);

create or replace function public.gpm_stl_materialize_active_fullmix_kuts()
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_import uuid; v_count integer;
begin
  select id into v_import from gpm_stl_fullmix_imports where active = true;
  if v_import is null then raise exception 'no_active_fullmix_import'; end if;
  insert into gpm_fullmix_kut_reviewq(fullmix_import_id, disco_track_id, source_row_number, source_row)
  select import_id, disco_track_id, row_number, source_row
  from gpm_stl_fullmix_inventory
  where import_id = v_import and coalesce(disco_track_id, '') <> ''
  on conflict(fullmix_import_id, disco_track_id) do update set
    source_row_number = excluded.source_row_number,
    source_row = excluded.source_row,
    updated_at = now();
  get diagnostics v_count = row_count;
  return jsonb_build_object('fullmix_import_id', v_import, 'materialized', v_count);
end $$;

alter table public.gpm_fullmix_kut_reviewq enable row level security;
revoke all on public.gpm_fullmix_kut_reviewq from public, anon, authenticated;
grant all on public.gpm_fullmix_kut_reviewq to service_role;
revoke all on function public.gpm_stl_materialize_active_fullmix_kuts() from public, anon, authenticated;
grant execute on function public.gpm_stl_materialize_active_fullmix_kuts() to service_role;
