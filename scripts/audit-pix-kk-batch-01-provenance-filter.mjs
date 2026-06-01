import fs from "node:fs";

const p = "data/gpmc-sensory/batch-scale/quality/pix-kk-batch-01-provenance-filter.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PIX/KK BATCH 01 PROVENANCE FILTER AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const rows = data.rows || [];

  if (data.status !== "pix_kk_batch_01_provenance_filter") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Filter must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");
  if (rows.length !== 27) fail(`Expected 27 filter rows, found ${rows.length}.`);

  for (const phrase of [
    "does not approve candidates",
    "publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "approve_internal",
    "derivative config",
    "manifest",
    "doctrine",
    "guide audio",
    "wrong-lane audio",
    "mK-like"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  const holdCount = rows.filter((r) => r.recommended_action === "HOLD_NOT_APPROVABLE_FROM_BATCH_01").length;
  if (holdCount < 1) fail("Expected at least one hold from Step 115 findings.");

  for (const row of rows) {
    if (row.public_status_after_filter !== "not_public") {
      fail(`${row.record_id} must remain not_public.`);
    }
    if (row.public_route_after_filter !== null) {
      fail(`${row.record_id} must not create public route.`);
    }
    if (row.stripe_url_after_filter !== null) {
      fail(`${row.record_id} must not create Stripe URL.`);
    }
    if (row.buyer_exposure_after_filter !== "none") {
      fail(`${row.record_id} buyer exposure must be none.`);
    }
    if (!row.provenance_status || !row.recommended_action) {
      fail(`${row.record_id} missing provenance status/action.`);
    }
  }
}

if (failed) {
  console.error("PIX/KK BATCH 01 PROVENANCE FILTER AUDIT: FAIL");
  process.exit(1);
}

console.log("PIX/KK BATCH 01 PROVENANCE FILTER AUDIT: PASS");
