import fs from "node:fs";

const mapPath = "data/4pe/rules/kkr-emotional-radiation-map.json";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("KKR ACTION OBJECT MAP AUDIT");

const map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const sympathy = map.sympathy || {};

for (const law of [
  "No verb alone.",
  "No noun alone.",
  "No title alone.",
  "Object focuses the match.",
  "Situation humanizes the match."
]) {
  if (!map.core_law?.includes(law)) fail(`Missing object law: ${law}`);
}

if (!map.matching_stack?.includes("action_object")) {
  fail("Matching stack missing action_object.");
}

for (const verb of [
  "comfort",
  "hold",
  "remember",
  "miss",
  "carry",
  "shelter",
  "walk_beside",
  "sit_with",
  "honor",
  "release",
  "endure"
]) {
  const objects = sympathy.sympathy_action_objects?.[verb];
  if (!Array.isArray(objects) || objects.length === 0) {
    fail(`Missing action objects for verb: ${verb}`);
  }
}

for (const blocked of ["lover", "crush", "christmas", "holiday", "wedding", "baby", "ex", "romance"]) {
  if (!sympathy.blocked_action_objects?.includes(blocked)) {
    fail(`Missing blocked object: ${blocked}`);
  }
}

if (failed) {
  console.error("KKR ACTION OBJECT MAP AUDIT: FAIL");
  process.exit(1);
}

console.log("KKR ACTION OBJECT MAP AUDIT: PASS");
