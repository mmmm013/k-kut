import fs from "node:fs";

const p = "data/gpmc-sensory/batch-scale/eligibility/pix-kk-batch-01-clean-source-asset-eligibility.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PIX/KK BATCH 01 CLEAN SOURCE ASSET ELIGIBILITY AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const rows = data.rows || [];

  if (data.status !== "pix_kk_batch_01_clean_source_asset_eligibility") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Eligibility report must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (rows.length !== 38) fail(`Expected 38 asset rows, found ${rows.length}.`);

  for (const phrase of [
    "does not approve candidates",
    "publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "approve_internal",
    "approved_public",
    "LineFeels/CC paused for refinement",
    "owner review"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  const held = rows.filter((r) => r.recommended_action === "hold_not_approvable_now").length;
  if (held < 1) fail("Expected at least one held asset.");

  for (const row of rows) {
    if (row.public_status_after_eligibility !== "not_public") {
      fail(`${row.asset_id} must remain not_public.`);
    }
    if (row.public_route_after_eligibility !== null) {
      fail(`${row.asset_id} must not create public route.`);
    }
    if (row.stripe_url_after_eligibility !== null) {
      fail(`${row.asset_id} must not create Stripe URL.`);
    }
    if (row.buyer_exposure_after_eligibility !== "none") {
      fail(`${row.asset_id} buyer exposure must be none.`);
    }
    if (!row.asset_id || !row.eligibility_status || !row.recommended_action) {
      fail(`${row.asset_id || "unknown"} missing eligibility fields.`);
    }
  }
}

if (failed) {
  console.error("PIX/KK BATCH 01 CLEAN SOURCE ASSET ELIGIBILITY AUDIT: FAIL");
  process.exit(1);
}

console.log("PIX/KK BATCH 01 CLEAN SOURCE ASSET ELIGIBILITY AUDIT: PASS");
