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
if (lock.addons_cents?.STORY_BUG_SEQUENCING !== 99) fail("Story BUG sequencing add-on must remain 99 cents");
if (lock.package_totals_cents?.REPEAT_BUG !== 199) fail("Repeat BUG total must remain 199 cents");
if (lock.package_totals_cents?.STORY_BUG !== 298) fail("Story BUG total must remain 298 cents");
if (JSON.stringify(lock.delivery_law?.BUG_DELIVERY_MODES) !== JSON.stringify(["REPEAT", "STORY_ARC"])) fail("BUG delivery modes changed");
if (lock.delivery_law?.REPEAT_BUG_SAME_EXACT_BUG_EACH_SEND !== true) fail("Repeat BUG must reuse the same exact BUG");
if (lock.delivery_law?.REPEAT_BUG_CONTENT_HASH_MUST_MATCH_ACROSS_SENDS !== true) fail("Repeat BUG hashes must match");
if (lock.delivery_law?.STORY_BUG_DISTINCT_BUG_EACH_SEND !== true) fail("Story BUG must use three distinct BUGs");
if (lock.delivery_law?.STORY_BUG_RELATED_THEME_REQUIRED !== true) fail("Story BUGs must be related");
if (JSON.stringify(lock.delivery_law?.STORY_BUG_SEQUENCE_ROLES) !== JSON.stringify(["HOOK", "BUILD", "PAYOFF"])) fail("Story BUG sequence changed");
if (lock.delivery_law?.STORY_BUG_RANDOMIZED_ONLY_AT_ASSEMBLY !== true) fail("Story BUG may randomize only at assembly");
if (lock.delivery_law?.STORY_BUG_SEQUENCING_ADDON_CENTS !== 99) fail("Story BUG sequencing add-on must remain 99 cents");
if (lock.delivery_law?.STORY_BUG_TOTAL_CENTS !== 298) fail("Story BUG total must remain 298 cents");
if (lock.delivery_law?.BUG_PACKAGE_LOCKED_BEFORE_SEND_ONE !== true) fail("BUG package must lock before Send 1");
if (lock.delivery_law?.BUG_BILLING_COUNT !== 1) fail("BUG must be billed once");

const mirror = fs.readFileSync(mirrorPath, "utf8");
for (const [name, cents] of Object.entries(expected)) {
  if (!mirror.includes(name + ": " + cents + ",")) fail("TypeScript mirror drift: " + name);
}
if (!mirror.includes("BUG_TOTAL_TIMED_SENDS: 3")) fail("BUG timed Sends mirror drift");
if (!mirror.includes("STORY_BUG_SEQUENCING: 99")) fail("Story BUG add-on price mirror drift");
if (!mirror.includes("REPEAT_BUG: 199")) fail("Repeat BUG total mirror drift");
if (!mirror.includes("STORY_BUG: 298")) fail("Story BUG total price mirror drift");
if (!mirror.includes('BUG_DELIVERY_MODES: ["REPEAT", "STORY_ARC"]')) fail("BUG modes mirror drift");
if (!mirror.includes("REPEAT_BUG_SAME_EXACT_BUG_EACH_SEND: true")) fail("Repeat BUG mirror drift");
if (!mirror.includes("STORY_BUG_DISTINCT_BUG_EACH_SEND: true")) fail("Story BUG distinctness mirror drift");
if (!mirror.includes('STORY_BUG_SEQUENCE_ROLES: ["HOOK", "BUILD", "PAYOFF"]')) fail("Story BUG sequence mirror drift");
if (!mirror.includes("STORY_BUG_SEQUENCING_ADDON_CENTS: 99")) fail("Story BUG add-on mirror drift");
if (!mirror.includes("STORY_BUG_TOTAL_CENTS: 298")) fail("Story BUG total mirror drift");
if (!mirror.includes("BUG_PACKAGE_LOCKED_BEFORE_SEND_ONE: true")) fail("BUG package-lock mirror drift");
if (!mirror.includes("BUG_BILLING_COUNT: 1")) fail("BUG billing mirror drift");

console.log("KKR CANONICAL PRODUCT / PRICE LOCK V002 AUDIT PASS");
console.log("HUG: $7.99");
console.log("TUG: $4.99");
console.log("BUG: $1.99 · Repeat or Story Arc · 3 timed Sends · billed once");
