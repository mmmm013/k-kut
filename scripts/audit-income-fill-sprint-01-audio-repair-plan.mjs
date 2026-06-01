import fs from "node:fs";

const p = "data/gpmc-sensory/income-fill/audio-repair/income-fill-sprint-01-audio-repair-plan.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("INCOME FILL SPRINT 01 AUDIO REPAIR PLAN AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const rows = data.repair || [];

  if (data.status !== "income_fill_sprint_01_audio_repair_plan") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Plan must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (rows.length !== 24) fail(`Expected 24 repair rows, found ${rows.length}.`);

  for (const phrase of [
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

  const replace = rows.filter((r) => r.repair_need === "replace_wrong_lane_audio").length;
  const discover = rows.filter((r) => r.repair_need === "discover_theme_matched_audio").length;

  if (replace !== 6) fail(`Expected 6 wrong-lane audio repairs, found ${replace}.`);
  if (discover !== 18) fail(`Expected 18 audio discoveries, found ${discover}.`);

  for (const row of rows) {
    if (row.public_status_after_repair_plan !== "not_public") {
      fail(`${row.record_id} must remain not_public.`);
    }
    if (row.public_route_after_repair_plan !== null) {
      fail(`${row.record_id} must not create public route.`);
    }
    if (row.stripe_url_after_repair_plan !== null) {
      fail(`${row.record_id} must not create Stripe URL.`);
    }
    if (row.buyer_exposure_after_repair_plan !== "none") {
      fail(`${row.record_id} buyer exposure must be none.`);
    }
  }
}

if (failed) {
  console.error("INCOME FILL SPRINT 01 AUDIO REPAIR PLAN AUDIT: FAIL");
  process.exit(1);
}

console.log("INCOME FILL SPRINT 01 AUDIO REPAIR PLAN AUDIT: PASS");
