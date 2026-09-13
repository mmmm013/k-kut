begin;
create or replace view public.gpmx_saved_kut_review_inventory_v1
with (security_invoker = true) as
select a.source_table || ':' || a.source_record_id as record_key,
  a.title, a.parent_title, a.product_layer, a.inventory_state,
  a.source_table, a.source_record_id,
  d.trim_start_sec as capture_start_sec, d.trim_end_sec as capture_end_sec,
  d.storage_bucket, d.storage_object_path,
  o.id is not null as object_exists
from public.gpm_r4u_inventory_authority a
left join public.gpmc_kk_rendered_deployable_inventory_ee d
  on a.source_table = 'public.gpmc_kk_rendered_deployable_inventory_ee'
  and a.source_record_id = d.batch_item_id::text
left join storage.objects o
  on o.bucket_id = d.storage_bucket and o.name = d.storage_object_path;

create or replace view public.gpmx_saved_kut_review_decisions_v1
with (security_invoker = true) as
select id, ii_key, card_key, action, original_start_sec, original_end_sec,
  corrected_start_sec, corrected_end_sec, source_relation, evidence_state, created_at
from gpmx_backend.universal_kut_review_decision_ee;

revoke all on public.gpmx_saved_kut_review_inventory_v1, public.gpmx_saved_kut_review_decisions_v1 from public, anon, authenticated;
grant select on public.gpmx_saved_kut_review_inventory_v1, public.gpmx_saved_kut_review_decisions_v1 to service_role;
commit;
