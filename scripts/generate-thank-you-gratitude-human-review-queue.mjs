import fs from "node:fs";

const candidatesPath = "data/gpmc-sensory/candidates/thank-you-gratitude-candidates.json";
const outputPath = "data/gpmc-sensory/review-queues/thank-you-gratitude-human-review-queue.json";

const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));
const records = candidates.records || [];

const reviewItems = records.map((record, index) => ({
  review_id: `review-${record.record_id}`,
  queue_order: index + 1,
  lane_id: record.lane_id,
  source_candidate_id: record.record_id,
  source_kut_id: record.source_kut_id,
  source_title: record.source_title,
  source_section: record.source_section,
  audio_delivery_url: record.audio_delivery_url,
  surface_feeling: record.surface_feeling,
  deeper_feelings: record.deeper_feelings,
  interpretation_summary: record.interpretation_summary,
  good_use_cases: record.good_use_cases,
  bad_use_cases: record.bad_use_cases,
  risk_notes: record.risk_notes,
  buyer_words: record.buyer_words,
  receiver_safe_words: record.receiver_safe_words,
  do_not_say: record.do_not_say,
  current_status: "needs_human_review",
  allowed_decisions: [
    "approve_internal",
    "hold",
    "reject_public",
    "request_audio_review",
    "request_copy_review"
  ],
  public_approval_locked: true,
  public_status_after_this_queue: "not_public",
  reviewer_questions: [
    "Is this gratitude-safe beyond Mother’s Day?",
    "Does this avoid pressure, repair promises, or emotional manipulation?",
    "Are the good use cases accurate?",
    "Are the bad use cases strong enough?",
    "Are the receiver-safe words gentle and non-assumptive?",
    "Should this remain internal, or later become an approved_public option after a separate public approval step?"
  ],
  human_decision: null,
  human_reviewer: null,
  human_review_notes: null,
  reviewed_at: null
}));

const output = {
  status: "human_review_queue",
  name: "Thank You Gratitude Human Review Queue",
  lane_id: "thank_you_gratitude",
  source: candidatesPath,
  count: reviewItems.length,
  public_status: "not_public",
  critical_warning:
    "This queue is for human review only. Approval here does not publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_law:
    "Human review may approve internal readiness only. A separate approved_public promotion step is required before any buyer-facing use.",
  review_items: reviewItems
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log(`GENERATED HUMAN REVIEW QUEUE ITEMS: ${reviewItems.length}`);
console.log(`WROTE ${outputPath}`);
