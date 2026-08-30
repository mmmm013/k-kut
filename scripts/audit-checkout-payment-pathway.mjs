import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const fail = (message) => {
  throw new Error(`CHECKOUT PAYMENT PATHWAY AUDIT FAIL: ${message}`);
};

const grid = read("components/ApprovedPublicOptionGrid.tsx");
const checkout = read("app/checkout/route.ts");
const bridge = JSON.parse(
  read("data/publication-bridge/public-option-records.generated.json"),
);

const linked = (bridge.records || []).filter(
  (record) => record.stripe_url_if_payment_allowed,
);

if (linked.length !== 0) {
  fail("Stripe link exposure must remain zero during the owner integrity hold");
}
const held = (bridge.records || []).find(
  (record) =>
    record.public_option_id ===
    "generated-love-sweet-d3dfd13c-7421-4671-8261-0c735cb51f38",
);
if (
  !held ||
  held.price_cents !== 799 ||
  held.payment_allowed !== false ||
  held.stripe_url_if_payment_allowed !== "" ||
  held.audio_delivery_url !== ""
) {
  fail("exact Sweet Love II is not fully contained");
}

for (const required of [
  "function lockedStripePaymentLink(record: ApprovedPublicOption)",
  'url.hostname === "buy.stripe.com"',
  "record.stripe_url_if_payment_allowed",
  "href={paymentLink}",
  "Checkout held for this exact II",
]) {
  if (!grid.includes(required)) fail(`approved grid missing ${required}`);
}

if (grid.includes('action="/checkout"')) {
  fail("visible button still posts to superseded API checkout");
}

for (const required of [
  'url.pathname = "/browse"',
  '"?checkout=locked-payment-link-required"',
  "export async function GET",
  "export async function POST",
]) {
  if (!checkout.includes(required)) fail(`legacy checkout hold missing ${required}`);
}

for (const forbidden of [
  'from "stripe"',
  "STRIPE_SECRET_KEY",
  "stripe.checkout.sessions.create",
  "createPendingH2Order",
]) {
  if (checkout.includes(forbidden)) {
    fail(`legacy API-created checkout remains active: ${forbidden}`);
  }
}

console.log("CHECKOUT PAYMENT PATHWAY AUDIT: PASS");
console.log("EXPOSED II PAYMENT LINKS: 0");
console.log("LOCKED PRICE: USD 7.99");
console.log("PAYMENT AUTHORITY: HOLD_BOUNDARY_AND_TWINKLE_INTEGRITY");
console.log("SUPERSEDED API-CREATED CHECKOUT: BLOCKED");
