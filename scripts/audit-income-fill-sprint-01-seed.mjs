import fs from "node:fs";

const p = "data/gpmc-sensory/income-fill/income-fill-sprint-01-seed.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("INCOME FILL SPRINT 01 SEED AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const themes = data.themes || [];

  if (data.status !== "income_fill_sprint_seed") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Seed must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (themes.length !== 3) fail(`Expected 3 sprint themes, found ${themes.length}.`);

  for (const requiredTheme of ["birthday", "encouragement_support", "friendship"]) {
    if (!themes.some((t) => t.theme === requiredTheme)) {
      fail(`Missing theme: ${requiredTheme}`);
    }
  }

  for (const theme of themes) {
    if (theme.target_internal_admin_candidates !== 8) {
      fail(`${theme.theme} target must be 8.`);
    }

    if (theme.deficit !== 8) {
      fail(`${theme.theme} deficit must be 8 for sprint 01.`);
    }
  }

  for (const phrase of [
    "all_KKs",
    "DUPs allowed",
    "Best reviewed candidate wins",
    "Ties may remain internal",
    "Do not flatten feeling tags",
    "XML-armed",
    "remain internal and not_public",
    "Nothing becomes public in this step"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const field of [
    "record_id",
    "source_id",
    "candidate_type",
    "lane_id",
    "theme",
    "surface_feeling",
    "deeper_feelings",
    "emotional_level",
    "relationship_lane",
    "situation_lane",
    "sensory_profile",
    "good_use_cases",
    "bad_use_cases",
    "risk_notes",
    "buyer_words",
    "receiver_safe_words",
    "do_not_say",
    "review_status",
    "public_status",
    "audio_delivery_url",
    "stripe_url_if_payment_allowed"
  ]) {
    if (!data.required_candidate_fields.includes(field)) {
      fail(`Missing required candidate field: ${field}`);
    }
  }
}

if (failed) {
  console.error("INCOME FILL SPRINT 01 SEED AUDIT: FAIL");
  process.exit(1);
}

console.log("INCOME FILL SPRINT 01 SEED AUDIT: PASS");
