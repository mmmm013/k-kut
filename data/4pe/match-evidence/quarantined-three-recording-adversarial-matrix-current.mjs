// CURRENT authoritative Match Evidence view.
// Extends the v001 three-recording adversarial matrix with the LTPIX_0121
// line alignment and TPR/CDR boundary lock. The v001 module remains immutable evidence history.

import {
  matchEvidenceRegistry as baseRegistry,
  matchEvidenceRecords as baseRecords,
} from "./quarantined-three-recording-adversarial-matrix-v001.mjs";
import {
  aLoveLikeThatLyricTprCdrLock,
  applyALoveLikeThatLyricTprCdrLock,
} from "./a-love-like-that-ltpix0121-lyric-tpr-cdr-lock-v001.mjs";

const candidateAudioProfiles = {
  ...baseRegistry.candidate_audio_profiles,
  "a-love-like-that": applyALoveLikeThatLyricTprCdrLock(
    baseRegistry.candidate_audio_profiles["a-love-like-that"]
  )
};

const evidenceCatalog = {
  ...baseRegistry.evidence_catalog,
  controlled_wav_lyric_tpr_cdr_lock:
    "LTPIX_0121 is line-aligned to all 37 controlled source-lyric lines. Seven natural vocal-start and final-complete-vocal-end section boundaries are locked to integer WAV frame indexes. Thirty-six lexical sequences are locked; ALLT-L04 retains one exact-wording hold.",
  allt_l04_wording_hold:
    "ALLT-L04 has a locked temporal span and PCM-slice hash, but its exact final wording remains held because the source metadata is internally anomalous. The wording must not be editorially guessed.",
  audio_meaning_profile_required:
    "Lyric timing and TPR/CDR boundaries do not establish speaker, addressee, action, claim, emotional resolution, performance meaning, contraindications, or customer-need fit."
};

const priorAlltGate =
  baseRegistry.eligibility_gate_profiles
    .a_love_like_that_source_and_lyric_text_resolved_v1;

const eligibilityGateProfiles = {
  ...baseRegistry.eligibility_gate_profiles,
  a_love_like_that_tpr_cdr_locked_v1: {
    ...priorAlltGate,
    mial_authority:
      "PARTIAL_LT_PIX_LYRIC_EVIDENCE_AND_TPR_CDR_LOCK_RESOLVED_MIAL_ROW_IDS_MISSING",
    controlled_source_identity: "PASS",
    lyric_text_source: "PASS_SOURCE_TEXT_LOCATED",
    exact_audible_expression:
      "PARTIAL_PASS_36_LEXICAL_SEQUENCES_LOCKED_1_WORDING_HOLD",
    natural_vocal_start: "PASS_7_OF_7_SECTION_TPR_LOCKS",
    natural_vocal_end: "PASS_7_OF_7_SECTION_CDR_LOCKS",
    no_vocal_cut: "PASS_CONTROLLED_WAV_SECTION_LOCKS",
    meaning_fit: "MISSING",
    relationship_fit: "MISSING",
    contraindication_review: "MISSING",
    human_review: "MISSING",
    gd_approval: "MISSING",
    canonical_twinkle_package: "FAIL"
  }
};

export const matchEvidenceRecords = baseRecords.map((record) => {
  if (record.candidate_audio?.candidate_id !== "a-love-like-that") {
    return record;
  }

  return {
    ...record,
    audio_meaning_profile: {
      ...record.audio_meaning_profile,
      lyric_tpr_cdr_lock_ref:
        "#/lyric_tpr_cdr_locks/a_love_like_that",
      status:
        "LINE_ALIGNMENT_COMPLETE_36_LOCKED_1_WORDING_HOLD_MEANING_PROFILE_REQUIRED",
      verified_field_count: 2
    },
    exact_expression_hits: {
      ...record.exact_expression_hits,
      status:
        "36_LEXICAL_SEQUENCES_AVAILABLE_1_WORDING_HOLD_NOT_MATCH_APPROVAL",
      hits: []
    },
    supporting_evidence: [
      ...new Set([
        ...(record.supporting_evidence || []),
        "#/evidence_catalog/controlled_wav_lyric_tpr_cdr_lock"
      ])
    ],
    conflicting_evidence: [
      ...(record.conflicting_evidence || []).filter((ref) =>
        ![
          "#/evidence_catalog/exact_audible_alignment_required",
          "#/evidence_catalog/lyric_normalization_hold",
          "#/evidence_catalog/tpr_boundary_gate_required",
          "#/evidence_catalog/unproven_boundaries"
        ].includes(ref)
      ),
      "#/evidence_catalog/allt_l04_wording_hold",
      "#/evidence_catalog/audio_meaning_profile_required"
    ],
    eligibility_gates: {
      ...record.eligibility_gates,
      gate_profile_ref:
        "#/eligibility_gate_profiles/a_love_like_that_tpr_cdr_locked_v1",
      eligible_for_ranking: false,
      eligible_for_public_release: false,
      blocking_statuses: [
        "METADATA_INSUFFICIENT",
        "MATCH_REVIEW_REQUIRED",
        "DELIVERY_PACKAGE_BLOCKED"
      ]
    },
    evidence_confidence: {
      ...record.evidence_confidence,
      score: null,
      confidence_band: "INSUFFICIENT_EVIDENCE_FOR_MATCH",
      missing_dimensions: [
        "mial_row_identity",
        "rendition_performance_identity",
        "rights",
        "exact_wording_hold_line_04",
        "meaning",
        "performance",
        "customer_fit",
        "contraindication_review",
        "human_review",
        "gd_decision",
        "final_package"
      ]
    },
    actual_status: "METADATA_INSUFFICIENT",
    required_next_action: {
      ...record.required_next_action,
      priority: "P1",
      immediate_action:
        "Resolve ALLT-L04 wording, then complete the KK-level audio meaning and contraindication profile."
    }
  };
});

export const matchEvidenceRegistry = {
  ...baseRegistry,
  registry_name:
    "4PE / KKr / MIAL Quarantined Three-Recording Match Evidence CURRENT",
  registry_version: "1.1.0",
  status: "A_LOVE_LIKE_THAT_TPR_CDR_LOCKED_MEANING_REVIEW_REQUIRED",
  candidate_audio_profiles: candidateAudioProfiles,
  evidence_catalog: evidenceCatalog,
  eligibility_gate_profiles: eligibilityGateProfiles,
  lyric_tpr_cdr_locks: {
    a_love_like_that: aLoveLikeThatLyricTprCdrLock
  },
  records: matchEvidenceRecords
};
