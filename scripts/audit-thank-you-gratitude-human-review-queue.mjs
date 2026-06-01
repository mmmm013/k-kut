import fs from "node:fs";

const queuePath = "data/gpmc-sensory/review-queues/thank-you-gratitude-human-review-queue.json";
const candidatesPath = "data/gpmc-sensory/candidates/thank-you-gratitude-candidates.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("THANK YOU GRATITUDE HUMAN REVIEW QUEUE AUDIT");

for (const file of [queuePath, candidatesPath]) {
  if (!fs.existsSync(file)) fail(`Missing ${file}`);
}

if (!failed) {
  const raw = fs.readFileSync(queuePath, "utf8");
  const queue = JSON.parse(raw);
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
  const items = queue.review_items || [];

  if (queue.lane_id !== "thank_you_gratitude") fail("Wrong lane_id.");
  if (queue.public_status !== "not_public") fail("Queue must remain not_public.");
  if (items.length !== 12) fail(`Expected 12 review items, found ${items.length}.`);
  if (items.length !== (candidates.records || []).length) {
    fail("Review item count must match candidate count.");
  }

  for (const phrase of [
    "human review only",
    "does not publish records",
    "create routes",
    "create Stripe links",
    "expose candidates in buyer flow",
    "separate approved_public promotion step"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing safety phrase: ${phrase}`);
  }

  for (const item of items) {
    if (item.current_status !== "needs_human_review") {
      fail(`${item.review_id} must need human review.`);
    }

    if (item.public_status_after_this_queue !== "not_public") {
      fail(`${item.review_id} must remain not_public after this queue.`);
    }

    if (item.public_approval_locked !== true) {
      fail(`${item.review_id} must have public_approval_locked true.`);
    }

    if (item.human_decision !== null || item.human_review_notes !== null || item.reviewed_at !== null) {
      fail(`${item.review_id} must not be pre-reviewed.`);
    }

    for (const field of [
      "good_use_cases",
      "bad_use_cases",
      "risk_notes",
      "buyer_words",
      "receiver_safe_words",
      "do_not_say",
      "reviewer_questions"
    ]) {
      if (!Array.isArray(item[field]) || item[field].length < 1) {
        fail(`${item.review_id} missing ${field}.`);
      }
    }

    const unsafeItem = {
      review_id: item.review_id,
      current_status: item.current_status,
      public_status_after_this_queue: item.public_status_after_this_queue,
      public_approval_locked: item.public_approval_locked,
      human_decision: item.human_decision,
      human_review_notes: item.human_review_notes,
      reviewed_at: item.reviewed_at
    };

    for (const forbidden of [
      "buy.stripe.com",
      "candidate_not_approved",
      "mk-products",
      "internal_proof"
    ]) {
      if (JSON.stringify(item).includes(forbidden)) {
        fail(`${item.review_id} contains forbidden phrase: ${forbidden}`);
      }
    }

    if (JSON.stringify(unsafeItem).includes("approved_public")) {
      fail(`${item.review_id} contains approved_public in a status/control field.`);
    }
  }
}

if (failed) {
  console.error("THANK YOU GRATITUDE HUMAN REVIEW QUEUE AUDIT: FAIL");
  process.exit(1);
}

console.log("THANK YOU GRATITUDE HUMAN REVIEW QUEUE AUDIT: PASS");
