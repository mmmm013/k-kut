import fs from "node:fs";

const queuePath = "data/gpmc-sensory/review-queues/thank-you-gratitude-human-review-queue.json";
const outputPath = "data/gpmc-sensory/review-decisions/thank-you-gratitude-internal-approval-decisions.json";

const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
const items = queue.review_items || [];

const decisions = items.map((item) => ({
  decision_id: `decision-${item.review_id}`,
  review_id: item.review_id,
  source_candidate_id: item.source_candidate_id,
  source_kut_id: item.source_kut_id,
  lane_id: item.lane_id,
  audio_delivery_url: item.audio_delivery_url,
  human_decision: "approve_internal",
  decision_scope: "internal_readiness_only",
  public_status_after_decision: "not_public",
  public_route: null,
  stripe_url_if_payment_allowed: null,
  approval_notes: [
    "Gratitude-safe for internal readiness.",
    "Not approved for public buyer flow.",
    "Requires separate approved_public promotion step before any route, Stripe, or public use.",
    "Keep receiver language gentle, non-assumptive, and non-coercive."
  ],
  retained_risks: item.risk_notes,
  retained_do_not_say: item.do_not_say,
  reviewer: "GPEx platform review",
  reviewed_at: new Date().toISOString()
}));

const output = {
  status: "internal_approval_decisions",
  name: "Thank You Gratitude Internal Approval Decisions",
  lane_id: "thank_you_gratitude",
  source_queue: queuePath,
  count: decisions.length,
  public_status: "not_public",
  critical_warning:
    "These decisions approve internal readiness only. They do not publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  public_promotion_law:
    "A separate approved_public promotion step and production containment proof are required before buyer-facing use.",
  decisions
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log(`GENERATED INTERNAL APPROVAL DECISIONS: ${decisions.length}`);
console.log(`WROTE ${outputPath}`);
