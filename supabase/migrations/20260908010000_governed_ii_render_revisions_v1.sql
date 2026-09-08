-- Private, append-only endpoint correction jobs. A TRIM never overwrites a source II.
create table if not exists public.gpm_ii_render_revisions (
  id uuid primary key default gen_random_uuid(),
  source_ii_key text not null,
  decision_id uuid not null,
  original_start_sec numeric not null,
  original_end_sec numeric not null,
  corrected_end_sec numeric not null,
  revision_state text not null default 'PENDING_RENDER',
  predecessor_state text not null default 'ACTIVE_UNCHANGED',
  rendered_object_path text,
  rendered_sha256 text,
  owner_approved_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint gpm_ii_revision_state check (revision_state in ('PENDING_RENDER','RENDERED_PENDING_OWNER_REVIEW','APPROVED_REPLACEMENT','ARCHIVED','HOLD','REJECTED')),
  constraint gpm_ii_revision_endpoint check (corrected_end_sec > original_start_sec)
);
alter table public.gpm_ii_render_revisions enable row level security;
revoke all on public.gpm_ii_render_revisions from public, anon, authenticated;
grant all on public.gpm_ii_render_revisions to service_role;
create unique index if not exists gpm_ii_one_pending_revision_idx on public.gpm_ii_render_revisions(source_ii_key) where revision_state in ('PENDING_RENDER','RENDERED_PENDING_OWNER_REVIEW');
