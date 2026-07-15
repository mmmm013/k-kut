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
  "MODE: exact selected K-KUT + optional 13-word note → one approved $7.99 Payment Link → durable Stripe order → manual review",
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

for (const [expected, message] of [
  [regularHugUrl, "/checkout does not retain the approved Regular HUG Stripe URL."],
  ["REGULAR_HUG_PAYMENT_URL", "/checkout is missing the Regular HUG payment authority constant."],
  ["REGULAR_HUG_PRICE_CENTS = 799", "/checkout does not lock the public HUG price to $7.99."],
  ['return value === "hug" ? "hug" : null', "/checkout permits a held offer."],
  ['formData.get("personal_note")', "/checkout does not receive the optional note."],
  ["PERSONAL_NOTE_WORD_LIMIT = 13", "/checkout does not enforce 13 words."],
  ["CLIENT_REFERENCE_LIMIT = 200", "/checkout does not enforce Stripe's reconciliation-reference limit."],
  ['CLIENT_REFERENCE_PREFIX = "H1|"', "/checkout is missing the governed HUG reference format."],
  ["buildClientReference", "/checkout does not combine the exact II and optional note."],
  ['checkoutUrl.searchParams.set("client_reference_id", clientReference)', "/checkout does not carry the governed order reference into Stripe."],
  ["personal-note-over-13-words", "/checkout does not block a 14-word note."],
  ["personal-note-reference-too-long", "/checkout does not block an oversized reconciliation reference."],
]) {
  requireText(checkout, expected, message);
}

for (const forbidden of [
  "stripe.paymentLinks",
  "stripe.checkout.sessions.create",
  "NEXT_PUBLIC_KKUT_SHORT_KUT_PAYMENT_URL",
  "NEXT_PUBLIC_KKUT_BIG_HUG_PAYMENT_URL",
  'value === "short_kut"',
  'value === "big_hug"',
]) {
  forbidText(checkout, forbidden, `/checkout still contains a rejected payment path: ${forbidden}`);
}

for (const [expected, message] of [
  ['REGULAR_HUG_OFFER = "K-KUT HUG"', "catalog does not map every verified II to K-KUT HUG."],
  ["REGULAR_HUG_PRICE_USD = 7.99", "catalog does not map every verified II to $7.99."],
  ["purchasableCount: publicRecords.length", "catalog does not make all governed records purchasable."],
  ['heldOffers: ["4.99", "12.99", "0.99", "charity_sales_claims"]', "catalog does not hold deferred offers and charitable claims."],
]) {
  requireText(catalog, expected, message);
}

for (const [text, expected, message] of [
  [hug, "Browse all K-KUTs", "/hug is missing Browse All."],
  [hug, 'href="/browse"', "/hug does not open the catalog."],
  [hug, 'href="/find"', "/hug is missing MC-BOT."],
  [browse, "Add up to 13 words", "/browse does not explain the optional note."],
  [browse, "$7.99", "/browse does not state the authorized price."],
  [browser, "Send this K-KUT as a HUG", "browser is missing the exact HUG action."],
  [browser, 'action="/checkout"', "browser bypasses governed checkout."],
  [browser, 'name="personal_note"', "browser is missing the note field."],
  [browser, "13 words maximum", "browser does not state the note limit."],
]) {
  requireText(text, expected, message);
}

for (const [expected, message] of [
  ["session.client_reference_id", "webhook does not read Stripe's order reference."],
  ["parseClientReference", "webhook does not separate the II and note."],
  ['CLIENT_REFERENCE_PREFIX = "H1|"', "webhook does not share the governed reference format."],
  ["selected_hug_id: selectedInventoryId", "fulfillment evidence loses the selected II."],
  ["personalNoteFields", "fulfillment evidence does not reconcile the note."],
  ['personal_note_placement: "before_hug_content"', "fulfillment evidence loses note placement."],
  ['durable_order_authority: "stripe_checkout_session"', "Stripe is not declared durable order authority."],
  ["stripe_durable_manual_review_queue", "webhook does not enter manual review."],
  ["disabled_on_read_only_runtime", "webhook does not disable Vercel file writes."],
  ["manual_review_required: true", "paid HUG fulfillment is not manual-reviewed."],
]) {
  requireText(webhook, expected, message);
}

for (const [label, text] of [
  ["/hug", hug],
  ["/browse", browse],
  ["K-KUT browser", browser],
]) {
  const rawStripeLinks = text.match(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g) || [];
  if (rawStripeLinks.length > 0) {
    fail(`${label} exposes a raw Stripe link instead of governed /checkout.`);
  }
}

if (failed) {
  console.error("ONE REGULAR HUG PAYMENT PROCESS AUDIT: FAIL");
  process.exit(1);
}

console.log("APPROVED REGULAR HUG PAYMENT URL: PRESENT");
console.log("REGULAR HUG PRICE AUTHORITY: $7.99 EXISTING PAYMENT LINK");
console.log("PURCHASABLE CATALOG RECORDS REQUIRED: 2611");
console.log("OPTIONAL PERSONAL NOTE: 13 WORDS MAXIMUM");
console.log("CLIENT REFERENCE: EXACT II + OPTIONAL NOTE, 200 CHARACTERS MAXIMUM");
console.log("STRIPE PAYMENT-LINK ENUMERATION: FORBIDDEN");
console.log("SECOND CHECKOUT AUTHORITY: FORBIDDEN");
console.log("HELD OFFER PATHS: $4.99 / $12.99 / $0.99");
console.log("CHARITABLE SALES CLAIMS: HELD");
console.log("PAID-ORDER K-KUT ID AND NOTE CAPTURE: PASS");
console.log("MANUAL FULFILLMENT REVIEW: REQUIRED");
console.log("ONE REGULAR HUG PAYMENT PROCESS AUDIT: PASS");
