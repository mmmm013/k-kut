// Authoritative populated matrix: 3 quarantined recordings x 9 adversarial customer needs.
// Retrieval signals discover candidates; they never approve, score, rank, sell, or release them.

import {
  MATCH_EVIDENCE_SCHEMA_PATH,
  CANONICAL_TWINKLE_PATH,
  customerNeedProfiles,
  candidateAudioProfiles as baseCandidateAudioProfiles,
  evidenceCatalog as baseEvidenceCatalog,
  eligibilityGateProfiles as baseEligibilityGateProfiles,
  fitWeightProfiles,
  unresolvedQuestions,
  requiredNextActionPlans,
} from "./match-evidence-authority-v001.mjs";
import {
  aLoveLikeThatControlledLtPixResolution,
  applyALoveLikeThatControlledLtPixResolution,
} from "./a-love-like-that-controlled-lt-pix-resolution-v001.mjs";

const candidateAudioProfiles = {
  ...baseCandidateAudioProfiles,
  "a-love-like-that": applyALoveLikeThatControlledLtPixResolution(
    baseCandidateAudioProfiles["a-love-like-that"]
  )
};

const evidenceCatalog = {
  ...baseEvidenceCatalog,
  controlled_lossless_parent_resolved:
    "The controlled WAV parent is LTPIX_0121: 296 - Lloyd G Miller - A LOVE LIKE THAT.wav, recorded in the controlled DISCO WAV inbox with SHA-256 0b05e40b1421665770d748242325a08e2c7d4fdd94757a43f57c3142d1839a80.",
  tpr_boundary_gate_required:
    "The controlled WAV parent remains NEEDS_TPR_BEFORE_KK_DERIVATION and BLOCKED_UNTIL_TPR_CDR_LOCKS_KK_BOUNDARIES. Source identity does not approve any prior duration-window KK.",
  missing_mial:
    "The controlled LT-PIX ID, WAV path, and SHA-256 are resolved for A Love Like That, but a separate current MIAL row ID and rendition/performance ID remain unlinked. Other candidates remain unresolved."
};

const eligibilityGateProfiles = {
  ...baseEligibilityGateProfiles,
  a_love_like_that_source_resolved_v1: {
    ...baseEligibilityGateProfiles.quarantined_evidence_missing_v1,
    mial_authority: "PARTIAL_LT_PIX_ID_RESOLVED_MIAL_ROW_ID_MISSING",
    controlled_source_identity: "PASS",
    natural_vocal_start: "TPR_REQUIRED",
    natural_vocal_end: "TPR_REQUIRED",
    no_vocal_cut: "TPR_REQUIRED"
  }
};

const historicalAssignments = {
  "a-love-like-that": new Set(["sweet_love", "devotion", "wedding", "anniversary", "general_care", "holiday_use"]),
  "your-heart-poundin": new Set(["physical_spark", "general_care"]),
  "dont-call-it-love": new Set(["apology", "general_care", "holiday_use"])
};

const titleSignals = {
  "a-love-like-that": {
    sweet_love: ["love", "near_synonym", "POSITIVE", 0.35, "Requires verified audible affection and romantic address."],
    devotion: ["love", "broader_concept", "AMBIGUOUS", 0.15, "Love does not establish loyalty or permanence."],
    wedding: ["love", "occasion_relationship", "AMBIGUOUS", 0.10, "Romance does not establish ceremony safety."],
    anniversary: ["love", "occasion_relationship", "AMBIGUOUS", 0.10, "Affection does not establish continuity."],
    general_care: ["love", "emotional_neighbor", "AMBIGUOUS", 0.10, "Romantic love may be unsafe for non-romantic recipients."],
    holiday_use: ["love", "occasion_relationship", "AMBIGUOUS", 0.05, "A title cannot establish current temporary-event fit."]
  },
  "your-heart-poundin": {
    physical_spark: ["heart poundin", "implication", "AMBIGUOUS", 0.40, "Could mean excitement, fear, exertion, or attraction."],
    general_care: ["heart", "emotional_neighbor", "AMBIGUOUS", 0.05, "The word heart does not establish care."]
  },
  "dont-call-it-love": {
    sweet_love: ["don't call it love", "negated_concept", "NEGATIVE", -0.70, "The title negates love; full lyric scope is unknown."],
    devotion: ["don't call it love", "negated_concept", "NEGATIVE", -0.80, "The title conflicts with devotion unless the lyric resolves differently."],
    wedding: ["don't call it love", "contraindication", "NEGATIVE", -0.90, "Serious ceremony-risk signal until full review."],
    anniversary: ["don't call it love", "contrast", "NEGATIVE", -0.65, "May conflict with continuing commitment."],
    apology: ["don't call it love", "ambiguous", "AMBIGUOUS", 0, "No apology or accountability is established."],
    grief: ["don't call it love", "ambiguous", "AMBIGUOUS", 0, "No grief or remembrance meaning is established."],
    general_care: ["don't call it love", "ambiguous", "AMBIGUOUS", 0, "Complicated emotion is not broadly safe care."],
    holiday_use: ["don't call it love", "ambiguous", "AMBIGUOUS", 0, "No current event fit is established."]
  }
};

function retrievalHit(candidateId, needId) {
  const row = titleSignals[candidateId]?.[needId];
  if (!row) return [];
  const [candidate_signal, relationship_type, direction, weight, context_requirement] = row;
  return [{
    query_concept: customerNeedProfiles[needId].label,
    candidate_signal,
    relationship_type,
    direction,
    weight,
    context_requirement,
    evidence_grade: "UNVERIFIED_RETRIEVAL_SIGNAL",
    source: "legacy_display_title_only"
  }];
}

function legacySemanticHit(candidateId, needId) {
  if (!historicalAssignments[candidateId].has(needId)) return [];
  return [{
    query_concept: customerNeedProfiles[needId].label,
    candidate_signal: "historical route or page assignment",
    relationship_type: "legacy_generated_assignment",
    direction: "AMBIGUOUS",
    weight: 0,
    context_requirement: "Administrative assignment is not audible evidence.",
    evidence_grade: "UNVERIFIED_RETRIEVAL_SIGNAL",
    source: "legacy registry, publication bridge, or hardwired page copy"
  }];
}

function makeRecord(candidateId, needId) {
  const candidate = candidateAudioProfiles[candidateId];
  const need = customerNeedProfiles[needId];
  const synonymHits = retrievalHit(candidateId, needId);
  const semanticHits = legacySemanticHit(candidateId, needId);
  const isALoveLikeThat = candidateId === "a-love-like-that";
  const sourceAuthorityEvidence = isALoveLikeThat
    ? [
        "#/evidence_catalog/gpmc_handoff_source_authority",
        "#/evidence_catalog/controlled_lossless_parent_resolved"
      ]
    : [];
  const sourceLineageConflicts = isALoveLikeThat
    ? [
        "#/evidence_catalog/tpr_boundary_gate_required",
        "#/evidence_catalog/rendition_reconciliation_required"
      ]
    : [];

  return {
    match_evidence_record_id: `mer-${candidateId}-${needId.replaceAll("_", "-")}-v001`,
    schema_version: "1.0.0",
    record_date: "2026-07-15",
    authority_chain: {
      system: "GPMx / 4PE / KKr / MIAL",
      mial_is_operational_ssot: true,
      authority_status: isALoveLikeThat ? "PARTIAL" : "UNRESOLVED"
    },
    candidate_audio: {
      candidate_id: candidateId,
      profile_ref: `#/candidate_audio_profiles/${candidateId}`,
      quarantine_status: "QUARANTINED_MATCH_REVIEW"
    },
    customer_need_profile: {
      need_id: needId,
      profile_ref: `#/customer_need_profiles/${needId}`
    },
    audio_meaning_profile: {
      profile_ref: `#/candidate_audio_profiles/${candidateId}`,
      status: "EVIDENCE_REQUIRED",
      verified_field_count: 0
    },
    synonym_graph_hits: {
      status: synonymHits.length ? "LEGACY_SIGNAL_ONLY" : "NOT_RUN",
      evidence_role: "CANDIDATE_DISCOVERY_ONLY_NOT_MATCH_APPROVAL",
      hits: synonymHits
    },
    semantic_retrieval_hits: {
      status: semanticHits.length ? "LEGACY_SIGNAL_ONLY" : "NOT_RUN",
      evidence_role: "CANDIDATE_DISCOVERY_ONLY_NOT_MATCH_APPROVAL",
      hits: semanticHits
    },
    exact_expression_hits: {
      status: "BLOCKED_NO_VERIFIED_TRANSCRIPT",
      evidence_role: "CANDIDATE_DISCOVERY_ONLY_NOT_MATCH_APPROVAL",
      hits: []
    },
    supporting_evidence: [
      ...sourceAuthorityEvidence,
      ...(semanticHits.length ? ["#/evidence_catalog/legacy_generated_approval"] : [])
    ],
    conflicting_evidence: [
      "#/evidence_catalog/missing_mial",
      ...sourceLineageConflicts,
      "#/evidence_catalog/missing_expression",
      "#/evidence_catalog/missing_rights",
      "#/evidence_catalog/missing_gd",
      "#/evidence_catalog/obsolete_twinkle",
      "#/evidence_catalog/unproven_boundaries",
      "#/evidence_catalog/overbroad_reuse"
    ],
    contraindications: {
      review_status: "NOT_REVIEWED",
      customer_need_profile_ref: `#/customer_need_profiles/${needId}`,
      candidate_specific_refs: ["#/evidence_catalog/overbroad_reuse"],
      unresolved_question_refs: Object.keys(unresolvedQuestions).map(
        (id) => `#/unresolved_questions/${id}`
      )
    },
    eligibility_gates: {
      gate_profile_ref: isALoveLikeThat
        ? "#/eligibility_gate_profiles/a_love_like_that_source_resolved_v1"
        : "#/eligibility_gate_profiles/quarantined_evidence_missing_v1",
      eligible_for_ranking: false,
      eligible_for_public_release: false,
      blocking_statuses: ["METADATA_INSUFFICIENT", "DELIVERY_PACKAGE_BLOCKED"]
    },
    fit_components: {
      scoring_allowed: false,
      weight_profile_ref: "#/fit_weight_profiles/bic_match_weight_profile_v1",
      fit_score: null,
      component_scores: null
    },
    evidence_confidence: {
      score: null,
      confidence_band: "INSUFFICIENT_EVIDENCE",
      missing_dimensions: isALoveLikeThat
        ? [
            "mial_row_identity", "rendition_performance_identity", "rights",
            "audible_expression", "boundaries", "meaning", "performance",
            "customer_fit", "human_review", "gd_decision", "final_package"
          ]
        : [
            "source_identity", "rights", "audible_expression", "boundaries", "meaning",
            "performance", "customer_fit", "human_review", "gd_decision", "final_package"
          ]
    },
    personalization_adjustment: {
      status: "NOT_APPLIED",
      value: 0,
      reason: "Personalization cannot override missing eligibility evidence."
    },
    actual_status: "METADATA_INSUFFICIENT",
    required_next_action: {
      action_plan_ref: "#/required_next_action_plans/quarantined_evidence_intake_v1",
      priority: "P1"
    },
    gd_decision: {
      status: "PENDING",
      reviewer: "GD",
      decision: null,
      decision_date: null,
      notes: `No GD approval exists for ${candidate.display_title} as ${need.label}.`
    }
  };
}

const candidateIds = Object.keys(candidateAudioProfiles);
const needIds = Object.keys(customerNeedProfiles);

export const matchEvidenceRecords = candidateIds.flatMap((candidateId) =>
  needIds.map((needId) => makeRecord(candidateId, needId))
);

export const matchEvidenceRegistry = {
  registry_name: "4PE / KKr / MIAL Quarantined Three-Recording Match Evidence Adversarial Matrix",
  registry_version: "1.0.0",
  record_schema: MATCH_EVIDENCE_SCHEMA_PATH,
  status: "READ_ONLY_EVIDENCE_INTAKE_REQUIRED",
  authority: {
    mial_is_operational_ssot: true,
    rule: "4PE captures. KKr proves fit. GD approves. Final II/package proof releases.",
    retrieval_law: "Retrieval signals discover candidates but cannot approve matches.",
    abstention_law: "Missing required evidence means abstain.",
    scaling_allowed: false
  },
  scope: {
    recordings: candidateIds,
    customer_needs: needIds,
    matrix_record_count: matchEvidenceRecords.length,
    reason: "First controlled adversarial test only."
  },
  canonical_twinkle: {
    required_final_path: CANONICAL_TWINKLE_PATH,
    legacy_paths_are_not_approved: true
  },
  source_resolutions: {
    a_love_like_that: aLoveLikeThatControlledLtPixResolution
  },
  customer_need_profiles: customerNeedProfiles,
  candidate_audio_profiles: candidateAudioProfiles,
  evidence_catalog: evidenceCatalog,
  unresolved_questions: unresolvedQuestions,
  eligibility_gate_profiles: eligibilityGateProfiles,
  fit_weight_profiles: fitWeightProfiles,
  required_next_action_plans: requiredNextActionPlans,
  records: matchEvidenceRecords
};
