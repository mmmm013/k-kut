import fs from "node:fs";

const contractPath = "data/publication-bridge/k-kut-publication-bridge-contract.json";
const generatedPath = "data/publication-bridge/public-option-records.generated.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("GENERATED PUBLIC OPTION RECORDS AUDIT");

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const generated = JSON.parse(fs.readFileSync(generatedPath, "utf8"));
const canary = JSON.parse(
  fs.readFileSync("data/production/first-production-canary-v1.json", "utf8"),
);
const stagedIds = new Set(
  (canary.records || [])
    .filter(
      (record) =>
        record.status === "STAGE" &&
        (record.missing_current_proof?.length || 0) === 0,
    )
    .map((record) => record.ii_id),
);

if (!Array.isArray(generated.records) || generated.records.length < 1) {
  fail("Generated bridge registry must contain at least one record.");
}

const ids = new Set();

for (const record of generated.records || []) {
  if (ids.has(record.public_option_id)) fail(`Duplicate public_option_id: ${record.public_option_id}`);
  ids.add(record.public_option_id);

  for (const field of contract.required_bridge_fields) {
    if (!(field in record)) fail(`${record.public_option_id} missing required field: ${field}`);
  }

  if (!record.audio_delivery_url?.startsWith("/ii-delivery/")) {
    fail(`${record.public_option_id} audio must be public II delivery audio.`);
  }

  if (record.public_route && !contract.known_public_routes.includes(record.public_route) && !record.public_route.startsWith("/personal/")) {
    fail(`${record.public_option_id} public route not allowed: ${record.public_route}`);
  }

  const staged = stagedIds.has(record.kk_id_or_delivery_object_id);
  if (staged) {
    if (record.approval_status !== "public_approved_generated_from_reusable_ii") {
      fail(`${record.public_option_id} STAGE record has wrong approval status.`);
    }
    if (record.audio_proof_status !== "pass" || record.payment_allowed !== true) {
      fail(`${record.public_option_id} STAGE record lacks audio/payment proof.`);
    }
  }

  const text = JSON.stringify(record).toLowerCase();
  for (const forbidden of [
    "mini-kut",
    "mk-products",
    "candidate_not_approved",
    "needs_bookend",
    "internal_proof",
    "local_source_path",
    "/users/gregoryputnam",
    "admin_only",
    "debug",
    "staging"
  ]) {
    if (text.includes(forbidden)) fail(`${record.public_option_id} contains forbidden public bridge term: ${forbidden}`);
  }
}

if (failed) {
  console.error("GENERATED PUBLIC OPTION RECORDS AUDIT: FAIL");
  process.exit(1);
}

console.log(`GENERATED PUBLIC OPTION RECORDS AUDIT: PASS (${generated.records.length} records)`);
