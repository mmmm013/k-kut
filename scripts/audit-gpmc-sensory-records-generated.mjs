import fs from "node:fs";

const publicPath = "data/publication-bridge/public-option-records.generated.json";
const sensoryPath = "data/gpmc-sensory/sensory-emotional-records.generated.json";
const templatePath = "data/gpmc-sensory/sensory-emotional-record-template.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("GPMC GENERATED SENSORY RECORDS AUDIT");

for (const file of [publicPath, sensoryPath, templatePath]) {
  if (!fs.existsSync(file)) fail(`Missing ${file}`);
}

const publicData = fs.existsSync(publicPath)
  ? JSON.parse(fs.readFileSync(publicPath, "utf8"))
  : { records: [] };

const sensoryData = fs.existsSync(sensoryPath)
  ? JSON.parse(fs.readFileSync(sensoryPath, "utf8"))
  : { records: [] };

const publicRecords = publicData.records || [];
const sensoryRecords = sensoryData.records || [];

if (sensoryRecords.length !== publicRecords.length) {
  fail(`Expected ${publicRecords.length} sensory records, found ${sensoryRecords.length}.`);
}

const publicIds = new Set(publicRecords.map((record) => record.public_option_id));
const sensoryPublicIds = new Set();

const requiredTopFields = [
  "record_id",
  "source_public_option_id",
  "source_pix_id_or_track_id",
  "source_title",
  "source_type",
  "public_option_id",
  "public_route",
  "audio_delivery_url",
  "stripe_url_if_payment_allowed",
  "surface_feeling",
  "deeper_feelings",
  "interpretation_summary",
  "action_object_meaning",
  "sensory_profile",
  "emotional_coordinates",
  "good_use_cases",
  "bad_use_cases",
  "risk_notes",
  "buyer_words",
  "receiver_safe_words",
  "do_not_say",
  "review_status",
  "human_review_notes"
];

for (const record of sensoryRecords) {
  for (const field of requiredTopFields) {
    if (!(field in record)) fail(`${record.record_id || "(missing id)"} missing ${field}`);
  }

  if (!publicIds.has(record.public_option_id)) {
    fail(`${record.record_id} references unknown public_option_id ${record.public_option_id}`);
  }

  sensoryPublicIds.add(record.public_option_id);

  if (record.review_status !== "approved_public") {
    fail(`${record.record_id} must be approved_public.`);
  }

  for (const axis of ["audio", "body", "visual", "touch", "memory"]) {
    if (!Array.isArray(record.sensory_profile?.[axis]) || record.sensory_profile[axis].length < 2) {
      fail(`${record.record_id} needs sensory_profile.${axis} with at least 2 entries.`);
    }
  }

  for (const coord of [
    "valence",
    "arousal",
    "control_or_agency",
    "social_direction",
    "time_direction"
  ]) {
    if (!record.emotional_coordinates?.[coord]) {
      fail(`${record.record_id} missing emotional coordinate ${coord}.`);
    }
  }

  for (const listField of [
    "deeper_feelings",
    "good_use_cases",
    "bad_use_cases",
    "risk_notes",
    "buyer_words",
    "receiver_safe_words",
    "do_not_say"
  ]) {
    if (!Array.isArray(record[listField]) || record[listField].length < 1) {
      fail(`${record.record_id} missing non-empty ${listField}.`);
    }
  }

  for (const forbidden of [
    "guaranteed emotional result",
    "we know exactly what they feel",
    "this will fix it",
    "vulnerability score",
    "manipulation prediction",
    "mk-products",
    "internal_proof",
    "candidate_not_approved",
    "raw inventory"
  ]) {
    if (JSON.stringify(record).includes(forbidden)) {
      fail(`${record.record_id} contains forbidden phrase: ${forbidden}`);
    }
  }
}

for (const id of publicIds) {
  if (!sensoryPublicIds.has(id)) {
    fail(`Missing sensory record for public option ${id}`);
  }
}

const requiredRoutes = [
  "/romance",
  "/wedding",
  "/kupid",
  "/personal/anniversary",
  "/personal/apology"
];

for (const route of requiredRoutes) {
  if (!sensoryRecords.some((record) => record.public_route === route)) {
    fail(`Missing sensory record for route ${route}`);
  }
}

if (failed) {
  console.error("GPMC GENERATED SENSORY RECORDS AUDIT: FAIL");
  process.exit(1);
}

console.log(`GPMC GENERATED SENSORY RECORDS AUDIT: PASS (${sensoryRecords.length} records)`);
