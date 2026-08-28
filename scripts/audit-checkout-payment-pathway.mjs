import fs from "node:fs";

const checkoutPath = "app/checkout/route.ts";
let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("CHECKOUT PRICE / BRAND / PREVIEW SAFETY AUDIT");

if (!fs.existsSync(checkoutPath)) fail(`Missing ${checkoutPath}`);

const checkout = fs.existsSync(checkoutPath)
  ? fs.readFileSync(checkoutPath, "utf8")
  : "";

for (const required of [
  'process.env.VERCEL_ENV !== "production"',
  '"preview-payment-disabled"',
  "new Stripe(stripeSecretKey)",
  "stripe.checkout.sessions.create",
  "unit_amount: config.priceCents",
  "const KK_HUG_PRICE_CENTS = 799",
  '"https://www.k-kut.com/logo.png"',
  "K-KUT by G Putnam Music",
  "client_reference_id: clientReference",
  "locked_price_cents: String(config.priceCents)",
]) {
  if (!checkout.includes(required)) fail(`Checkout missing: ${required}`);
}

for (const forbidden of [
  "buy.stripe.com",
  "NEXT_PUBLIC_KKUT_HUG_PAYMENT_URL",
  "stripe_url_if_payment_allowed ||",
]) {
  if (checkout.includes(forbidden)) {
    fail(`Checkout contains forbidden Payment Link authority: ${forbidden}`);
  }
}

if (!checkout.includes("priceCents: KK_HUG_PRICE_CENTS")) {
  fail("HUG offer is not bound to the 799-cent price constant.");
}

if (!checkout.includes("NextResponse.redirect(session.url")) {
  fail("Checkout does not redirect only to its newly created Stripe Session.");
}

if (failed) {
  console.error("CHECKOUT PRICE / BRAND / PREVIEW SAFETY AUDIT: FAIL");
  process.exit(1);
}

console.log("CHECKOUT PRICE / BRAND / PREVIEW SAFETY AUDIT: PASS");
console.log("HUG_PRICE_CENTS=799");
console.log("PREVIEW_LIVE_PAYMENT=BLOCKED");
console.log("PAYMENT_LINK_DEPENDENCY=0");
console.log("K_KUT_BRANDED_SESSION=REQUIRED");
