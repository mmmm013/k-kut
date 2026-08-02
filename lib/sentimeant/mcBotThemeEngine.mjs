export const RELATIONSHIP_CHOICES = [
  { id: "friend", label: "Friend" },
  { id: "partner", label: "Partner" },
  { id: "family", label: "Family" },
  { id: "coworker", label: "Coworker" },
  { id: "anyone", label: "Someone else" },
];

export const SENTIMEANT_THEMES = [
  {
    id: "comfort",
    label: "Comfort & Care",
    icon: "🫶",
    acknowledgment: "It sounds like they could use comfort and steady care.",
    prompt: "Here are three directions that say, “I’m here with you.”",
    mgsThemes: ["Comforting", "Reinforcing"],
    keywords: [
      ["bad day", 4], ["rough day", 4], ["hard day", 4],
      ["terrible week", 5], ["difficult week", 4], ["running on empty", 5],
      ["tired", 2], ["exhausted", 3], ["sick", 2], ["ill", 2],
      ["surgery", 3], ["treatment", 3], ["hospital", 3],
      ["recovering", 3], ["sad", 2], ["lonely", 3],
      ["stressed", 3], ["overwhelmed", 3], ["breakup", 7],
      ["broke up", 7], ["dumped", 8], ["comfort", 3],
      ["feel better", 4], ["not alone", 4],
    ],
    recommendations: [
      { title: "I’m Here", line: "Gentle reassurance without asking them to explain." },
      { title: "You Matter", line: "A warm reminder that they are seen and valued." },
      { title: "A Little Lift", line: "Soft encouragement for a difficult day." },
    ],
  },
  {
    id: "celebrate",
    label: "Celebrate & Be Proud",
    icon: "🎉",
    acknowledgment: "This sounds like a moment worth celebrating.",
    prompt: "Here are three directions that say, “I see what you did.”",
    mgsThemes: ["Winning", "Reinforcing"],
    keywords: [
      ["graduated", 4], ["graduation", 4], ["promotion", 4],
      ["promoted", 4], ["new job", 4], ["milestone", 3],
      ["won", 3], ["victory", 3], ["achievement", 3],
      ["achieved", 3], ["proud", 4], ["congratulations", 4],
      ["new baby", 4], ["engaged", 3], ["finished", 2],
      ["passed the test", 5], ["made it", 3], ["celebrate", 3],
    ],
    recommendations: [
      { title: "So Proud of You", line: "Direct pride for a brave step or meaningful result." },
      { title: "You Did It", line: "Bright recognition with happy energy." },
      { title: "Small Win, Big Heart", line: "For a victory that matters even when it looks small." },
    ],
  },
  {
    id: "love",
    label: "Love & Connection",
    icon: "❤️",
    acknowledgment: "This sounds like a connection you want them to feel.",
    prompt: "Here are three directions that bring two hearts closer.",
    mgsThemes: ["Loving", "Sharing"],
    keywords: [
      ["love you", 4], ["miss you", 4], ["miss them", 4], ["miss my", 4],
      ["long distance", 4], ["far away", 3], ["thinking of you", 4],
      ["thinking of them", 4], ["just because", 3],
      ["close to my heart", 5], ["connection", 3],
      ["still care", 4], ["reconnect", 3], ["feel close", 4],
    ],
    recommendations: [
      { title: "Miss You", line: "Closeness for people who cannot be in the same room." },
      { title: "Still Close", line: "A quiet reminder that distance did not erase the bond." },
      { title: "Just Because", line: "Care with no occasion and no explanation required." },
    ],
  },
  {
    id: "encourage",
    label: "Encouragement",
    icon: "🌟",
    acknowledgment: "It sounds like they need courage for what comes next.",
    prompt: "Here are three directions that say, “You can do this.”",
    mgsThemes: ["Urging", "Reinforcing"],
    keywords: [
      ["nervous", 3], ["scared", 3], ["afraid", 3],
      ["first day", 4], ["interview", 4], ["exam", 3],
      ["audition", 3], ["tryout", 3], ["new start", 4],
      ["challenge", 3], ["starting", 2], ["tomorrow", 2],
      ["encourage", 3], ["courage", 3], ["confidence", 3],
      ["keep going", 4], ["you got this", 4], ["believe in", 3],
    ],
    recommendations: [
      { title: "You’ve Got This", line: "Clear courage before a new or difficult moment." },
      { title: "One Step at a Time", line: "Calm support when the whole task feels too large." },
      { title: "I Believe in You", line: "Personal confidence from someone who knows them." },
    ],
  },
  {
    id: "repair",
    label: "Sorry & Repair",
    icon: "🩹",
    acknowledgment: "This sounds like a repair moment.",
    prompt: "Here are three directions that open the door without forcing it.",
    mgsThemes: ["Sharing", "Loving", "Comforting"],
    keywords: [
      ["mad at me", 6], ["angry at me", 6], ["upset with me", 6],
      ["mad with me", 6], ["won't talk to me", 6], ["not speaking to me", 6],
      ["i hurt her", 6], ["i hurt him", 6], ["hurt my wife", 6],
      ["hurt my husband", 6], ["said something hurtful", 6],
      ["said something wrong", 5], ["messed up", 5], ["my fault", 5],
      ["argument", 4], ["fight", 3], ["apology", 4], ["apologize", 4],
      ["apologise", 4], ["sorry", 4], ["made a mistake", 5],
      ["make it right", 5], ["repair", 4], ["forgive me", 5],
      ["regret", 4], ["broke trust", 5], ["lied", 4],
    ],
    recommendations: [
      { title: "I’m Sorry", line: "A direct apology that centers their feelings." },
      { title: "I Care About Us", line: "Repair language for a relationship that matters." },
      { title: "Can We Begin Again?", line: "A gentle invitation—not pressure—to reconnect." },
    ],
  },
  {
    id: "friendship",
    label: "Friendship & Appreciation",
    icon: "🤝",
    acknowledgment: "This sounds like someone who deserves to feel appreciated.",
    prompt: "Here are three directions that recognize what they mean to you.",
    mgsThemes: ["Sharing", "Reinforcing", "Loving"],
    keywords: [
      ["best friend", 2], ["friend", 1], ["bestie", 2],
      ["friendship", 2], ["thank you", 4], ["thanks", 3],
      ["grateful", 4], ["gratitude", 4], ["appreciate", 4],
      ["always there", 4], ["supportive", 3], ["made me laugh", 4],
      ["teammate", 1], ["coworker", 1],
    ],
    recommendations: [
      { title: "You Always Show Up", line: "Gratitude for the person who stays." },
      { title: "You Make Life Better", line: "Warm appreciation with a little joy." },
      { title: "A Friend Like You", line: "Simple recognition of a meaningful friendship." },
    ],
  },
  {
    id: "remembrance",
    label: "Memory & Remembrance",
    icon: "🕯️",
    acknowledgment: "This sounds like a tender memory or loss.",
    prompt: "Here are three gentle directions that honor without trying to fix grief.",
    mgsThemes: ["Remembering", "Comforting"],
    keywords: [
      ["passed away", 6], ["died", 5], ["loss", 4], ["lost my", 5],
      ["funeral", 5], ["memorial", 5], ["grief", 5], ["grieving", 5],
      ["anniversary of", 4], ["remember", 3], ["remembrance", 4],
      ["in memory", 5], ["miss her every day", 5], ["miss him every day", 5],
    ],
    recommendations: [
      { title: "Holding the Memory", line: "A quiet way to honor someone remembered." },
      { title: "You’re Not Alone in This", line: "Presence without explanations or easy answers." },
      { title: "Love Remains", line: "A gentle recognition that the relationship still matters." },
    ],
  },
];

const RELATIONSHIP_BONUS = {
  friend: { friendship: 3, comfort: 1, encourage: 1 },
  partner: { love: 2, repair: 1 },
  family: { love: 2, celebrate: 1, comfort: 1 },
  coworker: { friendship: 2, encourage: 2, celebrate: 1 },
  anyone: {},
};

const STARTING_FEELINGS = {
  "thank-you": { label: "Thank You iMeant", expectedThemeIds: ["friendship", "celebrate"], bonuses: { friendship: 2, celebrate: 1 } },
  sorry: { label: "Sorry iMeant", expectedThemeIds: ["repair"], bonuses: { repair: 4 } },
  "miss-you": { label: "Miss You iMeant", expectedThemeIds: ["love", "remembrance"], bonuses: { love: 3, remembrance: 1 } },
  "proud-of-you": { label: "Proud of You iMeant", expectedThemeIds: ["celebrate", "encourage"], bonuses: { celebrate: 4, encourage: 1 } },
  "still-care": { label: "Still Care iMeant", expectedThemeIds: ["love", "repair"], bonuses: { love: 3, repair: 1 } },
};

const RELATIONSHIP_TERMS = {
  partner: ["wife", "husband", "spouse", "partner", "boyfriend", "girlfriend", "fiancé", "fiance"],
  family: ["mom", "mother", "dad", "father", "son", "daughter", "sister", "brother", "grandson", "granddaughter", "grandma", "grandpa", "family"],
  coworker: ["coworker", "co-worker", "colleague", "boss", "employee", "teammate"],
  friend: ["best friend", "friend", "bestie", "buddy"],
};

const SAFETY_TERMS = [
  "kill myself", "suicide", "suicidal", "hurt myself", "self harm",
  "self-harm", "immediate danger", "going to hurt", "wants to die",
];

export function normalizeSentimeantText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function inferRelationship(text) {
  const input = normalizeSentimeantText(text);
  for (const relationship of ["partner", "family", "coworker", "friend"]) {
    if (RELATIONSHIP_TERMS[relationship].some((term) => input.includes(term))) {
      return relationship;
    }
  }
  return "anyone";
}

function matchedKeywords(input, keywords) {
  const sorted = [...keywords].sort((a, b) => b[0].length - a[0].length);
  const accepted = [];

  for (const [term, weight] of sorted) {
    if (!input.includes(term)) continue;
    if (accepted.some(([acceptedTerm]) => acceptedTerm.includes(term))) continue;
    accepted.push([term, weight]);
  }

  return accepted;
}

export function classifySituation({ text, relationship = "anyone", startingFeelingId = "" }) {
  const story = String(text ?? "").trim();
  const input = normalizeSentimeantText(story);
  const inferredRelationship = relationship === "anyone" ? inferRelationship(input) : relationship;
  const relationshipBonuses = RELATIONSHIP_BONUS[inferredRelationship] ?? {};
  const startingFeeling = STARTING_FEELINGS[startingFeelingId] ?? null;
  const feelingBonuses = startingFeeling?.bonuses ?? {};
  const safetyHold = SAFETY_TERMS.some((term) => input.includes(term));

  const rankings = SENTIMEANT_THEMES.map((theme) => {
    let score = Number(relationshipBonuses[theme.id] ?? 0) + Number(feelingBonuses[theme.id] ?? 0);
    const acceptedMatches = matchedKeywords(input, theme.keywords);

    for (const [, weight] of acceptedMatches) {
      score += weight;
    }

    return { ...theme, score, matches: acceptedMatches.map(([term]) => term) };
  }).sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

  const top = rankings[0];
  const second = rankings[1];
  const margin = top.score - second.score;
  const confidence = top.score >= 7 && margin >= 3
    ? "high"
    : top.score >= 4 && margin >= 2
      ? "medium"
      : "low";
  const needsClarification = !safetyHold && (top.score < 3 || margin < 2);
  const expectedThemeIds = startingFeeling?.expectedThemeIds ?? [];
  const startingFeelingMismatch = Boolean(
    startingFeeling &&
    top.score >= 3 &&
    !expectedThemeIds.includes(top.id)
  );
  const relationshipLabel = RELATIONSHIP_CHOICES.find((choice) => choice.id === inferredRelationship)?.label ?? "Someone else";

  return {
    story,
    relationship: inferredRelationship,
    relationshipLabel,
    startingFeelingId,
    startingFeelingLabel: startingFeeling?.label ?? "",
    expectedThemeIds,
    rankings,
    top,
    confidence,
    needsClarification,
    safetyHold,
    startingFeelingMismatch,
  };
}
