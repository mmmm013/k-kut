import fs from "node:fs";

const p = "data/gpmc-sensory/batch-scale/review-queues/pix-kk-batch-01-clean-source-review-queue.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PIX/KK BATCH 01 CLEAN SOURCE REVIEW QUEUE AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const rows = data.queue || [];

  if (data.status !== "pix_kk_batch_01_clean_source_review_queue") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Queue must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (rows.length !== 1) fail(`Expected 1 clean-source row from Step 116, found ${rows.length}.`);

  for (const phrase of [
    "does not approve candidates",
    "publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "Human listening review",
    "actual KK/PIX source",
    "approve_internal",
    "approved_public"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const row of rows) {
    if (row.provenance_status !== "POSSIBLE_AUDIO_SOURCE_REVIEW_REQUIRED") {
      fail(`${row.record_id} must be possible audio source review required.`);
    }
    if (row.review_status !== "needs_human_review") {
      fail(`${row.record_id} must need human review.`);
    }
    if (row.public_status !== "not_public") {
      fail(`${row.record_id} must remain not_public.`);
    }
    if (row.public_route !== null) {
      fail(`${row.record_id} must not create public route.`);
    }
    if (row.stripe_url_if_payment_allowed !== null) {
      fail(`${row.record_id} must not create Stripe URL.`);
    }
    if (row.buyer_exposure !== "none") {
      fail(`${row.record_id} buyer exposure must be none.`);
    }
  }
}

if (failed) {
  console.error("PIX/KK BATCH 01 CLEAN SOURCE REVIEW QUEUE AUDIT: FAIL");
  process.exit(1);
}

console.log("PIX/KK BATCH 01 CLEAN SOURCE REVIEW QUEUE AUDIT: PASS");
