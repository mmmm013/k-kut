// CURRENT authoritative Match Evidence view.
// Extends the immutable v001 evidence with the LTPIX_0121 line/boundary lock,
// resolved ALLT-L04 wording, and seven internal KK-level BIC profiles.

import {
  matchEvidenceRegistry as baseRegistry,
  matchEvidenceRecords as baseRecords,
} from "./quarantined-three-recording-adversarial-matrix-v001.mjs";
import {
  aLoveLikeThatLyricTprCdrLock as baseLyricTprCdrLock,
  applyALoveLikeThatLyricTprCdrLock,
} from "./a-love-like-that-ltpix0121-lyric-tpr-cdr-lock-v001.mjs";
import {
  aLoveLikeThatL04WordingResolution,
  applyALoveLikeThatL04WordingResolution,
} from "./a-love-like-that-l04-wording-resolution-v001.mjs";
import {
  aLoveLikeThatKkProfileRegistry,
  applyALoveLikeThatKkProfiles,
} from "./a-love-like-that-seven-kk-bic-profiles-v001.mjs";

const resolvedLyricTprCdrLock =
  applyALoveLikeThatL04WordingResolution(baseLyricTprCdrLock);

const tprCdrProfile = applyALoveLikeThatLyricTprCdrLock(
  baseRegistry.candidate_audio_profiles["a-love-like-that"]
);

const candidateAudioProfiles = {
  ...baseRegistry.candidate_audio_profiles,
  "a-love-like-that": applyALoveLikeThatKkProfiles({
    ...tprCdrProfile,
    exact_audible_words_status: "VERIFIED_37_OF_37_CONTROLLED_WAV",
    exact_audible_words: null,
    wording_hold_count: 0,
    locked_lexical_sequence_count: 37,
    lyric_tpr_cdr_lock_id: resolvedLyricTprCdrLock.lock_id,
    l04_wording_resolution_id:
      aLoveLikeThatL04WordingResolution.resolution_id
  })
};

const evidenceCatalog = {
  ...baseRegistry.evidence_catalog,
  controlled_wav_lyric_tpr_cdr_lock:
    "LTPIX_0121 has 37 of 37 source-lyric lines aligned and seven natural vocal-start/final-complete-vocal-end section locks tied to integer WAV frame indexes.",
  allt_l04_exact_wording_resolved:
    "ALLT-L04 is audibly locked as: That's lookin' back - since then he's flashed. The unusual authored wording is preserved rather than editorially normalized.",
  seven_kk_profiles_complete:
    "Seven internal KK profiles separately record meaning, performance, emotional resolution, candidate-use families, explicit nonclaims, and contraindications.",
  seven_kk_contraindications_complete:
    "Contraindication review is complete at the candidate-audio level for all seven locked KKs; each customer need still requires a separate pairwise review.",
  customer_need_match_review_required:
    "Complete candidate evidence does not prove any customer-need match. Each KK x need pair must be reviewed for literal fit, relationship fit, emotional resolution, intensity, and contraindications before scoring or ranking.",
  missing_mial:
    "The controlled LT-PIX, source lyric evidence, exact wording, boundaries, and seven KK profiles are resolved, but current MIAL authority row IDs and rendition/performance identity remain unlinked."
};

const priorAlltGate =
  baseRegistry.eligibility_gate_profiles
    .a_love_like_that_source_and_lyric_text_resolved_v1;

const eligibilityGateProfiles = {
  ...baseRegistry.eligibility_gate_profiles,
  a_love_like_that_seven_kk_profiled_v1: {
    ...priorAlltGate,
    mial_authority:
      "PARTIAL_LT_PIX_LYRIC_TPR_CDR_AND_KK_PROFILES_RESOLVED_MIAL_ROW_IDS_MISSING",
    controlled_source_identity: "PASS",
    lyric_text_source: "PASS_SOURCE_TEXT_LOCATED",
    exact_audible_expression: "PASS_37_OF_37_CONTROLLED_WAV",
    natural_vocal_start: "PASS_7_OF_7_SECTION_TPR_LOCKS",
    natural_vocal_end: "PASS_7_OF_7_SECTION_CDR_LOCKS",
    no_vocal_cut: "PASS_CONTROLLED_WAV_SECTION_LOCKS",
    meaning_fit: "PASS_7_OF_7_CANDIDATE_PROFILES",
    performance_fit: "PASS_7_OF_7_CANDIDATE_PROFILES",
    emotional_resolution: "PASS_7_OF_7_CANDIDATE_PROFILES",
    contraindication_review: "PASS_7_OF_7_CANDIDATE_PROFILES",
    customer_need_pair_review: "MISSING",
    human_review: "MISSING",
    gd_approval: "MISSING",
    canonical_twinkle_package: "FAIL"
  }
};

const requiredNextActionPlans = {
  ...baseRegistry.required_next_action_plans,
  a_love_like_that_match_review_v1: {
    action:
      "Run the nine customer-need profiles against each of the seven locked KK profiles using positive fit and contraindication evidence.",
    required_outputs: [
      "pairwise literal-meaning decision",
      "relationship compatibility decision",
      "emotional-resolution decision",
      "performance-intensity decision",
      "contraindication decision",
      "abstain or GD-review recommendation"
    ],
    forbidden_until_complete: [
      "fit scoring",
      "ranking",
      "personalization",
      "public release",
      "delivery packaging"
    ]
  }
};

export const matchEvidenceRecords = baseRecords.map((record) => {
  if (record.candidate_audio?.candidate_id !== "a-love-like-that") {
    return record;
  }

  return {
    ...record,
    authority_chain: {
      ...record.authority_chain,
      authority_status: "PARTIAL"
    },
    audio_meaning_profile: {
      profile_ref: record.audio_meaning_profile.profile_ref,
      status: "VERIFIED",
      verified_field_count: 4
    },
    exact_expression_hits: {
      status: "COMPLETE",
      evidence_role: "CANDIDATE_DISCOVERY_ONLY_NOT_MATCH_APPROVAL",
      hits: []
    },
    supporting_evidence: [
      ...new Set([
        ...(record.supporting_evidence || []),
        "#/evidence_catalog/controlled_wav_lyric_tpr_cdr_lock",
        "#/evidence_catalog/allt_l04_exact_wording_resolved",
        "#/evidence_catalog/seven_kk_profiles_complete",
        "#/evidence_catalog/seven_kk_contraindications_complete"
      ])
    ],
    conflicting_evidence: [
      ...(record.conflicting_evidence || []).filter((ref) =>
        ![
          "#/evidence_catalog/exact_audible_alignment_required",
          "#/evidence_catalog/lyric_normalization_hold",
          "#/evidence_catalog/tpr_boundary_gate_required",
          "#/evidence_catalog/unproven_boundaries",
          "#/evidence_catalog/missing_expression"
        ].includes(ref)
      ),
      "#/evidence_catalog/customer_need_match_review_required"
    ],
    contraindications: {
      review_status: "COMPLETE",
      customer_need_profile_ref:
        record.contraindications.customer_need_profile_ref,
      candidate_specific_refs: [
        "#/evidence_catalog/seven_kk_contraindications_complete",
        "#/evidence_catalog/customer_need_match_review_required"
      ],
      unresolved_question_refs:
        record.contraindications.unresolved_question_refs
    },
    eligibility_gates: {
      gate_profile_ref:
        "#/eligibility_gate_profiles/a_love_like_that_seven_kk_profiled_v1",
      eligible_for_ranking: false,
      eligible_for_public_release: false,
      blocking_statuses: [
        "MATCH_REVIEW_REQUIRED",
        "DELIVERY_PACKAGE_BLOCKED"
      ]
    },
    fit_components: {
      ...record.fit_components,
      scoring_allowed: false,
      fit_score: null,
      component_scores: null
    },
    evidence_confidence: {
      score: null,
      confidence_band: "MODERATE",
      missing_dimensions: [
        "rights",
        "customer_fit",
        "human_review",
        "gd_decision",
        "final_package"
      ]
    },
    personalization_adjustment: {
      status: "NOT_APPLIED",
      value: 0,
      reason:
        "Personalization cannot precede pairwise customer-fit evidence and GD approval."
    },
    actual_status: "MATCH_REVIEW_REQUIRED",
    required_next_action: {
      action_plan_ref:
        "#/required_next_action_plans/a_love_like_that_match_review_v1",
      priority: "P1"
    },
    gd_decision: {
      status: "PENDING",
      reviewer: "GD",
      decision: null,
      decision_date: null,
      notes:
        `Seven candidate KK profiles are complete; no GD match decision exists for ${record.customer_need_profile.need_id}.`
    }
  };
});

export const matchEvidenceRegistry = {
  ...baseRegistry,
  registry_name:
    "4PE / KKr / MIAL Quarantined Three-Recording Match Evidence CURRENT",
  registry_version: "1.2.0",
  status:
    "A_LOVE_LIKE_THAT_SEVEN_KK_PROFILES_COMPLETE_MATCH_REVIEW_REQUIRED",
  candidate_audio_profiles: candidateAudioProfiles,
  evidence_catalog: evidenceCatalog,
  eligibility_gate_profiles: eligibilityGateProfiles,
  required_next_action_plans: requiredNextActionPlans,
  lyric_tpr_cdr_locks: {
    a_love_like_that: resolvedLyricTprCdrLock
  },
  wording_resolutions: {
    allt_l04: aLoveLikeThatL04WordingResolution
  },
  kk_profile_registries: {
    a_love_like_that: aLoveLikeThatKkProfileRegistry
  },
  records: matchEvidenceRecords
};
