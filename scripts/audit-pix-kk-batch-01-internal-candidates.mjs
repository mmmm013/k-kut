import fs from "node:fs";

const p = "data/gpmc-sensory/batch-scale/candidates/pix-kk-batch-01-internal-candidates.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PIX/KK BATCH 01 INTERNAL CANDIDATES AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const records = data.records || [];

  if (data.status !== "pix_kk_batch_01_internal_candidates") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Batch candidates must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (records.length < 25) fail(`Expected at least 25 records, found ${records.length}.`);

  for (const phrase of [
    "batch-generated internal candidates only",
    "do not approve records",
    "publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "Human review is required",
    "approved_public"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const record of records) {
    for (const field of [
      "record_id",
      "batch_id",
      "batch_source_id",
      "source_file",
      "candidate_type",
      "lane_id",
      "theme",
      "detected_themes",
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
      "public_route",
      "audio_delivery_url",
      "stripe_url_if_payment_allowed"
    ]) {
      if (!(field in record)) fail(`${record.record_id || "unknown"} missing ${field}.`);
    }

    if (record.review_status !== "needs_human_review") fail(`${record.record_id} must need human review.`);
    if (record.public_status !== "not_public") fail(`${record.record_id} must remain not_public.`);
    if (record.public_route !== null) fail(`${record.record_id} must not have public route.`);
    if (record.stripe_url_if_payment_allowed !== null) fail(`${record.record_id} must not have Stripe URL.`);
    if (record.route_created !== false || record.stripe_created !== false) fail(`${record.record_id} must not create route or Stripe.`);
    if (record.buyer_exposure !== "none") fail(`${record.record_id} buyer exposure must be none.`);
    if (record.xml_armed !== true) fail(`${record.record_id} must be XML-armed.`);
  }
}

if (failed) {
  console.error("PIX/KK BATCH 01 INTERNAL CANDIDATES AUDIT: FAIL");
  process.exit(1);
}

console.log("PIX/KK BATCH 01 INTERNAL CANDIDATES AUDIT: PASS");
