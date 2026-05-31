import fs from "node:fs";

const path = "data/emotions/top-100-shared-emotions.json";
let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("TOP 100 SHARED EMOTIONS AUDIT");

if (!fs.existsSync(path)) fail(`Missing ${path}`);

const data = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, "utf8")) : {};
const rows = data.emotions || [];

if (rows.length !== 100) fail(`Expected 100 shared emotions, found ${rows.length}.`);

const ids = new Set();

for (const row of rows) {
  if (!row.emotion_id) fail("Emotion row missing emotion_id.");
  if (!row.display_name) fail(`Emotion ${row.emotion_id} missing display_name.`);
  if (!row.level) fail(`Emotion ${row.emotion_id} missing level.`);
  if (!Array.isArray(row.action_verbs) || row.action_verbs.length < 1) {
    fail(`Emotion ${row.emotion_id} missing action_verbs.`);
  }
  if (!Array.isArray(row.objects) || row.objects.length < 1) {
    fail(`Emotion ${row.emotion_id} missing objects.`);
  }
  if (ids.has(row.emotion_id)) fail(`Duplicate emotion_id: ${row.emotion_id}`);
  ids.add(row.emotion_id);
}

for (const required of [
  "comfort_after_loss",
  "missing_someone",
  "remembering_a_life",
  "being_carried",
  "sheltered_from_hurt",
  "walking_beside",
  "quiet_presence",
  "continuing_love",
  "gratitude_for_life",
  "gentle_goodbye"
]) {
  if (!ids.has(required)) fail(`Missing required emotion: ${required}`);
}

if (failed) {
  console.error("TOP 100 SHARED EMOTIONS AUDIT: FAIL");
  process.exit(1);
}

console.log("TOP 100 SHARED EMOTIONS AUDIT: PASS");
