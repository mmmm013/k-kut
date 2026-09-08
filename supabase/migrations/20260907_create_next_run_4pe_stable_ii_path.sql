-- Next Run -> 4PE Stable II path (fail-closed, immutable control plane)
set lock_timeout = '5s';
set statement_timeout = '60s';

create table if not exists public.gpm_4pe_next_run_stage (
  id uuid primary key default gen_random_uuid(),
  control_version text not null default 'NEXT_RUN_4PE_STABLE_II_V1',
  run_key text not null,
  delta_key text not null,
  source_queue_id text not null,
  selected_hug_id text not null,
  selected_public_option_id text not null,
  staged_payload jsonb not null default '{}'::jsonb,
  staging_state text not null default 'STAGED',
  created_by text not null default 'system',
  created_at timestamptz not null default now(),
  constraint gpm_4pe_stage_state_chk check (staging_state in ('STAGED','APPROVAL_LINKED')),
  constraint gpm_4pe_stage_identity_chk check (char_length(selected_hug_id) > 0 and char_length(selected_public_option_id) > 0)
);

create table if not exists public.gpm_4pe_approval_linkage (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.gpm_4pe_next_run_stage(id) on delete restrict,
  approval_evidence_id text not null,
  approval_reference_id text not null,
  approved_by text not null,
  approved_at timestamptz not null default now(),
  evidence_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(stage_id)
);

create table if not exists public.gpm_4pe_stable_ii (
  id uuid primary key default gen_random_uuid(),
  control_version text not null default 'NEXT_RUN_4PE_STABLE_II_V1',
  stage_id uuid not null references public.gpm_4pe_next_run_stage(id) on delete restrict,
  approval_linkage_id uuid not null references public.gpm_4pe_approval_linkage(id) on delete restrict,
  run_key text not null,
  delta_key text not null,
  source_queue_id text not null,
  selected_hug_id text not null,
  selected_public_option_id text not null,
  predecessor_stable_ii_id uuid references public.gpm_4pe_stable_ii(id) on delete restrict,
  stable_state text not null default 'APPROVED',
  materialized_by text not null default 'system',
  materialized_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(stage_id),
  constraint gpm_4pe_stable_state_chk check (stable_state = 'APPROVED')
);

create table if not exists public.gpm_4pe_stable_ii_registry (
  id uuid primary key default gen_random_uuid(),
  stable_ii_id uuid not null references public.gpm_4pe_stable_ii(id) on delete restrict,
  selected_hug_id text not null,
  selected_public_option_id text not null,
  registry_state text not null,
  supersedes_registry_id uuid references public.gpm_4pe_stable_ii_registry(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint gpm_4pe_registry_state_chk check (registry_state in ('ACTIVE','SUPERSEDED'))
);

create unique index if not exists gpm_4pe_registry_active_public_idx
on public.gpm_4pe_stable_ii_registry(selected_public_option_id)
where registry_state = 'ACTIVE';

create unique index if not exists gpm_4pe_registry_active_hug_idx
on public.gpm_4pe_stable_ii_registry(selected_hug_id)
where registry_state = 'ACTIVE';

create table if not exists public.gpm_4pe_stable_ii_events (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid references public.gpm_4pe_next_run_stage(id) on delete restrict,
  stable_ii_id uuid references public.gpm_4pe_stable_ii(id) on delete restrict,
  registry_id uuid references public.gpm_4pe_stable_ii_registry(id) on delete restrict,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint gpm_4pe_event_type_chk check (
    event_type in (
      'NEXT_RUN_STAGED',
      'APPROVAL_LINKED',
      'PROMOTED_TO_STABLE_II',
      'REGISTRY_SUPERSEDED',
      'FAIL_CLOSED_OUTCOME'
    )
  )
);

create or replace function public.gpm_4pe_reject_updates_deletes()
returns trigger
language plpgsql
as $$
begin
  raise exception 'immutable_row_violation: % is append-only', tg_table_name;
end
$$;

drop trigger if exists trg_gpm_4pe_stage_no_update_delete on public.gpm_4pe_next_run_stage;
create trigger trg_gpm_4pe_stage_no_update_delete
before update or delete on public.gpm_4pe_next_run_stage
for each row execute function public.gpm_4pe_reject_updates_deletes();

drop trigger if exists trg_gpm_4pe_approval_no_update_delete on public.gpm_4pe_approval_linkage;
create trigger trg_gpm_4pe_approval_no_update_delete
before update or delete on public.gpm_4pe_approval_linkage
for each row execute function public.gpm_4pe_reject_updates_deletes();

drop trigger if exists trg_gpm_4pe_stable_no_update_delete on public.gpm_4pe_stable_ii;
create trigger trg_gpm_4pe_stable_no_update_delete
before update or delete on public.gpm_4pe_stable_ii
for each row execute function public.gpm_4pe_reject_updates_deletes();

drop trigger if exists trg_gpm_4pe_registry_no_update_delete on public.gpm_4pe_stable_ii_registry;
create trigger trg_gpm_4pe_registry_no_update_delete
before update or delete on public.gpm_4pe_stable_ii_registry
for each row execute function public.gpm_4pe_reject_updates_deletes();

drop trigger if exists trg_gpm_4pe_events_no_update_delete on public.gpm_4pe_stable_ii_events;
create trigger trg_gpm_4pe_events_no_update_delete
before update or delete on public.gpm_4pe_stable_ii_events
for each row execute function public.gpm_4pe_reject_updates_deletes();

create or replace function public.gpm_4pe_enforce_stable_insert()
returns trigger
language plpgsql
as $$
declare
  stage_row public.gpm_4pe_next_run_stage;
  linked_count integer;
begin
  select * into stage_row from public.gpm_4pe_next_run_stage where id = new.stage_id;

  if not found then
    raise exception 'stable_insert_blocked: stage record missing';
  end if;

  select count(*) into linked_count
  from public.gpm_4pe_approval_linkage
  where id = new.approval_linkage_id
    and stage_id = new.stage_id;

  if linked_count <> 1 then
    raise exception 'stable_insert_blocked: approval linkage missing';
  end if;

  return new;
end
$$;

drop trigger if exists trg_gpm_4pe_enforce_stable_insert on public.gpm_4pe_stable_ii;
create trigger trg_gpm_4pe_enforce_stable_insert
before insert on public.gpm_4pe_stable_ii
for each row execute function public.gpm_4pe_enforce_stable_insert();

create or replace function public.gpm_4pe_mark_stage_approval_linked()
returns trigger
language plpgsql
as $$
begin
  insert into public.gpm_4pe_stable_ii_events(stage_id, event_type, event_payload)
  values (
    new.stage_id,
    'APPROVAL_LINKED',
    jsonb_build_object(
      'approval_linkage_id', new.id,
      'approval_evidence_id', new.approval_evidence_id,
      'approval_reference_id', new.approval_reference_id,
      'approved_by', new.approved_by,
      'approved_at', new.approved_at
    )
  );

  return new;
end
$$;

drop trigger if exists trg_gpm_4pe_mark_stage_approval_linked on public.gpm_4pe_approval_linkage;
create trigger trg_gpm_4pe_mark_stage_approval_linked
after insert on public.gpm_4pe_approval_linkage
for each row
execute function public.gpm_4pe_mark_stage_approval_linked();

create or replace function public.gpm_4pe_require_stable_path(path_selected_public_option_id text)
returns uuid
language plpgsql
as $$
declare
  active_stable uuid;
begin
  select stable_ii_id
  into active_stable
  from public.gpm_4pe_stable_ii_registry
  where selected_public_option_id = path_selected_public_option_id
    and registry_state = 'ACTIVE'
  order by created_at desc
  limit 1;

  if active_stable is null then
    insert into public.gpm_4pe_stable_ii_events(event_type, event_payload)
    values (
      'FAIL_CLOSED_OUTCOME',
      jsonb_build_object(
        'pathway', 'production_consumption',
        'reason', 'stable_path_missing',
        'selected_public_option_id', path_selected_public_option_id
      )
    );
    raise exception 'stable_path_missing_fail_closed';
  end if;

  return active_stable;
end
$$;

alter table public.gpm_4pe_next_run_stage enable row level security;
alter table public.gpm_4pe_approval_linkage enable row level security;
alter table public.gpm_4pe_stable_ii enable row level security;
alter table public.gpm_4pe_stable_ii_registry enable row level security;
alter table public.gpm_4pe_stable_ii_events enable row level security;

revoke all on table
  public.gpm_4pe_next_run_stage,
  public.gpm_4pe_approval_linkage,
  public.gpm_4pe_stable_ii,
  public.gpm_4pe_stable_ii_registry,
  public.gpm_4pe_stable_ii_events
from public, anon, authenticated;

grant all on table
  public.gpm_4pe_next_run_stage,
  public.gpm_4pe_approval_linkage,
  public.gpm_4pe_stable_ii,
  public.gpm_4pe_stable_ii_registry,
  public.gpm_4pe_stable_ii_events
to service_role;

create index if not exists gpm_4pe_stage_run_idx
  on public.gpm_4pe_next_run_stage(run_key, created_at);
create index if not exists gpm_4pe_stable_run_idx
  on public.gpm_4pe_stable_ii(run_key, materialized_at);
create index if not exists gpm_4pe_events_stage_idx
  on public.gpm_4pe_stable_ii_events(stage_id, created_at);
