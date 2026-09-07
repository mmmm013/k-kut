-- 4PE production factory v1.
-- One DISCO STL mixed LT-PIX enters intake. VOCAL and INSTRO are derived stems,
-- never separately registered source tracks. Stable IIs are not regenerated.

create table public.gpm_4pe_staged_changes (
  id uuid primary key default gen_random_uuid(),
  disco_track_key text not null,
  authority_title text not null,
  operation text not null default 'UPSERT' check (operation in ('UPSERT','REPROCESS','DELETE')),
  source_locator jsonb not null default '{}'::jsonb,
  expected_mixed_sha256 text check (expected_mixed_sha256 is null or expected_mixed_sha256 ~ '^[a-f0-9]{64}$'),
  lyric_authority jsonb not null default '{}'::jsonb,
  lyric_authority_sha256 text check (lyric_authority_sha256 is null or lyric_authority_sha256 ~ '^[a-f0-9]{64}$'),
  requested_types text[] not null default array['KK']::text[],
  stage_state text not null default 'STAGED' check (stage_state in ('STAGED','SNAPSHOTTED','CANCELED')),
  staged_reason text,
  staged_by text not null default 'GPM_ADMIN',
  staged_at timestamptz not null default now(),
  snapshotted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(source_locator) = 'object'),
  check (jsonb_typeof(lyric_authority) = 'object'),
  check (cardinality(requested_types) > 0),
  check (requested_types <@ array['KK','mK','sK','KOMBO']::text[])
);

create unique index gpm_4pe_one_staged_change_per_disco_track
  on public.gpm_4pe_staged_changes (disco_track_key)
  where stage_state = 'STAGED';

create table public.gpm_4pe_runs (
  id uuid primary key default gen_random_uuid(),
  run_key text not null unique,
  trigger_kind text not null check (trigger_kind in ('SCHEDULED','MANUAL')),
  run_state text not null default 'DISPATCHED' check (run_state in ('DISPATCHED','RUNNING','COMPLETE','PARTIAL_HOLD','FAILED','EMPTY')),
  staged_item_count integer not null default 0 check (staged_item_count >= 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  measures jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gpm_4pe_run_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.gpm_4pe_runs(id) on delete restrict,
  staged_change_id uuid not null references public.gpm_4pe_staged_changes(id) on delete restrict,
  disco_track_key text not null,
  authority_title text not null,
  operation text not null check (operation in ('UPSERT','REPROCESS','DELETE')),
  source_snapshot jsonb not null,
  requested_types text[] not null,
  pipeline_state text not null check (pipeline_state in (
    'AWAITING_SOURCE_FETCH','AWAITING_ARCHIVE','PROCESSING',
    'AWAITING_STEM_SEPARATION','AWAITING_STRUCTURE_ANALYSIS',
    'AWAITING_LYRIC_PROSECUTION','AWAITING_KK_RENDER','AWAITING_TPR',
    'CATALOGED','ARCHIVED','HOLD','REJECTED'
  )),
  current_step text not null,
  claimed_by text,
  claimed_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  checkpoint jsonb not null default '{}'::jsonb,
  last_error jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(run_id, disco_track_key)
);

create index gpm_4pe_run_items_dispatch_idx
  on public.gpm_4pe_run_items (pipeline_state, created_at);

create table public.gpm_4pe_artifacts (
  id uuid primary key default gen_random_uuid(),
  run_item_id uuid not null references public.gpm_4pe_run_items(id) on delete restrict,
  parent_artifact_id uuid references public.gpm_4pe_artifacts(id) on delete restrict,
  artifact_role text not null check (artifact_role in (
    'MIXED_LT_PIX','VOCAL_STEM','INSTRO_STEM','IN_PIX_STRUCTURE',
    'BLK_MAP','TP_MAP','VOCAL_CC','RENDERED_II','PROOF'
  )),
  storage_bucket text,
  storage_path text,
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  byte_count bigint check (byte_count is null or byte_count >= 0),
  duration_sec numeric check (duration_sec is null or duration_sec >= 0),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(run_item_id, artifact_role, sha256)
);

create table public.gpm_4pe_ii_catalog (
  id uuid primary key default gen_random_uuid(),
  ii_key text not null unique,
  disco_track_key text not null,
  authority_title text not null,
  ii_type text not null check (ii_type in ('KK','mK','sK','KOMBO')),
  blk_key text not null,
  tp_key text not null,
  run_item_id uuid not null references public.gpm_4pe_run_items(id) on delete restrict,
  rendered_artifact_id uuid not null references public.gpm_4pe_artifacts(id) on delete restrict,
  definition_version text not null,
  definition_proof jsonb not null,
  lineage jsonb not null,
  start_sec numeric not null check (start_sec >= 0),
  end_sec numeric not null check (end_sec > start_sec),
  review_state text not null default 'PENDING_TPR' check (review_state in ('PENDING_TPR','APPROVED','TRIMMED','HOLD','REJECTED','ARCHIVED')),
  catalog_state text not null default 'STAGED' check (catalog_state in ('STAGED','ACTIVE','ARCHIVED')),
  supersedes_ii_id uuid references public.gpm_4pe_ii_catalog(id) on delete restrict,
  superseded_by_ii_id uuid references public.gpm_4pe_ii_catalog(id) on delete restrict,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  activated_at timestamptz,
  archived_at timestamptz,
  check (jsonb_typeof(definition_proof) = 'object'),
  check (jsonb_typeof(lineage) = 'object')
);

create unique index gpm_4pe_one_active_ii_version
  on public.gpm_4pe_ii_catalog (disco_track_key, ii_type, blk_key, tp_key)
  where catalog_state = 'ACTIVE';

create table public.gpm_4pe_events (
  id bigint generated always as identity primary key,
  run_id uuid references public.gpm_4pe_runs(id) on delete restrict,
  run_item_id uuid references public.gpm_4pe_run_items(id) on delete restrict,
  ii_id uuid references public.gpm_4pe_ii_catalog(id) on delete restrict,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.gpm_4pe_begin_next_run(p_trigger_kind text default 'SCHEDULED')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run_id uuid;
  v_count integer;
begin
  if p_trigger_kind not in ('SCHEDULED','MANUAL') then
    raise exception 'invalid trigger kind';
  end if;
  perform pg_advisory_xact_lock(hashtext('gpm_4pe_begin_next_run'));
  select count(*) into v_count
    from public.gpm_4pe_staged_changes where stage_state = 'STAGED';
  if v_count = 0 then return null; end if;

  insert into public.gpm_4pe_runs(run_key, trigger_kind, staged_item_count)
  values ('4PE-' || to_char(clock_timestamp() at time zone 'UTC', 'YYYYMMDD-HH24MISS-US'), p_trigger_kind, v_count)
  returning id into v_run_id;

  insert into public.gpm_4pe_run_items(
    run_id, staged_change_id, disco_track_key, authority_title, operation,
    source_snapshot, requested_types, pipeline_state, current_step
  )
  select v_run_id, id, disco_track_key, authority_title, operation,
    jsonb_build_object(
      'source_system','DISCO_STL', 'locator',source_locator,
      'expected_mixed_sha256',expected_mixed_sha256,
      'lyric_authority',lyric_authority,
      'lyric_authority_sha256',lyric_authority_sha256,
      'staged_at',staged_at
    ),
    requested_types,
    case when operation = 'DELETE' then 'AWAITING_ARCHIVE' else 'AWAITING_SOURCE_FETCH' end,
    case when operation = 'DELETE' then 'ARCHIVE' else 'SOURCE_FETCH' end
  from public.gpm_4pe_staged_changes where stage_state = 'STAGED'
  order by staged_at, id;

  update public.gpm_4pe_staged_changes
    set stage_state = 'SNAPSHOTTED', snapshotted_at = now(), updated_at = now()
    where stage_state = 'STAGED';
  insert into public.gpm_4pe_events(run_id, event_type, payload)
    values (v_run_id, 'RUN_SNAPSHOTTED', jsonb_build_object('item_count',v_count,'trigger_kind',p_trigger_kind));
  return v_run_id;
end;
$$;

create or replace function public.gpm_4pe_claim_next_item(p_worker_id text)
returns setof public.gpm_4pe_run_items
language plpgsql
security definer
set search_path = ''
as $$
begin
  if nullif(btrim(p_worker_id), '') is null then raise exception 'worker id required'; end if;
  return query
  with candidate as (
    select id from public.gpm_4pe_run_items
    where pipeline_state in (
      'AWAITING_SOURCE_FETCH','AWAITING_ARCHIVE','AWAITING_STEM_SEPARATION',
      'AWAITING_STRUCTURE_ANALYSIS','AWAITING_LYRIC_PROSECUTION','AWAITING_KK_RENDER'
    )
    order by created_at, id
    for update skip locked limit 1
  )
  update public.gpm_4pe_run_items i
    set pipeline_state = 'PROCESSING', claimed_by = p_worker_id, claimed_at = now(),
        attempts = attempts + 1, updated_at = now(),
        checkpoint = checkpoint || jsonb_build_object('claimed_step', current_step)
    from candidate c where i.id = c.id
  returning i.*;
end;
$$;

create or replace function public.gpm_4pe_complete_step(
  p_item_id uuid,
  p_completed_step text,
  p_next_state text,
  p_checkpoint jsonb default '{}'::jsonb,
  p_error jsonb default null,
  p_artifacts jsonb default '[]'::jsonb
)
returns public.gpm_4pe_run_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.gpm_4pe_run_items;
  v_expected_state text;
  v_next_step text;
begin
  select * into v_item from public.gpm_4pe_run_items where id = p_item_id for update;
  if not found or v_item.pipeline_state <> 'PROCESSING' then raise exception 'claimed processing item required'; end if;
  if v_item.checkpoint->>'claimed_step' <> p_completed_step then raise exception 'completed step does not match claim'; end if;
  if jsonb_typeof(coalesce(p_artifacts, '[]'::jsonb)) <> 'array' then raise exception 'artifacts must be an array'; end if;

  select expected_state, next_step into v_expected_state, v_next_step from (values
    ('SOURCE_FETCH','AWAITING_STEM_SEPARATION','STEM_SEPARATION'),
    ('STEM_SEPARATION','AWAITING_STRUCTURE_ANALYSIS','STRUCTURE_ANALYSIS'),
    ('STRUCTURE_ANALYSIS','AWAITING_LYRIC_PROSECUTION','LYRIC_PROSECUTION'),
    ('LYRIC_PROSECUTION','AWAITING_KK_RENDER','KK_RENDER'),
    ('KK_RENDER','AWAITING_TPR','TPR'),
    ('ARCHIVE','ARCHIVED','ARCHIVED')
  ) as transitions(completed_step, expected_state, next_step)
  where completed_step = p_completed_step;
  if v_expected_state is null or p_next_state <> v_expected_state then raise exception 'invalid 4PE step transition'; end if;

  if p_completed_step = 'SOURCE_FETCH' and not exists (
    select 1 from jsonb_array_elements(p_artifacts) a where a->>'artifact_role' = 'MIXED_LT_PIX'
  ) then raise exception 'mixed LT-PIX evidence required'; end if;
  if p_completed_step = 'STEM_SEPARATION' and not (
    exists (select 1 from jsonb_array_elements(p_artifacts) a where a->>'artifact_role' = 'VOCAL_STEM') and
    exists (select 1 from jsonb_array_elements(p_artifacts) a where a->>'artifact_role' = 'INSTRO_STEM')
  ) then raise exception 'VOCAL and INSTRO stem evidence required'; end if;
  if p_completed_step = 'STRUCTURE_ANALYSIS' and not exists (
    select 1 from jsonb_array_elements(p_artifacts) a where a->>'artifact_role' = 'IN_PIX_STRUCTURE'
  ) then raise exception 'IN-PIX structure evidence required'; end if;
  if p_completed_step = 'LYRIC_PROSECUTION' and not exists (
    select 1 from jsonb_array_elements(p_artifacts) a where a->>'artifact_role' = 'PROOF'
  ) then raise exception 'lyric prosecution proof required'; end if;
  if p_completed_step = 'KK_RENDER' and not exists (
    select 1 from jsonb_array_elements(p_artifacts) a where a->>'artifact_role' = 'RENDERED_II'
  ) then raise exception 'rendered KK evidence required'; end if;

  insert into public.gpm_4pe_artifacts(
    run_item_id, parent_artifact_id, artifact_role, storage_bucket, storage_path,
    sha256, byte_count, duration_sec, evidence
  )
  select p_item_id,
    nullif(a->>'parent_artifact_id','')::uuid,
    a->>'artifact_role', nullif(a->>'storage_bucket',''), nullif(a->>'storage_path',''),
    a->>'sha256', nullif(a->>'byte_count','')::bigint, nullif(a->>'duration_sec','')::numeric,
    coalesce(a->'evidence','{}'::jsonb)
  from jsonb_array_elements(coalesce(p_artifacts,'[]'::jsonb)) a;

  update public.gpm_4pe_run_items set
    pipeline_state = p_next_state, current_step = v_next_step,
    checkpoint = coalesce(p_checkpoint,'{}'::jsonb), last_error = p_error,
    claimed_by = null, claimed_at = null, updated_at = now()
  where id = p_item_id returning * into v_item;
  insert into public.gpm_4pe_events(run_id, run_item_id, event_type, payload)
    values (v_item.run_id, v_item.id, 'WORKER_STEP_COMPLETED',
      jsonb_build_object('completed_step',p_completed_step,'next_state',p_next_state,'artifact_count',jsonb_array_length(coalesce(p_artifacts,'[]'::jsonb))));
  return v_item;
end;
$$;

create or replace function public.gpm_4pe_record_tpr_decision(
  p_ii_key text,
  p_action text,
  p_corrected_end_sec numeric default null
)
returns public.gpm_4pe_ii_catalog
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.gpm_4pe_ii_catalog;
  v_old_id uuid;
begin
  if p_action not in ('APPROVE','TRIM','HOLD','REJECT') then raise exception 'invalid TPR action'; end if;
  select * into v_item from public.gpm_4pe_ii_catalog
    where ii_key = p_ii_key and review_state = 'PENDING_TPR' for update;
  if not found then raise exception 'pending II not found'; end if;
  if p_action = 'TRIM' and (p_corrected_end_sec is null or p_corrected_end_sec <= v_item.start_sec or p_corrected_end_sec > v_item.end_sec) then
    raise exception 'trim endpoint outside rendered II';
  end if;

  if p_action in ('APPROVE','TRIM') then
    select id into v_old_id from public.gpm_4pe_ii_catalog
      where disco_track_key = v_item.disco_track_key and ii_type = v_item.ii_type
        and blk_key = v_item.blk_key and tp_key = v_item.tp_key
        and catalog_state = 'ACTIVE' and id <> v_item.id
      for update;
    if v_old_id is not null then
      update public.gpm_4pe_ii_catalog set
        review_state = 'ARCHIVED', catalog_state = 'ARCHIVED', archived_at = now(), superseded_by_ii_id = v_item.id
      where id = v_old_id;
    end if;
    update public.gpm_4pe_ii_catalog set
      review_state = case when p_action = 'TRIM' then 'TRIMMED' else 'APPROVED' end,
      catalog_state = 'ACTIVE', end_sec = coalesce(p_corrected_end_sec, end_sec),
      supersedes_ii_id = v_old_id, reviewed_at = now(), activated_at = now()
    where id = v_item.id returning * into v_item;
  else
    update public.gpm_4pe_ii_catalog set
      review_state = case when p_action = 'HOLD' then 'HOLD' else 'REJECTED' end,
      reviewed_at = now()
    where id = v_item.id returning * into v_item;
  end if;
  insert into public.gpm_4pe_events(run_id, run_item_id, ii_id, event_type, payload)
    select run_id, v_item.run_item_id, v_item.id, 'TPR_' || p_action,
      jsonb_build_object('corrected_end_sec',p_corrected_end_sec,'archived_ii_id',v_old_id)
    from public.gpm_4pe_run_items where id = v_item.run_item_id;
  return v_item;
end;
$$;

alter table public.gpm_4pe_staged_changes enable row level security;
alter table public.gpm_4pe_runs enable row level security;
alter table public.gpm_4pe_run_items enable row level security;
alter table public.gpm_4pe_artifacts enable row level security;
alter table public.gpm_4pe_ii_catalog enable row level security;
alter table public.gpm_4pe_events enable row level security;

revoke all on public.gpm_4pe_staged_changes, public.gpm_4pe_runs,
  public.gpm_4pe_run_items, public.gpm_4pe_artifacts,
  public.gpm_4pe_ii_catalog, public.gpm_4pe_events from public, anon, authenticated;
grant all on public.gpm_4pe_staged_changes, public.gpm_4pe_runs,
  public.gpm_4pe_run_items, public.gpm_4pe_artifacts,
  public.gpm_4pe_ii_catalog, public.gpm_4pe_events to service_role;
grant usage, select on sequence public.gpm_4pe_events_id_seq to service_role;
revoke all on function public.gpm_4pe_begin_next_run(text) from public, anon, authenticated;
revoke all on function public.gpm_4pe_claim_next_item(text) from public, anon, authenticated;
revoke all on function public.gpm_4pe_complete_step(uuid,text,text,jsonb,jsonb,jsonb) from public, anon, authenticated;
revoke all on function public.gpm_4pe_record_tpr_decision(text,text,numeric) from public, anon, authenticated;
grant execute on function public.gpm_4pe_begin_next_run(text) to service_role;
grant execute on function public.gpm_4pe_claim_next_item(text) to service_role;
grant execute on function public.gpm_4pe_complete_step(uuid,text,text,jsonb,jsonb,jsonb) to service_role;
grant execute on function public.gpm_4pe_record_tpr_decision(text,text,numeric) to service_role;

-- The database scheduler only snapshots staged changes. It never regenerates stable IIs.
select cron.unschedule(jobid) from cron.job where jobname = 'gpm-4pe-next-run-12h';
select cron.schedule(
  'gpm-4pe-next-run-12h',
  '0 */12 * * *',
  $$select public.gpm_4pe_begin_next_run('SCHEDULED');$$
);
