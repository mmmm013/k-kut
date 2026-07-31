export const REVIEW_CANDIDATE_STATUS = "TEST_CANDIDATE_NOT_INVENTORY";

const THEME_CANDIDATES = {
  comfort: [
    {
      title: "Quiet Presence",
      fitLevel: "Strong fit",
      summary: "Centers reassurance and steady presence without demanding an explanation.",
      evidence: ["comforting effect", "low-pressure delivery", "relationship-safe point of view"],
      concern: "May feel too quiet when the user wants active encouragement.",
    },
    {
      title: "Seen and Supported",
      fitLevel: "Supported fit",
      summary: "Affirms that the person matters and is not carrying the moment alone.",
      evidence: ["reinforcing effect", "warm acknowledgment", "supportive presentation"],
      concern: "Needs care not to sound like a generic motivational message.",
    },
    {
      title: "Gentle Lift",
      fitLevel: "Possible fit — review",
      summary: "Adds a small amount of hope while keeping comfort as the primary purpose.",
      evidence: ["soft encouragement", "comforting tone", "future-facing effect"],
      concern: "Could move too quickly toward fixing the problem.",
    },
  ],
  celebrate: [
    {
      title: "You Earned This",
      fitLevel: "Strong fit",
      summary: "Recognizes the achievement directly and keeps the recipient at the center.",
      evidence: ["winning theme", "clear recognition", "confident presentation"],
      concern: "May be too formal for a very small or playful victory.",
    },
    {
      title: "I Am Proud of You",
      fitLevel: "Supported fit",
      summary: "Combines celebration with personal pride and relationship evidence.",
      evidence: ["reinforcing theme", "relationship point of view", "positive human effect"],
      concern: "The relationship must support saying pride directly.",
    },
    {
      title: "Celebrate the Step",
      fitLevel: "Possible fit — review",
      summary: "Honors progress even when the larger goal is not finished.",
      evidence: ["progress recognition", "encouraging effect", "moderate energy"],
      concern: "Could understate a major accomplishment.",
    },
  ],
  love: [
    {
      title: "Still Close",
      fitLevel: "Strong fit",
      summary: "Expresses enduring connection without adding pressure or possession.",
      evidence: ["loving theme", "sharing effect", "relationship-compatible point of view"],
      concern: "Needs review when the relationship is currently estranged.",
    },
    {
      title: "Thinking of You",
      fitLevel: "Supported fit",
      summary: "Offers warmth and presence without requiring a response.",
      evidence: ["warm presentation", "low-pressure sharing", "present-time connection"],
      concern: "May be too light for a deeply emotional message.",
    },
    {
      title: "Come a Little Closer",
      fitLevel: "Possible fit — review",
      summary: "Invites reconnection while leaving the recipient room to choose.",
      evidence: ["loving direction", "reconnection use", "gentle invitation"],
      concern: "Could be inappropriate when boundaries require distance.",
    },
  ],
  encourage: [
    {
      title: "You Can Do This",
      fitLevel: "Strong fit",
      summary: "Gives direct courage for the next step with clear forward motion.",
      evidence: ["urging theme", "reinforcing effect", "confident presentation"],
      concern: "May feel too forceful when the recipient mainly needs empathy.",
    },
    {
      title: "One Step at a Time",
      fitLevel: "Supported fit",
      summary: "Reduces pressure while preserving movement toward the goal.",
      evidence: ["calm encouragement", "manageable action", "supportive effect"],
      concern: "May not provide enough energy for a celebratory moment.",
    },
    {
      title: "I Believe in You",
      fitLevel: "Possible fit — review",
      summary: "Uses the sender relationship as the source of confidence.",
      evidence: ["relationship support", "reinforcing meaning", "personal presentation"],
      concern: "Requires a relationship where this claim feels authentic.",
    },
  ],
  repair: [
    {
      title: "Own the Hurt",
      fitLevel: "Strong fit",
      summary: "Centers accountability and the other person’s experience before asking for anything.",
      evidence: ["sharing theme", "comforting effect", "partner-compatible point of view"],
      concern: "Must not include excuses or make forgiveness the recipient’s duty.",
    },
    {
      title: "Our Relationship Matters",
      fitLevel: "Supported fit",
      summary: "Adds care for the relationship after accountability is established.",
      evidence: ["loving theme", "repair use case", "relationship evidence"],
      concern: "Could center the sender if accountability is not clear enough.",
    },
    {
      title: "Leave the Door Open",
      fitLevel: "Possible fit — review",
      summary: "Invites future conversation without pressuring the recipient to respond now.",
      evidence: ["gentle invitation", "low-pressure presentation", "future-facing repair"],
      concern: "May be premature when the hurt is fresh or severe.",
    },
  ],
  friendship: [
    {
      title: "You Always Show Up",
      fitLevel: "Strong fit",
      summary: "Names the friend’s dependable presence and why it matters.",
      evidence: ["sharing theme", "reinforcing effect", "friend relationship evidence"],
      concern: "Needs a concrete relationship basis so it does not sound generic.",
    },
    {
      title: "You Make Life Better",
      fitLevel: "Supported fit",
      summary: "Expresses warm appreciation with room for joy and personality.",
      evidence: ["loving theme", "gratitude use", "warm presentation"],
      concern: "Could sound romantic without clear friendship context.",
    },
    {
      title: "Thank You for Being You",
      fitLevel: "Possible fit — review",
      summary: "Affirms identity rather than a single favor or event.",
      evidence: ["reinforcing theme", "appreciation effect", "identity affirmation"],
      concern: "May be too broad when the user wants to thank one specific act.",
    },
  ],
  remembrance: [
    {
      title: "Hold the Memory",
      fitLevel: "Strong fit",
      summary: "Honors the person or shared history without trying to resolve grief.",
      evidence: ["remembering theme", "comforting effect", "past-oriented meaning"],
      concern: "Must avoid details the recipient may not want revisited.",
    },
    {
      title: "Love Remains",
      fitLevel: "Supported fit",
      summary: "Recognizes that the relationship still matters after absence or loss.",
      evidence: ["remembering theme", "loving meaning", "gentle presentation"],
      concern: "Relationship language must fit the actual people involved.",
    },
    {
      title: "You Are Not Alone",
      fitLevel: "Possible fit — review",
      summary: "Offers companionship to someone carrying grief or remembrance.",
      evidence: ["comforting effect", "presence", "recipient-centered point of view"],
      concern: "Could shift away from remembrance toward general comfort.",
    },
  ],
};

function rotate(items, offset) {
  if (!items.length) return [];
  const normalized = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

export function buildReviewCandidates({ themeId, directionTitle, relationshipLabel, revision = 0 }) {
  const source = THEME_CANDIDATES[themeId] ?? [];
  return rotate(source, revision).map((candidate, index) => ({
    ...candidate,
    id: `${themeId}-review-${revision}-${index + 1}`,
    status: REVIEW_CANDIDATE_STATUS,
    themeId,
    directionTitle,
    relationshipLabel,
    rank: index + 1,
    isInventory: false,
    kkOrKomboId: null,
    audioUrl: null,
    price: null,
  }));
}

export function validateReviewCandidate(candidate) {
  return Boolean(
    candidate &&
      candidate.status === REVIEW_CANDIDATE_STATUS &&
      candidate.isInventory === false &&
      candidate.kkOrKomboId === null &&
      candidate.audioUrl === null &&
      candidate.price === null &&
      candidate.title &&
      candidate.fitLevel &&
      candidate.summary &&
      Array.isArray(candidate.evidence) &&
      candidate.evidence.length >= 3 &&
      candidate.concern
  );
}

export function listReviewCandidateThemeIds() {
  return Object.keys(THEME_CANDIDATES);
}
