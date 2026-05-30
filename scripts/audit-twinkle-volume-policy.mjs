import fs from "node:fs";

const policyPath = "data/audio-law/twinkle-volume-policy.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("TWINKLE VOLUME POLICY AUDIT");

if (!fs.existsSync(policyPath)) {
  fail(`Missing ${policyPath}`);
}

const policy = fs.existsSync(policyPath)
  ? JSON.parse(fs.readFileSync(policyPath, "utf8"))
  : {};

if (policy.default_delivery_gain !== 0.5) {
  fail("Twinkle default_delivery_gain must be 0.5.");
}

for (const phrase of [
  "Twinkle is a closing signature layer.",
  "Twinkle must not overpower the emotional audio payload.",
  "Default Twinkle gain for user/ad-hoc delivery is 0.5.",
  "Original Twinkle source audio remains unchanged.",
  "Delivery copies may be materialized at half volume."
]) {
  if (!policy.core_law?.includes(phrase)) {
    fail(`Missing policy law: ${phrase}`);
  }
}

if (!String(policy.publication_rule || "").includes("50% delivery layer")) {
  fail("Publication rule must require the 50% delivery layer.");
}

if (failed) {
  console.error("TWINKLE VOLUME POLICY AUDIT: FAIL");
  process.exit(1);
}

console.log("TWINKLE VOLUME POLICY AUDIT: PASS");
