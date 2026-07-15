import fs from "node:fs";
import {
  matchEvidenceRegistry,
  matchEvidenceRecords,
} from "../data/4pe/match-evidence/quarantined-three-recording-adversarial-matrix-v001.mjs";
import {
  A_LOVE_LIKE_THAT_CONTROLLED_SOURCE_PATH,
  A_LOVE_LIKE_THAT_SOURCE_SHA256,
  aLoveLikeThatControlledLtPixResolution,
} from "../data/4pe/match-evidence/a-love-like-that-controlled-lt-pix-resolution-v001.mjs";
import {
  A_LOVE_LIKE_THAT_LYRIC_AUTHORITY_ID,
  A_LOVE_LIKE_THAT_SOURCE_LYRIC_FINGERPRINT,
  aLoveLikeThatLyricAuthority,
} from "../data/4pe/match-evidence/a-love-like-that-lyric-authority-v001.mjs";

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
    ...(record.audio_meaning_profile?.lyric_authority_ref
      ? [record.audio_meaning_profile.lyric_authority_ref]
      : []),
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

  const expectedExactExpressionStatus = candidateId === "a-love-like-that"
    ? "LYRIC_TEXT_LOCATED_AUDIO_ALIGNMENT_REQUIRED"
    : "BLOCKED_NO_VERIFIED_TRANSCRIPT";
  if (record.exact_expression_hits?.status !== expectedExactExpressionStatus ||
      record.exact_expression_hits?.hits?.length !== 0) {
    stop(`${pair} exact-expression matching status or abstention is wrong`);
  }

  if (!record.eligibility_gates?.blocking_statuses?.includes("DELIVERY_PACKAGE_BLOCKED")) {
    stop(`${pair} must retain delivery package block`);
  }
}

const alltProfile = matchEvidenceRegistry.candidate_audio_profiles["a-love-like-that"];
const alltSourceResolution = matchEvidenceRegistry.source_resolutions?.a_love_like_that;
const alltLyricAuthority = matchEvidenceRegistry.lyric_authorities?.a_love_like_that;

if (alltProfile?.source_authority_status !==
    "RESOLVED_CONTROLLED_LOSSLESS_PARENT_TPR_REQUIRED") {
  stop("A Love Like That controlled source authority status mismatch");
}
if (alltProfile?.source_lineage_resolution?.mial_lineage?.pix_handle !== "ALLT-105529524") {
  stop("A Love Like That PIX handle mismatch");
}
if (alltProfile?.source_lineage_resolution?.mial_lineage?.source_stl_id !== "105529524") {
  stop("A Love Like That source/STL ID mismatch");
}
if (alltProfile?.lt_pix_id !== "LTPIX_0121" ||
    alltProfile?.source_lineage_resolution?.controlled_lt_pix?.lt_pix_id !== "LTPIX_0121") {
  stop("A Love Like That LT-PIX ID mismatch");
}
if (alltProfile?.object_type !== "LT-PIX") {
  stop("A Love Like That object type must be LT-PIX");
}
if (alltProfile?.controlled_source_path !== A_LOVE_LIKE_THAT_CONTROLLED_SOURCE_PATH ||
    alltProfile?.source_lineage_resolution?.controlled_lt_pix?.controlled_source_path !==
      A_LOVE_LIKE_THAT_CONTROLLED_SOURCE_PATH) {
  stop("A Love Like That controlled WAV path mismatch");
}
if (alltProfile?.source_sha256 !== A_LOVE_LIKE_THAT_SOURCE_SHA256 ||
    alltProfile?.source_lineage_resolution?.controlled_lt_pix?.source_sha256 !==
      A_LOVE_LIKE_THAT_SOURCE_SHA256) {
  stop("A Love Like That source SHA-256 mismatch");
}
if (alltProfile?.source_lineage_resolution?.controlled_lt_pix?.status !==
    "RESOLVED_LOCKED_PARENT_AUDIO_TPR_REQUIRED") {
  stop("A Love Like That controlled LT-PIX must retain the TPR requirement");
}
if (alltSourceResolution?.source_identity_status !== "RESOLVED_LOCKED_LOSSLESS_PARENT" ||
    alltSourceResolution?.authority_evidence?.blocking_status !==
      "BLOCKED_UNTIL_TPR_CDR_LOCKS_KK_BOUNDARIES") {
  stop("A Love Like That source-resolution authority or TPR block mismatch");
}
if (alltSourceResolution?.controlled_source_path !== A_LOVE_LIKE_THAT_CONTROLLED_SOURCE_PATH ||
    alltSourceResolution?.source_sha256 !== A_LOVE_LIKE_THAT_SOURCE_SHA256) {
  stop("A Love Like That source-resolution registry values mismatch");
}
if (alltProfile?.mial_record_id !== null ||
    alltProfile?.rendition_performance_id !== null) {
  stop("A Love Like That MIAL row ID and rendition/performance ID must remain unresolved");
}

if (alltLyricAuthority?.lyric_authority_id !== A_LOVE_LIKE_THAT_LYRIC_AUTHORITY_ID ||
    alltProfile?.lyric_authority_source !== A_LOVE_LIKE_THAT_LYRIC_AUTHORITY_ID) {
  stop("A Love Like That lyric authority ID mismatch");
}
if (alltLyricAuthority?.authority_status !==
    "PARTIAL_LYRIC_TEXT_LOCATED_CONTROLLED_AUDIO_ALIGNMENT_REQUIRED") {
  stop("A Love Like That lyric authority must remain partial");
}
if (alltLyricAuthority?.lt_pix_id !== "LTPIX_0121" ||
    alltLyricAuthority?.controlled_source_path !== A_LOVE_LIKE_THAT_CONTROLLED_SOURCE_PATH ||
    alltLyricAuthority?.controlled_source_sha256 !== A_LOVE_LIKE_THAT_SOURCE_SHA256) {
  stop("A Love Like That lyric authority is not bound to the controlled WAV parent");
}
if (alltLyricAuthority?.source_lyric_evidence?.line_count !== 37 ||
    alltLyricAuthority?.source_lyric_evidence?.utf8_character_count !== 1308 ||
    alltLyricAuthority?.source_lyric_evidence?.sha256 !==
      A_LOVE_LIKE_THAT_SOURCE_LYRIC_FINGERPRINT) {
  stop("A Love Like That source lyric fingerprint or count mismatch");
}
if (alltProfile?.lyric_source_line_count !== 37 ||
    alltProfile?.lyric_source_sha256 !== A_LOVE_LIKE_THAT_SOURCE_LYRIC_FINGERPRINT) {
  stop("A Love Like That candidate profile lyric evidence mismatch");
}
if (alltProfile?.exact_audible_words !== null ||
    alltProfile?.exact_audible_words_status !==
      "PENDING_LINE_BY_LINE_CONTROLLED_WAV_ALIGNMENT") {
  stop("A Love Like That must not claim exact audible words before alignment");
}
if (alltProfile?.source_lineage_resolution?.lyric_authority?.next_gate !==
    "CONTROLLED_WAV_LINE_BY_LINE_ALIGNMENT_AND_TPR_CDR_SECTION_LOCK") {
  stop("A Love Like That lyric authority next gate mismatch");
}

for (const record of records.filter(
  (row) => row.candidate_audio?.candidate_id === "a-love-like-that"
)) {
  if (record.authority_chain?.authority_status !== "PARTIAL") {
    stop(`${record.match_evidence_record_id} authority status must be PARTIAL`);
  }
  if (record.audio_meaning_profile?.status !==
      "LYRIC_TEXT_LOCATED_EXACT_AUDIBLE_ALIGNMENT_REQUIRED" ||
      record.audio_meaning_profile?.lyric_authority_ref !==
        "#/lyric_authorities/a_love_like_that") {
    stop(`${record.match_evidence_record_id} lyric evidence status or reference mismatch`);
  }
  if (record.eligibility_gates?.gate_profile_ref !==
      "#/eligibility_gate_profiles/a_love_like_that_source_and_lyric_text_resolved_v1") {
    stop(`${record.match_evidence_record_id} uses wrong source-and-lyric gate`);
  }
  if (!record.supporting_evidence?.includes(
      "#/evidence_catalog/gpmc_handoff_source_authority"
    ) || !record.supporting_evidence?.includes(
      "#/evidence_catalog/controlled_lossless_parent_resolved"
    ) || !record.supporting_evidence?.includes(
      "#/evidence_catalog/lyric_text_source_located"
    )) {
    stop(`${record.match_evidence_record_id} missing controlled source or lyric evidence`);
  }
  if (!record.conflicting_evidence?.includes(
      "#/evidence_catalog/exact_audible_alignment_required"
    ) || !record.conflicting_evidence?.includes(
      "#/evidence_catalog/lyric_normalization_hold"
    ) || !record.conflicting_evidence?.includes(
      "#/evidence_catalog/tpr_boundary_gate_required"
    ) || !record.conflicting_evidence?.includes(
      "#/evidence_catalog/rendition_reconciliation_required"
    )) {
    stop(`${record.match_evidence_record_id} missing remaining lyric or source holds`);
  }
  if (record.conflicting_evidence?.includes(
      "#/evidence_catalog/lossless_lt_pix_parent_missing"
    )) {
    stop(`${record.match_evidence_record_id} still claims the WAV parent is missing`);
  }
}

for (const candidateId of candidateIds) {
  const profile = matchEvidenceRegistry.candidate_audio_profiles[candidateId];
  const requiredUnknowns = candidateId === "a-love-like-that"
    ? [
        "mial_record_id",
        "rendition_performance_id",
        "exact_audible_words",
        "approved_start_seconds",
        "approved_end_seconds"
      ]
    : [
        "mial_record_id",
        "lt_pix_id",
        "rendition_performance_id",
        "controlled_source_path",
        "source_sha256",
        "object_type",
        "exact_audible_words",
        "approved_start_seconds",
        "approved_end_seconds"
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

if (aLoveLikeThatControlledLtPixResolution.lt_pix_id !== "LTPIX_0121" ||
    aLoveLikeThatControlledLtPixResolution.controlled_source_path !==
      A_LOVE_LIKE_THAT_CONTROLLED_SOURCE_PATH ||
    aLoveLikeThatControlledLtPixResolution.source_sha256 !==
      A_LOVE_LIKE_THAT_SOURCE_SHA256) {
  stop("A Love Like That imported source-resolution constants mismatch");
}
if (aLoveLikeThatLyricAuthority.source_lyric_evidence.sha256 !==
    A_LOVE_LIKE_THAT_SOURCE_LYRIC_FINGERPRINT) {
  stop("A Love Like That imported lyric-evidence constant mismatch");
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
console.log("A LOVE LIKE THAT SOURCE AUTHORITY: RESOLVED_CONTROLLED_LOSSLESS_PARENT_TPR_REQUIRED");
console.log("A LOVE LIKE THAT PIX HANDLE: ALLT-105529524");
console.log("A LOVE LIKE THAT LT-PIX ID: LTPIX_0121");
console.log(`A LOVE LIKE THAT WAV PATH: ${A_LOVE_LIKE_THAT_CONTROLLED_SOURCE_PATH}`);
console.log(`A LOVE LIKE THAT SHA-256: ${A_LOVE_LIKE_THAT_SOURCE_SHA256}`);
console.log("A LOVE LIKE THAT LYRIC TEXT: 37 SOURCE LINES LOCATED");
console.log(`A LOVE LIKE THAT LYRIC FINGERPRINT: ${A_LOVE_LIKE_THAT_SOURCE_LYRIC_FINGERPRINT}`);
console.log("A LOVE LIKE THAT EXACT AUDIBLE WORDS: ALIGNMENT REQUIRED");
console.log("A LOVE LIKE THAT TPR/CDR BOUNDARY GATE: REQUIRED");
