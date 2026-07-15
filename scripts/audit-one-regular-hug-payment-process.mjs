import fs from "node:fs";

const checkoutPath = "app/checkout/route.ts";
const hugPath = "app/hug/page.tsx";
const browsePath = "app/browse/page.tsx";
const webhookPath = "app/api/stripe/webhook/route.ts";
const regularHugUrl = "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

function requireText(text, expected, message) {
  if (!text.includes(expected)) fail(message);
}

console.log("ONE REGULAR HUG PAYMENT PROCESS AUDIT");
console.log("MODE: exact selected K-KUT → approved checkout → paid-order identity");

for (const file of [checkoutPath, hugPath, browsePath, webhookPath]) {
  if (!fs.existsSync(file)) fail(`missing required file: ${file}`);
}

if (failed) process.exit(1);

const checkout = fs.readFileSync(checkoutPath, "utf8");
const hug = fs.readFileSync(hugPath, "utf8");
const browse = fs.readFileSync(browsePath, "utf8");
const webhook = fs.readFileSync(webhookPath, "utf8");

requireText(
  checkout,
  regularHugUrl,
  "/checkout does not retain the approved regular HUG Stripe URL.",
);
requireText(
  checkout,
  "REGULAR_HUG_PAYMENT_URL",
  "/checkout must preserve the regular HUG payment authority constant.",
);
requireText(
  checkout,
  "APPROVED_PAYMENT_LINKS",
  "/checkout is missing the approved-payment allow-list.",
);
requireText(
  checkout,
  'searchParams.get("ii")',
  "/checkout does not require the selected K-KUT identity.",
);
requireText(
  checkout,
  'searchParams.set("client_reference_id", inventoryId)',
  "/checkout does not carry exact K-KUT identity into Stripe.",
);
requireText(
  checkout,
  "offer-checkout-held",
  "/checkout does not hold unconfigured offer mappings.",
);
requireText(
  checkout,
  "APPROVED_PAYMENT_LINKS.has(paymentLink)",
  "/checkout does not enforce the approved-payment allow-list.",
);

requireText(
  hug,
  "Browse all K-KUTs",
  "/hug is missing the primary Browse All K-KUTs action.",
);
requireText(
  hug,
  'href="/browse"',
  "/hug primary action does not open the released catalog.",
);
requireText(
  hug,
  'href="/find"',
  "/hug is missing the MC-BOT choice path.",
);
requireText(
  browse,
  "Choose this K-KUT",
  "/browse is missing the exact K-KUT selection action.",
);
requireText(
  webhook,
  "session.client_reference_id",
  "Stripe webhook does not read the selected K-KUT reference.",
);
requireText(
  webhook,
  "selected_hug_id: selectedInventoryId",
  "Paid fulfillment record does not preserve the selected K-KUT identity.",
);

for (const [label, text] of [
  ["/hug", hug],
  ["/browse", browse],
]) {
  const rawStripeLinks =
    text.match(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g) || [];
  if (rawStripeLinks.length > 0) {
    fail(`${label} exposes raw Stripe links instead of governed /checkout.`);
  }
}

if (failed) {
  console.error("ONE REGULAR HUG PAYMENT PROCESS AUDIT: FAIL");
  process.exit(1);
}

console.log("APPROVED REGULAR HUG PAYMENT URL: PRESENT");
console.log("EXACT K-KUT REFERENCE INTO CHECKOUT: PASS");
console.log("APPROVED PAYMENT ALLOW-LIST: PASS");
console.log("PAID-ORDER K-KUT ID CAPTURE: PASS");
console.log("RAW STRIPE LINKS ON BUYER PAGES: 0");
console.log("ONE REGULAR HUG PAYMENT PROCESS AUDIT: PASS");
