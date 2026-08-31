import fs from "node:fs";
import path from "node:path";

function fail(message) {
  throw new Error(`TWO-DAY FREE CANARY AUDIT FAIL: ${message}`);
}

const read = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8"));

const manifest = read("data/production/two-day-free-canary-v1.json");
const canary = read("data/production/first-production-canary-v1.json");
const bridge = read("data/publication-bridge/public-option-records.generated.json");

if (manifest.authority !== "OWNER_APPROVED_PREPARE_AND_TEST_ONLY") fail("authority widened");
if (manifest.window?.duration_hours !== 48) fail("window is not exactly 48 hours");
if (manifest.window?.starts_at !== null || manifest.window?.ends_at !== null) fail("prepared window was activated");
if (manifest.window?.activation_requires_separate_owner_approval !== true) fail("activation approval gate missing");
if (manifest.commerce?.customer_charge_cents !== 0) fail("customer charge is not zero");
if (manifest.commerce?.stripe_used !== false) fail("Stripe must remain unused");
if (manifest.commerce?.canonical_prices_unchanged !== true) fail("canonical price lock not preserved");

for (const [key, value] of Object.entries(manifest.prohibited_changes || {})) {
  if (value !== true) fail(`prohibition weakened: ${key}`);
}

const bridgeByIi = new Map((bridge.records || []).map((record) => [
  record.kk_id_or_delivery_object_id,
  record,
]));

const eligible = (canary.records || [])
  .filter((record) => {
    const option = bridgeByIi.get(record.ii_id);
    return (
      record.status === "STAGE" &&
      (record.missing_current_proof?.length || 0) === 0 &&
      option?.audio_proof_status === "pass" &&
      option?.audio_delivery_url?.startsWith("/") &&
      option?.public_route?.startsWith("/")
    );
  })
  .sort((a, b) => String(a.ii_id).localeCompare(String(b.ii_id)));

const selected = manifest.selected_records || [];
if (eligible.length === 0) {
  if (manifest.state !== "BLOCKED_NO_ELIGIBLE_II") fail("empty eligibility is not fail-closed");
  if (selected.length !== 0) fail("unverified II selected");
} else {
  if (manifest.state !== "PREPARED_NOT_ACTIVE") fail("eligible canary has wrong prepared state");
  if (selected.length !== 1) fail("smallest canary must select exactly one II");
  if (selected[0]?.ii_id !== eligible[0]?.ii_id) fail("selection is not the smallest eligible II");
}

const held = new Set(
  (canary.records || [])
    .filter((record) => record.status !== "STAGE" || record.release_authority?.scope?.startsWith("HOLD"))
    .map((record) => record.ii_id),
);
if (selected.some((record) => held.has(record.ii_id))) fail("held II selected");

console.log("TWO-DAY FREE CANARY AUDIT: PASS");
console.log(`STATE: ${manifest.state}`);
console.log(`ELIGIBLE NON-HELD IIs: ${eligible.length}`);
console.log(`SELECTED IIs: ${selected.length}`);
console.log("WINDOW: 48 HOURS · NOT STARTED");
console.log("CUSTOMER CHARGE: $0.00 · STRIPE: UNUSED");
console.log("AUDIO GENERATION: 0 · SENSORY CHANGES: 0");
console.log("PRODUCTION AUTHORITY: NONE");
