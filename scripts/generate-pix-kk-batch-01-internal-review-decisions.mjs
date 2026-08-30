import fs from "node:fs";
import { assertBlkKkMassGenerationAllowed } from "./lib/blk-kk-text-generation-freeze.mjs";

assertBlkKkMassGenerationAllowed(import.meta.url);

const queuePath = "data/gpmc-sensory/batch-scale/review-queues/pix-kk-batch-01-review-priority-queue.json";
const outputPath = "data/gpmc-sensory/batch-scale/approval/pix-kk-batch-01-internal-review-decisions.json";

const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
const rows = queue.queue || [];

const decisions = rows.map((row) => ({
  decision_id: `decision-${row.record_id}`,
  review_id: row.review_id,
  record_id: row.record_id,
  batch_id: row.batch_id,
  theme: row.theme,
  source_file: row.source_file,
  source_audio_hints: row.source_audio_hints || [],
  audio_status_before_decision: row.audio_status,
  review_decision: "pending_human_review",
  allowed_decisions: [
    "approve_internal",
    "hold_for_audio",
    "needs_deep_review",
    "reject"
  ],
  can_advance_to_approve_internal: false,
  public_status_after_decision: "not_public",
  public_route_after_decision: null,
  stripe_url_after_decision: null,
  buyer_exposure_after_decision: "none",
  decision_notes_required: true,
  decision_notes: [
    "Human review has not been completed.",
    "Audio fit, text safety, theme fit, and buyer/receiver wording must be confirmed before approve_internal.",
    "Public promotion remains a separate approved_public step."
  ]
}));

const themeCounts = {};
for (const row of decisions) {
  themeCounts[row.theme] = (themeCounts[row.theme] || 0) + 1;
}

const output = {
  status: "pix_kk_batch_01_internal_review_decisions",
  name: "PIX/KK Batch 01 Internal Review Decisions",
  source_queue: queuePath,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  count: decisions.length,
  theme_counts: themeCounts,
  critical_warning:
    "This scaffold does not approve candidates, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_rule:
    "Only explicit human review may change a decision to approve_internal. Public promotion remains a separate approved_public step.",
  decisions
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("PIX/KK BATCH 01 INTERNAL REVIEW DECISIONS");
console.log(`count: ${decisions.length}`);
for (const [theme, count] of Object.entries(themeCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`${theme}: ${count}`);
}
console.log(`WROTE ${outputPath}`);
