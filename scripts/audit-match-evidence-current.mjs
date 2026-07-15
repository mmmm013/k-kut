import {
  matchEvidenceRegistry,
  matchEvidenceRecords,
} from "../data/4pe/match-evidence/quarantined-three-recording-adversarial-matrix-current.mjs";
import {
  A_LOVE_LIKE_THAT_TPR_CDR_LOCK_ID,
  aLoveLikeThatLyricTprCdrLock,
} from "../data/4pe/match-evidence/a-love-like-that-ltpix0121-lyric-tpr-cdr-lock-v001.mjs";

function stop(message) {
  console.error(`STOP: ${message}`);
  process.exit(1);
}

const lock = matchEvidenceRegistry.lyric_tpr_cdr_locks?.a_love_like_that;
const profile = matchEvidenceRegistry.candidate_audio_profiles?.["a-love-like-that"];
const alltRecords = matchEvidenceRecords.filter(
  (row) => row.candidate_audio?.candidate_id === "a-love-like-that"
);

if (matchEvidenceRegistry.registry_version !== "1.1.0") {
  stop("CURRENT registry version must be 1.1.0");
}
if (matchEvidenceRegistry.authority?.mial_is_operational_ssot !== true) {
  stop("MIAL operational SSOT lock missing");
}
if (matchEvidenceRegistry.authority?.scaling_allowed !== false) {
  stop("adversarial test scaling must remain blocked");
}
if (matchEvidenceRecords.length !== 27 || alltRecords.length !== 9) {
  stop("expected 27 total records and 9 A Love Like That records");
}
if (lock?.lock_id !== A_LOVE_LIKE_THAT_TPR_CDR_LOCK_ID ||
    lock?.lock_id !== "allt-ltpix0121-lyric-tpr-cdr-lock-v001") {
  stop("TPR/CDR lock ID mismatch");
}
if (lock?.lt_pix_id !== "LTPIX_0121" ||
    lock?.controlled_source_sha256 !==
      "0b05e40b1421665770d748242325a08e2c7d4fdd94757a43f57c3142d1839a80") {
  stop("controlled WAV identity mismatch");
}
if (lock?.audio_properties?.sample_rate_hz !== 44100 ||
    lock?.audio_properties?.channels !== 2 ||
    lock?.audio_properties?.sample_format !== "PCM_16" ||
    lock?.audio_properties?.duration_seconds !== 196 ||
    lock?.audio_properties?.total_frames !== 8643600) {
  stop("controlled WAV properties mismatch");
}
if (lock?.section_locks?.length !== 7 ||
    lock?.line_alignments?.length !== 37) {
  stop("expected 7 section locks and 37 line alignments");
}
if (lock?.alignment_authority?.line_status_summary?.locked_lexical_sequences !== 36 ||
    lock?.alignment_authority?.line_status_summary?.wording_holds !== 1 ||
    lock?.alignment_authority?.line_status_summary?.section_tpr_cdr_locks !== 7) {
  stop("line or boundary lock summary mismatch");
}
const wordingHolds = lock.line_alignments.filter(
  (row) => row.exact_word_status ===
    "TPR_LOCKED_WORDING_HOLD_SOURCE_METADATA_ANOMALY"
);
if (wordingHolds.length !== 1 || wordingHolds[0]?.line_id !== "ALLT-L04") {
  stop("ALLT-L04 must be the only wording hold");
}
for (const section of lock.section_locks) {
  if (section.boundary_status !== "LOCKED_CONTROLLED_WAV_TPR_CDR_V001") {
    stop(`${section.section_id} is not TPR/CDR locked`);
  }
  if (!(section.start_frame < section.end_frame) ||
      !(section.tpr_start_seconds <
        section.cdr_last_complete_vocal_end_seconds) ||
      !/^[a-f0-9]{64}$/.test(section.pcm_slice_sha256)) {
    stop(`${section.section_id} has invalid frame, time, or slice-hash evidence`);
  }
}
for (const row of lock.line_alignments) {
  if (!(row.start_frame < row.end_frame) ||
      !(row.start_seconds < row.end_seconds) ||
      !/^[a-f0-9]{64}$/.test(row.source_text_sha256) ||
      !/^[a-f0-9]{64}$/.test(row.normalized_lexical_sha256) ||
      !/^[a-f0-9]{64}$/.test(row.pcm_slice_sha256)) {
    stop(`${row.line_id} has invalid alignment or hash evidence`);
  }
}
if (profile?.kkr_section_boundary_count !== 7 ||
    profile?.aligned_source_line_count !== 37 ||
    profile?.locked_lexical_sequence_count !== 36 ||
    profile?.wording_hold_count !== 1 ||
    profile?.exact_audible_words !== null) {
  stop("candidate profile TPR/CDR summary mismatch");
}
for (const record of alltRecords) {
  if (record.audio_meaning_profile?.status !==
      "LINE_ALIGNMENT_COMPLETE_36_LOCKED_1_WORDING_HOLD_MEANING_PROFILE_REQUIRED") {
    stop(`${record.match_evidence_record_id} meaning-profile status mismatch`);
  }
  if (record.exact_expression_hits?.status !==
      "36_LEXICAL_SEQUENCES_AVAILABLE_1_WORDING_HOLD_NOT_MATCH_APPROVAL" ||
      record.exact_expression_hits?.hits?.length !== 0) {
    stop(`${record.match_evidence_record_id} exact-expression control mismatch`);
  }
  if (record.eligibility_gates?.eligible_for_ranking !== false ||
      record.eligibility_gates?.eligible_for_public_release !== false ||
      record.fit_components?.scoring_allowed !== false ||
      record.actual_status !== "METADATA_INSUFFICIENT") {
    stop(`${record.match_evidence_record_id} released or scored prematurely`);
  }
  if (record.eligibility_gates?.gate_profile_ref !==
      "#/eligibility_gate_profiles/a_love_like_that_tpr_cdr_locked_v1") {
    stop(`${record.match_evidence_record_id} gate-profile mismatch`);
  }
  if (!record.supporting_evidence?.includes(
      "#/evidence_catalog/controlled_wav_lyric_tpr_cdr_lock"
    ) || !record.conflicting_evidence?.includes(
      "#/evidence_catalog/allt_l04_wording_hold"
    ) || !record.conflicting_evidence?.includes(
      "#/evidence_catalog/audio_meaning_profile_required"
    )) {
    stop(`${record.match_evidence_record_id} evidence linkage mismatch`);
  }
}
if (aLoveLikeThatLyricTprCdrLock !== lock) {
  stop("registry lock object is not the imported authority object");
}

console.log("MATCH EVIDENCE CURRENT TPR/CDR AUDIT PASS");
console.log("LT-PIX: LTPIX_0121");
console.log("CONTROLLED WAV SHA-256: 0b05e40b1421665770d748242325a08e2c7d4fdd94757a43f57c3142d1839a80");
console.log("SOURCE LYRIC LINES ALIGNED: 37");
console.log("LEXICAL SEQUENCES LOCKED: 36");
console.log("WORDING HOLDS: 1 — ALLT-L04");
console.log("SECTION TPR/CDR LOCKS: 7");
console.log("PROVEN MATCHES: 0");
console.log("SCORING ALLOWED: 0");
console.log("PUBLIC RELEASE ELIGIBLE: 0");
