import fs from "node:fs";

const triagePath = "data/gpmc-sensory/batch-scale/quality/pix-kk-batch-01-quality-triage.json";
const candidatesPath = "data/gpmc-sensory/batch-scale/candidates/pix-kk-batch-01-internal-candidates.json";
const outputPath = "data/gpmc-sensory/batch-scale/review-queues/pix-kk-batch-01-review-priority-queue.json";

const triage = JSON.parse(fs.readFileSync(triagePath, "utf8"));
const candidates = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));

const candidateById = Object.fromEntries((candidates.records || []).map((r) => [r.record_id, r]));

const priorityThemeOrder = [
  "gratitude_thank_you",
  "family_parent",
  "encouragement_support",
  "romance_love",
  "birthday",
  "anniversary",
  "friendship",
  "mentor_recognition"
];

const rows = (triage.triage || [])
  .filter((row) => row.quality_status === "INCOME_LANE_REVIEW_READY")
  .map((row) => {
    const candidate = candidateById[row.record_id] || {};
    const themeRank = priorityThemeOrder.indexOf(row.theme);
    const normalizedRank = themeRank === -1 ? 99 : themeRank;

    return {
      review_id: `review-${row.record_id}`,
      record_id: row.record_id,
      batch_id: row.batch_id,
      theme: row.theme,
      source_file: row.source_file,
      priority_rank_group: normalizedRank,
      priority_reason: "Income-lane candidate with audio hints or review-ready source signal.",
      audio_status: row.audio_status,
      source_audio_hints: candidate.source_audio_hints || [],
      detected_themes: candidate.detected_themes || [],
      surface_feeling: candidate.surface_feeling,
      deeper_feelings: candidate.deeper_feelings,
      emotional_level: candidate.emotional_level,
      relationship_lane: candidate.relationship_lane,
      situation_lane: candidate.situation_lane,
      good_use_cases: candidate.good_use_cases,
      bad_use_cases: candidate.bad_use_cases,
      risk_notes: candidate.risk_notes,
      buyer_words: candidate.buyer_words,
      receiver_safe_words: candidate.receiver_safe_words,
      do_not_say: candidate.do_not_say,
      review_status: "needs_human_review",
      public_status: "not_public",
      public_route: null,
      stripe_url_if_payment_allowed: null,
      buyer_exposure: "none",
      next_action: "human_review_audio_and_text_fit"
    };
  })
  .sort((a, b) => a.priority_rank_group - b.priority_rank_group || a.theme.localeCompare(b.theme) || a.record_id.localeCompare(b.record_id));

const themeCounts = {};
for (const row of rows) {
  themeCounts[row.theme] = (themeCounts[row.theme] || 0) + 1;
}

const output = {
  status: "pix_kk_batch_01_review_priority_queue",
  name: "PIX/KK Batch 01 Review Priority Queue",
  source_triage: triagePath,
  source_candidates: candidatesPath,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  count: rows.length,
  theme_counts: themeCounts,
  critical_warning:
    "This queue does not approve candidates, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_rule:
    "Human review must confirm audio fit, text safety, theme fit, and buyer/receiver wording before approve_internal. Public promotion remains a separate approved_public step.",
  queue_rule:
    "Review income-lane candidates first to support admin income without weakening quality gates.",
  queue: rows
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("PIX/KK BATCH 01 REVIEW PRIORITY QUEUE");
console.log(`count: ${rows.length}`);
for (const [theme, count] of Object.entries(themeCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`${theme}: ${count}`);
}
console.log(`WROTE ${outputPath}`);
