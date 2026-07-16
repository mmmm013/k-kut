-- GPM H2 pending-order authority.
-- Stores exact II, optional note, and BF attribution server-side before Stripe.
-- No anon/authenticated table access. Vercel server routes use service_role only.

create table if not exists public.gpm_h2_pending_orders (
  token text primary key,
  inventory_id text not null,
  personal_note text not null default '',
  bf_profile text not null,
  origin_domain text not null,
  public_product_name text not null,
  core_offer_code text not null default 'hug',
  status text not null default 'awaiting_payment',
  stripe_event_id text,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  paid_received_at timestamptz,
  constraint gpm_h2_token_format check (token ~ '^[a-f0-9]{32}$'),
  constraint gpm_h2_inventory_id_format check (inventory_id ~ '^[A-Za-z0-9_-]{1,200}$'),
  constraint gpm_h2_personal_note_length check (char_length(personal_note) <= 160),
  constraint gpm_h2_bf_profile_format check (bf_profile ~ '^[a-z0-9-]{1,60}$'),
  constraint gpm_h2_origin_domain_format check (origin_domain ~ '^[A-Za-z0-9.-]{1,253}$'),
  constraint gpm_h2_public_product_name_length check (
    char_length(public_product_name) between 1 and 120
  ),
  constraint gpm_h2_core_offer_code check (core_offer_code = 'hug'),
  constraint gpm_h2_status check (status in ('awaiting_payment', 'paid_received'))
);

alter table public.gpm_h2_pending_orders enable row level security;

revoke all on table public.gpm_h2_pending_orders from anon;
revoke all on table public.gpm_h2_pending_orders from authenticated;
grant all on table public.gpm_h2_pending_orders to service_role;

create index if not exists gpm_h2_pending_orders_status_expires_idx
  on public.gpm_h2_pending_orders (status, expires_at);

create unique index if not exists gpm_h2_pending_orders_stripe_event_idx
  on public.gpm_h2_pending_orders (stripe_event_id)
  where stripe_event_id is not null;

comment on table public.gpm_h2_pending_orders is
  'Server-only pending order authority for Stripe-safe H2 tokens. No public table access.';
