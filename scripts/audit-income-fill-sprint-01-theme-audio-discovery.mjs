import fs from "node:fs";

const p = "data/gpmc-sensory/income-fill/audio-discovery/income-fill-sprint-01-theme-audio-discovery.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("INCOME FILL SPRINT 01 THEME AUDIO DISCOVERY AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);

  if (data.status !== "income_fill_sprint_01_theme_audio_discovery") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Discovery must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");

  for (const theme of ["birthday", "encouragement_support", "friendship"]) {
    const block = data.themes?.[theme];
    if (!block) fail(`Missing theme block: ${theme}`);
    else {
      if (!Array.isArray(block.candidates)) fail(`${theme} candidates must be an array.`);
      for (const c of block.candidates) {
        if (c.public_status !== "not_public") fail(`${theme} audio candidate must remain not_public.`);
        if (c.route_created !== false) fail(`${theme} audio candidate must not create route.`);
        if (c.stripe_created !== false) fail(`${theme} audio candidate must not create Stripe.`);
        if (c.buyer_exposure !== "none") fail(`${theme} buyer exposure must be none.`);
        if (!c.public_audio_url || !c.public_audio_url.startsWith("/")) {
          fail(`${theme} candidate missing public_audio_url.`);
        }
      }
    }
  }

  for (const phrase of [
    "audio discovery only",
    "does not approve candidates",
    "publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "theme-matched audio",
    "approve_internal"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }
}

if (failed) {
  console.error("INCOME FILL SPRINT 01 THEME AUDIO DISCOVERY AUDIT: FAIL");
  process.exit(1);
}

console.log("INCOME FILL SPRINT 01 THEME AUDIO DISCOVERY AUDIT: PASS");
