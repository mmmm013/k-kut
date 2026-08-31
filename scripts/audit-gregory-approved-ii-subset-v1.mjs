import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const parse = (file) => JSON.parse(read(file));
const fail = (message) => {
  throw new Error(`GREGORY-APPROVED II SUBSET AUDIT FAIL: ${message}`);
};

const manifest = parse(
  "data/production/gregory-approved-kk-subset-v1.json",
);
const audioRoute = read(
  "app/api/approved-ii-audio/[publicOptionId]/route.ts",
);
const checkoutRoute = read("app/api/approved-ii-checkout/route.ts");
const webhookRoute = read("app/api/stripe/webhook/route.ts");
const page = read("app/approved-iis/page.tsx");
const grid = read("components/ApprovedIiReleaseGrid.tsx");

if (manifest.schema_version !== "gregory-approved-kk-subset-v1") {
  fail("wrong schema version");
}
if (manifest.storage_bucket !== "tracks") fail("wrong storage bucket");
if (manifest.prices_cents?.regular_hug !== 799) {
  fail("regular HUG price is not 799 cents");
}
if (manifest.prices_cents?.holiday_hug !== 1499) {
  fail("holiday HUG price is not 1499 cents");
}
if (manifest.release_authority?.required_deploy_state !== "DEPLOYABLE_INVENTORY") {
  fail("deployable-inventory authority missing");
}
if (manifest.release_authority?.required_gregory_decision !== "APPROVE_KK_TRIMMED") {
  fail("Gregory approval authority missing");
}

const titles = manifest.titles || [];
const items = titles.flatMap((title) =>
  (title.items || []).map((item) => ({ ...item, title })),
);
if (titles.length !== 6) fail(`expected 6 titles; found ${titles.length}`);
if (items.length !== 36) fail(`expected 36 IIs; found ${items.length}`);

const ids = new Set();
const objectPaths = new Set();
for (const title of titles) {
  if ((title.items || []).length !== 6) {
    fail(`${title.source_title} does not contain exactly 6 IIs`);
  }
  for (const item of title.items || []) {
    if (ids.has(item.batch_item_id)) fail(`duplicate batch item ${item.batch_item_id}`);
    if (objectPaths.has(item.storage_object_path)) {
      fail(`duplicate storage object ${item.storage_object_path}`);
    }
    ids.add(item.batch_item_id);
    objectPaths.add(item.storage_object_path);
    if (!/^\d+_[a-z0-9-]+_blk[1-6]_[a-z0-9-]+\.mp3$/.test(item.storage_object_path)) {
      fail(`invalid storage object path for ${item.batch_item_id}`);
    }
  }
}

const christmas = titles.find((title) => title.source_title === "C'MON CHRISTMAS!");
if (!christmas || christmas.container !== "holiday_hug") {
  fail("intrinsic Christmas title escaped the holiday container");
}
for (const title of titles.filter((candidate) => candidate !== christmas)) {
  if (title.container !== "regular_hug") {
    fail(`${title.source_title} is incorrectly assigned to a holiday container`);
  }
}

for (const required of [
  "findApprovedIiReleaseByPublicOptionId",
  ".createSignedUrl(",
  "approvedIiRelease.signedUrlTtlSeconds",
  '"Cache-Control": "private, no-store, max-age=0"',
]) {
  if (!audioRoute.includes(required)) fail(`audio route missing ${required}`);
}
for (const forbidden of ["getPublicUrl", "download: true", "/object/public/"]) {
  if (audioRoute.includes(forbidden)) fail(`audio route exposes ${forbidden}`);
}

for (const required of [
  "K_KUT_REGULAR_HUG_STRIPE_PAYMENT_LINK",
  "K_KUT_HOLIDAY_HUG_STRIPE_PAYMENT_LINK",
  'url.hostname !== "buy.stripe.com"',
  'paymentLink.searchParams.set("client_reference_id", item.publicOptionId)',
]) {
  if (!checkoutRoute.includes(required)) fail(`checkout route missing ${required}`);
}
if (checkoutRoute.includes("stripe.checkout.sessions.create")) {
  fail("subset route unexpectedly creates Stripe Checkout Sessions");
}
for (const required of [
  "findApprovedIiReleaseByPublicOptionId",
  "approvedSubsetOption.priceCents",
  "record.amount_paid_usd",
  "selected_public_option_id: approvedSubsetOption.publicOptionId",
]) {
  if (!webhookRoute.includes(required)) fail(`webhook missing ${required}`);
}

for (const required of [
  "36 Gregory-approved real-music IIs",
  "30 regular HUG moments at $7.99",
  "$14.99 holiday container",
  "No AI audio",
]) {
  if (!page.includes(required)) fail(`release page missing ${required}`);
}
for (const required of [
  'controlsList="nodownload noplaybackrate"',
  'preload="none"',
  "Checkout opens after Stripe price verification",
]) {
  if (!grid.includes(required)) fail(`release grid missing ${required}`);
}

console.log("GREGORY-APPROVED II SUBSET AUDIT: PASS");
console.log("APPROVED IIs: 36");
console.log("REGULAR HUG IIs: 30 AT $7.99");
console.log("INTRINSIC CHRISTMAS IIs: 6 AT $14.99");
console.log("PUBLIC STORAGE URLS: 0");
console.log("CHECKOUT: ENV-LOCKED STRIPE PAYMENT LINKS");
