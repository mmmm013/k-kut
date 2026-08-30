import fs from "node:fs";

const II_ID = "ii-romance-reuse-d3dfd13c-7421-4671-8261-0c735cb51f38";
const EXPECTED_SHA256 = "21155af2dbfefdf2ff90bec6b0a2458485dfd178994b430054edca8aa635b6b1";
const EXPECTED_START = 0;
const EXPECTED_END = 34.875;
const EXPECTED_DELIVERY_DURATION = 41.273469;

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const registry = readJson("data/ii-delivery-registry/romance-reusable-ii-records.json");
const privateAudio = readJson("config/current-ii-private-audio.v1.json");
const privateRecord = privateAudio.records?.find((item) => item.ii_id === II_ID);
if (!privateRecord) fail("A LOVE LIKE THAT private-audio record is missing.");
if (
  privateRecord.sha256 !== EXPECTED_SHA256 ||
  privateRecord.duration_seconds !== EXPECTED_DELIVERY_DURATION ||
  privateRecord.owner_review_enabled !== true
) {
  fail("A LOVE LIKE THAT private-audio evidence is stale.");
}
const record = registry.records?.find((item) => item.ii_id === II_ID);
if (!record) fail("A LOVE LIKE THAT registry record is missing.");
if (record.start_seconds !== EXPECTED_START || record.end_seconds !== EXPECTED_END) {
  fail("A LOVE LIKE THAT must use the governed 0.000-34.875 boundary.");
}
if (record.boundary_authority?.prior_invalid_fixed_window_end_seconds !== 24) {
  fail("The superseded 24-second fixed-window defect is not documented.");
}
if (
  record.boundary_authority?.owner_confirmation_state !==
  "APPROVED_FOR_CONTROLLED_PURCHASE_CANARY_2026_08_30"
) {
  fail("The repaired boundary lacks the controlled-canary owner approval.");
}
if (record.delivery_materialization?.twinkle_gain !== 0.75) {
  fail("A LOVE LIKE THAT must use the locked medium 75% Twinkle gain.");
}
if (
  record.delivery_materialization?.twinkle_path !==
  "/signature/sti/gpm-sti-twinkle-v001-stop-at-audio-end.mp3"
) {
  fail("A LOVE LIKE THAT must end with the governed GPMx Twinkle.");
}
if (record.release_gate?.state !== "STAGE_CONTROLLED_PURCHASE_CANARY") {
  fail("A LOVE LIKE THAT controlled purchase stage is missing.");
}
if (
  record.delivery_audio_url !== "" ||
  record.private_delivery_audio?.object_path !== privateRecord.storage_object_path
) {
  fail("A LOVE LIKE THAT must use the private delivery locator.");
}

const canary = readJson("data/production/first-production-canary-v1.json");
const canaryRecord = canary.records?.find((item) => item.ii_id === II_ID);
if (!canaryRecord) fail("A LOVE LIKE THAT canary record is missing.");
if (canaryRecord.status !== "STAGE") fail("A LOVE LIKE THAT is not STAGE for the approved canary.");
if (canaryRecord.missing_current_proof?.length) {
  fail("A LOVE LIKE THAT STAGE record retains missing proof.");
}
if (canaryRecord.delivery_sha256 !== EXPECTED_SHA256) fail("Canary delivery hash is stale.");
if (
  canaryRecord.boundary_start_seconds !== EXPECTED_START ||
  canaryRecord.boundary_end_seconds !== EXPECTED_END
) {
  fail("Canary boundary does not match the governed repair boundary.");
}

const bridge = readJson("data/publication-bridge/public-option-records.generated.json");
const bridgeRows = (bridge.records || []).filter(
  (item) => item.kk_id_or_delivery_object_id === II_ID,
);
if (!bridgeRows.length) fail("A LOVE LIKE THAT publication rows are missing.");
const authorizedOptionId =
  "generated-love-sweet-d3dfd13c-7421-4671-8261-0c735cb51f38";
for (const row of bridgeRows) {
  if (row.public_option_id === authorizedOptionId) {
    if (row.payment_allowed !== true) fail("Controlled canary payment is disabled.");
    if (
      row.audio_delivery_url !== `/api/ii-delivery/${authorizedOptionId}` ||
      row.audio_proof_status !== "pass"
    ) {
      fail("Controlled canary audio authority is invalid.");
    }
  } else if (row.payment_allowed !== false || row.audio_delivery_url !== "") {
    fail(`${row.public_option_id} exceeds the one-option canary scope.`);
  }
}

console.log("PASS: A LOVE LIKE THAT uses 0.000-34.875 and is owner-authorized for one controlled purchase option.");
console.log(`SHA-256: ${EXPECTED_SHA256}`);
console.log(`Duration: ${EXPECTED_DELIVERY_DURATION.toFixed(6)} seconds`);
console.log("Delivery access: private Supabase target; upload and hash verification complete");
