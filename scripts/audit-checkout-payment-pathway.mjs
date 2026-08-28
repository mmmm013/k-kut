import fs from "node:fs";

const checkoutPath = "app/checkout/route.ts";
const retiredHugStripe = "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("CHECKOUT PRICE / PREVIEW SAFETY AUDIT");

if (!fs.existsSync(checkoutPath)) fail(`Missing ${checkoutPath}`);

const checkout = fs.existsSync(checkoutPath)
  ? fs.readFileSync(checkoutPath, "utf8")
  : "";

if (!checkout.includes('process.env.VERCEL_ENV !== "production"')) {
  fail("Checkout must block every non-Production environment.");
}

if (!checkout.includes('"preview-payment-disabled"')) {
  fail("Checkout must expose the governed Preview-disabled reason.");
}

if (!checkout.includes("NEXT_PUBLIC_KKUT_HUG_PAYMENT_URL")) {
  fail("HUG checkout must use the environment-scoped commerce authority.");
}

if (checkout.includes("publicationOption?.stripe_url_if_payment_allowed ||")) {
  fail("Catalog rows must never override product-price authority.");
}

if (!checkout.includes("priceCents: KK_HUG_PRICE_CENTS") ||
    !checkout.includes("const KK_HUG_PRICE_CENTS = 799")) {
  fail("HUG price law must remain locked at 799 cents.");
}

const retiredCount = checkout.split(retiredHugStripe).length - 1;
if (retiredCount !== 1 ||
    !checkout.includes("RETIRED_KK_HUG_PAYMENT_URL") ||
    !checkout.includes("url.toString() !== RETIRED_KK_HUG_PAYMENT_URL")) {
  fail("The $9.99 link may exist only as an explicit deny-list value.");
}

if (!checkout.includes("NextResponse.redirect")) {
  fail("Checkout route must use a governed redirect.");
}

if (failed) {
  console.error("CHECKOUT PRICE / PREVIEW SAFETY AUDIT: FAIL");
  process.exit(1);
}

console.log("CHECKOUT PRICE / PREVIEW SAFETY AUDIT: PASS");
console.log("HUG_PRICE_CENTS=799");
console.log("PREVIEW_LIVE_PAYMENT=BLOCKED");
console.log("RETIRED_9_99_LINK=DENIED");
