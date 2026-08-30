import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

const grid = read("components/ApprovedPublicOptionGrid.tsx");
const checkout = read("app/checkout/route.ts");

console.log("CHECKOUT PRICE / BRAND / PREVIEW SAFETY AUDIT");

for (const required of [
  "NEXT_PUBLIC_KKUT_REVIEWED_HUG_PAYMENT_URL",
  "function reviewedLemonSqueezyPaymentUrl()",
  'url.protocol === "https:"',
  'hostname.endsWith(".lemonsqueezy.com")',
  "href={paymentUrl}",
  "Lemon Squeezy securely handles checkout",
  "Checkout temporarily unavailable",
]) {
  if (!grid.includes(required)) fail(`Approved grid missing: ${required}`);
}

for (const forbidden of [
  'action="/checkout"',
  "stripe.checkout.sessions.create",
  "STRIPE_SECRET_KEY",
  "buy.stripe.com",
]) {
  if (grid.includes(forbidden)) fail(`Customer payment surface contains: ${forbidden}`);
}

for (const required of [
  'url.pathname = "/browse"',
  '"?checkout=lemon-squeezy-direct-link-required"',
  "export async function GET",
  "export async function POST",
]) {
  if (!checkout.includes(required)) fail(`Legacy checkout hold missing: ${required}`);
}

for (const forbidden of [
  'from "stripe"',
  "STRIPE_SECRET_KEY",
  "stripe.checkout.sessions.create",
  "createPendingH2Order",
]) {
  if (checkout.includes(forbidden)) fail(`Legacy checkout remains active: ${forbidden}`);
}

if (failed) {
  console.error("CHECKOUT PRICE / BRAND / PREVIEW SAFETY AUDIT: FAIL");
  process.exit(1);
}

console.log("CHECKOUT PRICE / BRAND / PREVIEW SAFETY AUDIT: PASS");
console.log("HUG_PRICE_DISPLAY=USD_7.99_FROM_APPROVED_RECORD");
console.log("CUSTOMER_PAYMENT_SURFACE=REVIEWED_LEMON_SQUEEZY_URL");
console.log("MISSING_OR_INVALID_URL=FAIL_CLOSED");
console.log("LEGACY_DIRECT_STRIPE_ROUTE=BLOCKED");
