import fs from "node:fs";

const inputPath = "data/publication-bridge/public-option-records.generated.json";
const outputPath = "data/gpmc-sensory/sensory-emotional-records.generated.json";

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const publicRecords = Array.isArray(input.records) ? input.records : [];

const laneProfiles = {
  romance_love: {
    surface_feeling: "romance",
    deeper_feelings: ["warm love", "sweet connection", "chosen closeness"],
    sensory_profile: {
      audio: ["warm", "soft lift", "romantic", "resolved ending"],
      body: ["open", "warm", "settled"],
      visual: ["warm light", "close-up", "soft motion"],
      touch: ["held", "soft", "warm"],
      memory: ["first love", "shared feeling", "returning"]
    },
    emotional_coordinates: {
      valence: "positive_warm",
      arousal: "settled",
      control_or_agency: "steady",
      social_direction: "toward",
      time_direction: "present"
    },
    good_use_cases: ["romance", "sweet love", "warm connection"],
    bad_use_cases: ["fresh breakup", "grief", "unclear friendship"],
    risk_notes: ["Romantic context should be clear.", "Do not imply guaranteed response."],
    buyer_words: ["This made me think of us.", "I wanted to send something warm."],
    receiver_safe_words: ["I thought you might like this.", "No pressure — just a warm music moment."],
    do_not_say: ["This proves you love me.", "You have to feel this too."]
  },

  wedding: {
    surface_feeling: "wedding",
    deeper_feelings: ["commitment", "devotion", "ceremony", "shared future"],
    sensory_profile: {
      audio: ["warm", "steady", "ceremonial", "resolved ending"],
      body: ["settled", "open", "lifted"],
      visual: ["warm light", "shared room", "slow motion"],
      touch: ["held", "soft", "steady"],
      memory: ["first dance", "promise", "shared future"]
    },
    emotional_coordinates: {
      valence: "positive_warm",
      arousal: "lifted",
      control_or_agency: "steady",
      social_direction: "staying",
      time_direction: "future"
    },
    good_use_cases: ["wedding", "first dance", "ceremonial love"],
    bad_use_cases: ["breakup", "ambiguous apology", "grief"],
    risk_notes: ["Use only where commitment context is clear.", "Do not overpromise forever as a guaranteed outcome."],
    buyer_words: ["This feels like us.", "This could carry the moment."],
    receiver_safe_words: ["I wanted this music moment to be part of us.", "This felt warm and real."],
    do_not_say: ["This guarantees forever.", "This proves the marriage will be perfect."]
  },

  anniversary: {
    surface_feeling: "anniversary",
    deeper_feelings: ["devotion", "continuity", "still choosing", "soft gratitude"],
    sensory_profile: {
      audio: ["warm", "steady", "soft lift", "resolved ending"],
      body: ["settled", "open", "warm"],
      visual: ["warm light", "close-up", "stillness"],
      touch: ["held", "soft", "warm"],
      memory: ["still choosing", "shared history", "returning"]
    },
    emotional_coordinates: {
      valence: "positive_warm",
      arousal: "settled",
      control_or_agency: "steady",
      social_direction: "staying",
      time_direction: "past_present_future"
    },
    good_use_cases: ["anniversary", "longtime love", "still choosing you"],
    bad_use_cases: ["fresh breakup", "ambiguous apology", "grief", "pressure to reconcile"],
    risk_notes: ["Romantic context required.", "Do not imply the song fixes the relationship."],
    buyer_words: ["I still choose you.", "We are still here."],
    receiver_safe_words: ["This made me think of us.", "I wanted to send something warm."],
    do_not_say: ["This fixes everything.", "You have to feel the same.", "This proves forever."]
  },

  kupid_romance: {
    surface_feeling: "spark",
    deeper_feelings: ["attraction", "playful energy", "pulse", "romantic confidence"],
    sensory_profile: {
      audio: ["charged", "rhythmic", "energetic", "sparked"],
      body: ["pulse", "lifted", "electric"],
      visual: ["bright motion", "close-up", "night light"],
      touch: ["warm", "alive", "charged"],
      memory: ["first spark", "flirtation", "romantic excitement"]
    },
    emotional_coordinates: {
      valence: "positive_warm",
      arousal: "charged",
      control_or_agency: "empowering",
      social_direction: "toward",
      time_direction: "present"
    },
    good_use_cases: ["romantic spark", "playful connection", "confident attraction"],
    bad_use_cases: ["grief", "apology", "anniversary repair", "family support"],
    risk_notes: ["Use only for clearly playful or romantic contexts.", "Avoid where softness or grief safety is needed."],
    buyer_words: ["This has a spark.", "This feels playful and alive."],
    receiver_safe_words: ["This felt fun and bright.", "I thought you might like the energy."],
    do_not_say: ["This will make them want you.", "This guarantees attraction."]
  },

  repair_still_care: {
    surface_feeling: "apology",
    deeper_feelings: ["repair", "still care", "tenderness", "humility"],
    sensory_profile: {
      audio: ["soft", "tender", "low pressure", "careful"],
      body: ["ache", "settling", "warmth"],
      visual: ["dim light", "quiet room", "small gesture"],
      touch: ["soft", "fragile", "held"],
      memory: ["apology", "lost chance", "returning carefully"]
    },
    emotional_coordinates: {
      valence: "mixed",
      arousal: "quiet",
      control_or_agency: "held",
      social_direction: "returning",
      time_direction: "present"
    },
    good_use_cases: ["apology", "repair", "still care", "soft reconnection"],
    bad_use_cases: ["pressure to forgive", "grief", "celebration", "playful romance"],
    risk_notes: ["Keep non-coercive.", "Do not imply forgiveness is owed.", "Avoid if buyer wants pressure or persuasion."],
    buyer_words: ["I still care.", "I wanted to send this gently."],
    receiver_safe_words: ["No pressure.", "This is just a small music moment from me."],
    do_not_say: ["This will make them forgive you.", "You owe me another chance.", "This fixes everything."]
  }
};

function routeFallbackLane(record) {
  if (record.public_route === "/wedding") return "wedding";
  if (record.public_route === "/personal/anniversary") return "anniversary";
  if (record.public_route === "/personal/apology") return "repair_still_care";
  if (record.public_route === "/kupid") return "kupid_romance";
  return record.intent_lane || "romance_love";
}

const sensoryRecords = publicRecords.map((record) => {
  const lane = routeFallbackLane(record);
  const profile = laneProfiles[lane] || laneProfiles.romance_love;

  return {
    record_id: `sensory-${record.public_option_id}`,
    source_public_option_id: record.public_option_id,
    source_pix_id_or_track_id: record.source_pix_id_or_track_id,
    source_title: record.display_title,
    source_type: "II",
    public_option_id: record.public_option_id,
    public_route: record.public_route,
    audio_delivery_url: record.audio_delivery_url,
    stripe_url_if_payment_allowed: record.stripe_url_if_payment_allowed,
    surface_feeling: profile.surface_feeling,
    deeper_feelings: profile.deeper_feelings,
    interpretation_summary: record.interpretation_summary,
    action_object_meaning: record.action_object_meaning,
    sensory_profile: profile.sensory_profile,
    emotional_coordinates: profile.emotional_coordinates,
    good_use_cases: profile.good_use_cases,
    bad_use_cases: profile.bad_use_cases,
    risk_notes: profile.risk_notes,
    buyer_words: profile.buyer_words,
    receiver_safe_words: profile.receiver_safe_words,
    do_not_say: profile.do_not_say,
    review_status: "approved_public",
    human_review_notes:
      "Generated from an already approved public option record. Requires future human enrichment before deeper personalization use."
  };
});

const output = {
  status: "generated",
  name: "GPMC Sensory-Emotional Records From Approved Public Options",
  source: inputPath,
  generated_at: new Date().toISOString(),
  count: sensoryRecords.length,
  doctrine_law:
    "Slice as thinly as the emotional meaning remains complete. Do not slice thinner than human meaning.",
  records: sensoryRecords
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log(`GENERATED GPMC SENSORY RECORDS: ${sensoryRecords.length}`);
console.log(`WROTE ${outputPath}`);
