import fs from "node:fs";

const eligibilityPath = "data/gpmc-sensory/batch-scale/eligibility/pix-kk-batch-01-clean-source-asset-eligibility.json";
const outputPath = "data/gpmc-sensory/batch-scale/review-queues/pix-kk-batch-01-possible-internal-review-assets.json";

const eligibility = JSON.parse(fs.readFileSync(eligibilityPath, "utf8"));

const rows = (eligibility.rows || [])
  .filter((row) => row.eligibility_status === "POSSIBLE_INTERNAL_REVIEW")
  .map((row) => ({
    review_asset_id: `review-asset-${row.asset_id}`,
    asset_id: row.asset_id,
    source_song: row.source_song,
    holiday_set: row.holiday_set,
    format_type: row.format_type,
    asset_family: row.asset_family,
    user_display_title: row.user_display_title,
    user_display_description: row.user_display_description,
    emotional_lanes: row.emotional_lanes,
    intensity: row.intensity,
    duration_class: row.duration_class,
    audio_url: row.audio_url,
    occasion_context: row.occasion_context,
    recipient_context: row.recipient_context,
    sentiment_product_type: row.sentiment_product_type,
    primary_emotional_job: row.primary_emotional_job,
    secondary_emotional_job: row.secondary_emotional_job,
    eligibility_status: row.eligibility_status,
    review_status: "needs_human_listening_review",
    review_decision: "pending_human_review",
    allowed_decisions: [
      "approve_internal",
      "hold_for_audio_or_text_repair",
      "reject"
    ],
    public_status: "not_public",
    public_route: null,
    stripe_url_if_payment_allowed: null,
    buyer_exposure: "none",
    next_action: "listen_and_confirm_audio_text_fit_before_internal_approval"
  }));

const output = {
  status: "pix_kk_batch_01_possible_internal_review_assets",
  name: "PIX/KK Batch 01 Possible Internal Review Assets",
  source_eligibility_report: eligibilityPath,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  count: rows.length,
  critical_warning:
    "This review queue does not approve assets, publish records, create routes, create Stripe links, or expose assets in buyer flow.",
  approval_rule:
    "Human listening review must confirm audio quality, emotional fit, safe buyer/receiver wording, and correct lane before approve_internal. Public promotion remains a separate approved_public step.",
  queue: rows
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("PIX/KK BATCH 01 POSSIBLE INTERNAL REVIEW ASSETS");
console.log(`count: ${rows.length}`);
for (const row of rows) {
  console.log(`${row.asset_id}: ${row.asset_family} ${row.audio_url}`);
}
console.log(`WROTE ${outputPath}`);
