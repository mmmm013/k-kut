import fs from "node:fs";

const cleanQueuePath = "data/gpmc-sensory/batch-scale/review-queues/pix-kk-batch-01-clean-source-review-queue.json";
const sourcePath = "data/holiday-kks/mothers-day-thank-you-kks.json";
const outputPath = "data/gpmc-sensory/batch-scale/eligibility/pix-kk-batch-01-clean-source-asset-eligibility.json";

const cleanQueue = JSON.parse(fs.readFileSync(cleanQueuePath, "utf8"));
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const assets = source.assets || [];

function eligibility(asset) {
  if (asset.review_status === "paused_for_linefeel_refinement") {
    return "HOLD_LINEFEEL_REFINEMENT";
  }

  if (asset.active_offer_eligible === true && asset.audio_url) {
    return "POSSIBLE_INTERNAL_REVIEW";
  }

  if (!asset.audio_url) {
    return "HOLD_MISSING_AUDIO_URL";
  }

  return "HOLD_NOT_ACTIVE_OFFER_ELIGIBLE";
}

const rows = assets.map((asset) => ({
  asset_id: asset.id,
  source_song: source.source_song,
  holiday_set: source.holiday_set,
  format_type: asset.format_type,
  asset_family: asset.asset_family,
  user_display_title: asset.user_display_title,
  user_display_description: asset.user_display_description,
  emotional_lanes: asset.emotional_lanes || [],
  intensity: asset.intensity,
  duration_class: asset.duration_class,
  audio_url: asset.audio_url,
  occasion_context: asset.occasion_context,
  recipient_context: asset.recipient_context,
  sentiment_product_type: asset.sentiment_product_type,
  primary_emotional_job: asset.primary_emotional_job,
  secondary_emotional_job: asset.secondary_emotional_job,
  review_status_before_eligibility: asset.review_status,
  active_offer_eligible_before_eligibility: asset.active_offer_eligible,
  offer_pause_reason: asset.offer_pause_reason || null,
  eligibility_status: eligibility(asset),
  recommended_action:
    eligibility(asset) === "POSSIBLE_INTERNAL_REVIEW"
      ? "human_listen_before_approve_internal"
      : "hold_not_approvable_now",
  public_status_after_eligibility: "not_public",
  public_route_after_eligibility: null,
  stripe_url_after_eligibility: null,
  buyer_exposure_after_eligibility: "none"
}));

const counts = {};
const familyCounts = {};

for (const row of rows) {
  counts[row.eligibility_status] = (counts[row.eligibility_status] || 0) + 1;
  familyCounts[row.asset_family] = (familyCounts[row.asset_family] || 0) + 1;
}

const output = {
  status: "pix_kk_batch_01_clean_source_asset_eligibility",
  name: "PIX/KK Batch 01 Clean Source Asset Eligibility",
  source_clean_queue: cleanQueuePath,
  source_asset_file: sourcePath,
  source_song: source.source_song,
  holiday_set: source.holiday_set,
  active_offer_rule: source.active_offer_rule,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  asset_count: rows.length,
  counts,
  family_counts: familyCounts,
  critical_warning:
    "This asset eligibility report does not approve candidates, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_rule:
    "Only assets with human listening review, safe text, correct emotional lane, and explicit approve_internal may advance. Public promotion remains a separate approved_public step.",
  refinement_rule:
    "LineFeels/CC paused for refinement must remain held until owner review is complete.",
  rows
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("PIX/KK BATCH 01 CLEAN SOURCE ASSET ELIGIBILITY");
console.log(`asset_count: ${rows.length}`);
for (const [k, v] of Object.entries(counts).sort((a,b) => b[1] - a[1])) {
  console.log(`${k}: ${v}`);
}
console.log("family_counts:");
for (const [k, v] of Object.entries(familyCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`${k}: ${v}`);
}
console.log(`WROTE ${outputPath}`);
