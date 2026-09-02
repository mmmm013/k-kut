import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const parse = (file) => JSON.parse(read(file));
const fail = (message) => { throw new Error(`CURRENT-II AUTHORITY AUDIT FAIL: ${message}`); };

const bridgeData = parse("data/publication-bridge/public-option-records.generated.json");
const canary = parse("data/production/first-production-canary-v1.json");
const bridgeRuntime = read("lib/publication-bridge/approvedPublicOptions.ts");
const checkout = read("app/checkout/route.ts");
const publicOptionGrid = read("components/ApprovedPublicOptionGrid.tsx");
const directK = read("app/k/[id]/page.tsx");
const directMk = read("app/mkut/[id]/page.tsx");
const hugPage = read("app/hug/[id]/page.tsx");
const hugApi = read("app/api/hug/[id]/route.ts");
const fulfillment = read("app/api/4pe/fulfillment/route.ts");
const webhook = read("app/api/stripe/webhook/route.ts");
const discovery = read("scripts/discover-pix-kk-batch-source-catalog.mjs");
const discoveryBoundary = parse("config/current-ii-discovery-boundary.v1.json");
const rollbackSql = read("supabase/rollback-only/current_ii_authority_containment_v1.sql");

const productLaw = new Map([
  ["HUG", { inventoryFamily: "KK", priceCents: 799 }],
  ["TUG", { inventoryFamily: "SK", priceCents: 499 }],
  ["BUG", { inventoryFamily: "MK", priceCents: 199 }],
]);

const staged = new Map((canary.records || [])
  .filter((record) => record.status === "STAGE" && (record.missing_current_proof?.length || 0) === 0)
  .map((record) => [record.ii_id, record]));

for (const record of canary.records || []) {
  const expected = productLaw.get(record.product_family);
  if (!expected) fail(`invalid canary product family ${record.ii_id}`);
  if (record.inventory_family !== expected.inventoryFamily) fail(`canary product/inventory mismatch ${record.ii_id}`);
  if (record.price_cents !== expected.priceCents) fail(`canary product/price mismatch ${record.ii_id}`);
}

const eligible = (bridgeData.records || []).filter((record) => {
  const stage = staged.get(record.kk_id_or_delivery_object_id);
  return Boolean(stage && stage.product_family === record.product_family && stage.inventory_family === record.inventory_family && stage.price_cents === record.price_cents && record.audio_proof_status === "pass" && record.payment_allowed === true);
});

for (const required of [
  "staged.get(record.kk_id_or_delivery_object_id)",
  "canary.product_family === record.product_family",
  "canary.inventory_family === record.inventory_family",
  "canary.price_cents === record.price_cents",
]) if (!bridgeRuntime.includes(required)) fail(`bridge runtime missing ${required}`);

for (const forbidden of ["CATALOG_URL", "verifiedInventoryFamily", "/storage/v1/object/public/ii-delivery/catalog/public-ii-catalog.json"])
  if (checkout.includes(forbidden)) fail(`checkout retains legacy authority ${forbidden}`);

for (const required of [
  'HUG: { inventoryFamily: "KK", offer: "kk", priceCents: 799 }',
  'TUG: { inventoryFamily: "SK", offer: "sk", priceCents: 499 }',
  'BUG: { inventoryFamily: "MK", offer: "mk", priceCents: 199 }',
  "findApprovedPublicOptionByPublicOptionId",
  "stripe.checkout.sessions.create",
  "createPendingH2Order",
  'process.env.VERCEL_ENV !== "production"',
]) if (!checkout.includes(required)) fail(`shared checkout missing ${required}`);

for (const required of ['action="/checkout"', 'name="public_option_id"', 'name="ii"'])
  if (!publicOptionGrid.includes(required)) fail(`public option grid missing ${required}`);
if (publicOptionGrid.includes("buy.stripe.com") || publicOptionGrid.includes("stripe_url_if_payment_allowed"))
  fail("public option grid retains legacy payment-link dependency");

for (const [name, source] of [["direct K-KUT route", directK], ["direct mini-KUT route", directMk]]) {
  if (!source.includes("findApprovedPublicOptionByAnyId")) fail(`${name} lacks current-II lookup`);
  for (const forbidden of ["createClient", "k_kut_audio_qc", "m_kut_assets"]) if (source.includes(forbidden)) fail(`${name} retains ${forbidden}`);
}
for (const [name, source] of [["HUG delivery page", hugPage], ["HUG delivery API", hugApi]]) {
  if (!source.includes("findApprovedPublicOptionByInventoryId")) fail(`${name} lacks current-II lookup`);
  if (source.includes("k_kut_audio_qc")) fail(`${name} still reads legacy playable authority`);
}

for (const required of ["current_ii_not_staged", "findApprovedPublicOptionByPublicOptionId", "currentOption.kk_id_or_delivery_object_id !== selectedHugId", "selected_public_option_id: selectedPublicOptionId"])
  if (!fulfillment.includes(required)) fail(`4PE fulfillment missing ${required}`);
for (const required of ["enforceCurrentIiAuthority", "findApprovedPublicOptionByPublicOptionId", "option.kk_id_or_delivery_object_id !== inventoryId", "selected_public_option_id", "paid_held_current_ii_authority", 'hug_link_status: "blocked_current_ii_hold"'])
  if (!webhook.includes(required)) fail(`Stripe webhook missing ${required}`);
if (webhook.includes("fulfillmentQueueStatus = record.selected_hug_id")) fail("payment_intent.succeeded can create duplicate fulfillment");
if (!webhook.includes('fulfillment_authority: "checkout.session.completed"')) fail("Stripe webhook lacks single fulfillment-event authority");

if (discovery.includes('candidate_generation_status: "ready_for_batch_candidate_generation"')) fail("legacy repo discovery still marks candidates ready");
if (discoveryBoundary.repo_keyword_discovery_is_authority !== false) fail("repo keyword discovery remains authority");
for (const requiredPrefix of ["data/gpmc-sensory/batch-scale", "data/hugz", "data/ii-delivery-registry", "data/production", "data/publication-bridge", "data/sentimeant", "public"])
  if (!discoveryBoundary.excluded_path_prefixes.includes(requiredPrefix)) fail(`discovery boundary missing ${requiredPrefix}`);

for (const required of ["begin;", "revoke select on table", "drop policy if exists", "update storage.buckets", "remaining_public_storage_policy_count", "raise exception", "rollback;"])
  if (!rollbackSql.toLowerCase().includes(required)) fail(`rollback-only SQL missing ${required}`);

console.log("CURRENT-II AUTHORITY ENFORCEMENT AUDIT: PASS");
console.log(`CANARY RECORDS: ${(canary.records || []).length}`);
console.log(`STAGE IIs: ${staged.size}`);
console.log(`RUNTIME-ELIGIBLE PUBLIC OPTIONS: ${eligible.length}`);
console.log("SHARED CHECKOUT PRODUCT LAW: HUG 799 / TUG 499 / BUG 199");
console.log("LEGACY CHECKOUT CATALOG AUTHORITY: REMOVED");
console.log("LEGACY FULFILLMENT AUTHORITY: BLOCKED");
console.log("DATABASE CONTAINMENT: ROLLBACK-ONLY SQL PRESENT");
