import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "data", "production", "first-production-canary-v1.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const allowed = new Set(["STAGE", "TRIAGE", "BLOCKED_MISSING_AUTHORITY"]);
const productLaw = new Map([
  ["HUG", { inventoryFamily: "KK", priceCents: 799 }],
  ["TUG", { inventoryFamily: "SK", priceCents: 499 }],
  ["BUG", { inventoryFamily: "MK", priceCents: 199 }],
]);
if (manifest.schema_version !== "first-production-canary-v1") throw new Error("Wrong canary schema");
if (manifest.price?.unit_amount_cents !== 799 || manifest.price?.currency !== "usd") {
  throw new Error("HUG canary price must be exactly USD 7.99");
}
if (!Array.isArray(manifest.records) || manifest.records.length < 1 || manifest.records.length > 5) {
  throw new Error("First Production canary must contain 1-5 records");
}
const ids = new Set();
for (const record of manifest.records) {
  if (!allowed.has(record.status)) throw new Error(`Invalid status: ${record.status}`);
  if (ids.has(record.ii_id)) throw new Error(`Duplicate II: ${record.ii_id}`);
  ids.add(record.ii_id);
  const expectedProduct = productLaw.get(record.product_family);
  if (!expectedProduct) throw new Error(`Invalid product family: ${record.ii_id}`);
  if (record.inventory_family !== expectedProduct.inventoryFamily) {
    throw new Error(`Product/inventory mismatch: ${record.ii_id}`);
  }
  if (record.price_cents !== expectedProduct.priceCents) {
    throw new Error(`Product price mismatch: ${record.ii_id}`);
  }
  if (!/^[a-f0-9]{64}$/.test(record.delivery_sha256 || "")) {
    throw new Error(`Missing delivery hash: ${record.ii_id}`);
  }
  const file = path.join(root, "public", record.delivery_audio_url.replace(/^\//, ""));
  if (!fs.existsSync(file)) throw new Error(`Delivery audio absent: ${record.ii_id}`);
  if (record.status === "STAGE" && record.missing_current_proof?.length) {
    throw new Error(`STAGE record still has missing proof: ${record.ii_id}`);
  }
}
console.log(`FIRST PRODUCTION CANARY PASS: ${manifest.records.length} candidates; ${manifest.records.filter(r=>r.status==="STAGE").length} STAGE; exact product/inventory/price mapping locked`);
