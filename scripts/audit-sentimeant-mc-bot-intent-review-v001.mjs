import fs from "node:fs";

const stop = (message) => {
  throw new Error(message);
};

const manifest = JSON.parse(
  fs.readFileSync(
    "data/sentimeant/mc-bot-intent-flow-v001.json",
    "utf8",
  ),
);
const themeFitLaw = JSON.parse(
  fs.readFileSync(
    "data/sentimeant/nkk-blk-theme-fit-law-v001.json",
    "utf8",
  ),
);
const component = fs.readFileSync(
  "components/SentimeantMcBotIntentReview.tsx",
  "utf8",
);
const landing = fs.readFileSync("app/_sentimeant-home.tsx", "utf8");
const reviewRoute = fs.readFileSync("app/sentimeant/page.tsx", "utf8");
const startRoute = fs.readFileSync(
  "app/sentimeant/start/page.tsx",
  "utf8",
);
const layout = fs.readFileSync("app/layout.tsx", "utf8");
const middleware = fs.readFileSync("middleware.ts", "utf8");

if (manifest.schema_version !== "SENTIMEANT_MC_BOT_INTENT_FLOW_V002") {
  stop("intent-flow schema version changed");
}
if (manifest.status !== "REVIEW_ONLY_NON_AUDIO") {
  stop("Sentimeant intent flow must remain review-only and non-audio");
}
if (themeFitLaw.schema_version !== "SENTIMEANT_NKK_BLK_THEME_FIT_LAW_V001") {
  stop("NKK / BLK theme-fit law missing or changed");
}
if (themeFitLaw.themes.length !== 7) {
  stop("exactly seven governed themes are required");
}
if (
  !themeFitLaw.source_units.includes("NKK") ||
  !themeFitLaw.source_units.includes("BLK")
) {
  stop("both NKK and BLK must enter theme-fit consideration");
}
if (themeFitLaw.minimum_independent_attention_signals !== 3) {
  stop("three independent attention signals are required");
}
if (themeFitLaw.multiple_theme_fits_allowed !== true) {
  stop("one NKK / BLK must be allowed to support multiple themes");
}
if (
  themeFitLaw.parent_to_child_theme_inheritance
    .automatic_inheritance_allowed !== false ||
  themeFitLaw.parent_to_child_theme_inheritance
    .all_child_KKs_and_KOMBOs_must_be_individually_assessed !== true
) {
  stop("parent theme fit must never auto-classify child KKs or KOMBOs");
}
if (themeFitLaw.no_theme_fit_isolation.label !== "NO THEME FIT — HOLD") {
  stop("unmatched KK / KOMBO isolation label missing");
}

for (const field of [
  "audio_enabled",
  "inventory_lookup_enabled",
  "ii_assignment_enabled",
  "checkout_enabled",
  "delivery_enabled",
  "persists_customer_data",
]) {
  if (manifest[field] !== false) {
    stop(`${field} must remain false`);
  }
}

const originalLandingLanguage = [
  "Sent-i-Meants",
  "Send what you meant.",
  "Send an",
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
  "1. Choose",
  "2. Shape",
  "3. Send",
  "4. Care",
];

for (const required of originalLandingLanguage) {
  if (!landing.includes(required)) {
    stop(`original Sent-i-Meants landing language missing: ${required}`);
  }
}

if (!landing.includes("/sentimeant/start?feeling=")) {
  stop("original feeling choices must lead to the separate MC-BOT route");
}
if (landing.includes("SentimeantMcBotIntentReview")) {
  stop("MC-BOT dialog must not replace or render inside the landing page");
}
if (!reviewRoute.includes("../_sentimeant-home")) {
  stop("explicit /sentimeant review route must render the original landing");
}
if (/redirect\s*\(\s*["']\/hugz/iu.test(reviewRoute)) {
  stop("Sentimeant must never redirect to HUGz");
}
if (!startRoute.includes("SentimeantMcBotIntentReview")) {
  stop("MC-BOT dialog must render only after the landing-page feeling choice");
}
if (!startRoute.includes("You started with:")) {
  stop("selected landing-page feeling context is missing from MC-BOT route");
}

if (!middleware.includes('"/sentimeant/:path*"')) {
  stop("middleware must inspect Sentimeant routes without blocking them");
}
if (!middleware.includes("SENTIMEANT_EVIDENCE_AUDIO_PREFIX")) {
  stop("non-public Sentimeant evidence-audio block must remain active");
}
if (middleware.includes("SENTIMEANT_STORY_PREFIX")) {
  stop("obsolete all-Sentimeant redirect remains in middleware");
}
if (/pathname\.startsWith\(SENTIMEANT_STORY_PREFIX\)/u.test(middleware)) {
  stop("Sentimeant landing and start routes are still redirected away");
}
if (!middleware.includes("return NextResponse.next();")) {
  stop("middleware must allow safe Sentimeant page routes to continue");
}

for (const required of [
  "MC-BOT reflects before matching",
  "Ready for later two-sided MGS comparison",
  "Future three-candidate format — no music loaded",
  "NKK / BLK theme-fit law",
  "NO THEME FIT — HOLD",
  "Nothing entered here is saved or sent.",
]) {
  if (!component.includes(required)) {
    stop(`required MC-BOT review language missing: ${required}`);
  }
}

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
    forbidden.test(component) ||
    forbidden.test(landing) ||
    forbidden.test(startRoute)
  ) {
    stop(`forbidden public action found: ${forbidden}`);
  }
}

if (!layout.includes("GPMx")) {
  stop("upper-left GPMx identity is missing");
}
if (!layout.includes("SENTIMEANT_HOSTS")) {
  stop("Sentimeant host-specific identity navigation is missing");
}

console.log("SENTIMEANT ORIGINAL LANDING + MC-BOT DIALOG AUDIT: PASS");
console.log("ORIGINAL SENT-I-MEANTS FRONT DOOR: PRESERVED");
console.log("ORIGINAL FIVE FEELINGS: PRESERVED");
console.log("THE MIRROR: PRESERVED");
console.log("CHOOSE / SHAPE / SEND / CARE: PRESERVED");
console.log("GPMx UPPER-LEFT IDENTITY: PASS");
console.log("LANDING TO /SENTIMEANT/START ROUTE: ALLOWED");
console.log("OBSOLETE ALL-SENTIMEANT REDIRECT: REMOVED");
console.log("NON-PUBLIC EVIDENCE AUDIO BLOCK: PRESERVED");
console.log("MC-BOT ON LANDING PAGE: BLOCKED");
console.log("MC-BOT AFTER FEELING CHOICE: PASS");
console.log("NKK / BLK ALL-THEME CONSIDERATION: ON");
console.log("PARENT-TO-CHILD AUTO-INHERITANCE: BLOCKED");
console.log("NO THEME FIT — HOLD: ENFORCED");
console.log("AUDIO / INVENTORY / II ASSIGNMENT: OFF");
console.log("CHECKOUT / DELIVERY / PERSISTENCE: OFF");
