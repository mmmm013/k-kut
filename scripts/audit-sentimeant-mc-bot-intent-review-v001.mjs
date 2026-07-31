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
const component = fs.readFileSync(
  "components/SentimeantMcBotIntentReview.tsx",
  "utf8",
);
const page = fs.readFileSync("app/_sentimeant-home.tsx", "utf8");

if (manifest.schema_version !== "SENTIMEANT_MC_BOT_INTENT_FLOW_V001") {
  stop("intent-flow schema version changed");
}
if (manifest.status !== "REVIEW_ONLY_NON_AUDIO") {
  stop("Sentimeant intent flow must remain review-only and non-audio");
}
if (manifest.steps.length !== 3) {
  stop("exactly three intent steps are required");
}
for (const step of manifest.steps) {
  if (step.options.length !== 3) {
    stop(`exactly three choices required for ${step.id}`);
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
  "MC-BOT",
  "Exactly three directions are shown at a time.",
  "MGS direction ready for review",
  "No audio · No II assignment · No checkout",
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
  stop("Sentimeant home must render the MC-BOT intent review");
}
if (page.includes("Semantic match hold")) {
  stop("old hold wall remains as the main Sentimeant experience");
}
if (!page.includes("updated LT-PIX and KK metadata")) {
  stop("updated two-sided metadata/MGS direction is missing");
}

console.log("SENTIMEANT MC-BOT INTENT REVIEW AUDIT: PASS");
console.log("STEPS: 3");
console.log("CHOICES PER STEP: 3");
console.log("AUDIO: OFF");
console.log("INVENTORY / II ASSIGNMENT: OFF");
console.log("CHECKOUT / DELIVERY: OFF");
console.log("PERSISTENCE: OFF");
