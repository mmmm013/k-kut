-- BIC II control plane. Private, service-role-only provenance and reviewer inventory.
create table if not exists public.gpm_bic_ii_candidates (
  id uuid primary key default gen_random_uuid(),
  candidate_key text not null unique,
  lt_pix_track_id text not null,
  in_pix_track_id text not null,
  source_audio_sha256 text not null check (source_audio_sha256 ~ '^[a-f0-9]{64}$'),
  ii_type text not null check (ii_type in ('KK','sK','mK')),
  authority_title text not null,
  blk_key text not null,
  start_sec numeric not null check (start_sec >= 0),
  end_sec numeric not null check (end_sec > start_sec),
  evidence jsonb not null,
  definition_proof jsonb not null,
  rendering jsonb not null,
  dmaic_state text not null default 'MEASURE' check (dmaic_state in ('DEFINE','MEASURE','ANALYZE','IMPROVE','CONTROL','HOLD','REJECTED')),
  reviewer_state text not null default 'HOLD' check (reviewer_state in ('PENDING_GREGORY_REVIEW','OWNER_APPROVED','OWNER_TRIMMED','OWNER_HELD','OWNER_REJECTED','HOLD')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (lt_pix_track_id <> in_pix_track_id)
);
create table if not exists public.gpm_bic_ii_events (
  id uuid primary key default gen_random_uuid(), candidate_id uuid not null references public.gpm_bic_ii_candidates(id) on delete restrict,
  stage text not null, outcome text not null, measures jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
alter table public.gpm_bic_ii_candidates enable row level security;
alter table public.gpm_bic_ii_events enable row level security;
revoke all on public.gpm_bic_ii_candidates, public.gpm_bic_ii_events from public, anon, authenticated;
grant all on public.gpm_bic_ii_candidates, public.gpm_bic_ii_events to service_role;
create index if not exists gpm_bic_ii_review_idx on public.gpm_bic_ii_candidates(reviewer_state, dmaic_state, updated_at);
