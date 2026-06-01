import fs from "node:fs";

const p = "data/gpmc-sensory/batch-scale/approval/pix-kk-batch-01-internal-review-decisions.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PIX/KK BATCH 01 INTERNAL REVIEW DECISIONS AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const rows = data.decisions || [];

  if (data.status !== "pix_kk_batch_01_internal_review_decisions") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Decision scaffold must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (rows.length !== 27) fail(`Expected 27 decision rows, found ${rows.length}.`);

  for (const phrase of [
    "does not approve candidates",
    "publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "approve_internal",
    "approved_public",
    "explicit human review"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const row of rows) {
    if (row.review_decision !== "pending_human_review") {
      fail(`${row.decision_id} must start pending_human_review.`);
    }
    if (row.can_advance_to_approve_internal !== false) {
      fail(`${row.decision_id} must not advance yet.`);
    }
    if (row.public_status_after_decision !== "not_public") {
      fail(`${row.decision_id} must remain not_public.`);
    }
    if (row.public_route_after_decision !== null) {
      fail(`${row.decision_id} must not create public route.`);
    }
    if (row.stripe_url_after_decision !== null) {
      fail(`${row.decision_id} must not create Stripe URL.`);
    }
    if (row.buyer_exposure_after_decision !== "none") {
      fail(`${row.decision_id} buyer exposure must be none.`);
    }
    if (!Array.isArray(row.allowed_decisions) || !row.allowed_decisions.includes("approve_internal")) {
      fail(`${row.decision_id} missing allowed decisions.`);
    }
    if (!Array.isArray(row.decision_notes) || row.decision_notes.length < 1) {
      fail(`${row.decision_id} missing decision notes.`);
    }
  }
}

if (failed) {
  console.error("PIX/KK BATCH 01 INTERNAL REVIEW DECISIONS AUDIT: FAIL");
  process.exit(1);
}

console.log("PIX/KK BATCH 01 INTERNAL REVIEW DECISIONS AUDIT: PASS");
