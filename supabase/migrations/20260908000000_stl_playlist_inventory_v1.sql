-- Private STL playlist intake; import source and derived inventory stay service-role-only.
create table if not exists public.gpm_stl_playlist_imports (
 id uuid primary key default gen_random_uuid(), source_name text not null, source_sha256 text not null unique,
 received_at timestamptz not null default now(), totals jsonb not null default '{}'::jsonb
);
create table if not exists public.gpm_stl_track_registry (
 disco_track_id text primary key, track_name text not null, album text, artist text, isrc text,
 classification text not null check (classification in ('VOCAL_LT_PIX_CANDIDATE','IN_PIX_CANDIDATE','HOLD_RIGHTS_OR_MASTER_VERIFICATION')),
 source_import_id uuid not null references public.gpm_stl_playlist_imports(id) on delete restrict,
 first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now()
);
alter table public.gpm_stl_playlist_imports enable row level security;
alter table public.gpm_stl_track_registry enable row level security;
revoke all on public.gpm_stl_playlist_imports, public.gpm_stl_track_registry from public, anon, authenticated;
grant all on public.gpm_stl_playlist_imports, public.gpm_stl_track_registry to service_role;
