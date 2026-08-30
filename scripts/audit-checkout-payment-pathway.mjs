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
  "const HUG_PRICE_CENTS = 799",
  "const TUG_PRICE_CENTS = 499",
  "const BUG_PRICE_CENTS = 199",
  '"https://www.k-kut.com/logo.png"',
  "K-KUT by G Putnam Music",
  "client_reference_id: clientReference",
  "findApprovedPublicOptionByPublicOptionId",
  "publicationOption.kk_id_or_delivery_object_id !== inventoryId",
  "public_option_id: publicationOption.public_option_id",
  "locked_price_cents: String(config.priceCents)",
  "phone_number_collection: { enabled: true }",
  'key: "recipientmobile"',
  'custom: "Recipient mobile number"',
  'success_url: `${siteOrigin}/order/success?session_id={CHECKOUT_SESSION_ID}`',
  "function isLiveStripeSecretKey(value: string)",
  'returnToStore(request, "stripe-secret-key-invalid")',
  'console.error("K_KUT_STRIPE_SECRET_KEY_INVALID")',
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

if (!checkout.includes("priceCents: HUG_PRICE_CENTS")) {
  fail("HUG offer is not bound to the 799-cent price constant.");
}

if (
  checkout.indexOf('returnToStore(request, "stripe-secret-key-invalid")') >
  checkout.indexOf("token = await createPendingH2Order")
) {
  fail("Stripe secret-key validation must run before pending-order creation.");
}

for (const forbidden of ["CATALOG_URL", "verifiedInventoryFamily"]) {
  if (checkout.includes(forbidden)) {
    fail(`Checkout retains superseded inventory authority: ${forbidden}`);
  }
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
