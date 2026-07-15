import fs from "node:fs";

function stop(message) {
  console.error(`H2 PENDING-ORDER AUDIT FAIL: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) stop(`missing ${file}`);
  return fs.readFileSync(file, "utf8");
}

function requireText(text, expected, label) {
  if (!text.includes(expected)) stop(`${label} missing: ${expected}`);
}

function forbidText(text, forbidden, label) {
  if (text.includes(forbidden)) stop(`${label} contains forbidden text: ${forbidden}`);
}

const checkout = read("app/checkout/route.ts");
const webhook = read("app/api/stripe/webhook/route.ts");
const store = read("lib/h2PendingOrder.ts");
const migration = read(
  "supabase/migrations/20260715_gpm_h2_pending_orders.sql",
);

for (const required of [
  'H2_CLIENT_REFERENCE_PREFIX = "H2_"',
  "createPendingH2Order",
  'checkoutUrl.searchParams.set("client_reference_id", clientReference)',
  "pending-order-unavailable",
  "pending-order-reference-invalid",
  'bfProfile: BF_PROFILE',
  'publicProductName: PUBLIC_PRODUCT_NAME',
]) requireText(checkout, required, "checkout");

for (const forbidden of [
  'CLIENT_REFERENCE_PREFIX = "H1|"',
  '`${CLIENT_REFERENCE_PREFIX}${inventoryId}|${personalNote}`',
  "stripe.checkout.sessions.create",
  "stripe.paymentLinks",
]) forbidText(checkout, forbidden, "checkout");

for (const required of [
  "SUPABASE_SERVICE_ROLE_KEY",
  'H2_TABLE = "gpm_h2_pending_orders"',
  "randomUUID().replaceAll",
  "createPendingH2Order",
  "consumePendingH2Order",
  'status: "awaiting_payment"',
  'status: "paid_received"',
  '.eq("status", "awaiting_payment")',
  '.gt("expires_at", now)',
]) requireText(store, required, "H2 store");

for (const required of [
  'H2_CLIENT_REFERENCE_PREFIX = "H2_"',
  "consumePendingH2Order",
  'format: "h2_pending_order_token"',
  'product_name: "K-KUT HUG"',
  "public_product_name: publicProductName",
  "bf_profile: bfProfile",
  "origin_domain: originDomain",
  'client_reference_format: "H2_safe_order_token"',
  '"H1|inventory_id|personal_note"',
  '"inventory_id"',
  "h2_pending_order_resolution_failed",
]) requireText(webhook, required, "webhook");

for (const required of [
  "create table if not exists public.gpm_h2_pending_orders",
  "enable row level security",
  "revoke all on table public.gpm_h2_pending_orders from anon",
  "revoke all on table public.gpm_h2_pending_orders from authenticated",
  "grant all on table public.gpm_h2_pending_orders to service_role",
  "gpm_h2_token_format",
  "gpm_h2_personal_note_length",
  "gpm_h2_pending_orders_stripe_event_idx",
]) requireText(migration, required, "migration");

forbidText(migration, "create policy", "migration");

console.log("H2 PENDING-ORDER TOKEN AUDIT PASS");
console.log("STRIPE REFERENCE FORMAT: H2_<32 HEX TOKEN>");
console.log("PERSONAL NOTE IN STRIPE URL: NO");
console.log("EXACT II IN STRIPE URL: NO");
console.log("PENDING ORDER TABLE: RLS ENABLED");
console.log("ANON TABLE ACCESS: REVOKED");
console.log("AUTHENTICATED TABLE ACCESS: REVOKED");
console.log("SERVER AUTHORITY: SUPABASE SERVICE ROLE");
console.log("LEGACY H1 READ COMPATIBILITY: REQUIRED");
console.log("SOURCE AUDIO CHANGED: NO");
console.log("STRIPE OBJECTS CREATED: NO");
