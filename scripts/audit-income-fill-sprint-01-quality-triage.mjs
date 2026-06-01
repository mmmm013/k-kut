import fs from "node:fs";

const p = "data/gpmc-sensory/income-fill/quality/income-fill-sprint-01-quality-triage.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("INCOME FILL SPRINT 01 QUALITY TRIAGE AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const rows = data.triage || [];

  if (data.status !== "income_fill_sprint_01_quality_triage") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Triage must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (rows.length !== 24) fail(`Expected 24 triage rows, found ${rows.length}.`);

  for (const phrase of [
    "does not approve candidates",
    "missing audio",
    "wrong-lane audio",
    "theme-matched audio",
    "approve_internal",
    "Public promotion remains a separate step"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  const wrongLane = rows.filter((r) => r.audio_status === "WRONG_LANE_AUDIO_HINT").length;
  const missingAudio = rows.filter((r) => r.audio_status === "NO_AUDIO_HINT_YET").length;

  if (wrongLane < 1) fail("Expected at least one wrong-lane audio hint from Step 92 review.");
  if (missingAudio < 1) fail("Expected at least one missing-audio candidate from Step 92 review.");

  for (const row of rows) {
    if (row.public_status_after_triage !== "not_public") {
      fail(`${row.record_id} must remain not_public.`);
    }

    if (row.public_route_after_triage !== null) {
      fail(`${row.record_id} must not create public route.`);
    }

    if (row.stripe_url_after_triage !== null) {
      fail(`${row.record_id} must not create Stripe URL.`);
    }

    if (row.buyer_exposure_after_triage !== "none") {
      fail(`${row.record_id} buyer exposure must be none.`);
    }

    if (!Array.isArray(row.triage_notes) || row.triage_notes.length < 1) {
      fail(`${row.record_id} missing triage notes.`);
    }

    for (const forbidden of [
      "buy.stripe.com",
      "approved_public",
      "candidate_not_approved",
      "mk-products",
      "internal_proof"
    ]) {
      if (JSON.stringify(row).includes(forbidden)) {
        fail(`${row.record_id} contains forbidden phrase: ${forbidden}`);
      }
    }
  }
}

if (failed) {
  console.error("INCOME FILL SPRINT 01 QUALITY TRIAGE AUDIT: FAIL");
  process.exit(1);
}

console.log("INCOME FILL SPRINT 01 QUALITY TRIAGE AUDIT: PASS");
