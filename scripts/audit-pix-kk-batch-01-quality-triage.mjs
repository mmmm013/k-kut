import fs from "node:fs";

const p = "data/gpmc-sensory/batch-scale/quality/pix-kk-batch-01-quality-triage.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PIX/KK BATCH 01 QUALITY TRIAGE AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const rows = data.triage || [];

  if (data.status !== "pix_kk_batch_01_quality_triage") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Triage must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (rows.length !== 72) fail(`Expected 72 triage rows, found ${rows.length}.`);

  for (const phrase of [
    "does not approve candidates",
    "publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "approve_internal",
    "approved_public",
    "avoid one-PIX manual marathons",
    "Deep review only"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  const statuses = new Set(rows.map((r) => r.quality_status));
  if (!statuses.has("INCOME_LANE_REVIEW_READY")) fail("Expected at least one income-lane review-ready record.");
  if (!statuses.has("HOLD_FOR_AUDIO_DISCOVERY")) fail("Expected at least one audio-discovery hold.");
  if (!statuses.has("HIGH_RISK_HOLD_FOR_DEEP_REVIEW")) fail("Expected at least one high-risk hold.");

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
  }
}

if (failed) {
  console.error("PIX/KK BATCH 01 QUALITY TRIAGE AUDIT: FAIL");
  process.exit(1);
}

console.log("PIX/KK BATCH 01 QUALITY TRIAGE AUDIT: PASS");
