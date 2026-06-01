import fs from "node:fs";

const p = "data/system-map/pix-batch-scale-processing-doctrine.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PIX BATCH-SCALE PROCESSING DOCTRINE AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);

  if (data.status !== "locked_doctrine") fail("Doctrine must be locked.");
  if (!raw.includes("Do not process 300 PIX one-by-one")) fail("Must forbid one-by-one 300 PIX processing.");
  if (!raw.includes("reusable batch pipeline")) fail("Must require reusable batch pipeline.");
  if (!raw.includes("human_review_required")) fail("Must require human review for approval.");
  if (!raw.includes("approved_public")) fail("Must preserve approved_public law.");
  if (!raw.includes("no route, no Stripe, no buyer exposure")) fail("Must preserve internal approval containment.");
  if (!raw.includes("Platform spine exists to support income")) fail("Must preserve income priority.");
  if (!raw.includes("Do not repeat one-song or one-PIX marathons")) fail("Must forbid repeated marathons.");

  if (data.batch_first_rule?.minimum_batch_size < 25) {
    fail("Minimum batch size must be at least 25.");
  }

  if (data.inventory_targets?.admin_minimum_per_theme !== 8) {
    fail("Admin minimum per theme must remain 8.");
  }

  if (data.duplicate_rule?.dups_allowed !== true) {
    fail("DUPs must remain allowed.");
  }

  if (data.duplicate_rule?.best_one_wins_when_same !== true) {
    fail("Best one wins rule missing.");
  }
}

if (failed) {
  console.error("PIX BATCH-SCALE PROCESSING DOCTRINE AUDIT: FAIL");
  process.exit(1);
}

console.log("PIX BATCH-SCALE PROCESSING DOCTRINE AUDIT: PASS");
