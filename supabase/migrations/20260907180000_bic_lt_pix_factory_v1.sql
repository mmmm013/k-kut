-- Private BIC 4PE factory: one registered vocal LT-PIX + paired IN-PIX per run.
create table if not exists public.gpm_bic_lt_pix_registry (
  id uuid primary key default gen_random_uuid(),
  vocal_lt_pix_track_id text not null unique,
  paired_in_pix_track_id text not null unique,
  authority_title text not null,
  vocal_source_sha256 text not null check (vocal_source_sha256 ~ '^[a-f0-9]{64}$'),
  lyric_authority_sha256 text not null check (lyric_authority_sha256 ~ '^[a-f0-9]{64}$'),
  registry_state text not null default 'ACTIVE' check (registry_state in ('ACTIVE','HOLD','ARCHIVED')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (vocal_lt_pix_track_id <> paired_in_pix_track_id)
);
create table if not exists public.gpm_bic_factory_controls (
  singleton boolean primary key default true check (singleton),
  kk_enabled boolean not null default true,
  mk_enabled boolean not null default false,
  sk_enabled boolean not null default false,
  kombo_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.gpm_bic_factory_controls(singleton) values (true) on conflict (singleton) do nothing;
create table if not exists public.gpm_bic_factory_runs (
  id uuid primary key default gen_random_uuid(),
  vocal_lt_pix_track_id text not null references public.gpm_bic_lt_pix_registry(vocal_lt_pix_track_id) on delete restrict,
  requested_stage text not null check (requested_stage in ('KK','mK','sK','KOMBO')),
  run_key text not null unique,
  dmaic_state text not null default 'DEFINE' check (dmaic_state in ('DEFINE','MEASURE','ANALYZE','IMPROVE','CONTROL','HOLD','REJECTED')),
  measures jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.gpm_bic_ii_replacements (
  id uuid primary key default gen_random_uuid(),
  replacing_candidate_id uuid not null references public.gpm_bic_ii_candidates(id) on delete restrict,
  replaced_candidate_id uuid not null references public.gpm_bic_ii_candidates(id) on delete restrict,
  reason text not null, created_at timestamptz not null default now(),
  unique(replacing_candidate_id, replaced_candidate_id)
);
alter table public.gpm_bic_lt_pix_registry enable row level security;
alter table public.gpm_bic_factory_controls enable row level security;
alter table public.gpm_bic_factory_runs enable row level security;
alter table public.gpm_bic_ii_replacements enable row level security;
revoke all on public.gpm_bic_lt_pix_registry, public.gpm_bic_factory_controls, public.gpm_bic_factory_runs, public.gpm_bic_ii_replacements from public, anon, authenticated;
grant all on public.gpm_bic_lt_pix_registry, public.gpm_bic_factory_controls, public.gpm_bic_factory_runs, public.gpm_bic_ii_replacements to service_role;
