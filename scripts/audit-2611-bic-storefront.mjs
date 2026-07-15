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
  "Choose this K-KUT",
  "stopOtherAudio",
]) {
  requireText(browser, required, "public browser");
}

for (const required of [
  "Browse All K-KUTs",
  "PublicIiBrowser",
  "exact K-KUT ID travels into checkout",
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
  "client_reference_id",
  "APPROVED_PAYMENT_LINKS",
  "invalid-selection",
  "offer-checkout-held",
  "ii_catalog",
]) {
  requireText(checkout, required, "checkout route");
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
]) {
  forbidText(publicSurfaces, forbidden, "customer UI");
}

if (/https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/.test(browser + browse + find + hug)) {
  stop("customer components bypass governed checkout route");
}

console.log("BIC 2611 STOREFRONT AUDIT PASS");
console.log("PUBLIC CATALOG COUNT GATE: 2611");
console.log("PUBLIC STORAGE STATUS GATE: REQUIRED");
console.log("CANONICAL TWINKLE-AT-END GATE: REQUIRED");
console.log("MC-BOT ABSTENTION: REQUIRED");
console.log("EXACT II CHECKOUT REFERENCE: REQUIRED");
console.log("STRIPE SIGNATURE VERIFICATION: REQUIRED");
console.log("STRIPE DURABLE ORDER AUTHORITY: REQUIRED");
console.log("VERCEL READ-ONLY FILESYSTEM WRITE: FORBIDDEN");
console.log("MANUAL FULFILLMENT REVIEW: REQUIRED");
console.log("PUBLIC INTERNAL-PROOF LEAKS: 0");
