import fs from "node:fs";

const rulePath = "data/4pe/rules/kkr-action-intent-rules.json";
const candidatePath = "data/intent-candidates/sympathy/action-candidates.json";
const reportPath = "data/intent-candidates/sympathy/action-candidate-report.md";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("SYMPATHY ACTION CANDIDATES AUDIT");

for (const path of [rulePath, candidatePath, reportPath]) {
  if (!fs.existsSync(path)) fail(`Missing ${path}`);
}

const rule = fs.existsSync(rulePath) ? JSON.parse(fs.readFileSync(rulePath, "utf8")) : {};
const data = fs.existsSync(candidatePath) ? JSON.parse(fs.readFileSync(candidatePath, "utf8")) : {};

for (const law of [
  "All buyer-facing intent options must be verbs/actions.",
  "No one-term search.",
  "Titles are backend labels only.",
  "Paragraphical or section meaning is required."
]) {
  if (!rule.core_law?.includes(law)) fail(`Missing action law: ${law}`);
}

if (data.publication_allowed !== false) fail("Action candidates must not allow publication.");

for (const row of data.rows || []) {
  if (!row.action_verb) fail(`Missing action_verb: ${row.id}`);
  if (!row.action_object) fail(`Missing action_object: ${row.id}`);
  if (!Array.isArray(row.object_evidence_terms) || row.object_evidence_terms.length === 0) {
    fail(`Missing object_evidence_terms: ${row.id}`);
  }
  if (!row.source_section_or_paragraph || row.source_section_or_paragraph.length < 80) {
    fail(`Missing paragraphical context: ${row.id}`);
  }
  if (!Array.isArray(row.positive_evidence_terms) || row.positive_evidence_terms.length < 2) {
    fail(`Candidate has weak one-term evidence: ${row.id}`);
  }

  for (const key of [
    "positive_directions",
    "negative_directions",
    "common_use_situations",
    "forbidden_use_situations",
    "evidence_needs"
  ]) {
    if (!Array.isArray(row[key]) || row[key].length === 0) {
      fail(`Candidate missing radiation field ${key}: ${row.id}`);
    }
  }

  if (!("opposite_meaning_risk" in row)) {
    fail(`Candidate missing opposite_meaning_risk: ${row.id}`);
  }

  if (!row.radiation_confidence) {
    fail(`Candidate missing radiation_confidence: ${row.id}`);
  }

  if (row.publication_allowed !== false) fail(`Candidate publishes: ${row.id}`);
  if (row.payment_allowed !== false) fail(`Candidate allows payment: ${row.id}`);

  const haystack = [
    row.title_backend_label,
    row.source_section_or_paragraph,
    row.meaning_context
  ].join(" ").toLowerCase();

  for (const forbidden of ["instro", "instrumental", "christmas", "holiday", "birthday", "valentine", "kupid", "— mk", " mini-kut"]) {
    if (haystack.includes(forbidden)) {
      fail(`Forbidden bleed in ${row.id}: ${forbidden}`);
    }
  }
}

if (failed) {
  console.error("SYMPATHY ACTION CANDIDATES AUDIT: FAIL");
  process.exit(1);
}

console.log(`Action candidate rows: ${(data.rows || []).length}`);
console.log("SYMPATHY ACTION CANDIDATES AUDIT: PASS");
