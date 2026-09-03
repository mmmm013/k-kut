import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const fail = (message) => { throw new Error(`CHECKOUT PAYMENT PATHWAY AUDIT FAIL: ${message}`); };

const grid = read("components/ApprovedPublicOptionGrid.tsx");
const checkout = read("app/checkout/route.ts");
const rollout = read("lib/paymentRolloutStatus.ts");
const operatorStatus = read("app/api/admin/payment-rollout-status/route.ts");

for (const required of [
  'HUG: { inventoryFamily: "KK", offer: "kk", priceCents: 799 }',
  'TUG: { inventoryFamily: "SK", offer: "sk", priceCents: 499 }',
  'BUG: { inventoryFamily: "MK", offer: "mk", priceCents: 199 }',
  'from "stripe"',
  "STRIPE_SECRET_KEY",
  "stripe.checkout.sessions.create",
  "createPendingH2Order",
  "paymentRolloutStatus",
  "findApprovedPublicOptionByPublicOptionId",
  'process.env.VERCEL_ENV !== "production"',
  "K_KUT_PAYMENT_ROLLOUT_STATUS",
  "current_rollout_day",
  "elapsed_days",
  "payment-rollout-day-1-2",
  "payment-rollout-force-disabled",
  'returnToStore(request, rollout.reason || "payment-rollout-disabled")',
  'checkout_authority: "current_ii_shared_product_law"',
]) {
  if (!checkout.includes(required)) fail(`shared checkout missing ${required}`);
}

for (const required of [
  "K_KUT_PAYMENT_LINKS_START_DATE",
  "K_KUT_PAYMENT_LINKS_FORCE_DISABLE",
  "payment-rollout-not-started",
  "payment-rollout-start-date-missing",
  "payment-rollout-start-date-invalid",
  "payment-rollout-day-1-2",
]) {
  if (!rollout.includes(required)) fail(`rollout helper missing ${required}`);
}

for (const required of [
  'request.headers.get("x-admin-token")',
  'request.nextUrl.searchParams.get("token")',
  'payment_links_enabled',
  "current_rollout_day",
  "elapsed_days",
  "rollout_start_date",
  "force_disabled",
  "checked_at_utc",
  'reason: status.reason || "enabled"',
]) {
  if (!operatorStatus.includes(required)) fail(`operator status endpoint missing ${required}`);
}

for (const forbidden of ["999", "1799", "699"]) {
  if (checkout.includes(forbidden)) fail(`retired price appears in checkout: ${forbidden}`);
}

for (const required of [
  'action="/checkout"',
  'method="post"',
  'name="public_option_id"',
  'name="ii"',
  "record.product_family",
  "record.price_cents",
]) {
  if (!grid.includes(required)) fail(`approved grid missing ${required}`);
}

if (grid.includes("buy.stripe.com") || grid.includes("stripe_url_if_payment_allowed")) {
  fail("public grid still depends on legacy per-II Stripe Payment Links");
}

console.log("CHECKOUT PAYMENT PATHWAY AUDIT: PASS");
console.log("HUG: USD 7.99 / KK");
console.log("TUG: USD 4.99 / SK");
console.log("BUG: USD 1.99 / MK");
console.log("PAYMENT AUTHORITY: SERVER CHECKOUT + CURRENT-II PRODUCT LAW");
console.log("LEGACY PAYMENT-LINK DEPENDENCY: REMOVED FROM SHARED GRID");
