-- GPM customer-package correction for pending orders.
-- REVIEW BRANCH ONLY: this migration is not applied by committing it.
-- HUG, TUG, and BUG are customer package names only.
-- The exact inventory_id continues to preserve the canonical II identity.

alter table public.gpm_h2_pending_orders
  drop constraint if exists gpm_h2_core_offer_code;

alter table public.gpm_h2_pending_orders
  add constraint gpm_h2_core_offer_code
  check (core_offer_code in ('hug', 'tug', 'bug'));

comment on column public.gpm_h2_pending_orders.core_offer_code is
  'Customer package code only: hug, tug, or bug. Never substitutes for inventory_id or canonical II identity.';
