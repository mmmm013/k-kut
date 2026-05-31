import fs from "node:fs";

const files = [
  "data/emotions/top-100-shared-emotions.json",
  "data/kkr/kk-interpretation-registry.json",
  "data/kkr/per-pix-interpretation-index.json",
  "data/kkr/per-kk-interpretation-index.json",
  "docs/4pe-learning/KKR_INTERPRETATION_FIRST_DOCTRINE.md"
];

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("KKR INTERPRETATION FOUNDATION AUDIT");

for (const file of files) {
  if (!fs.existsSync(file)) fail(`Missing ${file}`);
}

const emotions = fs.existsSync(files[0]) ? JSON.parse(fs.readFileSync(files[0], "utf8")) : {};
const registry = fs.existsSync(files[1]) ? JSON.parse(fs.readFileSync(files[1], "utf8")) : {};
const perPix = fs.existsSync(files[2]) ? JSON.parse(fs.readFileSync(files[2], "utf8")) : {};
const perKk = fs.existsSync(files[3]) ? JSON.parse(fs.readFileSync(files[3], "utf8")) : {};
const doctrine = fs.existsSync(files[4]) ? fs.readFileSync(files[4], "utf8") : "";

if (!Array.isArray(emotions.emotions)) fail("Top 100 Shared Emotions must have emotions array.");
if (!Array.isArray(registry.rows)) fail("KK interpretation registry must have rows array.");
if (!Array.isArray(perPix.pix)) fail("Per-PIX index must have pix array.");
if (!Array.isArray(perKk.kks)) fail("Per-KK index must have kks array.");

for (const key of [
  "pix_id",
  "kk_id",
  "theme",
  "action_verb",
  "action_object",
  "shared_emotion_ids",
  "positive_connotations",
  "negative_connotations",
  "neutral_connotations",
  "suitable_user_scenarios",
  "blocked_user_scenarios",
  "approval_status"
]) {
  if (!(key in (registry.row_shape || {}))) {
    fail(`Registry row_shape missing ${key}`);
  }
}

for (const phrase of [
  "KKs are suitability-limited.",
  "LT-PIX-IIs derive from KKs.",
  "Categories derive from interpreted suitability.",
  "No title-only search.",
  "No one-term search.",
  "More for this feeling",
  "More from this track"
]) {
  if (!doctrine.includes(phrase)) fail(`Doctrine missing: ${phrase}`);
}

if (failed) {
  console.error("KKR INTERPRETATION FOUNDATION AUDIT: FAIL");
  process.exit(1);
}

console.log("KKR INTERPRETATION FOUNDATION AUDIT: PASS");
