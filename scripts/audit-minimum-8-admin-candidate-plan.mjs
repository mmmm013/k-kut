import fs from "node:fs";

const p = "data/gpmc-sensory/plans/minimum-8-admin-candidate-plan.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("MINIMUM 8 ADMIN CANDIDATE PLAN AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const rows = data.plan || [];

  if (data.status !== "minimum_8_admin_candidate_plan") fail("Wrong status.");
  if (data.target_admin_minimum_per_theme !== 8) fail("Target admin minimum must be 8.");
  if (rows.length < 10) fail(`Expected at least 10 planned themes, found ${rows.length}.`);

  for (const phrase of [
    "does not publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "Use all KKs as source scope",
    "generated records remain internal",
    "DUPs are allowed",
    "Emotional levels must convene",
    "XML-armed",
    "Fill income lanes first"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const row of rows) {
    if (row.target_admin_minimum !== 8) {
      fail(`${row.theme} target_admin_minimum must be 8.`);
    }

    const expectedDeficit = Math.max(0, 8 - row.total_admin_candidate_count);
    if (row.admin_candidate_deficit !== expectedDeficit) {
      fail(`${row.theme} wrong deficit. expected ${expectedDeficit}, found ${row.admin_candidate_deficit}.`);
    }

    if (row.public_status_after_plan !== "not_public") {
      fail(`${row.theme} must remain not_public after plan.`);
    }

    if (row.public_route_after_plan !== null) {
      fail(`${row.theme} must not create public route.`);
    }

    if (row.stripe_url_after_plan !== null) {
      fail(`${row.theme} must not create Stripe URL.`);
    }

    for (const field of [
      "record_id",
      "source_id",
      "candidate_type",
      "lane_id",
      "surface_feeling",
      "deeper_feelings",
      "emotional_level",
      "sensory_profile",
      "good_use_cases",
      "bad_use_cases",
      "risk_notes",
      "review_status",
      "public_status",
      "audio_delivery_url",
      "do_not_say"
    ]) {
      if (!row.required_candidate_fields.includes(field)) {
        fail(`${row.theme} missing required candidate field: ${field}`);
      }
    }

    for (const forbidden of [
      "buy.stripe.com",
      "candidate_not_approved",
      "mk-products",
      "internal_proof"
    ]) {
      if (JSON.stringify(row).includes(forbidden)) {
        fail(`${row.theme} contains forbidden phrase: ${forbidden}`);
      }
    }
  }

  const emptyFill = rows.filter((row) => row.plan_status === "EMPTY_FILL_REQUIRED");
  const partialFill = rows.filter((row) => row.plan_status === "PARTIAL_FILL_REQUIRED");

  if (emptyFill.length < 3) fail("Expected multiple empty themes requiring fill.");
  if (partialFill.length < 3) fail("Expected multiple partial themes requiring fill.");
}

if (failed) {
  console.error("MINIMUM 8 ADMIN CANDIDATE PLAN AUDIT: FAIL");
  process.exit(1);
}

console.log("MINIMUM 8 ADMIN CANDIDATE PLAN AUDIT: PASS");
