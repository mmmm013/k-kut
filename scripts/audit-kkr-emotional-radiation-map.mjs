import fs from "node:fs";

const mapPath = "data/4pe/rules/kkr-emotional-radiation-map.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("KKR EMOTIONAL RADIATION MAP AUDIT");

if (!fs.existsSync(mapPath)) {
  fail(`Missing ${mapPath}`);
}

const map = fs.existsSync(mapPath)
  ? JSON.parse(fs.readFileSync(mapPath, "utf8"))
  : {};

for (const law of [
  "No verb alone.",
  "No noun alone.",
  "No title alone.",
  "No one-term match.",
  "Every match needs verb + emotional direction + situation + evidence + anti-meaning check."
]) {
  if (!map.core_law?.includes(law)) {
    fail(`Missing core law: ${law}`);
  }
}

for (const layer of [
  "action_verb",
  "positive_emotional_direction",
  "negative_emotional_direction",
  "human_situation_fit",
  "opposite_meaning_blocker",
  "registry_approval",
  "public_payment_gate"
]) {
  if (!map.matching_stack?.includes(layer)) {
    fail(`Missing matching stack layer: ${layer}`);
  }
}

const sympathy = map.sympathy || {};

for (const direction of [
  "comfort",
  "steady",
  "honor",
  "remember",
  "keep_near",
  "carry_through",
  "shelter",
  "sit_with",
  "walk_beside",
  "endure"
]) {
  if (!sympathy.positive_directions?.includes(direction)) {
    fail(`Missing sympathy positive direction: ${direction}`);
  }
}

for (const danger of [
  "romantic_longing",
  "breakup",
  "holiday_nostalgia",
  "celebration",
  "sexual_or_spark",
  "toxic_positivity",
  "instrumental_title_guess"
]) {
  if (!sympathy.negative_directions?.includes(danger)) {
    fail(`Missing sympathy negative direction: ${danger}`);
  }
}

for (const verb of [
  "comfort",
  "hold",
  "remember",
  "miss",
  "carry",
  "shelter",
  "release",
  "endure"
]) {
  const row = sympathy.verbs?.[verb];
  if (!row) {
    fail(`Missing verb radiation row: ${verb}`);
    continue;
  }

  for (const key of [
    "positive_radiation",
    "negative_radiation",
    "common_use_situations",
    "forbidden_use_situations",
    "evidence_needs"
  ]) {
    if (!Array.isArray(row[key]) || row[key].length === 0) {
      fail(`Verb ${verb} missing ${key}`);
    }
  }
}

if (!String(map.publication_rule || "").includes("cannot publish")) {
  fail("Publication rule must block publishing before radiation review.");
}

if (failed) {
  console.error("KKR EMOTIONAL RADIATION MAP AUDIT: FAIL");
  process.exit(1);
}

console.log("KKR EMOTIONAL RADIATION MAP AUDIT: PASS");
