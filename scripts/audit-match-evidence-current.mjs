import {
  matchEvidenceRegistry,
  matchEvidenceRecords,
} from "../data/4pe/match-evidence/quarantined-three-recording-adversarial-matrix-current.mjs";

function stop(message) {
  console.error(`STOP: ${message}`);
  process.exit(1);
}

const lock =
  matchEvidenceRegistry.lyric_tpr_cdr_locks?.a_love_like_that;
const wording = matchEvidenceRegistry.wording_resolutions?.allt_l04;
const profileRegistry =
  matchEvidenceRegistry.kk_profile_registries?.a_love_like_that;
const candidateProfile =
  matchEvidenceRegistry.candidate_audio_profiles?.["a-love-like-that"];
const alltRecords = matchEvidenceRecords.filter(
  (row) => row.candidate_audio?.candidate_id === "a-love-like-that"
);
const otherRecords = matchEvidenceRecords.filter(
  (row) => row.candidate_audio?.candidate_id !== "a-love-like-that"
);

if (matchEvidenceRegistry.registry_version !== "1.2.0") {
  stop("CURRENT registry version must be 1.2.0");
}
if (matchEvidenceRegistry.authority?.mial_is_operational_ssot !== true) {
  stop("MIAL operational SSOT lock missing");
}
if (matchEvidenceRegistry.authority?.scaling_allowed !== false) {
  stop("adversarial test scaling must remain blocked");
}
if (matchEvidenceRecords.length !== 27 ||
    alltRecords.length !== 9 || otherRecords.length !== 18) {
  stop("expected 27 records: 9 A Love Like That and 18 other records");
}

if (lock?.lt_pix_id !== "LTPIX_0121" ||
    lock?.controlled_source_sha256 !==
      "0b05e40b1421665770d748242325a08e2c7d4fdd94757a43f57c3142d1839a80") {
  stop("controlled WAV identity mismatch");
}
if (lock?.section_locks?.length !== 7 ||
    lock?.line_alignments?.length !== 37) {
  stop("expected seven section locks and 37 line alignments");
}
if (lock?.alignment_authority?.line_status_summary
      ?.locked_lexical_sequences !== 37 ||
    lock?.alignment_authority?.line_status_summary?.wording_holds !== 0 ||
    lock?.alignment_authority?.line_status_summary
      ?.section_tpr_cdr_locks !== 7) {
  stop("resolved line/boundary summary mismatch");
}

const l04 = lock.line_alignments.find((row) => row.line_id === "ALLT-L04");
if (!l04 ||
    l04.exact_word_status !==
      "LOCKED_SOURCE_LEXICAL_SEQUENCE_ALIGNED_TO_CONTROLLED_WAV" ||
    l04.exact_audible_wording_ref !==
      "allt-l04-exact-audible-wording-v001") {
  stop("ALLT-L04 is not linked to the exact-wording resolution");
}
if (wording?.exact_audible_wording !==
      "That's lookin' back - since then he's flashed" ||
    wording?.source_text_sha256 !==
      "ea72079286ecf270c5b838487dddcda369d200e00ddae5e6f6e46bf1bde74cc7" ||
    wording?.normalized_lexical_sha256 !==
      "12974a97d8e8a53e58ca5bbd676ea0838852f344c709f931a7dc2919b9aa7cd2" ||
    wording?.resolution_status !==
      "LOCKED_EXACT_AUDIBLE_WORDING_CONTROLLED_WAV") {
  stop("ALLT-L04 wording, hash, or status mismatch");
}
if (wording?.evidence?.source_beats_years_flashed_variants !== 18 ||
    wording?.evidence?.source_beats_years_passed_variants !== 18) {
  stop("ALLT-L04 adversarial alternative evidence mismatch");
}

if (profileRegistry?.profile_count !== 7 ||
    profileRegistry?.profiles?.length !== 7 ||
    profileRegistry?.status !==
      "INTERNAL_EVIDENCE_COMPLETE_GD_MATCH_APPROVAL_PENDING" ||
    profileRegistry?.scoring_allowed !== false ||
    profileRegistry?.ranking_allowed !== false ||
    profileRegistry?.public_release_allowed !== false) {
  stop("seven-KK profile registry status mismatch");
}

const expectedSections = new Set([
  "KK-ALLT-105529524-S01",
  "KK-ALLT-105529524-S02",
  "KK-ALLT-105529524-S03",
  "KK-ALLT-105529524-S04",
  "KK-ALLT-105529524-S05",
  "KK-ALLT-105529524-S06",
  "KK-ALLT-105529524-S07"
]);
const seenProfiles = new Set();
for (const profile of profileRegistry.profiles) {
  if (seenProfiles.has(profile.profile_id)) {
    stop(`duplicate profile ${profile.profile_id}`);
  }
  seenProfiles.add(profile.profile_id);
  if (!expectedSections.delete(profile.section_id)) {
    stop(`unexpected or duplicate section ${profile.section_id}`);
  }
  if (!(profile.tpr_start_seconds < profile.cdr_end_seconds) ||
      !profile.meaning?.core_proposition ||
      !profile.meaning?.speaker_pov ||
      !profile.performance?.presentation ||
      !Number.isFinite(profile.performance?.rms_db_median) ||
      !Number.isFinite(profile.performance?.f0_median_hz) ||
      !profile.emotional_resolution?.start ||
      !profile.emotional_resolution?.end ||
      !profile.contraindications?.hard?.length ||
      !profile.contraindications?.cautions?.length) {
    stop(`${profile.section_id} has incomplete BIC profile evidence`);
  }
}
if (expectedSections.size !== 0) {
  stop("one or more locked sections lack a KK profile");
}

if (candidateProfile?.kk_profile_count !== 7 ||
    candidateProfile?.locked_lexical_sequence_count !== 37 ||
    candidateProfile?.wording_hold_count !== 0 ||
    candidateProfile?.exact_audible_words_status !==
      "VERIFIED_37_OF_37_CONTROLLED_WAV" ||
    candidateProfile?.kk_meaning_profiles_status !==
      "VERIFIED_7_OF_7_INTERNAL" ||
    candidateProfile?.kk_performance_profiles_status !==
      "VERIFIED_7_OF_7_INTERNAL" ||
    candidateProfile?.kk_emotional_resolution_profiles_status !==
      "VERIFIED_7_OF_7_INTERNAL" ||
    candidateProfile?.kk_contraindication_profiles_status !==
      "COMPLETE_7_OF_7_INTERNAL") {
  stop("candidate profile summary mismatch");
}

for (const record of alltRecords) {
  if (record.actual_status !== "MATCH_REVIEW_REQUIRED" ||
      record.audio_meaning_profile?.status !== "VERIFIED" ||
      record.audio_meaning_profile?.verified_field_count !== 4 ||
      record.exact_expression_hits?.status !== "COMPLETE" ||
      record.exact_expression_hits?.hits?.length !== 0 ||
      record.contraindications?.review_status !== "COMPLETE") {
    stop(`${record.match_evidence_record_id} evidence-state mismatch`);
  }
  if (record.eligibility_gates?.eligible_for_ranking !== false ||
      record.eligibility_gates?.eligible_for_public_release !== false ||
      record.fit_components?.scoring_allowed !== false ||
      record.fit_components?.fit_score !== null ||
      record.fit_components?.component_scores !== null ||
      record.personalization_adjustment?.status !== "NOT_APPLIED" ||
      record.gd_decision?.status !== "PENDING") {
    stop(`${record.match_evidence_record_id} was scored, ranked, personalized, approved, or released prematurely`);
  }
  if (record.required_next_action?.action_plan_ref !==
        "#/required_next_action_plans/a_love_like_that_match_review_v1" ||
      !record.eligibility_gates?.blocking_statuses?.includes(
        "MATCH_REVIEW_REQUIRED") ||
      !record.eligibility_gates?.blocking_statuses?.includes(
        "DELIVERY_PACKAGE_BLOCKED")) {
    stop(`${record.match_evidence_record_id} match-review gate mismatch`);
  }
  for (const resolved of [
    "source_identity",
    "audible_expression",
    "boundaries",
    "meaning",
    "performance"
  ]) {
    if (record.evidence_confidence?.missing_dimensions?.includes(resolved)) {
      stop(`${record.match_evidence_record_id} still marks ${resolved} missing`);
    }
  }
  for (const pending of [
    "rights",
    "customer_fit",
    "human_review",
    "gd_decision",
    "final_package"
  ]) {
    if (!record.evidence_confidence?.missing_dimensions?.includes(pending)) {
      stop(`${record.match_evidence_record_id} lost pending ${pending} gate`);
    }
  }
}

for (const record of otherRecords) {
  if (record.actual_status !== "METADATA_INSUFFICIENT" ||
      record.eligibility_gates?.eligible_for_ranking !== false ||
      record.eligibility_gates?.eligible_for_public_release !== false) {
    stop(`${record.match_evidence_record_id} changed outside A Love Like That scope`);
  }
}
if (matchEvidenceRecords.some((row) => row.actual_status === "PROVEN_MATCH")) {
  stop("no pair may be PROVEN_MATCH before pairwise review and GD approval");
}

console.log("MATCH EVIDENCE CURRENT BIC PROFILE AUDIT PASS");
console.log("LT-PIX: LTPIX_0121");
console.log("ALLT-L04: EXACT AUDIBLE WORDING RESOLVED");
console.log("SOURCE LYRIC LINES LOCKED: 37 OF 37");
console.log("SECTION TPR/CDR LOCKS: 7 OF 7");
console.log("KK MEANING/PERFORMANCE/RESOLUTION/CONTRAINDICATION PROFILES: 7 OF 7");
console.log("A LOVE LIKE THAT PAIRS: MATCH_REVIEW_REQUIRED 9 OF 9");
console.log("PROVEN MATCHES: 0");
console.log("SCORING ALLOWED: 0");
console.log("RANKING ALLOWED: 0");
console.log("PERSONALIZATION APPLIED: 0");
console.log("PUBLIC RELEASE ELIGIBLE: 0");
