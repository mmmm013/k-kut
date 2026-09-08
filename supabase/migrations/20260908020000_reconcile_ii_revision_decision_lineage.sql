-- Reconcile deployments that applied 20260908010000 before the decision lineage fix.
-- Fail closed if the UUID-shaped table unexpectedly contains rows.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'gpm_ii_render_revisions'
      and column_name = 'decision_id'
      and data_type = 'uuid'
  ) then
    if exists (select 1 from public.gpm_ii_render_revisions) then
      raise exception 'Cannot convert populated UUID decision lineage; manual reconciliation required';
    end if;

    alter table public.gpm_ii_render_revisions
      alter column decision_id type bigint using null;
  end if;
end
$$;

alter table public.gpm_ii_render_revisions
  add column if not exists source_sha256 text,
  add column if not exists work_item_ids text[] not null default '{}'::text[],
  add column if not exists owner_listening_verified boolean not null default false,
  add column if not exists authority_state text;

alter table public.gpm_ii_render_revisions
  drop constraint if exists gpm_ii_render_revisions_decision_id_fkey;

alter table public.gpm_ii_render_revisions
  add constraint gpm_ii_render_revisions_decision_id_fkey
  foreign key (decision_id)
  references gpmx_backend.universal_kut_review_decision_ee(id)
  on delete restrict;

alter table public.gpm_ii_render_revisions
  drop constraint if exists gpm_ii_revision_owner_authority;

alter table public.gpm_ii_render_revisions
  add constraint gpm_ii_revision_owner_authority check (
    revision_state not in (
      'PENDING_RENDER',
      'RENDERED_PENDING_OWNER_REVIEW',
      'APPROVED_REPLACEMENT'
    )
    or (
      source_sha256 is not null
      and owner_listening_verified = true
      and authority_state = 'OWNER_CONFIRMED_LAST_VOCAL_NOTE_END'
      and cardinality(work_item_ids) > 0
    )
  );
