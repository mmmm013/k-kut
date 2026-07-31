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
const page = fs.readFileSync("app/_sentimeant-home.tsx", "utf8");
const layout = fs.readFileSync("app/layout.tsx", "utf8");

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
  themeFitLaw.no_theme_fit_isolation.label !== "NO THEME FIT — HOLD"
) {
  stop("unmatched KK / KOMBO isolation label missing");
}
if (manifest.starting_directions.length !== 3) {
  stop("exactly three starting directions are required");
}
for (const direction of manifest.starting_directions) {
  if (direction.theme_choices.length !== 3) {
    stop(`exactly three theme directions required for ${direction.id}`);
  }
}
for (const choices of [
  manifest.tone_choices,
  manifest.relationship_choices,
  manifest.confirmation_choices,
]) {
  if (choices.length !== 3) {
    stop("every customer decision set must show exactly three choices");
  }
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

for (const required of [
  "MC-BOT reflects before matching",
  "Ready for later two-sided MGS comparison",
  "Future three-candidate format — no music loaded",
  "NKK / BLK theme-fit law",
  "NO THEME FIT — HOLD",
  "Nothing entered here is saved or sent.",
]) {
  if (!component.includes(required)) {
    stop(`required review language missing: ${required}`);
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
  if (forbidden.test(component) || forbidden.test(page)) {
    stop(`forbidden public action found: ${forbidden}`);
  }
}

if (!page.includes("SentimeantMcBotIntentReview")) {
  stop("Sentimeant home must render the MC-BOT dialog review");
}
if (page.includes("Semantic match hold")) {
  stop("old hold wall remains as the main Sentimeant experience");
}
if (!page.includes("every NKK or BLK can be assessed")) {
  stop("all-source theme consideration is missing");
}
if (!layout.includes("GPMx")) {
  stop("upper-left GPMx identity is missing");
}

console.log("SENTIMEANT MC-BOT DIALOG AND THEME-FIT REVIEW AUDIT: PASS");
console.log("GPMx HEADER: PASS");
console.log("GOVERNED THEMES: 7");
console.log("NKK / BLK ALL-THEME CONSIDERATION: ON");
console.log("MULTIPLE THEME FITS: ALLOWED");
console.log("NO THEME FIT — HOLD: ENFORCED");
console.log("THREE-CHOICE DIALOG: ENFORCED");
console.log("AUDIO / INVENTORY / II ASSIGNMENT: OFF");
console.log("CHECKOUT / DELIVERY / PERSISTENCE: OFF");
