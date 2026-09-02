import fs from "node:fs";

const worklistPath = "data/kkr-captured-cc-correction-worklists/comin_true.deduplicated-v1.json";
const reportPath = "data/kkr-captured-cc-correction-worklists/comin_true.endpoint-prosecution-v1.json";

function assert(condition, message) {
  if (!condition) throw new Error(`CAPTURED-CC ENDPOINT PROSECUTION AUDIT: ${message}`);
}

assert(fs.existsSync(worklistPath), "worklist missing");
assert(fs.existsSync(reportPath), "prosecution report missing");
const worklist = JSON.parse(fs.readFileSync(worklistPath, "utf8"));
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

assert(report.schema_version === "GPMX_CAPTURED_CC_ENDPOINT_PROSECUTION_V1", "wrong schema");
assert(report.authority?.source_kind === "CAPTURED_CC_AUTHORITY_ONLY", "captured CC is not the authority");
assert(report.authority?.owner_action_required_for_routine_prosecution === false, "owner was turned into a routine approval queue");
assert(report.authority?.owner_correction_role === "EXCEPTION_FEEDBACK_NOT_APPROVAL_QUEUE", "owner correction role changed");
assert(report.authority?.fresh_lt_pix_discovery_used === false, "fresh LT-PIX discovery leaked into prosecution");
assert(report.authority?.canonical_full_lyrics_read === true, "full canonical lyrics were not read");
assert(report.authority?.text_strategy === "PRESERVE_EXISTING_CAPTURED_CC_TEXT_AND_TITLES_NO_REAUTHORING", "captured CC text was reauthored");
assert(report.source_proof?.vocal_sha256 === worklist.source_sha256, "vocal source hash changed");
assert(report.controls?.public_audio_authorized === false, "report authorized public audio");
assert(report.controls?.purchase_authorized === false, "report authorized purchases");
assert(report.controls?.materialization_authorized === false, "report authorized materialization");
assert(report.controls?.post_vocal_padding_sec === 0, "post-vocal padding is not zero");
assert(report.controls?.exceptions_remain_hold === true, "exceptions are not held");
assert(report.counts?.source_work_items === 96, "expected 96 deduplicated captured CC items");
assert(report.counts?.distinct_endpoints === 44, "expected 44 distinct stored endpoints");
assert(Array.isArray(report.endpoints) && report.endpoints.length === 44, "endpoint array count changed");

const expectedItems = new Set(worklist.items.map((item) => item.work_item_id));
const covered = [];
for (const endpoint of report.endpoints) {
  assert(Number.isFinite(endpoint.stored_end_sec), "stored endpoint is not finite");
  assert(Number.isFinite(endpoint.proposed_end_sec), `proposed endpoint is not finite at ${endpoint.stored_end_sec}`);
  assert(endpoint.proposed_end_sec > 0, `proposed endpoint is not positive at ${endpoint.stored_end_sec}`);
  assert(["LOCKED_KKR_REFERENCE_PASS", "KKR_SCIENTIFIC_BATCH_PASS", "KKR_EXCEPTION_REVIEW"].includes(endpoint.prosecution_state), `unknown prosecution state at ${endpoint.stored_end_sec}`);
  if (endpoint.prosecution_state === "KKR_EXCEPTION_REVIEW") assert(report.controls.exceptions_remain_hold === true, `exception escaped HOLD at ${endpoint.stored_end_sec}`);
  covered.push(...endpoint.work_item_ids);
}
assert(covered.length === expectedItems.size, "work-item coverage count changed");
assert(new Set(covered).size === covered.length, "work item appears in more than one endpoint group");
assert(covered.every((id) => expectedItems.has(id)), "unknown work item entered endpoint prosecution");

for (const storedEnd of [25, 28, 32]) {
  const endpoint = report.endpoints.find((item) => item.stored_end_sec === storedEnd);
  assert(endpoint?.owner_reported_defects?.length > 0, `owner-reported defect missing at ${storedEnd}`);
  assert(endpoint.proposed_end_sec < storedEnd, `owner-reported trespass was not shortened at ${storedEnd}`);
}

console.log("CAPTURED-CC ENDPOINT PROSECUTION AUDIT: PASS");
console.log(`SOURCE_WORK_ITEMS=${report.counts.source_work_items}`);
console.log(`DISTINCT_ENDPOINTS=${report.counts.distinct_endpoints}`);
console.log(`MACHINE_PROSECUTED=${report.counts.locked_reference_pass + report.counts.scientific_batch_pass}`);
console.log(`EXCEPTIONS_HELD=${report.counts.exception_review}`);
