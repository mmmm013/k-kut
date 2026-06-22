import fs from "node:fs";

const file = "data/kkr/approval-gates/human-kk-approval-gate.current.json";
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const failures = [];

for (const key of [
  "status",
  "purpose",
  "rule",
  "quality_target",
  "public_display_rule",
  "approval_statuses",
  "required_fields",
  "defect_categories",
  "frontend_naming_examples",
  "backend_tracking_examples",
  "memory_anchor"
]) {
  if (!(key in data)) failures.push(`missing top-level key: ${key}`);
}

for (const status of [
  "approved_sellable",
  "approved_request_only",
  "hold_needs_recut",
  "hold_needs_remap",
  "retired"
]) {
  if (!data.approval_statuses.includes(status)) {
    failures.push(`missing approval status: ${status}`);
  }
}

for (const field of [
  "kk_id",
  "public_option_code",
  "buyer_lane",
  "audio_url",
  "listen_status",
  "human_reviewer",
  "defect_category",
  "public_status",
  "backend_source_ref",
  "replacement_rule"
]) {
  if (!data.required_fields.includes(field)) {
    failures.push(`missing required field: ${field}`);
  }
}

console.log("# HUMAN KK APPROVAL GATE AUDIT");
console.log(`status: ${data.status}`);
console.log(`approval_statuses: ${data.approval_statuses.length}`);
console.log(`required_fields: ${data.required_fields.length}`);
console.log(`defect_categories: ${data.defect_categories.length}`);
console.log(`failures: ${failures.length}`);

if (failures.length) {
  for (const failure of failures) console.log(`- ${failure}`);
  process.exitCode = 2;
} else {
  console.log("AUDIT PASS");
}
