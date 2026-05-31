import fs from "node:fs";

const checkoutPath = "app/checkout/route.ts";
const approvedStripeAudit = "scripts/audit-approved-stripe-links.mjs";
const regularAudit = "scripts/audit-one-regular-hug-payment-process.mjs";
const regularStripe = "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("CHECKOUT PAYMENT PATHWAY AUDIT");

for (const file of [checkoutPath, approvedStripeAudit, regularAudit]) {
  if (!fs.existsSync(file)) fail(`Missing ${file}`);
}

const checkout = fs.existsSync(checkoutPath)
  ? fs.readFileSync(checkoutPath, "utf8")
  : "";

if (!checkout.includes(regularStripe)) {
  fail("Checkout route must include the regular/basic HUG Stripe fallback link.");
}

const validRedirectPatterns = [
  "redirect(",
  "NextResponse.redirect",
  "Response.redirect",
  "Location"
];

if (!validRedirectPatterns.some((pattern) => checkout.includes(pattern))) {
  fail("Checkout route must use a valid redirect mechanism.");
}

for (const forbidden of [
  "candidate_not_approved",
  "debug",
  "staging",
  "test example",
  "mini-KUT",
  "mkut",
  "sympathy",
  "grief",
  "memorial",
  "celebration-of-life"
]) {
  if (checkout.includes(forbidden)) {
    fail(`Checkout route contains forbidden term: ${forbidden}`);
  }
}

if (failed) {
  console.error("CHECKOUT PAYMENT PATHWAY AUDIT: FAIL");
  process.exit(1);
}

console.log("CHECKOUT PAYMENT PATHWAY AUDIT: PASS");
