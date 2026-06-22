import fs from "node:fs";

const file = "data/theme-population/refinement/bad-kk-report-intake.model.json";
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const failures = [];

console.log("# BAD-KK REPORT MODEL AUDIT");
console.log("");
console.log(`status: ${data.status}`);
console.log(`purpose: ${data.purpose}`);
console.log(`defect_categories: ${data.defect_categories.length}`);
console.log(`review_outcomes: ${data.review_outcomes.length}`);
console.log(`replacement_enabled: ${data.free_replacement_policy?.enabled}`);
console.log("");

const requiredTop = [
  "status",
  "purpose",
  "rule",
  "applies_to",
  "required_report_fields",
  "defect_categories",
  "review_outcomes",
  "free_replacement_policy",
  "lineage_required_for_resolution",
  "recursive_refinement_actions"
];

for (const key of requiredTop) {
  if (!(key in data)) failures.push(`missing top-level key: ${key}`);
}

const requiredFields = [
  "report_id",
  "reported_at",
  "customer_email_or_contact",
  "order_id",
  "hug_id",
  "kk_id",
  "pix_handle",
  "theme",
  "public_label",
  "audio_url",
  "defect_category",
  "review_status"
];

for (const key of requiredFields) {
  if (!(key in data.required_report_fields)) failures.push(`missing report field: ${key}`);
}

const mustHaveDefects = [
  "start_too_early",
  "start_too_late",
  "end_too_early",
  "end_too_late",
  "resolving_note_cut_off",
  "musical_tail_cut_off",
  "wrong_section",
  "wrong_emotional_match",
  "audio_artifact_or_glitch",
  "dead_audio_link",
  "wrong_hug_delivered"
];

for (const defect of mustHaveDefects) {
  if (!data.defect_categories.includes(defect)) failures.push(`missing defect category: ${defect}`);
}

if (data.free_replacement_policy?.enabled !== true) {
  failures.push("free replacement policy is not enabled");
}

console.log("# SUMMARY");
console.log(`failures: ${failures.length}`);

if (failures.length) {
  for (const failure of failures) console.log(`- ${failure}`);
  process.exitCode = 2;
} else {
  console.log("AUDIT PASS");
}
