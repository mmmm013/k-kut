import fs from "node:fs";

const catalogPath = "data/gpmc-sensory/batch-scale/pix-kk-batch-source-catalog.json";
const outputPath = "data/gpmc-sensory/batch-scale/candidates/pix-kk-batch-01-internal-candidates.json";

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const sources = (catalog.records || []).slice(0, 100);

function themeProfile(theme) {
  const base = {
    surface_feeling: theme.replaceAll("_", " "),
    deeper_feelings: ["needs_human_review"],
    emotional_level: "unconfirmed_batch",
    relationship_lane: "unconfirmed",
    situation_lane: theme,
    sensory_profile: ["unconfirmed"],
    good_use_cases: ["internal discovery", "admin review"],
    bad_use_cases: ["public use before review", "buyer-facing promotion before approval"],
    risk_notes: ["Batch-generated candidate. Human review required before approval."],
    buyer_words: ["human review required"],
    receiver_safe_words: ["human review required"],
    do_not_say: ["approved", "ready for sale", "public"]
  };

  const profiles = {
    family_parent: {
      deeper_feelings: ["care", "family", "recognition", "support"],
      emotional_level: "warm_to_grounding",
      relationship_lane: "family_parent"
    },
    encouragement_support: {
      deeper_feelings: ["support", "hope", "resilience", "steady care"],
      emotional_level: "supportive_to_grounding",
      relationship_lane: "friend_family_support"
    },
    romance_love: {
      deeper_feelings: ["love", "warmth", "connection", "devotion"],
      emotional_level: "warm_to_romantic",
      relationship_lane: "romance"
    },
    gratitude_thank_you: {
      deeper_feelings: ["gratitude", "recognition", "appreciation", "thanks"],
      emotional_level: "warm_to_grateful",
      relationship_lane: "gratitude"
    },
    birthday: {
      deeper_feelings: ["celebration", "being remembered", "warm attention"],
      emotional_level: "light_to_warm",
      relationship_lane: "friend_family_everyday"
    },
    apology_repair: {
      deeper_feelings: ["repair", "regret", "softening", "care"],
      emotional_level: "sensitive_repair",
      relationship_lane: "repair"
    },
    friendship: {
      deeper_feelings: ["connection", "loyalty", "shared warmth"],
      emotional_level: "warm_to_playful",
      relationship_lane: "friend"
    },
    anniversary: {
      deeper_feelings: ["memory", "love", "commitment"],
      emotional_level: "warm_to_romantic",
      relationship_lane: "anniversary"
    },
    mentor_recognition: {
      deeper_feelings: ["recognition", "guidance", "respect"],
      emotional_level: "warm_to_honoring",
      relationship_lane: "mentor"
    }
  };

  return { ...base, ...(profiles[theme] || {}) };
}

const records = sources.map((source, index) => {
  const theme = source.primary_theme;
  const profile = themeProfile(theme);

  return {
    record_id: `pix-kk-batch-01-${String(index + 1).padStart(3, "0")}`,
    batch_id: "pix_kk_batch_01",
    batch_source_id: source.batch_source_id,
    source_file: source.source_file,
    source_type: source.source_type,
    candidate_type: "batch_internal_candidate",
    lane_id: theme,
    theme,
    detected_themes: source.detected_themes,
    source_audio_hints: source.audio_hints || [],
    audio_delivery_url: null,
    audio_status: source.audio_hint_count > 0 ? "AUDIO_HINTS_EXIST_REVIEW_REQUIRED" : "NO_AUDIO_HINT_YET",
    ...profile,
    review_status: "needs_human_review",
    public_status: "not_public",
    public_route: null,
    stripe_url_if_payment_allowed: null,
    route_created: false,
    stripe_created: false,
    buyer_exposure: "none",
    xml_armed: true,
    generated_from: catalogPath
  };
});

const themeCounts = {};
for (const r of records) {
  themeCounts[r.theme] = (themeCounts[r.theme] || 0) + 1;
}

const output = {
  status: "pix_kk_batch_01_internal_candidates",
  name: "PIX/KK Batch 01 Internal Candidates",
  source_catalog: catalogPath,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  count: records.length,
  theme_counts: themeCounts,
  critical_warning:
    "These are batch-generated internal candidates only. They do not approve records, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_rule:
    "Human review is required before approve_internal. Public promotion remains a separate approved_public step.",
  records
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("PIX/KK BATCH 01 INTERNAL CANDIDATES");
console.log(`count: ${records.length}`);
for (const [theme, count] of Object.entries(themeCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`${theme}: ${count}`);
}
console.log(`WROTE ${outputPath}`);
