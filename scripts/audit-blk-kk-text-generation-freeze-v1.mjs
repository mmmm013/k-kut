import fs from "node:fs";

const freezePath = "config/blk-kk-text-generation-freeze.v1.json";
const worksheetPath = "templates/lt-pix-blk-worksheet-v1.json";
const exceptionsPath = "config/kk-short-duration-exception-registry.v1.json";
const reviewGatePath = "config/lt-pix-blk-review-gate.v1.json";
const ontologyPath = "docs/governance/GPMX_LT_PIX_BLK_ONTOLOGY_V1_DRAFT.md";
const requiredGuardedScripts = [
  "scripts/generate-pix-kk-batch-01-internal-candidates.mjs",
  "scripts/generate-pix-kk-batch-01-internal-review-decisions.mjs",
  "scripts/generate-income-fill-sprint-01-internal-candidates.mjs",
  "scripts/generate-sympathy-action-candidates.mjs",
  "scripts/generate-sympathy-candidates-from-inventory.mjs",
  "scripts/generate-thank-you-gratitude-internal-approval-decisions.mjs",
  "scripts/build-line-cc-inventory.mjs",
  "scripts/promote-line-cc-ready-inventory.mjs",
  "scripts/materialize-a-love-like-that-boundary-repair-v1.mjs",
  "scripts/materialize-ii-delivery-bookend-twinkle.mjs",
  "scripts/materialize-half-volume-twinkle-assets.mjs"
].sort();

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function readJson(path) {
  if (!fs.existsSync(path)) fail(`missing ${path}`);
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const freeze = readJson(freezePath);
const worksheet = readJson(worksheetPath);
const exceptions = readJson(exceptionsPath);
const reviewGate = readJson(reviewGatePath);
if (!fs.existsSync(ontologyPath)) fail(`missing ${ontologyPath}`);
const ontology = fs.readFileSync(ontologyPath, "utf8");

if (freeze.status !== "ACTIVE_OWNER_AUTHORIZED_FREEZE") {
  fail("mass-generation freeze is not active");
}

const prerequisiteStatuses = new Map(
  freeze.unlock_rule?.prerequisites?.map((item) => [item.id, item.status]) || []
);
for (const id of ["ontology", "per_lt_pix_worksheet", "exception_registry", "review_gate"]) {
  if (prerequisiteStatuses.get(id) !== "DRAFT_PENDING_OWNER_LOCK") {
    fail(`${id} must remain DRAFT_PENDING_OWNER_LOCK while the freeze is active`);
  }
}

if (!ontology.includes("Status: DRAFT — PENDING OWNER LOCK")) {
  fail("ontology draft status marker missing");
}
if (!ontology.includes("A BLK is a **song section**")) {
  fail("ontology does not define BLK as a song section");
}
if (!ontology.includes("ordinary structural uncertainty produces `TRIAGE`")) {
  fail("ontology does not preserve TRIAGE for ordinary uncertainty");
}

if (worksheet.governance_status !== "DRAFT_PENDING_OWNER_LOCK") {
  fail("worksheet governance status changed without lock");
}
if (worksheet.worksheet_status !== "TRIAGE" || worksheet.review_decision?.status !== "TRIAGE") {
  fail("worksheet must default incomplete work to TRIAGE");
}
if (worksheet.blk_record_template?.structural_label !== null) {
  fail("worksheet must not pre-guess a structural label");
}
if (worksheet.blk_record_template?.cc_defines_structure !== false) {
  fail("worksheet must prohibit CC-defined structure");
}
if (worksheet.song_context?.section_count_target_rule !== "FORBIDDEN") {
  fail("worksheet must prohibit section-count targets");
}

if (exceptions.status !== "DRAFT_PENDING_OWNER_LOCK") {
  fail("exception registry status changed without lock");
}
if (exceptions.normal_source_content_floor_seconds !== 10) {
  fail("normal source-content floor must remain 10 seconds in this draft");
}
if (exceptions.exceptions?.length !== 2) {
  fail("exception registry must contain only the two named draft families");
}
const exceptionFamilies = exceptions.exceptions.map((item) => item.display_family).sort();
if (exceptionFamilies.join("|") !== "Best Birthday|Sorry / I'm Sorry") {
  fail("draft exception families changed");
}
if (exceptions.exceptions.some((item) => item.status !== "TRIAGE_BINDING_REQUIRED")) {
  fail("unbound short-duration exceptions must remain TRIAGE_BINDING_REQUIRED");
}
if (exceptions.title_only_exception_matching_allowed !== false) {
  fail("title-only exception matching must remain prohibited");
}

if (reviewGate.status !== "DRAFT_PENDING_OWNER_LOCK") {
  fail("review gate status changed without lock");
}
if (reviewGate.default_incomplete_state !== "TRIAGE") {
  fail("review gate must default incomplete evidence to TRIAGE");
}
if (reviewGate.stage_is_uncertainty_state !== false || reviewGate.hold_is_default_uncertainty_state !== false) {
  fail("STAGE/HOLD uncertainty controls changed");
}

if (freeze.legacy_window_rule?.fixed_23_to_24_second_windows_are_blks !== false) {
  fail("legacy fixed windows must not be BLKs");
}
if (freeze.legacy_window_rule?.required_legacy_status !== "HOLD_NOT_BLK") {
  fail("legacy fixed windows must remain HOLD_NOT_BLK");
}

const guardImport = 'import { assertBlkKkMassGenerationAllowed } from "./lib/blk-kk-text-generation-freeze.mjs";';
const configuredGuardedScripts = [...(freeze.guarded_scripts || [])].sort();
if (JSON.stringify(configuredGuardedScripts) !== JSON.stringify(requiredGuardedScripts)) {
  fail("guarded mass-generation script set changed");
}
for (const script of freeze.guarded_scripts || []) {
  if (!fs.existsSync(script)) fail(`guarded script missing: ${script}`);
  const source = fs.readFileSync(script, "utf8");
  if (!source.includes(guardImport) || !source.includes("assertBlkKkMassGenerationAllowed(import.meta.url);")) {
    fail(`mass-generation freeze guard missing: ${script}`);
  }
}

const packageJson = readJson("package.json");
if (!packageJson.scripts?.prebuild?.includes("audit-blk-kk-text-generation-freeze-v1.mjs")) {
  fail("freeze audit is not wired into prebuild");
}

console.log("BLK/KK MASS TEXT GENERATION FREEZE: PASS");
console.log(`STATUS: ${freeze.status}`);
console.log(`GUARDED SCRIPTS: ${freeze.guarded_scripts.length}`);
console.log("UNCERTAINTY: TRIAGE");
console.log("LEGACY FIXED WINDOWS: HOLD_NOT_BLK");
console.log("PREREQUISITES: 4 DRAFT · 0 LOCKED");
