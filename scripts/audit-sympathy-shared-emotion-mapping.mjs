import fs from "node:fs";

const emotionsPath = "data/emotions/top-100-shared-emotions.json";
const candidatesPath = "data/intent-candidates/sympathy/action-candidates.json";
const reportPath = "data/intent-candidates/sympathy/shared-emotion-map-report.md";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("SYMPATHY SHARED EMOTION MAPPING AUDIT");

for (const file of [emotionsPath, candidatesPath, reportPath]) {
  if (!fs.existsSync(file)) fail(`Missing ${file}`);
}

const emotions = fs.existsSync(emotionsPath)
  ? JSON.parse(fs.readFileSync(emotionsPath, "utf8"))
  : {};
const candidates = fs.existsSync(candidatesPath)
  ? JSON.parse(fs.readFileSync(candidatesPath, "utf8"))
  : {};

const validEmotionIds = new Set((emotions.emotions || []).map((row) => row.emotion_id));
const rows = candidates.rows || [];

if (rows.length < 1) fail("Sympathy candidate rows must not be zero.");

for (const row of rows) {
  if (!Array.isArray(row.shared_emotion_ids) || row.shared_emotion_ids.length < 1) {
    fail(`Missing shared_emotion_ids: ${row.id}`);
  }

  for (const emotionId of row.shared_emotion_ids || []) {
    if (!validEmotionIds.has(emotionId)) {
      fail(`Unknown shared emotion ${emotionId} on row ${row.id}`);
    }
  }

  if (row.publication_allowed !== false) fail(`Row incorrectly allows publication: ${row.id}`);
  if (row.payment_allowed !== false) fail(`Row incorrectly allows payment: ${row.id}`);
  if (row.human_approved !== false) fail(`Row incorrectly has human approval: ${row.id}`);
}

if (!String(candidates.shared_emotion_mapping?.rule || "").includes("do not approve publication or payment")) {
  fail("Mapping rule must explicitly block publication/payment approval.");
}

if (failed) {
  console.error("SYMPATHY SHARED EMOTION MAPPING AUDIT: FAIL");
  process.exit(1);
}

console.log("SYMPATHY SHARED EMOTION MAPPING AUDIT: PASS");
