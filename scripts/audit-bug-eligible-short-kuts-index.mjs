import fs from "node:fs";

const indexPath = "data/kut-inventory/indexes/bug-eligible-short-kuts.json";
const inventoryPath = "data/kut-inventory/neutral-kut-inventory.json";
const taxonomyPath = "data/product-taxonomy/k-kut-public-products-and-intents.json";

const failures = [];
function fail(msg) { failures.push(msg); }

if (!fs.existsSync(indexPath)) fail(`Missing BUG index: ${indexPath}`);
if (!fs.existsSync(inventoryPath)) fail(`Missing neutral inventory: ${inventoryPath}`);
if (!fs.existsSync(taxonomyPath)) fail(`Missing taxonomy: ${taxonomyPath}`);

let index = null;
let inventory = null;
let taxonomy = null;

if (fs.existsSync(indexPath)) index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
if (fs.existsSync(inventoryPath)) inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
if (fs.existsSync(taxonomyPath)) taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, "utf8"));

const inventoryByKut = new Map((inventory?.items || []).map((item) => [item.kutId, item]));
const bugRule = taxonomy?.intentContainers?.BUG;

if (!bugRule) fail("BUG rule missing from taxonomy.");

if (index) {
  if (index.ownsAudio !== false) fail("BUG index must not own audio.");
  if (index.audioIdentity !== "neutral KUT inventory only") fail("BUG index audioIdentity must be neutral KUT inventory only.");

  const r = index.publicRules || {};
  if (r.intentContainer !== "BUG") fail("BUG index publicRules.intentContainer must be BUG.");
  if (r.productFamily !== "Short-KUT") fail("BUG index publicRules.productFamily must be Short-KUT.");
  if (r.unitPriceCents !== 199) fail("BUG unit price must be 199 cents.");
  if (r.currency !== "USD") fail("BUG currency must be USD.");
  if (r.minRepeatCount !== 1) fail("BUG min repeat count must be 1.");
  if (r.maxRepeatCount !== 5) fail("BUG max repeat count must be 5.");
  if (r.repeatRequiresSchedule !== true) fail("Repeated BUGs must require scheduling.");
  if (r.uncontrolledRandomDeliveryAllowed !== false) fail("Uncontrolled random BUG delivery must be false.");
  if (r.surpriseWindowAllowedOnlyWhenExplicit !== true) fail("Surprise Window must require explicit choice.");

  for (const [i, item] of (index.items || []).entries()) {
    const label = `BUG index item ${i + 1}`;

    if (item.intentContainer !== "BUG") fail(`${label}: intentContainer must be BUG.`);
    if (item.productFamily !== "Short-KUT") fail(`${label}: productFamily must be Short-KUT.`);
    if (item.displayProductFamily !== "Short-KUT") fail(`${label}: displayProductFamily must be Short-KUT.`);
    if (item.bugEligible !== true) fail(`${label}: bugEligible must be true.`);
    if (item.unitPriceCents !== 199) fail(`${label}: unitPriceCents must be 199.`);
    if (item.currency !== "USD") fail(`${label}: currency must be USD.`);
    if (item.minRepeatCount !== 1) fail(`${label}: minRepeatCount must be 1.`);
    if (item.maxRepeatCount !== 5) fail(`${label}: maxRepeatCount must be 5.`);
    if (JSON.stringify(item.allowedRepeatCounts) !== JSON.stringify([1,2,3,4,5])) fail(`${label}: allowedRepeatCounts must be [1,2,3,4,5].`);
    if (item.repeatRequiresSchedule !== true) fail(`${label}: repeatRequiresSchedule must be true.`);
    if (!/^KUT-[A-F0-9]{12}$/.test(item.kutId || "")) fail(`${label}: kutId must be neutral KUT-XXXXXXXXXXXX.`);
    if (!/^II-[A-F0-9]{12}$/.test(item.iiId || "")) fail(`${label}: iiId must be neutral II-XXXXXXXXXXXX.`);
    if (!/^KK-[A-F0-9]{12}$/.test(item.kkId || "")) fail(`${label}: kkId must be neutral KK-XXXXXXXXXXXX.`);
    if (!String(item.canonicalAudioUrl || "").startsWith("/kuts/inventory/")) fail(`${label}: canonicalAudioUrl must use /kuts/inventory/.`);

    if (/BUG[-_]KUT|BUG[-_]KK|BUG[-_]II/i.test(JSON.stringify(item))) {
      fail(`${label}: BUG must not be part of canonical audio identity.`);
    }

    const inv = inventoryByKut.get(item.kutId);
    if (!inv) {
      fail(`${label}: kutId ${item.kutId} not found in neutral inventory.`);
    } else {
      if (inv.canonicalAudioUrl !== item.canonicalAudioUrl) {
        fail(`${label}: canonicalAudioUrl does not match neutral inventory for ${item.kutId}.`);
      }
    }

    const sched = item.deliveryScheduling || {};
    if (sched.defaultForRepeatedBugs !== "scheduled_or_event_based") fail(`${label}: repeated BUG default must be scheduled_or_event_based.`);
    if (sched.repeatCountRequiresSchedule !== true) fail(`${label}: repeatCountRequiresSchedule must be true.`);
    if (sched.requiresExplicitTimingChoiceForRepeat !== true) fail(`${label}: requiresExplicitTimingChoiceForRepeat must be true.`);
    if (sched.uncontrolledRandomDeliveryAllowed !== false) fail(`${label}: uncontrolledRandomDeliveryAllowed must be false.`);
    if (sched.randomByDefaultAllowed !== false) fail(`${label}: randomByDefaultAllowed must be false.`);
    if (sched.surpriseWindowAllowed !== true) fail(`${label}: surpriseWindowAllowed must be true.`);
    if (sched.surpriseWindowRequiresExplicitUserChoice !== true) fail(`${label}: surpriseWindowRequiresExplicitUserChoice must be true.`);
    if (sched.surpriseWindowIsControlledWindow !== true) fail(`${label}: surpriseWindowIsControlledWindow must be true.`);

    const forbiddenModes = new Set(sched.forbiddenScheduleModes || []);
    for (const mode of ["uncontrolled_random", "random_by_default", "until_they_answer", "pester_loop"]) {
      if (!forbiddenModes.has(mode)) fail(`${label}: missing forbidden schedule mode ${mode}.`);
    }

    if (!item.safetyToneGate?.required) fail(`${label}: safetyToneGate.required must be true.`);
  }
}

if (failures.length) {
  console.error("BUG ELIGIBLE SHORT-KUT INDEX AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("BUG ELIGIBLE SHORT-KUT INDEX AUDIT: PASS");
console.log("BUG index points to neutral KUT inventory only; every BUG item is Short-KUT-only, $1.99, repeatable 1–5, and schedule-required when repeated.");
if (index) {
  console.log(`BUG inventory count: ${index.items?.length || 0}`);
  console.log(`Launch status: ${index.launchStatus}`);
}
