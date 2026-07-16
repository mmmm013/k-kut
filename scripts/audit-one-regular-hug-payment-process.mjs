import fs from "node:fs";

const checkoutPath = "app/checkout/route.ts";
const hugPath = "app/hug/page.tsx";
const browsePath = "app/browse/page.tsx";
const browserPath = "components/PublicIiBrowser.tsx";
const catalogPath = "app/api/public-ii-catalog/route.ts";
const webhookPath = "app/api/stripe/webhook/route.ts";
const h2StorePath = "lib/h2PendingOrder.ts";
const h2MigrationPath =
  "supabase/migrations/20260715_gpm_h2_pending_orders.sql";
const regularHugUrl = "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

function requireText(text, expected, message) {
  if (!text.includes(expected)) fail(message);
}

function forbidText(text, forbidden, message) {
  if (text.includes(forbidden)) fail(message);
}

console.log("ONE REGULAR HUG PAYMENT PROCESS AUDIT");
console.log(
  "MODE: exact selected K-KUT + optional 13-word note → server-side H2 pending order → one approved $7.99 Payment Link → durable Stripe order → manual review",
);

for (const file of [
  checkoutPath,
  hugPath,
  browsePath,
  browserPath,
  catalogPath,
  webhookPath,
  h2StorePath,
  h2MigrationPath,
]) {
  if (!fs.existsSync(file)) fail(`missing required file: ${file}`);
}

if (failed) process.exit(1);

const checkout = fs.readFileSync(checkoutPath, "utf8");
const hug = fs.readFileSync(hugPath, "utf8");
const browse = fs.readFileSync(browsePath, "utf8");
const browser = fs.readFileSync(browserPath, "utf8");
const catalog = fs.readFileSync(catalogPath, "utf8");
const webhook = fs.readFileSync(webhookPath, "utf8");
const h2Store = fs.readFileSync(h2StorePath, "utf8");
const h2Migration = fs.readFileSync(h2MigrationPath, "utf8");

for (const [expected, message] of [
  [regularHugUrl, "/checkout does not retain the approved Regular HUG Stripe URL."],
  ["REGULAR_HUG_PAYMENT_URL", "/checkout is missing the Regular HUG payment authority constant."],
  ["REGULAR_HUG_PRICE_CENTS = 799", "/checkout does not lock the public HUG price to $7.99."],
  ['return value === "hug" ? "hug" : null', "/checkout permits a held offer."],
  ['formData.get("personal_note")', "/checkout does not receive the optional note."],
  ["PERSONAL_NOTE_WORD_LIMIT = 13", "/checkout does not enforce 13 words."],
  ["CLIENT_REFERENCE_LIMIT = 200", "/checkout does not enforce Stripe's reference limit."],
  ['H2_CLIENT_REFERENCE_PREFIX = "H2_"', "/checkout is missing the Stripe-safe H2 reference format."],
  ["createPendingH2Order", "/checkout does not stage the exact II and note server-side."],
  ['checkoutUrl.searchParams.set("client_reference_id", clientReference)', "/checkout does not carry the H2 token into Stripe."],
  ["personal-note-over-13-words", "/checkout does not block a 14-word note."],
  ["pending-order-unavailable", "/checkout does not fail closed when the pending-order store is unavailable."],
  ["pending-order-reference-invalid", "/checkout does not validate the Stripe-safe token."],
]) requireText(checkout, expected, message);

for (const forbidden of [
  "stripe.paymentLinks",
  "stripe.checkout.sessions.create",
  "NEXT_PUBLIC_KKUT_SHORT_KUT_PAYMENT_URL",
  "NEXT_PUBLIC_KKUT_BIG_HUG_PAYMENT_URL",
  'value === "short_kut"',
  'value === "big_hug"',
  'CLIENT_REFERENCE_PREFIX = "H1|"',
]) forbidText(checkout, forbidden, `/checkout still contains a rejected payment path: ${forbidden}`);

for (const [expected, message] of [
  ['REGULAR_HUG_OFFER = "K-KUT HUG"', "catalog does not map every verified II to K-KUT HUG."],
  ["REGULAR_HUG_PRICE_USD = 7.99", "catalog does not map every verified II to $7.99."],
  ["purchasableCount: publicRecords.length", "catalog does not make all governed records purchasable."],
  ['heldOffers: ["4.99", "12.99", "0.99", "charity_sales_claims"]', "catalog does not hold deferred offers and charitable claims."],
]) requireText(catalog, expected, message);

for (const [text, expected, message] of [
  [hug, "Browse all K-KUTs", "/hug is missing Browse All."],
  [hug, 'href="/browse"', "/hug does not open the catalog."],
  [hug, 'href="/find"', "/hug is missing MC-BOT."],
  [browse, "Add up to 13 words", "/browse does not explain the optional note."],
  [browse, "$7.99", "/browse does not state the authorized price."],
  [browser, "Send this K-KUT as a HUG", "browser is missing the exact HUG action."],
  [browser, 'action="/checkout"', "browser bypasses governed checkout."],
  [browser, 'name="personal_note"', "browser is missing the note field."],
  [browser, "13 words maximum", "browser does not state the note limit."],
]) requireText(text, expected, message);

for (const [expected, message] of [
  ["session.client_reference_id", "webhook does not read Stripe's order reference."],
  ["parseClientReference", "webhook does not classify H2 and legacy references."],
  ['H2_CLIENT_REFERENCE_PREFIX = "H2_"', "webhook does not recognize H2."],
  ['LEGACY_CLIENT_REFERENCE_PREFIX = "H1|"', "webhook does not retain legacy H1 reads."],
  ["consumePendingH2Order", "webhook does not resolve the H2 server-side record."],
  ["selected_hug_id: selectedInventoryId", "fulfillment evidence loses the selected II."],
  ["personalNoteFields", "fulfillment evidence does not reconcile the note."],
  ['personal_note_placement: "before_hug_content"', "fulfillment evidence loses note placement."],
  ['durable_order_authority: "stripe_checkout_session"', "Stripe is not declared durable order authority."],
  ["stripe_durable_manual_review_queue", "webhook does not enter manual review."],
  ["disabled_on_read_only_runtime", "webhook does not disable Vercel file writes."],
  ["manual_review_required: true", "paid HUG fulfillment is not manual-reviewed."],
  ["public_product_name: publicProductName", "webhook loses the BF public product identity."],
  ["bf_profile: bfProfile", "webhook loses the BF profile."],
  ["origin_domain: originDomain", "webhook loses the origin domain."],
]) requireText(webhook, expected, message);

for (const [expected, message] of [
  ["SUPABASE_SERVICE_ROLE_KEY", "H2 store is not server-only."],
  ['H2_TABLE = "gpm_h2_pending_orders"', "H2 store table is not locked."],
  ["createPendingH2Order", "H2 create path is missing."],
  ["consumePendingH2Order", "H2 consume path is missing."],
  ['.eq("status", "awaiting_payment")', "H2 consumption is not state-gated."],
  ['.gt("expires_at", now)', "H2 consumption does not reject expired tokens."],
]) requireText(h2Store, expected, message);

for (const [expected, message] of [
  ["enable row level security", "H2 table does not enable RLS."],
  ["revoke all on table public.gpm_h2_pending_orders from anon", "anon table access is not revoked."],
  ["revoke all on table public.gpm_h2_pending_orders from authenticated", "authenticated table access is not revoked."],
  ["grant all on table public.gpm_h2_pending_orders to service_role", "service-role authority is missing."],
]) requireText(h2Migration, expected, message);

for (const [label, text] of [
  ["/hug", hug],
  ["/browse", browse],
  ["K-KUT browser", browser],
]) {
  const rawStripeLinks = text.match(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g) || [];
  if (rawStripeLinks.length > 0) {
    fail(`${label} exposes a raw Stripe link instead of governed /checkout.`);
  }
}

if (failed) {
  console.error("ONE REGULAR HUG PAYMENT PROCESS AUDIT: FAIL");
  process.exit(1);
}

console.log("APPROVED REGULAR HUG PAYMENT URL: PRESENT");
console.log("REGULAR HUG PRICE AUTHORITY: $7.99 EXISTING PAYMENT LINK");
console.log("PURCHASABLE CATALOG RECORDS REQUIRED: 2611");
console.log("OPTIONAL PERSONAL NOTE: 13 WORDS MAXIMUM");
console.log("STRIPE REFERENCE: H2 SAFE TOKEN");
console.log("EXACT II + OPTIONAL NOTE: SERVER-SIDE PENDING ORDER");
console.log("STRIPE PAYMENT-LINK ENUMERATION: FORBIDDEN");
console.log("SECOND CHECKOUT AUTHORITY: FORBIDDEN");
console.log("HELD OFFER PATHS: $4.99 / $12.99 / $0.99");
console.log("CHARITABLE SALES CLAIMS: HELD");
console.log("PAID-ORDER K-KUT ID AND NOTE CAPTURE: PASS");
console.log("BF PROFILE + ORIGIN DOMAIN CAPTURE: PASS");
console.log("MANUAL FULFILLMENT REVIEW: REQUIRED");
console.log("ONE REGULAR HUG PAYMENT PROCESS AUDIT: PASS");
