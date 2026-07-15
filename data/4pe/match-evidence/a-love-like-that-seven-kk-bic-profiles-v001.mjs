// Seven internal KK-level meaning, performance, emotional-resolution, and contraindication profiles.
// These profiles support controlled Match Evidence review. They do not score, rank, sell, or release a KK.

export const A_LOVE_LIKE_THAT_KK_PROFILE_REGISTRY_ID =
  "allt-105529524-seven-kk-bic-profiles-v001";

export const aLoveLikeThatKkProfiles = [
  {
    profile_id: "allt-105529524-s01-meaning-performance-v001",
    section_id: "KK-ALLT-105529524-S01",
    label: "V1",
    source_line_range: [1, 5],
    tpr_start_seconds: 12.004989,
    cdr_end_seconds: 31.810998,
    meaning: {
      speaker_pov: "FIRST_PERSON_NARRATOR_DESCRIBING_PARENTS_IN_THIRD_PERSON",
      addressee: "UNSPECIFIED_LISTENER",
      core_proposition:
        "The narrator's parents disproved early skepticism by sustaining a loving relationship for fifty years.",
      functions: [
        "FAMILY_ORIGIN_STORY",
        "ENDURANCE_PROOF",
        "RELATIONSHIP_RESILIENCE",
        "LEGACY_ADMIRATION"
      ],
      nonclaims: [
        "NOT_A_DIRECT_PROMISE_TO_RECIPIENT",
        "NOT_AN_APOLOGY",
        "NOT_A_PROPOSAL",
        "NOT_BEREAVEMENT_LANGUAGE"
      ]
    },
    performance: {
      presentation: "MALE_LEAD_NARRATIVE_SINGER_SONGWRITER",
      delivery:
        "CONVERSATIONAL_STORYTELLING_WITH_MELODIC_LIFT_AT_RESOLUTION",
      intensity: "LOW_TO_MODERATE",
      rms_db_median: -16.798,
      rms_db_p90: -11.826,
      f0_median_hz: 171.614,
      f0_p10_hz: 78.232,
      f0_p90_hz: 233.082,
      voiced_fraction: 0.642,
      onsets_per_second: 4.342,
      interpretation:
        "Quieter than the choruses; the wide upper pitch span supports narrative lift into the fifty-year resolution."
    },
    emotional_resolution: {
      start: "RECALLED_DOUBT_AND_RECKLESS_YOUTH",
      movement: "TIME_AND_ENDURANCE_DISPROVE_THE_DOUBT",
      end: "ADMIRING_VALIDATION_OF_LONG_TERM_LOVE",
      closure: "RESOLVED_WITHIN_THE_STORY"
    },
    candidate_use_families: [
      "LONG_MARRIAGE",
      "ANNIVERSARY",
      "PARENTS_OR_GRANDPARENTS",
      "FAMILY_LEGACY",
      "RELATIONSHIP_RESILIENCE"
    ],
    contraindications: {
      hard: ["APOLOGY", "PHYSICAL_SPARK", "GENERAL_NONROMANTIC_CARE", "ACUTE_GRIEF"],
      cautions: [
        "Assumes a parents/grandparents and long-duration relationship story.",
        "The recklessness reference can be wrong or embarrassing for a recipient.",
        "Third-person narration does not directly tell the recipient I love you."
      ]
    }
  },
  {
    profile_id: "allt-105529524-s02-meaning-performance-v001",
    section_id: "KK-ALLT-105529524-S02",
    label: "CH1",
    source_line_range: [6, 11],
    tpr_start_seconds: 33.117007,
    cdr_end_seconds: 63.39,
    meaning: {
      speaker_pov: "FIRST_PERSON_OBSERVER_EXPRESSING_ASPIRATION",
      addressee: "UNSPECIFIED_LISTENER",
      core_proposition:
        "Everyday courtesy, mutual attention, and walking through life together exemplify the kind of love the speaker wants.",
      functions: [
        "IDEALIZED_EVERYDAY_DEVOTION",
        "MUTUAL_AFFECTION",
        "ROMANTIC_ASPIRATION",
        "VISUAL_RELATIONSHIP_PORTRAIT"
      ],
      nonclaims: [
        "NOT_A_CLAIM_THAT_THE_SPEAKER_ALREADY_HAS_THIS_LOVE",
        "NOT_A_VOW",
        "NOT_AN_APOLOGY",
        "NOT_SEXUAL_LANGUAGE"
      ]
    },
    performance: {
      presentation: "MALE_LEAD_OPEN_CHORUS",
      delivery: "BROADER_SUSTAINED_MELODY_WITH_WARM_AFFIRMING_CADENCE",
      intensity: "MODERATE",
      rms_db_median: -14.022,
      rms_db_p90: -11.685,
      f0_median_hz: 133.099,
      f0_p10_hz: 65.406,
      f0_p90_hz: 174.614,
      voiced_fraction: 0.533,
      onsets_per_second: 4.426,
      interpretation:
        "Median energy rises about 2.8 dB above V1, creating the first clear emotional opening."
    },
    emotional_resolution: {
      start: "OBSERVATION_OF_AN_IDEAL_COUPLE",
      movement: "DETAILS_ACCUMULATE_INTO_ADMIRATION",
      end: "PERSONAL_YEARNING_FOR_THE_SAME_KIND_OF_LOVE",
      closure: "ASPIRATIONAL_NOT_POSSESSIVE"
    },
    candidate_use_families: [
      "SWEET_LOVE",
      "DEVOTION",
      "ANNIVERSARY",
      "WEDDING_ADJACENT",
      "ROMANTIC_ADMIRATION"
    ],
    contraindications: {
      hard: ["APOLOGY", "GRIEF", "GENERAL_NONROMANTIC_CARE"],
      cautions: [
        "The first-person desire can imply the speaker does not currently have this quality of love.",
        "The he/her and Rockwell-style imagery is relationship-specific rather than universal.",
        "It admires a model of love but does not make a direct commitment to the recipient."
      ]
    }
  },
  {
    profile_id: "allt-105529524-s03-meaning-performance-v001",
    section_id: "KK-ALLT-105529524-S03",
    label: "V2",
    source_line_range: [12, 16],
    tpr_start_seconds: 73.329002,
    cdr_end_seconds: 95.021995,
    meaning: {
      speaker_pov: "FIRST_PERSON_WITNESS_DESCRIBING_COUPLE_IN_THIRD_PERSON",
      addressee: "UNSPECIFIED_LISTENER",
      core_proposition:
        "The couple's shared memories and her laughter remain precious to him from their first meeting onward.",
      functions: [
        "PRESENT_DAY_WITNESS",
        "SHARED_HISTORY",
        "CHERISHED_LAUGHTER",
        "CONTINUING_TENDERNESS"
      ],
      nonclaims: [
        "NOT_DIRECT_RECIPIENT_ADDRESS",
        "NOT_A_PROMISE",
        "NOT_AN_APOLOGY",
        "NOT_A_LOSS_STATEMENT"
      ]
    },
    performance: {
      presentation: "MALE_LEAD_INTIMATE_OBSERVATIONAL_VERSE",
      delivery: "LIGHTER_CONVERSATIONAL_PHRASING_WITH_SPACE_AROUND_THE_STORY",
      intensity: "LOW_TO_MODERATE",
      rms_db_median: -16.172,
      rms_db_p90: -12.222,
      f0_median_hz: 153.777,
      f0_p10_hz: 77.782,
      f0_p90_hz: 174.614,
      voiced_fraction: 0.367,
      onsets_per_second: 4.241,
      interpretation:
        "Lower energy and the lowest voiced fraction create more space and an intimate observational feel."
    },
    emotional_resolution: {
      start: "WATCHING_THE_COUPLE_IN_THE_PRESENT",
      movement: "MEMORY_AND_LAUGHTER_REVEAL_CONTINUITY",
      end: "TENDER_CONFIDENCE_IN_ENDURING_AFFECTION",
      closure: "RESOLVED_AS_WITNESSED_CONTINUITY"
    },
    candidate_use_families: [
      "ANNIVERSARY",
      "SHARED_MEMORIES",
      "LONG_TERM_COUPLE",
      "TENDER_ADMIRATION",
      "FIRST_MEETING_MEMORY"
    ],
    contraindications: {
      hard: ["APOLOGY", "PHYSICAL_SPARK", "ACUTE_GRIEF", "GENERAL_NONROMANTIC_CARE"],
      cautions: [
        "Assumes a long shared history and a specific male/female couple.",
        "Third-person observation can feel impersonal when the customer needs direct words.",
        "The first-meeting reference is unsafe when it does not match the recipient's story."
      ]
    }
  },
  {
    profile_id: "allt-105529524-s04-meaning-performance-v001",
    section_id: "KK-ALLT-105529524-S04",
    label: "CH2",
    source_line_range: [17, 22],
    tpr_start_seconds: 97.180998,
    cdr_end_seconds: 126.403991,
    meaning: {
      speaker_pov: "FIRST_PERSON_OBSERVER_EXPRESSING_ASPIRATION",
      addressee: "UNSPECIFIED_LISTENER",
      core_proposition:
        "The observed couple's ordinary acts and mutual gaze confirm an enduring-love ideal the speaker personally desires.",
      functions: [
        "REINFORCED_EVERYDAY_DEVOTION",
        "MUTUAL_AFFECTION",
        "ROMANTIC_ASPIRATION",
        "EVIDENCE_BACKED_REFRAIN"
      ],
      nonclaims: [
        "NOT_A_DIRECT_VOW",
        "NOT_A_CLAIM_OF_CURRENT_RELATIONSHIP_SATISFACTION",
        "NOT_AN_APOLOGY",
        "NOT_GRIEF_LANGUAGE"
      ]
    },
    performance: {
      presentation: "MALE_LEAD_REINFORCED_CHORUS",
      delivery: "STEADY_BROAD_REFRAIN_AFTER_THE_INTIMATE_SECOND_VERSE",
      intensity: "MODERATE_TO_STRONG",
      rms_db_median: -13.9,
      rms_db_p90: -11.63,
      f0_median_hz: 130.813,
      f0_p10_hz: 65.406,
      f0_p90_hz: 174.614,
      voiced_fraction: 0.463,
      onsets_per_second: 4.312,
      interpretation:
        "Energy closely matches CH1, but the preceding lived-history verse makes the repeated refrain feel more evidenced than hypothetical."
    },
    emotional_resolution: {
      start: "TENDER_WITNESS_OF_SHARED_HISTORY",
      movement: "THE_REFRAIN_RESTATES_THE_VISIBLE_MODEL_OF_LOVE",
      end: "RENEWED_PERSONAL_ASPIRATION",
      closure: "REINFORCED_BUT_STILL_ASPIRATIONAL"
    },
    candidate_use_families: [
      "DEVOTION",
      "ANNIVERSARY",
      "LONG_TERM_ROMANCE",
      "WEDDING_ADJACENT",
      "MUTUAL_CARE"
    ],
    contraindications: {
      hard: ["APOLOGY", "GRIEF", "GENERAL_NONROMANTIC_CARE"],
      cautions: [
        "Repeated desire may imply the speaker lacks this love in the present relationship.",
        "The idealized imagery can feel comparative or pressuring.",
        "It is evidence of admiration, not an explicit promise or repair statement."
      ]
    }
  },
  {
    profile_id: "allt-105529524-s05-meaning-performance-v001",
    section_id: "KK-ALLT-105529524-S05",
    label: "BRIDGE",
    source_line_range: [23, 27],
    tpr_start_seconds: 128.998005,
    cdr_end_seconds: 144.683991,
    meaning: {
      speaker_pov: "FIRST_PERSON_OR_GENERALIZED_REFLECTIVE_VOICE",
      addressee: "GENERALIZED_YOU",
      core_proposition:
        "Promises require presence; looking forward requires releasing fixation on what was missed and choosing to live now.",
      functions: [
        "PRESENCE_OVER_ABSTRACTION",
        "FORWARD_FOCUS",
        "AGENCY",
        "IMPERATIVE_TO_LIVE"
      ],
      nonclaims: [
        "NOT_AN_APOLOGY",
        "NOT_A_ROMANTIC_DECLARATION",
        "NOT_A_GRIEF_ACKNOWLEDGMENT",
        "NOT_A_PROMISE_TO_THE_RECIPIENT"
      ]
    },
    performance: {
      presentation: "MALE_LEAD_DECLARATIVE_BRIDGE",
      delivery: "COMPACT_POINTED_PHRASING_WITH_THE_STRONGEST_MEDIAN_ENERGY",
      intensity: "STRONG",
      rms_db_median: -13.116,
      rms_db_p90: -10.969,
      f0_median_hz: 130.813,
      f0_p10_hz: 65.406,
      f0_p90_hz: 168.666,
      voiced_fraction: 0.494,
      onsets_per_second: 4.654,
      interpretation:
        "This section has the highest median and peak-near energy plus the fastest event density, supporting a focused exhortational turn."
    },
    emotional_resolution: {
      start: "ABSTRACT_REFLECTION_ON_PROMISE_AND_REGRET",
      movement: "THE_VOICE_TURNS_FROM_LOOKING_BACK_TO_ACTIVE_PRESENCE",
      end: "DIRECT_IMPERATIVE_TO_LIVE",
      closure: "ACTION_ORIENTED_RESOLUTION"
    },
    candidate_use_families: [
      "ENCOURAGEMENT",
      "MOVE_FORWARD",
      "PRESENCE",
      "LIFE_AFFIRMATION",
      "RELATIONSHIP_RECOMMITMENT_CONTEXT_ONLY"
    ],
    contraindications: {
      hard: ["ACUTE_GRIEF", "APOLOGY", "ROMANTIC_DECLARATION", "PHYSICAL_SPARK"],
      cautions: [
        "Can sound preachy, corrective, or impatient.",
        "References to what was missed can intensify regret.",
        "Unsafe for someone who needs validation before encouragement to move forward.",
        "The generalized you is not proof of relationship-specific care."
      ]
    }
  },
  {
    profile_id: "allt-105529524-s06-meaning-performance-v001",
    section_id: "KK-ALLT-105529524-S06",
    label: "CH3",
    source_line_range: [28, 33],
    tpr_start_seconds: 146.657007,
    cdr_end_seconds: 175.902993,
    meaning: {
      speaker_pov: "FIRST_PERSON_OBSERVER_TURNED_RESOLUTE_ASPIRANT",
      addressee: "UNSPECIFIED_LISTENER",
      core_proposition:
        "After the call to live presently, the speaker reaffirms everyday mutual devotion as the love model he wants to pursue.",
      functions: [
        "CLIMACTIC_DEVOTION_REFRAIN",
        "CHOSEN_RELATIONSHIP_IDEAL",
        "MUTUAL_AFFECTION",
        "ASPIRATIONAL_RECOMMITMENT"
      ],
      nonclaims: [
        "NOT_A_DIRECT_VOW",
        "NOT_AN_APOLOGY",
        "NOT_A_CLAIM_THAT_THE_GOAL_IS_ALREADY_ACHIEVED",
        "NOT_GENERAL_CARE"
      ]
    },
    performance: {
      presentation: "MALE_LEAD_FINAL_CHORUS",
      delivery: "MOST_SUSTAINED_VOCAL_PRESENCE_WITH_CLIMACTIC_REASSERTION",
      intensity: "STRONG_AND_SUSTAINED",
      rms_db_median: -14.678,
      rms_db_p90: -12.073,
      f0_median_hz: 123.471,
      f0_p10_hz: 65.406,
      f0_p90_hz: 197.133,
      voiced_fraction: 0.72,
      onsets_per_second: 3.659,
      interpretation:
        "The highest voiced fraction and elevated upper pitch range support the most sustained, climactic statement, even though median mix energy is below the Bridge."
    },
    emotional_resolution: {
      start: "ACTIVE_PRESENT_FOCUS_FROM_THE_BRIDGE",
      movement: "THE_FULL_REFRAIN_CONVERTS_REFLECTION_INTO_A_RELATIONSHIP_IDEAL",
      end: "STRONG_PERSONAL_ASPIRATION_TOWARD_ENDURING_LOVE",
      closure: "CLIMACTIC_ASPIRATION_NOT_FORMAL_COMMITMENT"
    },
    candidate_use_families: [
      "DEVOTION",
      "ANNIVERSARY",
      "WEDDING_ADJACENT",
      "LONG_TERM_ROMANCE",
      "RELATIONSHIP_RECOMMITMENT"
    ],
    contraindications: {
      hard: ["APOLOGY", "GRIEF", "GENERAL_NONROMANTIC_CARE"],
      cautions: [
        "I want is not the same as I choose you or I promise.",
        "The idealized he/her couple imagery may not fit the customer's relationship.",
        "For an established partner, aspiration can be heard as dissatisfaction unless the context is clearly admiring and inclusive."
      ]
    }
  },
  {
    profile_id: "allt-105529524-s07-meaning-performance-v001",
    section_id: "KK-ALLT-105529524-S07",
    label: "OUTRO",
    source_line_range: [34, 37],
    tpr_start_seconds: 178.469002,
    cdr_end_seconds: 192.28,
    meaning: {
      speaker_pov: "FIRST_PERSON_DIRECT_SELF_DISCLOSURE",
      addressee: "UNSPECIFIED_LISTENER",
      core_proposition:
        "The speaker repeatedly names a personal desire for enduring love of the kind just portrayed.",
      functions: [
        "REPEATED_YEARNING",
        "PERSONAL_ASPIRATION",
        "DESIRE_FOR_DURABILITY",
        "SUMMARY_REFRAIN"
      ],
      nonclaims: [
        "NOT_A_DECLARATION_THAT_THE_SPEAKER_ALREADY_HAS_THIS_LOVE",
        "NOT_A_VOW",
        "NOT_AN_APOLOGY",
        "NOT_A_RECIPIENT_SPECIFIC_STATEMENT"
      ]
    },
    performance: {
      presentation: "MALE_LEAD_REPEATED_OUTRO",
      delivery:
        "REPETITIVE_PERSONAL_YEARNING_WITH_FINAL_VOCAL_DECAY_INTO_INSTRUMENTAL_FADE",
      intensity: "MODERATE_WITH_EMOTIONAL_PERSISTENCE",
      rms_db_median: -14.766,
      rms_db_p90: -11.385,
      f0_median_hz: 145.987,
      f0_p10_hz: 65.406,
      f0_p90_hz: 177.359,
      voiced_fraction: 0.491,
      onsets_per_second: 3.91,
      interpretation:
        "Repeated phrasing and the locked final vocal decay make desire, not possession, the final emotional state."
    },
    emotional_resolution: {
      start: "CLIMACTIC_IDEALIZATION",
      movement: "THE_MESSAGE_NARROWS_TO_REPEATED_FIRST_PERSON_DESIRE",
      end: "SPECIFIC_YEARNING_FOR_LOVE_THAT_LASTS",
      closure: "EMOTIONALLY_CLEAR_BUT_NOT_SETTLED_AS_PRESENT_POSSESSION"
    },
    candidate_use_families: [
      "ROMANTIC_YEARNING",
      "FUTURE_LOVE",
      "DESIRE_FOR_LASTING_LOVE",
      "PERSONAL_REFLECTION"
    ],
    contraindications: {
      hard: [
        "APOLOGY",
        "GRIEF",
        "GENERAL_NONROMANTIC_CARE",
        "RELATIONSHIP_REASSURANCE_WITHOUT_CONTEXT"
      ],
      cautions: [
        "Can imply the speaker is single, unfulfilled, or dissatisfied with the current relationship.",
        "Risky for an anniversary or established partner when the customer needs confirmation of love already possessed.",
        "Repetition may feel too intense when the desired tone is gentle or low-pressure."
      ]
    }
  }
];

export const aLoveLikeThatKkProfileRegistry = {
  registry_id: A_LOVE_LIKE_THAT_KK_PROFILE_REGISTRY_ID,
  record_date: "2026-07-15",
  canonical_title: "A Love Like That",
  pix_handle: "ALLT-105529524",
  lt_pix_id: "LTPIX_0121",
  profile_count: aLoveLikeThatKkProfiles.length,
  status: "INTERNAL_EVIDENCE_COMPLETE_GD_MATCH_APPROVAL_PENDING",
  authority_law:
    "Profiles describe what each locked KK audibly means and how it performs. Customer-need fit remains a separate evidence decision.",
  scoring_allowed: false,
  ranking_allowed: false,
  public_release_allowed: false,
  profiles: aLoveLikeThatKkProfiles
};

export function applyALoveLikeThatKkProfiles(baseProfile) {
  return {
    ...baseProfile,
    kk_meaning_performance_profile_registry:
      A_LOVE_LIKE_THAT_KK_PROFILE_REGISTRY_ID,
    kk_profile_count: aLoveLikeThatKkProfiles.length,
    kk_meaning_profiles_status: "VERIFIED_7_OF_7_INTERNAL",
    kk_performance_profiles_status: "VERIFIED_7_OF_7_INTERNAL",
    kk_emotional_resolution_profiles_status: "VERIFIED_7_OF_7_INTERNAL",
    kk_contraindication_profiles_status: "COMPLETE_7_OF_7_INTERNAL"
  };
}
