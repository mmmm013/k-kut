-- R4U intake/run control authority. Service-role only; no browser access.
create table if not exists public.gpm_r4u_intake_runs (
  id uuid primary key default gen_random_uuid(),
  control_version text not null default 'R4U_INTAKE_CONTROL_V1',
  source_track_id text not null unique,
  lt_pix_track_id text not null,
  in_pix_track_id text not null,
  source_audio_sha256 text not null,
  lyric_authority_sha256 text not null,
  lifecycle_state text not null default 'INTAKE',
  baseline_snapshot jsonb not null,
  evidence jsonb not null default '{}'::jsonb,
  batch_request jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gpm_r4u_intake_state check (lifecycle_state in ('INTAKE','EVIDENCE_COMPLETE','BATCH_READY','REVIEWING','R4U_APPROVED','HOLD','REJECTED')),
  constraint gpm_r4u_hashes check (source_audio_sha256 ~ '^[a-f0-9]{64}$' and lyric_authority_sha256 ~ '^[a-f0-9]{64}$')
);

create table if not exists public.gpm_r4u_run_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.gpm_r4u_intake_runs(id) on delete restrict,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.gpm_r4u_intake_runs enable row level security;
alter table public.gpm_r4u_run_events enable row level security;
revoke all on table public.gpm_r4u_intake_runs, public.gpm_r4u_run_events from public, anon, authenticated;
grant all on table public.gpm_r4u_intake_runs, public.gpm_r4u_run_events to service_role;
create index if not exists gpm_r4u_intake_runs_state_idx on public.gpm_r4u_intake_runs(lifecycle_state, updated_at);
create index if not exists gpm_r4u_run_events_run_idx on public.gpm_r4u_run_events(run_id, created_at);
