import fs from "node:fs";

const p = "data/gpmc-sensory/batch-scale/review-queues/pix-kk-batch-01-review-priority-queue.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PIX/KK BATCH 01 REVIEW PRIORITY QUEUE AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const rows = data.queue || [];

  if (data.status !== "pix_kk_batch_01_review_priority_queue") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Queue must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (rows.length !== 27) fail(`Expected 27 priority rows, found ${rows.length}.`);

  for (const phrase of [
    "does not approve candidates",
    "publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "approve_internal",
    "approved_public",
    "support admin income",
    "quality gates"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const row of rows) {
    for (const field of [
      "review_id",
      "record_id",
      "batch_id",
      "theme",
      "source_file",
      "priority_reason",
      "audio_status",
      "source_audio_hints",
      "surface_feeling",
      "deeper_feelings",
      "emotional_level",
      "relationship_lane",
      "situation_lane",
      "good_use_cases",
      "bad_use_cases",
      "risk_notes",
      "buyer_words",
      "receiver_safe_words",
      "do_not_say",
      "review_status",
      "public_status",
      "public_route",
      "stripe_url_if_payment_allowed",
      "buyer_exposure",
      "next_action"
    ]) {
      if (!(field in row)) fail(`${row.review_id || "unknown"} missing ${field}.`);
    }

    if (row.review_status !== "needs_human_review") fail(`${row.review_id} must need human review.`);
    if (row.public_status !== "not_public") fail(`${row.review_id} must remain not_public.`);
    if (row.public_route !== null) fail(`${row.review_id} must not create public route.`);
    if (row.stripe_url_if_payment_allowed !== null) fail(`${row.review_id} must not create Stripe URL.`);
    if (row.buyer_exposure !== "none") fail(`${row.review_id} buyer exposure must be none.`);
  }
}

if (failed) {
  console.error("PIX/KK BATCH 01 REVIEW PRIORITY QUEUE AUDIT: FAIL");
  process.exit(1);
}

console.log("PIX/KK BATCH 01 REVIEW PRIORITY QUEUE AUDIT: PASS");
