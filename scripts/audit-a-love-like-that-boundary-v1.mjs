import fs from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const II_ID = "ii-romance-reuse-d3dfd13c-7421-4671-8261-0c735cb51f38";
const AUDIO_PATH =
  "public/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3";
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

function sha256(filePath) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const registry = readJson("data/ii-delivery-registry/romance-reusable-ii-records.json");
const record = registry.records?.find((item) => item.ii_id === II_ID);
if (!record) fail("A LOVE LIKE THAT registry record is missing.");
if (record.start_seconds !== EXPECTED_START || record.end_seconds !== EXPECTED_END) {
  fail("A LOVE LIKE THAT must use the governed 0.000-34.875 boundary.");
}
if (record.boundary_authority?.prior_invalid_fixed_window_end_seconds !== 24) {
  fail("The superseded 24-second fixed-window defect is not documented.");
}
if (record.boundary_authority?.owner_confirmation_state !== "PENDING_CURRENT_DELIVERY_HASH_LISTEN") {
  fail("The repaired boundary must remain held for owner listening approval.");
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
if (record.release_gate?.state !== "HOLD_PENDING_OWNER_LISTEN") {
  fail("A LOVE LIKE THAT release hold is missing.");
}

const canary = readJson("data/production/first-production-canary-v1.json");
const canaryRecord = canary.records?.find((item) => item.ii_id === II_ID);
if (!canaryRecord) fail("A LOVE LIKE THAT canary record is missing.");
if (canaryRecord.status !== "TRIAGE") fail("A LOVE LIKE THAT must not be STAGE before owner approval.");
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
for (const row of bridgeRows) {
  if (row.payment_allowed !== false) fail(`${row.public_option_id} still allows payment.`);
  if (row.audio_proof_status !== "boundary_repair_pending_owner_listening") {
    fail(`${row.public_option_id} has an invalid audio proof state.`);
  }
}

if (!fs.existsSync(AUDIO_PATH)) fail("A LOVE LIKE THAT repaired delivery audio is missing.");
if (sha256(AUDIO_PATH) !== EXPECTED_SHA256) fail("Repaired delivery audio hash does not match authority.");

const probe = spawnSync(
  "ffprobe",
  [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    AUDIO_PATH,
  ],
  { encoding: "utf8" },
);

let duration = EXPECTED_DELIVERY_DURATION;
if (probe.error?.code === "ENOENT") {
  console.log(
    `Duration: ${EXPECTED_DELIVERY_DURATION.toFixed(6)} seconds (locked by verified audio hash; ffprobe unavailable)`,
  );
} else {
  if (probe.error) fail(`ffprobe failed: ${probe.error.message}`);
  if (probe.status !== 0) fail(`ffprobe failed: ${probe.stderr?.trim() || `status ${probe.status}`}`);
  duration = Number(probe.stdout.trim());
  if (!Number.isFinite(duration) || duration < 41.2 || duration > 41.35) {
    fail(`Unexpected repaired delivery duration: ${duration}`);
  }
}

console.log("PASS: A LOVE LIKE THAT uses 0.000-34.875 and remains held for owner listening.");
console.log(`SHA-256: ${EXPECTED_SHA256}`);
if (!probe.error) console.log(`Duration: ${duration.toFixed(6)} seconds`);
