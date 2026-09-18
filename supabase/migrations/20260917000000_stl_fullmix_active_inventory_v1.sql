-- Private STL-FM authority. Every CSV cell is retained unchanged in source_row.
create table if not exists public.gpm_stl_fullmix_imports (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_sha256 text not null unique,
  imported_at timestamptz not null default now(),
  activated_at timestamptz,
  retired_at timestamptz,
  active boolean not null default false,
  totals jsonb not null default '{}'::jsonb
);
create unique index if not exists gpm_stl_fullmix_one_active_import
  on public.gpm_stl_fullmix_imports(active) where active;

create table if not exists public.gpm_stl_fullmix_inventory (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references public.gpm_stl_fullmix_imports(id) on delete restrict,
  row_number integer not null,
  disco_track_id text,
  original_download_url text,
  wav_url text,
  url_match text,
  playback_verification text,
  source_row jsonb not null,
  unique(import_id, row_number)
);

create or replace function public.gpm_stl_activate_fullmix_import(
  p_source_name text,
  p_source_sha256 text,
  p_totals jsonb,
  p_rows jsonb
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_import_id uuid; v_row_count integer;
begin
  if jsonb_typeof(p_rows) <> 'array' then raise exception 'fullmix_rows_must_be_array'; end if;
  update gpm_stl_fullmix_imports set active = false, retired_at = now() where active = true;
  insert into gpm_stl_fullmix_imports(source_name, source_sha256, totals, active, activated_at)
  values (p_source_name, p_source_sha256, p_totals, true, now())
  on conflict (source_sha256) do update
    set totals = excluded.totals, active = true, activated_at = now(), retired_at = null
  returning id into v_import_id;
  delete from gpm_stl_fullmix_inventory where import_id = v_import_id;
  insert into gpm_stl_fullmix_inventory(import_id, row_number, disco_track_id, original_download_url, wav_url, url_match, playback_verification, source_row)
  select v_import_id, ordinality::integer, row->>'Track ID', row->>'Original download URL', row->>'WAV URL', row->>'URL match', row->>'Playback verification', row
  from jsonb_array_elements(p_rows) with ordinality as input(row, ordinality);
  get diagnostics v_row_count = row_count;
  return jsonb_build_object('import_id', v_import_id, 'active', true, 'total', v_row_count);
end $$;

alter table public.gpm_stl_fullmix_imports enable row level security;
alter table public.gpm_stl_fullmix_inventory enable row level security;
revoke all on public.gpm_stl_fullmix_imports, public.gpm_stl_fullmix_inventory from public, anon, authenticated;
grant all on public.gpm_stl_fullmix_imports, public.gpm_stl_fullmix_inventory to service_role;
revoke all on function public.gpm_stl_activate_fullmix_import(text, text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.gpm_stl_activate_fullmix_import(text, text, jsonb, jsonb) to service_role;
