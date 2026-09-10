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

const requiredProductionOrder = [
  "BLK_MAP",
  "KK_AND_KOMBO_CC",
  "CC_VERIFICATION",
  "KK_AND_KOMBO_HEADING",
  "OWNER_APPROVAL",
  "MK_DERIVATION",
  "SK_DERIVATION"
];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function readJson(path) {
  if (!fs.existsSync(path)) fail(`missing ${path}`);
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function sameArray(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

const freeze = readJson(freezePath);
const worksheet = readJson(worksheetPath);
const exceptions = readJson(exceptionsPath);
const reviewGate = readJson(reviewGatePath);
if (!fs.existsSync(ontologyPath)) fail(`missing ${ontologyPath}`);
const ontology = fs.readFileSync(ontologyPath, "utf8");

const freezeIsActive = freeze.status === "ACTIVE_OWNER_AUTHORIZED_FREEZE";
const freezeIsLifted = freeze.status === "FREEZE_LIFTED_ALL_PREREQUISITES_LOCKED";
if (!freezeIsActive && !freezeIsLifted) fail(`unexpected freeze status: ${freeze.status}`);

const prerequisiteStatuses = new Map(
  (freeze.unlock_rule?.prerequisites_locked || freeze.unlock_rule?.prerequisites || []).map((item) => [
    item.id,
    item.status,
  ]),
);
for (const id of ["ontology", "per_lt_pix_worksheet", "exception_registry", "review_gate"]) {
  const expected = freezeIsActive ? "DRAFT_PENDING_OWNER_LOCK" : "LOCKED_OWNER_AUTHORIZED";
  if (prerequisiteStatuses.get(id) !== expected) {
    fail(`${id} must remain ${expected} for freeze status ${freeze.status}`);
  }
}

if (freezeIsActive && !ontology.includes("Status: DRAFT — PENDING OWNER LOCK")) {
  fail("ontology draft status marker missing while freeze is active");
}
if (freezeIsLifted && !ontology.includes("Status: LOCKED — OWNER AUTHORIZED")) {
  fail("ontology locked status marker missing while freeze is lifted");
}
if (freezeIsActive && !ontology.includes("Mass-generation effect: FROZEN")) {
  fail("ontology frozen effect marker missing while freeze is active");
}
if (freezeIsLifted && !ontology.includes("Mass-generation effect: AUTHORIZED ONLY THROUGH THIS ORDER")) {
  fail("ontology governed authorization marker missing while freeze is lifted");
}
for (const marker of [
  "exactly **324 FullMix LT-PIX SSOTs**",
  "INSTRO-ONLY / INO-PIX inventory is separate inventory and is never a KUT source",
  "A BLK is a song section",
  "Duration never triggers a CC",
  "Refrain",
  "ordinary structural uncertainty"
]) {
  if (!ontology.includes(marker)) fail(`ontology marker missing: ${marker}`);
}

if (freeze.production_authority?.fullmix_lt_pix_ssot_count !== 324) {
  fail("production authority must lock exactly 324 FullMix LT-PIX SSOTs");
}
if (freeze.production_authority?.required_kut_source_lane !== "FULLMIX") {
  fail("production authority must require the FULLMIX source lane");
}
if (freeze.production_authority?.instro_only_kut_eligible !== false) {
  fail("INSTRO-ONLY inventory must be ineligible as KUT source");
}
if (!sameArray(freeze.production_authority?.production_order, requiredProductionOrder)) {
  fail("production authority order changed");
}
if (freeze.production_authority?.duration_triggers_cc !== false) {
  fail("duration must never trigger CC");
}

if (worksheet.governance_status !== (freezeIsLifted ? "LOCKED_OWNER_AUTHORIZED" : "DRAFT_PENDING_OWNER_LOCK")) {
  fail("worksheet governance status does not match freeze state");
}
if (worksheet.worksheet_status !== "TRIAGE" || worksheet.review_decision?.status !== "TRIAGE") {
  fail("worksheet must default incomplete work to TRIAGE");
}
if (worksheet.catalog_authority?.current_fullmix_lt_pix_ssot_count !== 324) {
  fail("worksheet must lock the 324 FullMix LT-PIX inventory");
}
if (worksheet.catalog_authority?.required_kut_source_lane !== "FULLMIX" ||
    worksheet.catalog_authority?.instro_only_kut_eligible !== false) {
  fail("worksheet source-lane controls changed");
}
if (!sameArray(worksheet.production_order, requiredProductionOrder)) {
  fail("worksheet production order changed");
}
if (worksheet.blk_record_template?.structural_label !== null) {
  fail("worksheet must not pre-guess a structural label");
}
if (worksheet.blk_record_template?.cc_defines_structure !== false) {
  fail("worksheet must prohibit CC-defined structure");
}
if (worksheet.blk_record_template?.cc_created_after_blk_lock !== false ||
    worksheet.blk_record_template?.source_excerpt_exact !== false ||
    worksheet.blk_record_template?.heading_assigned_after_cc_verification !== false) {
  fail("worksheet proof fields must begin unresolved/false");
}
if (worksheet.blk_record_template?.duration_used_to_trigger_or_qualify_kut !== false) {
  fail("worksheet must prohibit duration-triggered CC or KUT qualification");
}
if (Object.hasOwn(worksheet.blk_record_template || {}, "short_duration_exception_id")) {
  fail("worksheet must not contain a KUT short-duration exception field");
}
if (worksheet.song_context?.section_count_target_rule !== "FORBIDDEN") {
  fail("worksheet must prohibit section-count targets");
}

if (exceptions.status !== (freezeIsLifted ? "LOCKED_OWNER_AUTHORIZED" : "DRAFT_PENDING_OWNER_LOCK")) {
  fail("exception registry status does not match freeze state");
}
if (exceptions.kut_duration_gate !== "NONE" ||
    exceptions.normal_source_content_floor_seconds !== null ||
    !Array.isArray(exceptions.exceptions) ||
    exceptions.exceptions.length !== 0) {
  fail("KUT duration gates or exceptions were reintroduced");
}
if (exceptions.title_only_exception_matching_allowed !== false ||
    exceptions.automatic_exception_creation_allowed !== false) {
  fail("automatic/title-only duration exceptions must remain prohibited");
}
const revoked = exceptions.historical_controls_revoked || [];
for (const control of [
  "10-second normal KK floor",
  "8-second Love Arena mK floor",
  "Best Birthday short-duration exception",
  "Sorry / I'm Sorry short-duration exception"
]) {
  if (!revoked.includes(control)) fail(`revoked duration control missing: ${control}`);
}
const swsp = exceptions.swsp_only_duration_rule;
if (swsp?.applies_to !== "SWSP_INSTRUMENTAL_KUT_ONLY" ||
    swsp?.minimum_seconds !== 13 ||
    swsp?.applies_to_kk !== false ||
    swsp?.applies_to_kk_kombo !== false ||
    swsp?.applies_to_mk !== false ||
    swsp?.applies_to_sk !== false) {
  fail("the sole 13-second SWSP instrumental rule changed or leaked into KUT tiers");
}

if (reviewGate.status !== (freezeIsLifted ? "LOCKED_OWNER_AUTHORIZED" : "DRAFT_PENDING_OWNER_LOCK")) {
  fail("review gate status does not match freeze state");
}
if (reviewGate.source_inventory?.required_lane !== "FULLMIX" ||
    reviewGate.source_inventory?.current_ssot_count !== 324 ||
    reviewGate.source_inventory?.instro_only_kut_eligible !== false) {
  fail("review-gate source inventory controls changed");
}
if (!Array.isArray(reviewGate.mandatory_order) || reviewGate.mandatory_order.length !== 9) {
  fail("review gate must preserve all nine ordered production checks");
}
if (!reviewGate.mandatory_order[1]?.includes("BLK map") ||
    !reviewGate.mandatory_order[3]?.startsWith("CC the exact KK") ||
    !reviewGate.mandatory_order[4]?.startsWith("verify exact FullMix excerpt") ||
    !reviewGate.mandatory_order[5]?.startsWith("assign permitted KK/KOMBO heading only after CC verification")) {
  fail("review gate must enforce BLK → CC → verify → heading");
}
if (reviewGate.duration_gate?.kut_duration_rule !== "NONE" ||
    reviewGate.duration_gate?.swsp_instrumental_minimum_seconds !== 13) {
  fail("review-gate duration law changed");
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
if (!sameArray(configuredGuardedScripts, requiredGuardedScripts)) {
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

console.log("BLK/KK GOVERNED GENERATION AUTHORITY: PASS");
console.log(`STATUS: ${freeze.status}`);
console.log("SOURCE: 324 FULLMIX LT-PIX SSOTS");
console.log("ORDER: BLK → CC KK/KOMBO → VERIFY → HEADING → OWNER APPROVAL → mK → sK");
console.log("KUT DURATION GATE: NONE");
console.log("SWSP INSTRUMENTAL MINIMUM: 13 SECONDS");
console.log(`GUARDED SCRIPTS: ${freeze.guarded_scripts.length}`);
console.log("UNCERTAINTY: TRIAGE");
console.log("LEGACY FIXED WINDOWS: HOLD_NOT_BLK");
console.log(`PREREQUISITES: ${freezeIsLifted ? "0 DRAFT · 4 LOCKED" : "4 DRAFT · 0 LOCKED"}`);
