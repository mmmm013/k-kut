import fs from "node:fs";

const checkoutPath = "app/checkout/route.ts";
const hugPath = "app/hug/page.tsx";
const regularHugUrl = "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("ONE REGULAR HUG PAYMENT PROCESS AUDIT");

const checkout = fs.readFileSync(checkoutPath, "utf8");
const hug = fs.readFileSync(hugPath, "utf8");

if (!checkout.includes(regularHugUrl)) {
  fail("/checkout does not contain the approved regular/basic HUG Stripe URL.");
}

if (!checkout.includes("REGULAR_HUG_PAYMENT_URL")) {
  fail("/checkout must use REGULAR_HUG_PAYMENT_URL as the one payment process constant.");
}

if (!checkout.includes("redirect(REGULAR_HUG_PAYMENT_URL)")) {
  fail("/checkout is not redirecting through REGULAR_HUG_PAYMENT_URL.");
}

if (!hug.includes("Start HUG Order")) {
  fail("/hug is missing Start HUG Order CTA.");
}

if (!hug.includes('href="/checkout"')) {
  fail("/hug Start HUG Order does not point to /checkout.");
}

const rawStripeLinksOnHug = hug.match(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g) || [];
if (rawStripeLinksOnHug.length > 0) {
  fail("/hug should not expose raw Stripe links directly. It should route through /checkout only.");
}

if (failed) {
  console.error("ONE REGULAR HUG PAYMENT PROCESS AUDIT: FAIL");
  process.exit(1);
}

console.log("ONE REGULAR HUG PAYMENT PROCESS AUDIT: PASS");
