import fs from "node:fs";

const p = "data/gpmc-sensory/review-decisions/thank-you-gratitude-internal-approval-decisions.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("THANK YOU GRATITUDE INTERNAL APPROVAL DECISIONS AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const decisions = data.decisions || [];

  if (data.lane_id !== "thank_you_gratitude") fail("Wrong lane_id.");
  if (data.public_status !== "not_public") fail("Decision file must remain not_public.");
  if (decisions.length !== 12) fail(`Expected 12 decisions, found ${decisions.length}.`);

  for (const phrase of [
    "internal readiness only",
    "do not publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "separate approved_public promotion step",
    "production containment proof"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required safety phrase: ${phrase}`);
  }

  for (const decision of decisions) {
    if (decision.human_decision !== "approve_internal") {
      fail(`${decision.decision_id} must be approve_internal.`);
    }

    if (decision.decision_scope !== "internal_readiness_only") {
      fail(`${decision.decision_id} must be internal_readiness_only.`);
    }

    if (decision.public_status_after_decision !== "not_public") {
      fail(`${decision.decision_id} must remain not_public.`);
    }

    if (decision.public_route !== null) {
      fail(`${decision.decision_id} must not have a public route.`);
    }

    if (decision.stripe_url_if_payment_allowed !== null) {
      fail(`${decision.decision_id} must not have a Stripe URL.`);
    }

    for (const field of ["approval_notes", "retained_risks", "retained_do_not_say"]) {
      if (!Array.isArray(decision[field]) || decision[field].length < 1) {
        fail(`${decision.decision_id} missing ${field}.`);
      }
    }

    for (const forbidden of [
      "buy.stripe.com",
      "candidate_not_approved",
      "mk-products",
      "internal_proof"
    ]) {
      if (JSON.stringify(decision).includes(forbidden)) {
        fail(`${decision.decision_id} contains forbidden phrase: ${forbidden}`);
      }
    }
  }
}

if (failed) {
  console.error("THANK YOU GRATITUDE INTERNAL APPROVAL DECISIONS AUDIT: FAIL");
  process.exit(1);
}

console.log("THANK YOU GRATITUDE INTERNAL APPROVAL DECISIONS AUDIT: PASS");
