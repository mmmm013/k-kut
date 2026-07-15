// Shared authority profiles for the first 4PE / KKr / MIAL Match Evidence adversarial test.

export const MATCH_EVIDENCE_SCHEMA_PATH =
  "data/4pe/rules/match-evidence-record.schema.json";

export const CANONICAL_TWINKLE_PATH =
  "public/signature/sti/gpm-sti-twinkle-v001-stop-at-audio-end.mp3";

export const customerNeedProfiles = {
  sweet_love: {
    label: "Sweet Love",
    primary_goal: "Express warm, gentle romantic affection that is easy to receive.",
    relationship_context: "mutually romantic relationship",
    occasion: "everyday affection or light romantic moment",
    required_meanings: ["affection", "warmth", "emotional safety"],
    preferred_performance: ["gentle", "sincere", "not overwhelming"],
    must_avoid: ["rejection", "breakup", "grief", "blame", "sexual-only meaning"],
    ambiguity: "General warmth is insufficient unless romantic address is proven."
  },
  devotion: {
    label: "Deep Devotion",
    primary_goal: "Express lasting, loyal, serious romantic commitment.",
    relationship_context: "established committed romantic relationship",
    occasion: "commitment statement or deep-love moment",
    required_meanings: ["lasting commitment", "loyalty", "serious affection"],
    preferred_performance: ["sincere", "confident", "emotionally grounded"],
    must_avoid: ["ambivalence", "rejection", "casual-only attraction", "breakup"],
    ambiguity: "The word love alone does not prove devotion or permanence."
  },
  wedding: {
    label: "Wedding / Forever",
    primary_goal: "Support a ceremony, vow, first-dance, or forever-facing commitment.",
    relationship_context: "marrying couple or explicitly committed partners",
    occasion: "wedding, vow, ceremony, or first dance",
    required_meanings: ["mutual commitment", "ceremony safety", "future-facing union"],
    preferred_performance: ["beautiful", "grounded", "ceremony-compatible"],
    must_avoid: ["breakup", "infidelity", "regret", "grief", "sexual-only meaning", "coercion"],
    ambiguity: "A romantic title does not establish wedding or ceremony safety."
  },
  anniversary: {
    label: "Anniversary / Still Choosing You",
    primary_goal: "Affirm ongoing choice, shared history, and continuing commitment.",
    relationship_context: "established romantic partnership",
    occasion: "anniversary or relationship milestone",
    required_meanings: ["continuity", "ongoing choice", "shared commitment"],
    preferred_performance: ["warm", "reflective", "confident"],
    must_avoid: ["new-love-only framing", "breakup", "relationship denial", "apology-only meaning"],
    ambiguity: "Affection without continuity does not prove anniversary fit."
  },
  physical_spark: {
    label: "Physical Spark",
    primary_goal: "Express mutual adult desire, passion, or intimate romantic energy.",
    relationship_context: "consenting adult romantic relationship",
    occasion: "private adult romantic moment",
    required_meanings: ["mutual attraction", "adult intimacy", "romantic or physical energy"],
    preferred_performance: ["confident", "charged", "context-safe"],
    must_avoid: ["non-consent", "child or family context", "grief", "coercion", "threat"],
    ambiguity: "Energy or a suggestive title alone does not prove intimate meaning."
  },
  apology: {
    label: "Apology / Repair",
    primary_goal: "Express accountability, regret, and a sincere desire to repair.",
    relationship_context: "relationship requiring repair; exact type must be known",
    occasion: "post-conflict or apology moment",
    required_meanings: ["accountability", "regret", "repair intention"],
    preferred_performance: ["sincere", "calm", "non-manipulative"],
    must_avoid: ["blame", "denial", "manipulation", "romantic claim used instead of apology"],
    ambiguity: "Tenderness and sadness do not prove an apology."
  },
  grief: {
    label: "Grief / Remembrance",
    primary_goal: "Offer loss-safe comfort, remembrance, or compassionate presence.",
    relationship_context: "bereaved person, family, friend, or memorial context",
    occasion: "death, memorial, remembrance, or acute loss",
    required_meanings: ["compassion", "loss safety", "remembrance or supportive presence"],
    preferred_performance: ["gentle", "respectful", "emotionally safe"],
    must_avoid: ["celebration mismatch", "sexual meaning", "unsupported romance", "blame", "forced closure"],
    ambiguity: "I miss you may mean romance, breakup, distance, or death and requires exact context."
  },
  general_care: {
    label: "General Care / Support",
    primary_goal: "Express broadly receivable care, warmth, encouragement, or support.",
    relationship_context: "friend, family, colleague, community member, or context-safe partner",
    occasion: "everyday support or unspecified caring moment",
    required_meanings: ["care", "support", "emotional safety"],
    preferred_performance: ["warm", "sincere", "accessible"],
    must_avoid: ["exclusive romance", "sexual implication", "grief-only framing", "conflict-specific blame"],
    ambiguity: "General care cannot be inferred from mood alone."
  },
  holiday_use: {
    label: "Temporary Holiday Event Use",
    primary_goal: "Serve a current approved calendar-event need using fresh evidence and temporary assembly.",
    relationship_context: "must be specified for the live holiday event",
    occasion: "approved temporary calendar-event window only",
    required_meanings: ["current event fit", "relationship fit", "fresh approval"],
    preferred_performance: ["appropriate to the exact event and recipient"],
    must_avoid: ["permanent named-holiday inventory", "stale approval", "post-event residue", "mood-only match"],
    ambiguity: "Holiday is a temporary controlled event mechanism, not a permanent meaning category."
  }
};

export const candidateAudioProfiles = {
  "a-love-like-that": {
    display_title: "A Love Like That",
    legacy_ii_id: "ii-romance-reuse-d3dfd13c-7421-4671-8261-0c735cb51f38",
    legacy_kk_id: "d3dfd13c-7421-4671-8261-0c735cb51f38",
    legacy_source_path: "/Users/gregoryputnam/GPM STL MP3s/A LOVE LIKE THAT.mp3",
    legacy_delivery_audio_path: "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
    legacy_claimed_start_seconds: 0,
    legacy_claimed_end_seconds: 24,
    legacy_twinkle_path: "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3",
    mial_record_id: null,
    lt_pix_id: null,
    rendition_performance_id: null,
    controlled_source_path: null,
    source_sha256: null,
    object_type: null,
    exact_audible_words: null,
    lyric_authority_source: null,
    speaker_pov: null,
    addressee: null,
    action: null,
    object: null,
    claim_or_promise: null,
    emotional_resolution: null,
    performance_delivery: null,
    approved_start_seconds: null,
    approved_end_seconds: null,
    boundary_status: "UNREVIEWED",
    composition_rights_status: "UNRESOLVED",
    sound_recording_rights_status: "UNRESOLVED",
    source_authority_status: "UNRESOLVED"
  },
  "your-heart-poundin": {
    display_title: "Your Heart Poundin'",
    legacy_ii_id: "ii-romance-reuse-1f016b4a-f85d-4945-b881-2e0f571e6a49",
    legacy_kk_id: "1f016b4a-f85d-4945-b881-2e0f571e6a49",
    legacy_source_path: "/Users/gregoryputnam/Movies/G Putnam Music, LLC - Shine the Light (STL) - GPM Inventory 12 2025/YOUR HEART POUNDIN' .mp3",
    legacy_delivery_audio_path: "/ii-delivery/romance/your-heart-poundin-1f016b4a-f85d-4945-b881-2e0f571e6a49-bookend-twinkle.mp3",
    legacy_claimed_start_seconds: 0,
    legacy_claimed_end_seconds: 24,
    legacy_twinkle_path: "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3",
    mial_record_id: null,
    lt_pix_id: null,
    rendition_performance_id: null,
    controlled_source_path: null,
    source_sha256: null,
    object_type: null,
    exact_audible_words: null,
    lyric_authority_source: null,
    speaker_pov: null,
    addressee: null,
    action: null,
    object: null,
    claim_or_promise: null,
    emotional_resolution: null,
    performance_delivery: null,
    approved_start_seconds: null,
    approved_end_seconds: null,
    boundary_status: "UNREVIEWED",
    composition_rights_status: "UNRESOLVED",
    sound_recording_rights_status: "UNRESOLVED",
    source_authority_status: "UNRESOLVED"
  },
  "dont-call-it-love": {
    display_title: "Don't Call It Love",
    legacy_ii_id: "ii-romance-reuse-6e959ac6-9546-4bae-87b2-ed6584185682",
    legacy_kk_id: "6e959ac6-9546-4bae-87b2-ed6584185682",
    legacy_source_path: "/Users/gregoryputnam/Music/DON'T CALL IT LOVE -.mp3",
    legacy_delivery_audio_path: "/ii-delivery/romance/dont-call-it-love-6e959ac6-9546-4bae-87b2-ed6584185682-bookend-twinkle.mp3",
    legacy_claimed_start_seconds: 0,
    legacy_claimed_end_seconds: 23,
    legacy_twinkle_path: "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3",
    mial_record_id: null,
    lt_pix_id: null,
    rendition_performance_id: null,
    controlled_source_path: null,
    source_sha256: null,
    object_type: null,
    exact_audible_words: null,
    lyric_authority_source: null,
    speaker_pov: null,
    addressee: null,
    action: null,
    object: null,
    claim_or_promise: null,
    emotional_resolution: null,
    performance_delivery: null,
    approved_start_seconds: null,
    approved_end_seconds: null,
    boundary_status: "UNREVIEWED",
    composition_rights_status: "UNRESOLVED",
    sound_recording_rights_status: "UNRESOLVED",
    source_authority_status: "UNRESOLVED"
  }
};

export const evidenceCatalog = {
  missing_mial: "No current MIAL record, exact LT-PIX lineage, controlled source SHA-256, or rendition/performance identity is linked.",
  missing_expression: "No verified exact audible words, speaker, addressee, action, claim, resolution, or performance profile exists.",
  missing_rights: "ASCAP evidence where applicable, composition rights, sound-recording rights, and GPM Kreator relationships are unresolved.",
  missing_gd: "No GD approval exists for any candidate/need pair in this first adversarial matrix.",
  obsolete_twinkle: "Legacy delivery records use an obsolete Mother’s Day signature instead of the locked canonical GPMx Twinkle.",
  unproven_boundaries: "The legacy round-number excerpts have no accepted natural vocal-start or last-complete-vocal-end proof.",
  legacy_generated_approval: "The legacy generator claimed approval, audio proof pass, and payment permission without the required evidence chain.",
  overbroad_reuse: "The same excerpts were stretched across customer needs that require different literal, relational, emotional, and occasion meanings."
};

export const eligibilityGateProfiles = {
  quarantined_evidence_missing_v1: {
    mial_authority: "MISSING",
    controlled_source_identity: "MISSING",
    composition_rights: "MISSING",
    sound_recording_rights: "MISSING",
    exact_audible_expression: "MISSING",
    natural_vocal_start: "UNVERIFIED",
    natural_vocal_end: "UNVERIFIED",
    no_vocal_cut: "UNVERIFIED",
    meaning_fit: "MISSING",
    relationship_fit: "MISSING",
    contraindication_review: "MISSING",
    human_review: "MISSING",
    gd_approval: "MISSING",
    canonical_twinkle_package: "FAIL"
  }
};

export const fitWeightProfiles = {
  bic_match_weight_profile_v1: {
    exact_expression_fit: 0.20,
    literal_meaning_fit: 0.18,
    relationship_fit: 0.12,
    goal_and_action_fit: 0.12,
    emotional_resolution_fit: 0.12,
    occasion_fit: 0.08,
    performance_fit: 0.08,
    intensity_fit: 0.05,
    structural_fit: 0.05
  }
};

export const unresolvedQuestions = {
  exact_words: "What exact words are audible?",
  speaker_addressee: "Who is speaking, to whom, and about what relationship?",
  performance: "What does the performance communicate beyond the literal words?",
  boundaries: "Where are the natural vocal start and last complete audible vocal end-sound?",
  need_fit: "What proves or disproves this exact customer-need fit?",
  contraindications: "What contraindications appear after full lyric and performance review?"
};

export const requiredNextActionPlans = {
  quarantined_evidence_intake_v1: {
    status: "READ_ONLY_EVIDENCE_INTAKE_REQUIRED",
    ordered_actions: [
      "Resolve MIAL record, LT-PIX parent, controlled lossless source, SHA-256, and rendition/performance identity.",
      "Resolve ASCAP evidence where applicable, composition rights, sound-recording rights, and GPM Kreator relationships.",
      "Save lyric authority and exact audible words.",
      "Approve natural vocal start and last complete audible vocal end-sound from the controlled LT-PIX.",
      "Profile literal meaning, emotional meaning, speaker, addressee, action, claim, resolution, performance, intensity, and ambiguity.",
      "Evaluate evidence, contradictions, and contraindications for the exact customer need.",
      "Record KKr human review and request GD decision.",
      "Only after approval, render and prove the final II/package with the locked canonical GPMx Twinkle."
    ],
    do_not: [
      "Do not infer fit from title, filename, route, mood, or legacy approval.",
      "Do not score, rank, release, sell, rerender, or restore checkout.",
      "Do not use the obsolete Mother’s Day signature."
    ]
  }
};
