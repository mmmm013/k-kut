import fs from "node:fs";

const p = "data/gpmc-sensory/batch-scale/review-queues/pix-kk-batch-01-possible-internal-review-assets.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PIX/KK BATCH 01 POSSIBLE INTERNAL REVIEW ASSETS AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const rows = data.queue || [];

  if (data.status !== "pix_kk_batch_01_possible_internal_review_assets") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Queue must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (rows.length !== 7) fail(`Expected 7 possible internal-review assets, found ${rows.length}.`);

  for (const phrase of [
    "does not approve assets",
    "publish records",
    "create routes",
    "create Stripe links",
    "expose assets in buyer flow",
    "Human listening review",
    "approve_internal",
    "approved_public"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const row of rows) {
    if (row.eligibility_status !== "POSSIBLE_INTERNAL_REVIEW") {
      fail(`${row.asset_id} must be POSSIBLE_INTERNAL_REVIEW.`);
    }
    if (row.review_status !== "needs_human_listening_review") {
      fail(`${row.asset_id} must need human listening review.`);
    }
    if (row.review_decision !== "pending_human_review") {
      fail(`${row.asset_id} decision must be pending.`);
    }
    if (row.public_status !== "not_public") {
      fail(`${row.asset_id} must remain not_public.`);
    }
    if (row.public_route !== null) {
      fail(`${row.asset_id} must not create public route.`);
    }
    if (row.stripe_url_if_payment_allowed !== null) {
      fail(`${row.asset_id} must not create Stripe URL.`);
    }
    if (row.buyer_exposure !== "none") {
      fail(`${row.asset_id} buyer exposure must be none.`);
    }
    if (!row.audio_url) {
      fail(`${row.asset_id} missing audio_url.`);
    }
  }
}

if (failed) {
  console.error("PIX/KK BATCH 01 POSSIBLE INTERNAL REVIEW ASSETS AUDIT: FAIL");
  process.exit(1);
}

console.log("PIX/KK BATCH 01 POSSIBLE INTERNAL REVIEW ASSETS AUDIT: PASS");
