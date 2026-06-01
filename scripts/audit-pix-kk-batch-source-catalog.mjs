import fs from "node:fs";

const p = "data/gpmc-sensory/batch-scale/pix-kk-batch-source-catalog.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PIX/KK BATCH SOURCE CATALOG AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const records = data.records || [];

  if (data.status !== "pix_kk_batch_source_catalog") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Catalog must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (data.minimum_batch_size !== 25) fail("Minimum batch size must be 25.");
  if (data.preferred_batch_size !== 100) fail("Preferred batch size must be 100.");
  if (records.length < 25) fail(`Expected at least 25 batch source records, found ${records.length}.`);

  for (const phrase of [
    "batch source discovery only",
    "does not approve candidates",
    "publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "internal candidates in batches",
    "Deep manual review"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const record of records) {
    for (const field of [
      "batch_source_id",
      "source_file",
      "source_type",
      "detected_themes",
      "primary_theme",
      "candidate_generation_status",
      "review_status",
      "public_status",
      "public_route",
      "stripe_url_if_payment_allowed",
      "buyer_exposure"
    ]) {
      if (!(field in record)) fail(`${record.batch_source_id || "unknown"} missing ${field}.`);
    }

    if (record.public_status !== "not_public") fail(`${record.batch_source_id} must remain not_public.`);
    if (record.public_route !== null) fail(`${record.batch_source_id} must not create public route.`);
    if (record.stripe_url_if_payment_allowed !== null) fail(`${record.batch_source_id} must not create Stripe URL.`);
    if (record.buyer_exposure !== "none") fail(`${record.batch_source_id} buyer exposure must be none.`);
    if (!Array.isArray(record.detected_themes) || record.detected_themes.length < 1) {
      fail(`${record.batch_source_id} missing detected themes.`);
    }
  }
}

if (failed) {
  console.error("PIX/KK BATCH SOURCE CATALOG AUDIT: FAIL");
  process.exit(1);
}

console.log("PIX/KK BATCH SOURCE CATALOG AUDIT: PASS");
