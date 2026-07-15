import fs from "node:fs";
import {
  matchEvidenceRegistry,
  matchEvidenceRecords,
} from "../data/4pe/match-evidence/quarantined-three-recording-adversarial-matrix-v001.mjs";

const SCHEMA_PATH = "data/4pe/rules/match-evidence-record.schema.json";

function stop(message) {
  console.error(`STOP: ${message}`);
  process.exit(1);
}

function resolveLocalRef(registry, ref) {
  if (typeof ref !== "string" || !ref.startsWith("#/")) return undefined;
  return ref
    .slice(2)
    .split("/")
    .reduce((value, key) => value?.[key], registry);
}

if (!fs.existsSync(SCHEMA_PATH)) stop(`missing ${SCHEMA_PATH}`);

let schema;
try {
  schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
} catch (error) {
  stop(`invalid schema JSON: ${error.message}`);
}

if (schema.$id !== "urn:gpmx:4pe:kkr:mial:match-evidence-record:v1") {
  stop("wrong authoritative Match Evidence schema ID");
}

const requiredFields = schema.required || [];
const candidateIds = Object.keys(matchEvidenceRegistry.candidate_audio_profiles || {});
const needIds = Object.keys(matchEvidenceRegistry.customer_need_profiles || {});
const records = matchEvidenceRecords;

if (matchEvidenceRegistry.authority?.mial_is_operational_ssot !== true) {
  stop("MIAL operational SSOT lock is missing");
}

if (matchEvidenceRegistry.authority?.scaling_allowed !== false) {
  stop("first adversarial test must remain locked to three recordings");
}

if (matchEvidenceRegistry.canonical_twinkle?.required_final_path !==
    "public/signature/sti/gpm-sti-twinkle-v001-stop-at-audio-end.mp3") {
  stop("canonical Twinkle path mismatch");
}

if (candidateIds.length !== 3) stop(`expected 3 candidates, found ${candidateIds.length}`);
if (needIds.length !== 9) stop(`expected 9 needs, found ${needIds.length}`);
if (records.length !== 27) stop(`expected 27 records, found ${records.length}`);
if (matchEvidenceRegistry.scope?.matrix_record_count !== 27) {
  stop("registry matrix_record_count must equal 27");
}

const seenIds = new Set();
const seenPairs = new Set();

for (const record of records) {
  for (const field of requiredFields) {
    if (!(field in record)) {
      stop(`${record.match_evidence_record_id || "unknown"} missing ${field}`);
    }
  }

  if (seenIds.has(record.match_evidence_record_id)) {
    stop(`duplicate record ID ${record.match_evidence_record_id}`);
  }
  seenIds.add(record.match_evidence_record_id);

  const candidateId = record.candidate_audio?.candidate_id;
  const needId = record.customer_need_profile?.need_id;
  const pair = `${candidateId}::${needId}`;

  if (!candidateIds.includes(candidateId)) stop(`${pair} has unknown candidate`);
  if (!needIds.includes(needId)) stop(`${pair} has unknown customer need`);
  if (seenPairs.has(pair)) stop(`duplicate candidate/need pair ${pair}`);
  seenPairs.add(pair);

  const refs = [
    record.candidate_audio?.profile_ref,
    record.customer_need_profile?.profile_ref,
    record.audio_meaning_profile?.profile_ref,
    ...(record.supporting_evidence || []),
    ...(record.conflicting_evidence || []),
    record.contraindications?.customer_need_profile_ref,
    ...(record.contraindications?.candidate_specific_refs || []),
    ...(record.contraindications?.unresolved_question_refs || []),
    record.eligibility_gates?.gate_profile_ref,
    record.fit_components?.weight_profile_ref,
    record.required_next_action?.action_plan_ref,
  ];

  for (const ref of refs) {
    if (resolveLocalRef(matchEvidenceRegistry, ref) === undefined) {
      stop(`${pair} has broken local reference ${ref}`);
    }
  }

  if (record.actual_status !== "METADATA_INSUFFICIENT") {
    stop(`${pair} must abstain as METADATA_INSUFFICIENT in v1`);
  }
  if (record.actual_status === "PROVEN_MATCH") stop(`${pair} cannot be PROVEN_MATCH`);
  if (record.eligibility_gates?.eligible_for_ranking !== false) {
    stop(`${pair} ranking must remain blocked`);
  }
  if (record.eligibility_gates?.eligible_for_public_release !== false) {
    stop(`${pair} public release must remain blocked`);
  }
  if (record.fit_components?.scoring_allowed !== false ||
      record.fit_components?.fit_score !== null ||
      record.fit_components?.component_scores !== null) {
    stop(`${pair} must not be scored while evidence is missing`);
  }
  if (record.personalization_adjustment?.status !== "NOT_APPLIED" ||
      record.personalization_adjustment?.value !== 0) {
    stop(`${pair} personalization must remain unapplied`);
  }
  if (record.gd_decision?.status !== "PENDING" ||
      record.gd_decision?.decision !== null) {
    stop(`${pair} must not claim a GD decision`);
  }
  if (record.exact_expression_hits?.status !== "BLOCKED_NO_VERIFIED_TRANSCRIPT" ||
      record.exact_expression_hits?.hits?.length !== 0) {
    stop(`${pair} exact-expression matching must abstain without transcript`);
  }
  if (!record.eligibility_gates?.blocking_statuses?.includes("DELIVERY_PACKAGE_BLOCKED")) {
    stop(`${pair} must retain delivery package block`);
  }
}

const alltProfile = matchEvidenceRegistry.candidate_audio_profiles["a-love-like-that"];
if (alltProfile?.source_authority_status !== "PARTIAL") {
  stop("A Love Like That source authority must be PARTIAL after GPMC handoff resolution");
}
if (alltProfile?.source_lineage_resolution?.mial_lineage?.pix_handle !== "ALLT-105529524") {
  stop("A Love Like That PIX handle mismatch");
}
if (alltProfile?.source_lineage_resolution?.mial_lineage?.source_stl_id !== "105529524") {
  stop("A Love Like That source/STL ID mismatch");
}
if (alltProfile?.source_lineage_resolution?.controlled_lt_pix?.status !==
    "BLOCKED_LOSSLESS_PARENT_NOT_LOCATED") {
  stop("A Love Like That controlled LT-PIX must remain blocked until lossless parent resolution");
}
if (alltProfile?.source_lineage_resolution?.controlled_lt_pix?.lt_pix_id !== null ||
    alltProfile?.source_lineage_resolution?.controlled_lt_pix?.controlled_source_path !== null ||
    alltProfile?.source_lineage_resolution?.controlled_lt_pix?.source_sha256 !== null) {
  stop("A Love Like That lossless LT-PIX identifiers must remain null");
}
if (alltProfile?.source_lineage_resolution?.rendition_reconciliation?.status !== "REQUIRED" ||
    alltProfile?.source_lineage_resolution?.rendition_reconciliation?.candidates?.length !== 2) {
  stop("A Love Like That must retain two unresolved rendition candidates");
}
for (const record of records.filter(
  (row) => row.candidate_audio?.candidate_id === "a-love-like-that"
)) {
  if (!record.supporting_evidence?.includes(
    "#/evidence_catalog/gpmc_handoff_source_authority"
  )) {
    stop(`${record.match_evidence_record_id} missing GPMC handoff source evidence`);
  }
  if (!record.conflicting_evidence?.includes(
    "#/evidence_catalog/lossless_lt_pix_parent_missing"
  ) || !record.conflicting_evidence?.includes(
    "#/evidence_catalog/rendition_reconciliation_required"
  )) {
    stop(`${record.match_evidence_record_id} missing source-lineage blockers`);
  }
}

for (const candidateId of candidateIds) {
  const profile = matchEvidenceRegistry.candidate_audio_profiles[candidateId];
  const requiredUnknowns = [
    "mial_record_id",
    "lt_pix_id",
    "rendition_performance_id",
    "controlled_source_path",
    "source_sha256",
    "object_type",
    "exact_audible_words",
    "approved_start_seconds",
    "approved_end_seconds",
  ];
  for (const field of requiredUnknowns) {
    if (profile[field] !== null) {
      stop(`${candidateId} ${field} must remain null until evidence is captured`);
    }
  }

  for (const needId of needIds) {
    if (!seenPairs.has(`${candidateId}::${needId}`)) {
      stop(`missing matrix pair ${candidateId}::${needId}`);
    }
  }
}

console.log("MATCH EVIDENCE ADVERSARIAL MATRIX AUDIT PASS");
console.log(`CANDIDATES: ${candidateIds.length}`);
console.log(`CUSTOMER NEEDS: ${needIds.length}`);
console.log(`MATCH EVIDENCE RECORDS: ${records.length}`);
console.log("PROVEN_MATCH: 0");
console.log("PUBLIC RELEASE ELIGIBLE: 0");
console.log("SCORING ALLOWED: 0");
console.log("PERSONALIZATION APPLIED: 0");
console.log("SCALING ALLOWED: false");
console.log("A LOVE LIKE THAT SOURCE AUTHORITY: PARTIAL");
console.log("A LOVE LIKE THAT PIX HANDLE: ALLT-105529524");
console.log("A LOVE LIKE THAT CONTROLLED LT-PIX: BLOCKED_LOSSLESS_PARENT_NOT_LOCATED");
console.log("A LOVE LIKE THAT RENDITION RECONCILIATION: REQUIRED");
