import fs from "node:fs";

const sourcePath = "data/gpmc-sensory/income-fill/source-discovery/income-fill-sprint-01-source-pool.json";
const outputPath = "data/gpmc-sensory/income-fill/candidates/income-fill-sprint-01-internal-candidates.json";

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const themeProfiles = {
  birthday: {
    surface_feeling: "birthday joy",
    deeper_feelings: ["celebration", "being remembered", "warm attention", "personal lift"],
    emotional_level: "light_to_warm",
    relationship_lane: "friend_family_everyday",
    situation_lane: "birthday",
    sensory_profile: ["bright", "warm", "uplifting", "personal"],
    good_use_cases: ["birthday greeting", "simple celebration", "warm check-in", "friend or family birthday"],
    bad_use_cases: ["fresh grief birthday", "romantic repair", "high-conflict relationship"],
    risk_notes: ["Keep birthday language warm without assuming closeness or party mood."],
    buyer_words: ["A real birthday HUG.", "Something warmer than a text."],
    receiver_safe_words: ["Thought of you today.", "Wanted to send something warm for your birthday."],
    do_not_say: ["You have to be happy today.", "This fixes a hard year."]
  },
  encouragement_support: {
    surface_feeling: "encouragement",
    deeper_feelings: ["support", "resilience", "hope", "steady care"],
    emotional_level: "supportive_to_grounding",
    relationship_lane: "friend_family_support",
    situation_lane: "encouragement",
    sensory_profile: ["steady", "hopeful", "grounding", "warm"],
    good_use_cases: ["encouragement", "support during stress", "keep going message", "everyday resilience"],
    bad_use_cases: ["medical promise", "therapy substitute", "fresh crisis intervention"],
    risk_notes: ["Do not promise outcomes, healing, or emotional repair."],
    buyer_words: ["A small support HUG.", "Something to help them feel less alone."],
    receiver_safe_words: ["No pressure — just support.", "I wanted to send something steady."],
    do_not_say: ["Everything will be fine.", "This will heal you."]
  },
  friendship: {
    surface_feeling: "friendship",
    deeper_feelings: ["connection", "loyalty", "shared warmth", "being there"],
    emotional_level: "warm_to_playful",
    relationship_lane: "friend",
    situation_lane: "friendship",
    sensory_profile: ["warm", "familiar", "light", "real"],
    good_use_cases: ["friend appreciation", "thinking of you", "supportive friendship", "everyday connection"],
    bad_use_cases: ["romantic confession", "apology pressure", "grief-specific remembrance"],
    risk_notes: ["Keep friendship language non-romantic and non-possessive."],
    buyer_words: ["A real friendship HUG.", "For someone who has been there."],
    receiver_safe_words: ["This made me think of our friendship.", "Just wanted to send something real."],
    do_not_say: ["You are my only person.", "You owe me the same friendship."]
  }
};

function safeId(text) {
  return String(text || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const records = [];

for (const theme of ["birthday", "encouragement_support", "friendship"]) {
  const block = source.themes?.[theme];
  const pool = (block?.candidates || []).slice(0, 8);
  const profile = themeProfiles[theme];

  for (let index = 0; index < pool.length; index++) {
    const src = pool[index];
    const sourceId = `${safeId(src.source_file)}-${index + 1}`;

    records.push({
      record_id: `income-sprint-01-${theme}-${String(index + 1).padStart(2, "0")}`,
      sprint_id: "income_fill_sprint_01",
      source_id: sourceId,
      source_type: "repo_source_pool_discovery",
      source_file: src.source_file,
      source_title: src.source_file.split("/").pop(),
      candidate_type: "admin_internal_candidate",
      lane_id: theme,
      theme,
      source_keyword_hits: src.keyword_hits,
      source_snippets: src.snippets,
      audio_delivery_url: src.audio_hints?.[0] || null,
      ...profile,
      review_status: "needs_human_review",
      public_status: "not_public",
      public_route: null,
      stripe_url_if_payment_allowed: null,
      route_created: false,
      stripe_created: false,
      buyer_exposure: "none",
      xml_armed: true,
      generated_from: sourcePath
    });
  }
}

const output = {
  status: "income_fill_sprint_01_internal_candidates",
  name: "Income Fill Sprint 01 Internal Admin Candidates",
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  target_per_theme: 8,
  count: records.length,
  theme_counts: Object.fromEntries(
    ["birthday", "encouragement_support", "friendship"].map((theme) => [
      theme,
      records.filter((r) => r.theme === theme).length
    ])
  ),
  critical_warning:
    "These are internal admin candidates only. They do not publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  records
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("GENERATED INCOME FILL SPRINT 01 INTERNAL CANDIDATES");
console.log(`count: ${records.length}`);
for (const [theme, count] of Object.entries(output.theme_counts)) {
  console.log(`${theme}: ${count}`);
}
console.log(`WROTE ${outputPath}`);
