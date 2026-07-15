import fs from "node:fs";

function stop(message) {
  console.error(`BIC 2611 STOREFRONT AUDIT FAIL: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) stop(`missing ${file}`);
  return fs.readFileSync(file, "utf8");
}

function requireText(text, expected, label) {
  if (!text.includes(expected)) stop(`${label} missing: ${expected}`);
}

function forbidText(text, forbidden, label) {
  if (text.includes(forbidden)) {
    stop(`${label} exposes forbidden text: ${forbidden}`);
  }
}

const api = read("app/api/public-ii-catalog/route.ts");
const browser = read("components/PublicIiBrowser.tsx");
const browse = read("app/browse/page.tsx");
const find = read("app/find/page.tsx");
const hug = read("app/hug/page.tsx");
const home = read("app/page.tsx");
const checkout = read("app/checkout/route.ts");
const webhook = read("app/api/stripe/webhook/route.ts");

for (const required of [
  "EXPECTED_INVENTORY_COUNT = 2611",
  "PUBLIC_STORAGE_VERIFIED",
  "signature_audio_logo_integral_at_end",
  "twinkle_gate_failed_at_",
  "public_release_gate_failed",
  "inventory_count_gate_failed",
  "release-gate-v004/",
  'REGULAR_HUG_OFFER = "K-KUT HUG"',
  "REGULAR_HUG_PRICE_USD = 7.99",
  "PERSONAL_NOTE_WORD_LIMIT = 13",
  'checkout: "hug"',
  "purchasableCount: publicRecords.length",
]) {
  requireText(api, required, "catalog API");
}

for (const forbidden of [
  "local_capsule_sha256:",
  "local_capsule_size_bytes:",
  "object_path:",
  "lt_pix_parent_id:",
  "controlled_source_path:",
]) {
  forbidText(api, forbidden, "public API output");
}

for (const required of [
  'fetch("/api/public-ii-catalog"',
  "const PAGE_SIZE = 12",
  'preload="none"',
  "MC-BOT will not invent a match",
  "Send this K-KUT as a HUG",
  "Optional personal note · 13 words maximum",
  'action="/checkout"',
  'method="post"',
  'name="personal_note"',
  "stopOtherAudio",
]) {
  requireText(browser, required, "public browser");
}

for (const required of [
  "Browse All K-KUTs",
  "PublicIiBrowser",
  "Add up to 13 words",
  "$7.99",
  "does not alter the audio",
]) {
  requireText(browse, required, "browse page");
}

for (const required of [
  "MC-BOT music guide",
  "PublicIiBrowser",
  "MC-BOT will not invent",
]) {
  requireText(find, required, "find page");
}

for (const required of [
  "2,611 playable K-KUTs",
  'href="/browse"',
  'href="/find"',
  "Twinkle-at-end proof remains required",
]) {
  requireText(hug, required, "HUG page");
}

requireText(home, 'redirect("/browse")', "home route");

for (const required of [
  "REGULAR_HUG_PAYMENT_URL",
  "REGULAR_HUG_PRICE_CENTS = 799",
  "PERSONAL_NOTE_WORD_LIMIT = 13",
  "PERSONAL_NOTE_CHARACTER_LIMIT = 160",
  'return value === "hug" ? "hug" : null',
  'formData.get("personal_note")',
  "personal-note-over-13-words",
  "regular_hug_price_is_not_7_99",
  "stripe.paymentLinks.listLineItems",
  "stripe.checkout.sessions.create",
  "client_reference_id: inventoryId",
  'personal_note_placement: "before_hug_content"',
]) {
  requireText(checkout, required, "checkout route");
}

for (const forbidden of [
  'value === "short_kut"',
  'value === "big_hug"',
  "NEXT_PUBLIC_KKUT_SHORT_KUT_PAYMENT_URL",
  "NEXT_PUBLIC_KKUT_BIG_HUG_PAYMENT_URL",
]) {
  forbidText(checkout, forbidden, "checkout route");
}

for (const required of [
  "session.client_reference_id",
  "selected_hug_id: selectedInventoryId",
  "fulfill_exact_selected_ii",
  "constructEvent",
  "isVercelProduction",
  'durable_order_authority: "stripe_checkout_session"',
  "stripe_durable_manual_review_queue",
  "disabled_on_read_only_runtime",
  "manual_review_required: true",
  "personalNoteFields",
  'personal_note_placement: "before_hug_content"',
  'personal_note_capture: "optional_13_words_before_hug_content"',
]) {
  requireText(webhook, required, "Stripe webhook");
}

if (
  !webhook.includes("if (!isVercelProduction)") ||
  !webhook.includes("writeLocalPaidFulfillmentPacket(record)")
) {
  stop("Stripe webhook does not guard local packet writes away from Vercel");
}

const publicSurfaces = [browser, browse, find, hug].join("\n");
for (const forbidden of [
  "MIAL",
  "Release Gate",
  "Dispatch",
  "pre-made",
  "raw inventory",
  "local_capsule_sha256",
  "controlled_source_path",
  "$4.99",
  "$12.99",
  "$0.99",
  "donation",
  "charity",
]) {
  forbidText(publicSurfaces, forbidden, "customer UI");
}

if (/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/.test(browser + browse + find + hug)) {
  stop("customer components bypass governed checkout route");
}

console.log("BIC 2611 STOREFRONT AUDIT PASS");
console.log("PUBLIC CATALOG COUNT GATE: 2611");
console.log("PURCHASABLE K-KUT HUGS REQUIRED: 2611");
console.log("REGULAR HUG PRICE: $7.99");
console.log("PERSONAL NOTE LIMIT: 13 WORDS");
console.log("PERSONAL NOTE PLACEMENT: BEFORE HUG CONTENT");
console.log("SOURCE AUDIO CHANGED: FORBIDDEN");
console.log("SHORT KUT / BIG HUG / $0.99 ADD-ON: HELD");
console.log("CHARITABLE SALES CLAIMS: HELD");
console.log("PUBLIC STORAGE STATUS GATE: REQUIRED");
console.log("CANONICAL TWINKLE-AT-END GATE: REQUIRED");
console.log("MC-BOT ABSTENTION: REQUIRED");
console.log("EXACT II CHECKOUT REFERENCE: REQUIRED");
console.log("STRIPE SIGNATURE VERIFICATION: REQUIRED");
console.log("STRIPE DURABLE ORDER AUTHORITY: REQUIRED");
console.log("VERCEL READ-ONLY FILESYSTEM WRITE: FORBIDDEN");
console.log("MANUAL FULFILLMENT REVIEW: REQUIRED");
console.log("PUBLIC INTERNAL-PROOF LEAKS: 0");
