import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const lockPath = path.join(root, "config", "kkr-canonical-product-price-lock.v2.json");
const historicalV1Path = path.join(root, "config", "kkr-canonical-product-price-lock.v1.json");
const mirrorPath = path.join(root, "lib", "kkr-canonical-pricing.ts");
const expected = Object.freeze({ HUG: 799, TUG: 499, BUG: 199 });

function fail(message) {
  console.error("KKR CANONICAL PRICE LOCK FAIL: " + message);
  process.exit(1);
}

if (!fs.existsSync(lockPath)) fail("V002 machine-readable lock is missing");
if (!fs.existsSync(historicalV1Path)) fail("V001 historical lock is missing");
if (!fs.existsSync(mirrorPath)) fail("TypeScript canonical mirror is missing");

const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
if (lock.schema_version !== "KKR_CANONICAL_PRODUCT_PRICE_LOCK_V002") fail("schema version changed");
if (lock.status !== "PERMANENT_CANONICAL_LAW") fail("canonical status changed");
if (lock.currency !== "USD") fail("currency must remain USD");
if (lock.supersedes !== "KKR_CANONICAL_PRODUCT_PRICE_LOCK_V001") fail("V001 supersession missing");
if (lock.change_control?.silent_edits_prohibited !== true) fail("silent edits must remain prohibited");
if (lock.change_control?.new_numbered_lock_required !== true) fail("new numbered lock requirement changed");
if (lock.change_control?.explicit_GD_decision_required !== true) fail("explicit GD decision requirement changed");
if (Object.keys(lock.prices_cents || {}).sort().join(",") !== "BUG,HUG,TUG") fail("product price keys changed");

for (const [name, cents] of Object.entries(expected)) {
  if (lock.prices_cents?.[name] !== cents) fail(name + " must remain " + cents + " cents");
}
if (lock.delivery_law?.BUG_TOTAL_TIMED_SENDS !== 3) fail("BUG must remain exactly 3 total timed Sends");

const mirror = fs.readFileSync(mirrorPath, "utf8");
for (const [name, cents] of Object.entries(expected)) {
  if (!mirror.includes(name + ": " + cents + ",")) fail("TypeScript mirror drift: " + name);
}
if (!mirror.includes("BUG_TOTAL_TIMED_SENDS: 3")) fail("BUG timed Sends mirror drift");

console.log("KKR CANONICAL PRODUCT / PRICE LOCK V002 AUDIT PASS");
console.log("HUG: $7.99");
console.log("TUG: $4.99");
console.log("BUG: $1.99 · 3 total timed Sends");
