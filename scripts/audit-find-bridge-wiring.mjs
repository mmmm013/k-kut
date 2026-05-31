import fs from "node:fs";

const findPath = "app/find/page.tsx";
const generatedPath = "data/publication-bridge/public-option-records.generated.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("FIND BRIDGE WIRING AUDIT");

const page = fs.readFileSync(findPath, "utf8");
const generated = JSON.parse(fs.readFileSync(generatedPath, "utf8"));

for (const phrase of [
  "public-option-records.generated.json",
  "Approved bridge options",
  "Hear approved K-KUT HUG options",
  "More for this feeling",
  "More from this track",
  "Send this HUG",
  "No raw inventory",
  "no unapproved router candidates"
]) {
  if (!page.includes(phrase)) fail(`/find missing phrase: ${phrase}`);
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
  if (page.includes(forbidden)) fail(`/find contains forbidden source/leak term: ${forbidden}`);
}

if (!Array.isArray(generated.records) || generated.records.length !== 6) {
  fail("Generated bridge records should currently contain 6 records.");
}

if (failed) {
  console.error("FIND BRIDGE WIRING AUDIT: FAIL");
  process.exit(1);
}

console.log("FIND BRIDGE WIRING AUDIT: PASS");
