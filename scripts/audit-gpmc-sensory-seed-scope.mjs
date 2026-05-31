import fs from "node:fs";

const p = "data/gpmc-sensory/sensory-emotional-records.generated.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("GPMC SENSORY SEED SCOPE AUDIT");

const data = JSON.parse(fs.readFileSync(p, "utf8"));
const raw = JSON.stringify(data);

if (data.scope !== "approved_public_seed_only") {
  fail("Sensory generated records must be labeled approved_public_seed_only.");
}

for (const phrase of [
  "not the full GPM PIX catalog",
  "not the full K-KUT inventory",
  "not the total KKr emotional-sensory universe",
  "approved-public buyer options",
  "More sensory records must be generated"
]) {
  if (!raw.includes(phrase)) fail(`Missing seed-scope warning phrase: ${phrase}`);
}

if (data.count !== 6 || !Array.isArray(data.records) || data.records.length !== 6) {
  fail("Current seed must still contain exactly 6 approved-public records.");
}

if (failed) {
  console.error("GPMC SENSORY SEED SCOPE AUDIT: FAIL");
  process.exit(1);
}

console.log("GPMC SENSORY SEED SCOPE AUDIT: PASS");
