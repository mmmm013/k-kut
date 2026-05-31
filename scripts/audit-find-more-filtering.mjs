import fs from "node:fs";

const findPath = "app/find/page.tsx";
const generatedPath = "data/publication-bridge/public-option-records.generated.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("FIND MORE FILTERING AUDIT");

const page = fs.readFileSync(findPath, "utf8");
const generated = JSON.parse(fs.readFileSync(generatedPath, "utf8"));

for (const phrase of [
  "searchParams",
  "activeFeeling",
  "activeTrack",
  "filteredRecords",
  "record.intent_lane !== activeFeeling",
  "record.source_pix_id_or_track_id !== activeTrack",
  "More for this feeling",
  "More from this track",
  "record.source_pix_id_or_track_id",
  "Show all approved options",
  "Current view"
]) {
  if (!page.includes(phrase)) fail(`/find filtering missing phrase: ${phrase}`);
}

for (const forbidden of [
  "romance-router.json",
  "admin_only",
  "mk-products",
  "candidate_not_approved",
  "needs_bookend",
  "internal_proof",
  "local_source_path",
  "/Users/gregoryputnam",
  "debug",
  "staging"
]) {
  if (page.includes(forbidden)) {
    fail(`/find contains forbidden source/leak term: ${forbidden}`);
  }
}

const byFeeling = new Map();
const bySource = new Map();

for (const row of generated.records || []) {
  byFeeling.set(row.intent_lane, (byFeeling.get(row.intent_lane) || 0) + 1);
  bySource.set(
    row.source_pix_id_or_track_id,
    (bySource.get(row.source_pix_id_or_track_id) || 0) + 1
  );
}

if (byFeeling.get("romance_love") !== 2) {
  fail("Expected romance_love feeling group to contain 2 records.");
}

if (bySource.get("d3dfd13c-7421-4671-8261-0c735cb51f38") !== 4) {
  fail("Expected A LOVE LIKE THAT source/track group to contain 4 records.");
}

if (generated.records.length !== 6) {
  fail("Generated bridge records should currently contain 6 records.");
}

if (failed) {
  console.error("FIND MORE FILTERING AUDIT: FAIL");
  process.exit(1);
}

console.log("FIND MORE FILTERING AUDIT: PASS");
