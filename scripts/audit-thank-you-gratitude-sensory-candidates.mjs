import fs from "node:fs";

const p = "data/gpmc-sensory/candidates/thank-you-gratitude-candidates.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

function cloneWithoutDoNotSay(record) {
  const copy = JSON.parse(JSON.stringify(record));
  delete copy.do_not_say;
  return copy;
}

console.log("THANK YOU GRATITUDE SENSORY CANDIDATES AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const records = data.records || [];

  if (data.lane_id !== "thank_you_gratitude") fail("Wrong lane_id.");
  if (data.public_status !== "not_public") fail("Candidate file must be not_public.");
  if (records.length !== 12) fail(`Expected 12 candidates, found ${records.length}.`);

  for (const phrase of [
    "internal sensory-emotional candidates only",
    "not approved_public records",
    "must not enter buyer flow",
    "reviewed for non-Mother’s-Day gratitude use"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing safety phrase: ${phrase}`);
  }

  for (const record of records) {
    if (record.review_status !== "held_internal_candidate") {
      fail(`${record.record_id} must be held_internal_candidate.`);
    }

    if (record.public_status !== "not_public") {
      fail(`${record.record_id} must be not_public.`);
    }

    if (record.public_route !== null) {
      fail(`${record.record_id} must not have a public_route.`);
    }

    if (record.stripe_url_if_payment_allowed !== null) {
      fail(`${record.record_id} must not have a Stripe URL.`);
    }

    for (const field of [
      "good_use_cases",
      "bad_use_cases",
      "risk_notes",
      "buyer_words",
      "receiver_safe_words",
      "do_not_say"
    ]) {
      if (!Array.isArray(record[field]) || record[field].length < 1) {
        fail(`${record.record_id} missing ${field}.`);
      }
    }

    for (const axis of ["audio", "body", "visual", "touch", "memory"]) {
      if (!Array.isArray(record.sensory_profile?.[axis]) || record.sensory_profile[axis].length < 2) {
        fail(`${record.record_id} missing sensory axis ${axis}.`);
      }
    }

    const unsafePublicText = JSON.stringify(cloneWithoutDoNotSay(record));

    for (const forbidden of [
      "approved_public",
      "buy.stripe.com",
      "candidate_not_approved",
      "mk-products",
      "internal_proof",
      "This will fix everything",
      "You need to feel appreciated now",
      "This should make up for everything"
    ]) {
      if (unsafePublicText.includes(forbidden)) {
        fail(`${record.record_id} contains forbidden public phrase outside do_not_say: ${forbidden}`);
      }
    }

    if (record.record_id.includes("outro")) {
      const pressureGuards = [
        "This will fix everything",
        "This should make up for everything",
        "You owe me a response"
      ];

      const hasAnyPressureGuard = (record.do_not_say || []).some((entry) =>
        pressureGuards.some((guard) => String(entry).includes(guard))
      );

      if (!hasAnyPressureGuard) {
        fail(`${record.record_id} should preserve at least one repair/pressure guard in do_not_say.`);
      }
    }
  }
}

if (failed) {
  console.error("THANK YOU GRATITUDE SENSORY CANDIDATES AUDIT: FAIL");
  process.exit(1);
}

console.log("THANK YOU GRATITUDE SENSORY CANDIDATES AUDIT: PASS");
