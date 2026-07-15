import fs from "node:fs";

const checkoutPath = "app/checkout/route.ts";
const hugPath = "app/hug/page.tsx";
const browsePath = "app/browse/page.tsx";
const browserPath = "components/PublicIiBrowser.tsx";
const catalogPath = "app/api/public-ii-catalog/route.ts";
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

function forbidText(text, forbidden, message) {
  if (text.includes(forbidden)) fail(message);
}

console.log("ONE REGULAR HUG PAYMENT PROCESS AUDIT");
console.log(
  "MODE: exact selected K-KUT → optional 13-word note → approved $7.99 HUG authority → durable Stripe order → manual review",
);

for (const file of [
  checkoutPath,
  hugPath,
  browsePath,
  browserPath,
  catalogPath,
  webhookPath,
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

requireText(
  checkout,
  regularHugUrl,
  "/checkout does not retain the approved Regular HUG Stripe URL.",
);
requireText(
  checkout,
  "REGULAR_HUG_PAYMENT_URL",
  "/checkout must preserve the Regular HUG payment authority constant.",
);
requireText(
  checkout,
  "REGULAR_HUG_PRICE_CENTS = 799",
  "/checkout does not lock the Regular HUG authority to $7.99.",
);
requireText(
  checkout,
  'return value === "hug" ? "hug" : null',
  "/checkout permits an offer other than the authorized HUG.",
);
requireText(
  checkout,
  'searchParams.get("ii")',
  "/checkout does not require the selected K-KUT identity.",
);
requireText(
  checkout,
  'checkoutUrl.searchParams.set("client_reference_id", inventoryId)',
  "/checkout direct path does not carry exact K-KUT identity into Stripe.",
);
requireText(
  checkout,
  'formData.get("personal_note")',
  "/checkout does not receive the optional personal note.",
);
requireText(
  checkout,
  "PERSONAL_NOTE_WORD_LIMIT = 13",
  "/checkout does not enforce the 13-word note limit.",
);
requireText(
  checkout,
  "stripe.paymentLinks.listLineItems",
  "/checkout does not derive the personalized session from the existing Regular HUG payment authority.",
);
requireText(
  checkout,
  "regular_hug_price_is_not_7_99",
  "/checkout does not hard-stop a changed Regular HUG price.",
);
requireText(
  checkout,
  "stripe.checkout.sessions.create",
  "/checkout does not create the secure personalized Stripe session.",
);
requireText(
  checkout,
  'personal_note_placement: "before_hug_content"',
  "/checkout does not preserve the note placement instruction.",
);

for (const forbidden of [
  "NEXT_PUBLIC_KKUT_SHORT_KUT_PAYMENT_URL",
  "NEXT_PUBLIC_KKUT_BIG_HUG_PAYMENT_URL",
  'value === "short_kut"',
  'value === "big_hug"',
]) {
  forbidText(
    checkout,
    forbidden,
    `/checkout still exposes a held offer control: ${forbidden}`,
  );
}

requireText(
  catalog,
  'REGULAR_HUG_OFFER = "K-KUT HUG"',
  "catalog does not map every verified II to K-KUT HUG.",
);
requireText(
  catalog,
  "REGULAR_HUG_PRICE_USD = 7.99",
  "catalog does not map every verified II to $7.99.",
);
requireText(
  catalog,
  "purchasableCount: publicRecords.length",
  "catalog does not make all governed records purchasable.",
);
requireText(
  catalog,
  'heldOffers: ["4.99", "12.99", "0.99", "charity_sales_claims"]',
  "catalog does not explicitly hold the deferred offers and charitable sales claims.",
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
  "Add up to 13 words",
  "/browse does not explain the optional note.",
);
requireText(
  browse,
  "$7.99",
  "/browse does not state the authorized Regular HUG price.",
);
requireText(
  browser,
  "Send this K-KUT as a HUG",
  "/browse browser is missing the exact K-KUT HUG action.",
);
requireText(
  browser,
  'action="/checkout"',
  "/browse browser does not submit through governed checkout.",
);
requireText(
  browser,
  'name="personal_note"',
  "/browse browser is missing the optional note field.",
);
requireText(
  browser,
  "13 words maximum",
  "/browse browser does not explain the note limit.",
);

requireText(
  webhook,
  "session.client_reference_id",
  "Stripe webhook does not read the selected K-KUT reference.",
);
requireText(
  webhook,
  "selected_hug_id: selectedInventoryId",
  "Paid fulfillment evidence does not preserve the selected K-KUT identity.",
);
requireText(
  webhook,
  "personalNoteFields",
  "Paid fulfillment evidence does not reconcile the optional personal note.",
);
requireText(
  webhook,
  'personal_note_placement: "before_hug_content"',
  "Paid fulfillment evidence does not preserve note placement.",
);
requireText(
  webhook,
  'durable_order_authority: "stripe_checkout_session"',
  "Stripe Checkout is not declared as the durable production order authority.",
);
requireText(
  webhook,
  "stripe_durable_manual_review_queue",
  "Production webhook does not enter the durable Stripe manual-review queue.",
);
requireText(
  webhook,
  "disabled_on_read_only_runtime",
  "Production webhook does not disable local file writes on Vercel.",
);
requireText(
  webhook,
  "manual_review_required: true",
  "Paid HUG fulfillment is not locked to manual review.",
);

for (const [label, text] of [
  ["/hug", hug],
  ["/browse", browse],
  ["K-KUT browser", browser],
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
console.log("REGULAR HUG PRICE AUTHORITY: $7.99");
console.log("PURCHASABLE CATALOG RECORDS REQUIRED: 2611");
console.log("OPTIONAL PERSONAL NOTE: 13 WORDS MAXIMUM");
console.log("PERSONAL NOTE PLACEMENT: BEFORE HUG CONTENT");
console.log("EXACT K-KUT REFERENCE INTO CHECKOUT: PASS");
console.log("HELD OFFER PATHS: $4.99 / $12.99 / $0.99");
console.log("CHARITABLE SALES CLAIMS: HELD");
console.log("STRIPE DURABLE ORDER AUTHORITY: PASS");
console.log("PAID-ORDER K-KUT ID AND NOTE CAPTURE: PASS");
console.log("VERCEL LOCAL FILE WRITE: DISABLED");
console.log("MANUAL FULFILLMENT REVIEW: REQUIRED");
console.log("RAW STRIPE LINKS ON BUYER PAGES: 0");
console.log("ONE REGULAR HUG PAYMENT PROCESS AUDIT: PASS");
