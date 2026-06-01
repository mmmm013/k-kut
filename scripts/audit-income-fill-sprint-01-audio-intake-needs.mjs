import fs from "node:fs";

const p = "data/gpmc-sensory/income-fill/audio-intake/income-fill-sprint-01-audio-intake-needs.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("INCOME FILL SPRINT 01 AUDIO INTAKE NEEDS AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const rows = data.needs || [];

  if (data.status !== "income_fill_sprint_01_audio_intake_needs") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Needs file must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (rows.length !== 3) fail(`Expected 3 theme need rows, found ${rows.length}.`);

  const byTheme = Object.fromEntries(rows.map((r) => [r.theme, r]));

  if (byTheme.birthday?.audio_intake_deficit !== 8) fail("Birthday should need 8 audio candidates.");
  if (byTheme.encouragement_support?.audio_intake_deficit !== 7) fail("Encouragement/support should need 7 audio candidates.");
  if (byTheme.friendship?.audio_intake_deficit !== 8) fail("Friendship should need 8 audio candidates.");
  if (data.total_audio_intake_deficit !== 23) fail(`Expected total deficit 23, found ${data.total_audio_intake_deficit}.`);

  for (const phrase of [
    "does not approve candidates",
    "publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "theme-matched audio",
    "approve_internal",
    "Public promotion remains separate",
    "wrong-lane romance audio",
    "wrong-lane Mothers Day audio"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const row of rows) {
    if (row.public_status_after_intake_plan !== "not_public") {
      fail(`${row.theme} must remain not_public.`);
    }
    if (row.public_route_after_intake_plan !== null) {
      fail(`${row.theme} must not create public route.`);
    }
    if (row.stripe_url_after_intake_plan !== null) {
      fail(`${row.theme} must not create Stripe URL.`);
    }
    if (row.buyer_exposure_after_intake_plan !== "none") {
      fail(`${row.theme} buyer exposure must be none.`);
    }
  }
}

if (failed) {
  console.error("INCOME FILL SPRINT 01 AUDIO INTAKE NEEDS AUDIT: FAIL");
  process.exit(1);
}

console.log("INCOME FILL SPRINT 01 AUDIO INTAKE NEEDS AUDIT: PASS");
