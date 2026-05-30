import fs from "node:fs";

const candidatePath = "data/intent-candidates/sympathy/candidates.json";
const reportPath = "data/intent-candidates/sympathy/candidate-report.md";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("SYMPATHY GENERATED CANDIDATES AUDIT");

if (!fs.existsSync(candidatePath)) fail(`Missing ${candidatePath}`);
if (!fs.existsSync(reportPath)) fail(`Missing ${reportPath}`);

const data = fs.existsSync(candidatePath)
  ? JSON.parse(fs.readFileSync(candidatePath, "utf8"))
  : {};

if (data.publication_allowed !== false) {
  fail("Generated candidate pool must not allow publication.");
}

if (!Array.isArray(data.rows)) {
  fail("Candidate rows must be an array.");
}

for (const row of data.rows || []) {
  if (row.publication_allowed !== false) fail(`Candidate ${row.id} allows publication.`);
  if (row.human_approved !== false) fail(`Candidate ${row.id} is incorrectly human-approved.`);
  if (row.payment_allowed !== false) fail(`Candidate ${row.id} incorrectly allows payment.`);
}

if (failed) {
  console.error("SYMPATHY GENERATED CANDIDATES AUDIT: FAIL");
  process.exit(1);
}

console.log(`Candidate rows: ${(data.rows || []).length}`);
console.log("SYMPATHY GENERATED CANDIDATES AUDIT: PASS");
