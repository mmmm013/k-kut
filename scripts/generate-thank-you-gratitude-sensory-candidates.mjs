import fs from "node:fs";

const manifestPath = "public/mothers-day/thank-you/kks-expanded/manifest.json";
const outputPath = "data/gpmc-sensory/candidates/thank-you-gratitude-candidates.json";

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const all = Array.isArray(manifest.kks) ? manifest.kks : [];

const preferredIds = [
  "thank-you-sec-v1a",
  "thank-you-sec-v1b",
  "thank-you-sec-prech1",
  "thank-you-sec-ch1",
  "thank-you-sec-v2a",
  "thank-you-sec-v2b",
  "thank-you-sec-br",
  "thank-you-sec-ch2",
  "thank-you-sec-outro",
  "thank-you-cc-003",
  "thank-you-cc-012",
  "thank-you-cc-022"
];

const byId = new Map(all.map((x) => [x.id, x]));
const selected = preferredIds.map((id) => byId.get(id)).filter(Boolean);

function profileFor(item) {
  const id = item.id || "";
  const section = item.section || item.title || "Thank You moment";

  if (id.includes("outro") || id.includes("cc-022")) {
    return {
      surface_feeling: "final thank you",
      deeper_feelings: ["gratitude", "completion", "tender closure", "lasting appreciation"],
      interpretation_summary: "A closing gratitude moment that lets the thank-you land softly.",
      good_use_cases: ["thank you", "closing note", "gentle appreciation", "family gratitude"],
      bad_use_cases: ["urgent apology", "grief-specific message", "romantic pressure"],
      risk_notes: ["Keep as gratitude/closure, not grief or obligation."],
      buyer_words: ["I wanted to end with a real thank you.", "This felt like the right closing feeling."],
      receiver_safe_words: ["I wanted to send a small thank-you moment.", "No pressure — just gratitude."],
      do_not_say: ["You owe me a response.", "This should make up for everything."]
    };
  }

  if (id.includes("ch")) {
    return {
      surface_feeling: "big thank you",
      deeper_feelings: ["gratitude", "appreciation", "warm recognition", "emotional lift"],
      interpretation_summary: "A larger gratitude moment for appreciation that should feel open and warm.",
      good_use_cases: ["thank you", "appreciation", "support recognition", "family care"],
      bad_use_cases: ["fresh grief", "romantic confession", "pressure to forgive"],
      risk_notes: ["Use as appreciation, not emotional leverage."],
      buyer_words: ["This says thank you bigger than words.", "This carries the appreciation I mean."],
      receiver_safe_words: ["This made me think of what you have given.", "I wanted to send something warm."],
      do_not_say: ["This proves how much you did for me.", "You have to understand this now."]
    };
  }

  if (id.includes("br") || id.includes("prech")) {
    return {
      surface_feeling: "reflective gratitude",
      deeper_feelings: ["gratitude", "reflection", "care", "recognition"],
      interpretation_summary: "A reflective thank-you moment for care, guidance, or support.",
      good_use_cases: ["mentor gratitude", "parent gratitude", "support", "recognition"],
      bad_use_cases: ["celebration-only birthday", "romantic spark", "grief-specific remembrance"],
      risk_notes: ["Do not overstate what the receiver intended or felt."],
      buyer_words: ["This helped me say what I could not quite say.", "This feels like recognition."],
      receiver_safe_words: ["I wanted to recognize what you gave.", "This felt warm and true."],
      do_not_say: ["I know exactly what you feel.", "This captures everything perfectly."]
    };
  }

  return {
    surface_feeling: "thank you",
    deeper_feelings: ["gratitude", "care", "warmth", "appreciation"],
    interpretation_summary: `A focused gratitude slice from ${section}.`,
    good_use_cases: ["thank you", "everyday appreciation", "family care", "friend support"],
    bad_use_cases: ["grief-specific message", "romantic repair", "high-conflict apology"],
    risk_notes: ["Confirm not Mother’s-Day-only before public approval."],
    buyer_words: ["Thank you for being there.", "This felt like a small warm thank you."],
    receiver_safe_words: ["I thought you might like this.", "I wanted to send a real thank-you moment."],
    do_not_say: ["This will fix everything.", "You need to feel appreciated now."]
  };
}

function sensoryProfileFor(item) {
  const id = item.id || "";

  if (id.includes("ch")) {
    return {
      audio: ["warm", "lifted", "section-sized", "resolved"],
      body: ["open", "warm", "lifted"],
      visual: ["bright room", "warm light", "wide gesture"],
      touch: ["held", "warm", "open"],
      memory: ["support remembered", "recognition", "care received"]
    };
  }

  if (id.includes("outro") || id.includes("cc-022")) {
    return {
      audio: ["soft", "closing", "gentle", "resolved ending"],
      body: ["settled", "warm", "release"],
      visual: ["soft light", "final wave", "stillness"],
      touch: ["soft", "held", "light"],
      memory: ["ending thank you", "lasting appreciation", "goodbye without pressure"]
    };
  }

  return {
    audio: ["warm", "gentle", "human", "steady"],
    body: ["settled", "warm", "open"],
    visual: ["warm light", "close-up", "quiet room"],
    touch: ["soft", "held", "warm"],
    memory: ["care received", "support", "recognition"]
  };
}

const records = selected.map((item) => {
  const profile = profileFor(item);

  return {
    record_id: `candidate-gratitude-${item.id}`,
    lane_id: "thank_you_gratitude",
    source_manifest: manifestPath,
    source_kut_id: item.id,
    source_title: item.title,
    source_section: item.section,
    source_type: item.tier || "thank_you_fixture",
    start: item.start ?? null,
    end: item.end ?? null,
    audio_delivery_url: item.audio_url,
    price_tier: item.price_tier || null,
    surface_feeling: profile.surface_feeling,
    deeper_feelings: profile.deeper_feelings,
    interpretation_summary: profile.interpretation_summary,
    sensory_profile: sensoryProfileFor(item),
    emotional_coordinates: {
      valence: "positive_warm",
      arousal: item.id.includes("ch") ? "lifted" : "settled",
      control_or_agency: "held",
      social_direction: "toward",
      time_direction: "present"
    },
    good_use_cases: profile.good_use_cases,
    bad_use_cases: profile.bad_use_cases,
    risk_notes: profile.risk_notes,
    buyer_words: profile.buyer_words,
    receiver_safe_words: profile.receiver_safe_words,
    do_not_say: profile.do_not_say,
    review_status: "held_internal_candidate",
    public_status: "not_public",
    public_route: null,
    stripe_url_if_payment_allowed: null,
    human_review_notes:
      "Internal gratitude candidate generated from the proven Thank You fixture. Must be reviewed for non-Mother’s-Day gratitude use before public approval."
  };
});

const output = {
  status: "generated_internal_candidates",
  name: "Thank You Gratitude Sensory Candidates",
  lane_id: "thank_you_gratitude",
  source: manifestPath,
  public_status: "not_public",
  count: records.length,
  target_first_pass_count: 12,
  critical_warning:
    "These are internal sensory-emotional candidates only. They are not approved_public records and must not enter buyer flow until reviewed.",
  records
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log(`GENERATED THANK YOU GRATITUDE CANDIDATES: ${records.length}`);
console.log(`WROTE ${outputPath}`);
