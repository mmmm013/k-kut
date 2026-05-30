import fs from "node:fs";

const candidatePath = "data/intent-candidates/sympathy/candidates.json";
const approvedPath = "data/intent-approved/sympathy-registry.json";
const reportScript = "scripts/report-sympathy-intent-candidates.mjs";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("SYMPATHY CANDIDATE PIPELINE AUDIT");

for (const path of [candidatePath, approvedPath, reportScript]) {
  if (!fs.existsSync(path)) fail(`Missing ${path}`);
}

const candidates = fs.existsSync(candidatePath)
  ? JSON.parse(fs.readFileSync(candidatePath, "utf8"))
  : {};

const approved = fs.existsSync(approvedPath)
  ? JSON.parse(fs.readFileSync(approvedPath, "utf8"))
  : {};

if (candidates.publication_allowed !== false) {
  fail("Candidate pool must never allow publication.");
}

if (!Array.isArray(candidates.rows)) {
  fail("Candidate pool rows must be an array.");
}

if (approved.publication_allowed !== false && (approved.rows || []).length === 0) {
  fail("Approved registry cannot allow publication when empty.");
}

if (failed) {
  console.error("SYMPATHY CANDIDATE PIPELINE AUDIT: FAIL");
  process.exit(1);
}

console.log("SYMPATHY CANDIDATE PIPELINE AUDIT: PASS");
