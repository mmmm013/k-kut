import fs from "node:fs";

const contractPath = "data/publication-bridge/k-kut-publication-bridge-contract.json";
const seedPath = "data/publication-bridge/public-option-records.seed.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PUBLIC OPTION RECORDS SEED AUDIT");

const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

if (!Array.isArray(seed.records) || seed.records.length < 1) {
  fail("Seed must include at least one public option record.");
}

for (const record of seed.records || []) {
  for (const field of contract.required_bridge_fields) {
    if (!(field in record)) fail(`Record ${record.public_option_id || "(missing id)"} missing required field: ${field}`);
  }

  if (record.payment_allowed === true && !record.stripe_url_if_payment_allowed?.startsWith("https://buy.stripe.com/")) {
    fail(`${record.public_option_id} allows payment but lacks Stripe URL.`);
  }

  if (record.audio_proof_status !== "pass") {
    fail(`${record.public_option_id} audio proof must be pass.`);
  }

  if (!record.audio_delivery_url?.startsWith("/")) {
    fail(`${record.public_option_id} audio URL must be site-relative.`);
  }

  if (!contract.known_public_routes.includes(record.public_route)) {
    fail(`${record.public_option_id} public route not allowed by contract: ${record.public_route}`);
  }

  for (const forbidden of ["candidate_not_approved", "debug", "staging", "test example", "mini-KUT", "mkut"]) {
    const text = JSON.stringify(record);
    if (text.includes(forbidden)) fail(`${record.public_option_id} contains forbidden term: ${forbidden}`);
  }
}

if (failed) {
  console.error("PUBLIC OPTION RECORDS SEED AUDIT: FAIL");
  process.exit(1);
}

console.log("PUBLIC OPTION RECORDS SEED AUDIT: PASS");
