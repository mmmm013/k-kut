import fs from "node:fs";

const filterPath = "data/gpmc-sensory/batch-scale/quality/pix-kk-batch-01-provenance-filter.json";
const queuePath = "data/gpmc-sensory/batch-scale/review-queues/pix-kk-batch-01-review-priority-queue.json";
const outputPath = "data/gpmc-sensory/batch-scale/review-queues/pix-kk-batch-01-clean-source-review-queue.json";

const filter = JSON.parse(fs.readFileSync(filterPath, "utf8"));
const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

const queueByRecord = Object.fromEntries((queue.queue || []).map((r) => [r.record_id, r]));

const rows = (filter.rows || [])
  .filter((row) => row.provenance_status === "POSSIBLE_AUDIO_SOURCE_REVIEW_REQUIRED")
  .map((row) => {
    const q = queueByRecord[row.record_id] || {};

    return {
      clean_review_id: `clean-${row.record_id}`,
      record_id: row.record_id,
      review_id: row.review_id,
      decision_id: row.decision_id,
      theme: row.theme,
      source_file: row.source_file,
      provenance_status: row.provenance_status,
      source_audio_hints: q.source_audio_hints || [],
      audio_hints_count: row.audio_hints_count,
      surface_feeling: q.surface_feeling,
      deeper_feelings: q.deeper_feelings,
      emotional_level: q.emotional_level,
      relationship_lane: q.relationship_lane,
      situation_lane: q.situation_lane,
      good_use_cases: q.good_use_cases,
      bad_use_cases: q.bad_use_cases,
      risk_notes: q.risk_notes,
      buyer_words: q.buyer_words,
      receiver_safe_words: q.receiver_safe_words,
      do_not_say: q.do_not_say,
      review_status: "needs_human_review",
      clean_source_status: "candidate_clean_source_review_required",
      public_status: "not_public",
      public_route: null,
      stripe_url_if_payment_allowed: null,
      buyer_exposure: "none",
      next_action: "human_listen_confirm_actual_kk_pix_source_theme_fit"
    };
  });

const output = {
  status: "pix_kk_batch_01_clean_source_review_queue",
  name: "PIX/KK Batch 01 Clean Source Review Queue",
  source_provenance_filter: filterPath,
  source_priority_queue: queuePath,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  count: rows.length,
  critical_warning:
    "This clean-source queue does not approve candidates, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_rule:
    "Human listening review must confirm actual KK/PIX source, theme fit, audio quality, and safe buyer/receiver wording before approve_internal. Public promotion remains a separate approved_public step.",
  queue: rows
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("PIX/KK BATCH 01 CLEAN SOURCE REVIEW QUEUE");
console.log(`count: ${rows.length}`);
for (const row of rows) {
  console.log(`${row.record_id}: ${row.theme} ${row.source_file}`);
}
console.log(`WROTE ${outputPath}`);
