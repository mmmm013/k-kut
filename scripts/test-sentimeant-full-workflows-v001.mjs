import fs from "node:fs";
import {
  classifySituation,
  SENTIMEANT_THEMES,
} from "../lib/sentimeant/mcBotThemeEngine.mjs";
import {
  buildReviewCandidates,
  listReviewCandidateThemeIds,
  REVIEW_CANDIDATE_STATUS,
  validateReviewCandidate,
} from "../lib/sentimeant/mcBotReviewWorkflow.mjs";

const stop = (message) => {
  throw new Error(message);
};

const cases = [
  {
    name: "comfort",
    text: "She has had a terrible week and feels overwhelmed.",
    expectedTheme: "comfort",
  },
  {
    name: "celebrate",
    text: "My grandson graduated and I am so proud.",
    expectedTheme: "celebrate",
  },
  {
    name: "love",
    text: "I miss my wife and want her to feel close to my heart.",
    expectedTheme: "love",
  },
  {
    name: "encourage",
    text: "My friend is nervous about her first day at work.",
    expectedTheme: "encourage",
  },
  {
    name: "repair",
    text: "My wife is mad at me because I said something hurtful.",
    expectedTheme: "repair",
  },
  {
    name: "friendship",
    text: "I want to thank my best friend for always being there.",
    expectedTheme: "friendship",
  },
  {
    name: "remembrance",
    text: "My father passed away and I want to honor his memory.",
    expectedTheme: "remembrance",
  },
];

const knownThemeIds = SENTIMEANT_THEMES.map((theme) => theme.id).sort();
const candidateThemeIds = listReviewCandidateThemeIds().sort();
if (JSON.stringify(knownThemeIds) !== JSON.stringify(candidateThemeIds)) {
  stop(`candidate coverage mismatch: ${candidateThemeIds.join(", ")}`);
}

for (const test of cases) {
  const result = classifySituation({ text: test.text });
  if (result.top.id !== test.expectedTheme) {
    stop(`${test.name}: expected ${test.expectedTheme}; received ${result.top.id}`);
  }
  if (result.top.recommendations.length !== 3) {
    stop(`${test.name}: expected exactly three directions`);
  }

  for (const direction of result.top.recommendations) {
    const firstSet = buildReviewCandidates({
      themeId: result.top.id,
      directionTitle: direction.title,
      relationshipLabel: result.relationshipLabel,
      revision: 0,
    });
    const secondSet = buildReviewCandidates({
      themeId: result.top.id,
      directionTitle: direction.title,
      relationshipLabel: result.relationshipLabel,
      revision: 1,
    });

    if (firstSet.length !== 3 || secondSet.length !== 3) {
      stop(`${test.name}/${direction.title}: exactly three test candidates required`);
    }
    if (firstSet[0].id === secondSet[0].id || firstSet[0].title === secondSet[0].title) {
      stop(`${test.name}/${direction.title}: alternate-candidate control did not change the set order`);
    }

    for (const candidate of [...firstSet, ...secondSet]) {
      if (!validateReviewCandidate(candidate)) {
        stop(`${test.name}/${direction.title}: invalid test candidate ${candidate.id}`);
      }
      if (candidate.status !== REVIEW_CANDIDATE_STATUS) {
        stop(`${candidate.id}: wrong review status`);
      }
      if (
        candidate.isInventory !== false ||
        candidate.kkOrKomboId !== null ||
        candidate.audioUrl !== null ||
        candidate.price !== null
      ) {
        stop(`${candidate.id}: test candidate crossed the inventory boundary`);
      }
    }
  }
}

const landing = fs.readFileSync("app/_sentimeant-home.tsx", "utf8");
for (const feeling of [
  "thank-you",
  "sorry",
  "miss-you",
  "proud-of-you",
  "still-care",
]) {
  if (!landing.includes(`id: "${feeling}"`)) {
    stop(`landing feeling missing: ${feeling}`);
  }
}

const mismatch = classifySituation({
  text: "My wife is mad at me.",
  startingFeelingId: "thank-you",
});
if (mismatch.top.id !== "repair" || !mismatch.startingFeelingMismatch) {
  stop("starting-feeling mismatch workflow failed");
}

const ambiguous = classifySituation({ text: "I need help saying this." });
if (!ambiguous.needsClarification || ambiguous.safetyHold) {
  stop("clarification workflow failed");
}

const safety = classifySituation({ text: "I want to kill myself." });
if (!safety.safetyHold) {
  stop("human-safety hold workflow failed");
}

const explicitRelationship = classifySituation({
  text: "They are nervous about tomorrow.",
  relationship: "coworker",
});
if (explicitRelationship.relationship !== "coworker") {
  stop("explicit relationship selection workflow failed");
}

const parent = fs.readFileSync("components/SentimeantMcBotIntentReview.tsx", "utf8");
const candidates = fs.readFileSync("components/SentimeantMgsCandidateReview.tsx", "utf8");

for (const required of [
  "Find the right feeling",
  "One quick question",
  "User-side direction confirmed",
  "SentimeantMgsCandidateReview",
  "Clear this message",
  "Refine the sentence",
  "Start over",
]) {
  if (!parent.includes(required)) {
    stop(`parent interaction missing: ${required}`);
  }
}

for (const required of [
  "Continue to MGS comparison",
  "Confirm this test match",
  "Show three different candidates",
  "None of these fit",
  "Change the direction",
  "Refine the sentence",
  "Change the test candidate",
  "Complete review workflow passed",
  "Do not force a match.",
]) {
  if (!candidates.includes(required)) {
    stop(`candidate interaction missing: ${required}`);
  }
}

for (const forbidden of [
  /buy\.stripe\.com/u,
  /<audio\b/iu,
  /new\s+Audio\s*\(/u,
  /\/api\/checkout/u,
  /localStorage/u,
  /sessionStorage/u,
]) {
  if (forbidden.test(parent) || forbidden.test(candidates)) {
    stop(`forbidden workflow behavior found: ${forbidden}`);
  }
}

console.log("SENTIMEANT FULL WORKFLOW TESTS: PASS");
console.log("LANDING FEELINGS: 5 / 5");
console.log("CLASSIFICATION THEMES: 7 / 7");
console.log("DIRECTIONS PER THEME: 3");
console.log("TEST CANDIDATES PER DIRECTION: 3");
console.log("ALTERNATE CANDIDATE CYCLING: PASS");
console.log("CLARIFICATION BRANCH: PASS");
console.log("SAFETY HOLD BRANCH: PASS");
console.log("STARTING-FEELING MISMATCH: PASS");
console.log("NO-FIT / REFINE / CHANGE / CONFIRM CONTROLS: PRESENT");
console.log("REAL KK / KOMBO / AUDIO / PRICE / CHECKOUT: BLOCKED");
