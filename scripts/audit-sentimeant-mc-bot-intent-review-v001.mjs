import fs from "node:fs";
import {
  classifySituation,
  SENTIMEANT_THEMES,
} from "../lib/sentimeant/mcBotThemeEngine.mjs";
import {
  listReviewCandidateThemeIds,
  REVIEW_CANDIDATE_STATUS,
} from "../lib/sentimeant/mcBotReviewWorkflow.mjs";

const read = (path) => fs.readFileSync(path, "utf8");
const stop = (message) => {
  throw new Error(message);
};

const manifest = JSON.parse(read("data/sentimeant/mc-bot-intent-flow-v001.json"));
const themeFitLaw = JSON.parse(read("data/sentimeant/nkk-blk-theme-fit-law-v001.json"));
const parent = read("components/SentimeantMcBotIntentReview.tsx");
const candidateReview = read("components/SentimeantMgsCandidateReview.tsx");
const landing = read("app/_sentimeant-home.tsx");
const reviewRoute = read("app/sentimeant/page.tsx");
const startRoute = read("app/sentimeant/start/page.tsx");
const layout = read("app/layout.tsx");
const middleware = read("middleware.ts");

if (manifest.schema_version !== "SENTIMEANT_MC_BOT_INTENT_FLOW_V002") {
  stop("intent-flow schema version changed");
}
if (manifest.status !== "REVIEW_ONLY_NON_AUDIO") {
  stop("Sentimeant must remain review-only and non-audio");
}
if (themeFitLaw.schema_version !== "SENTIMEANT_NKK_BLK_THEME_FIT_LAW_V001") {
  stop("NKK / BLK theme-fit law missing or changed");
}
if (
  themeFitLaw.themes.length !== 7 ||
  SENTIMEANT_THEMES.length !== 7 ||
  listReviewCandidateThemeIds().length !== 7
) {
  stop("all seven governed themes require classifier and workflow coverage");
}
if (themeFitLaw.minimum_independent_attention_signals !== 3) {
  stop("three independent attention signals remain required");
}
if (
  themeFitLaw.parent_to_child_theme_inheritance.automatic_inheritance_allowed !== false ||
  themeFitLaw.parent_to_child_theme_inheritance.all_child_KKs_and_KOMBOs_must_be_individually_assessed !== true
) {
  stop("parent theme fit must never auto-classify child KKs or KOMBOs");
}
if (themeFitLaw.no_theme_fit_isolation.label !== "NO THEME FIT — HOLD") {
  stop("NO THEME FIT — HOLD law missing");
}

for (const field of [
  "audio_enabled",
  "inventory_lookup_enabled",
  "ii_assignment_enabled",
  "checkout_enabled",
  "delivery_enabled",
  "persists_customer_data",
]) {
  if (manifest[field] !== false) stop(`${field} must remain false`);
}

for (const required of [
  "Sent-i-Meants",
  "Send what you meant.",
  "A text says what you typed. An iMeant says what you meant.",
  "Start with the feeling.",
  "The Mirror",
  "What you want to say. What they may need to hear.",
  "Thank You iMeant",
  "Sorry iMeant",
  "Miss You iMeant",
  "Proud of You iMeant",
  "Still Care iMeant",
  "No rush. No blast. Just care.",
]) {
  if (!landing.includes(required)) stop(`original landing language missing: ${required}`);
}
if (!landing.includes("/sentimeant/start?feeling=")) {
  stop("landing feelings do not enter the MC-BOT route");
}
if (landing.includes("SentimeantMcBotIntentReview")) {
  stop("MC-BOT must not replace the landing page");
}
if (!reviewRoute.includes("../_sentimeant-home")) {
  stop("/sentimeant must render the original landing");
}
if (!startRoute.includes("SentimeantMcBotIntentReview")) {
  stop("/sentimeant/start must render MC-BOT");
}
for (const required of [
  "initialFeelingId={feelingId}",
  "initialFeelingLabel={feeling}",
  "You started with:",
]) {
  if (!startRoute.includes(required)) stop(`starting feeling connection missing: ${required}`);
}

if (!middleware.includes('"/sentimeant/:path*"')) {
  stop("middleware does not inspect Sentimeant routes");
}
if (!middleware.includes("SENTIMEANT_EVIDENCE_AUDIO_PREFIX")) {
  stop("evidence-audio hold missing");
}
if (middleware.includes("SENTIMEANT_STORY_PREFIX")) {
  stop("obsolete blanket Sentimeant redirect returned");
}
if (!middleware.includes("return NextResponse.next();")) {
  stop("safe Sentimeant routes are not allowed through");
}

for (const required of [
  "Find the right feeling",
  "Closest emotional direction",
  "One quick question",
  "User-side direction confirmed",
  "SentimeantMgsCandidateReview",
  "Clear this message",
  "Refine the sentence",
  "Start over",
]) {
  if (!parent.includes(required)) stop(`MC-BOT interaction missing: ${required}`);
}

for (const required of [
  "Continue to MGS comparison",
  "Confirm this test match",
  "Show three different candidates",
  "None of these fit",
  "Change the direction",
  "Change the test candidate",
  "Complete review workflow passed",
  "Do not force a match.",
  REVIEW_CANDIDATE_STATUS,
]) {
  if (!candidateReview.includes(required)) stop(`candidate workflow missing: ${required}`);
}

const screenshotCase = classifySituation({
  text: "my wife is mad at me.",
  startingFeelingId: "thank-you",
});
if (
  screenshotCase.top.id !== "repair" ||
  screenshotCase.relationship !== "partner" ||
  screenshotCase.needsClarification ||
  !screenshotCase.startingFeelingMismatch ||
  screenshotCase.top.recommendations.length !== 3
) {
  stop("GD screenshot repair workflow failed");
}

const ambiguousCase = classifySituation({ text: "I need help saying this." });
if (!ambiguousCase.needsClarification) stop("clarification branch failed");

const safetyCase = classifySituation({ text: "I want to kill myself." });
if (!safetyCase.safetyHold) stop("human-safety hold failed");

for (const forbidden of [
  /<audio\b/iu,
  /new\s+Audio\s*\(/u,
  /fetch\s*\(/u,
  /localStorage/u,
  /sessionStorage/u,
  /buy\.stripe\.com/u,
  /client_reference_id/u,
  /href\s*=\s*["']\/checkout/iu,
  /\/api\/checkout/u,
]) {
  if (
    forbidden.test(parent) ||
    forbidden.test(candidateReview) ||
    forbidden.test(landing) ||
    forbidden.test(startRoute)
  ) {
    stop(`forbidden public behavior found: ${forbidden}`);
  }
}

if (!layout.includes("GPMx") || !layout.includes("SENTIMEANT_HOSTS")) {
  stop("GPMx Sentimeant header separation missing");
}

console.log("SENTIMEANT COMPLETE REVIEW WORKFLOW AUDIT: PASS");
console.log("ORIGINAL FRONT DOOR: PRESERVED");
console.log("LANDING TO MC-BOT ROUTE: PASS");
console.log("CLASSIFY / CLARIFY / SAFETY HOLD: PASS");
console.log("DIRECTION SELECTION: PASS");
console.log("MGS COMPARISON CONTINUATION: PASS");
console.log("THREE EXPLAINED TEST CANDIDATES: PASS");
console.log("REFINE / NONE FIT / CHANGE / CONFIRM: PASS");
console.log("REAL KK / KOMBO / AUDIO / PRICE / CHECKOUT: BLOCKED");
