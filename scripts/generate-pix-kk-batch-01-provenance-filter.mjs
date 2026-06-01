import fs from "node:fs";

const queuePath = "data/gpmc-sensory/batch-scale/review-queues/pix-kk-batch-01-review-priority-queue.json";
const decisionsPath = "data/gpmc-sensory/batch-scale/approval/pix-kk-batch-01-internal-review-decisions.json";
const outputPath = "data/gpmc-sensory/batch-scale/quality/pix-kk-batch-01-provenance-filter.json";

const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
const decisions = JSON.parse(fs.readFileSync(decisionsPath, "utf8"));

const decisionByRecord = Object.fromEntries((decisions.decisions || []).map((d) => [d.record_id, d]));

function classifySource(row) {
  const source = String(row.source_file || "").toLowerCase();
  const hints = (row.source_audio_hints || []).join(" ").toLowerCase();

  if (source.includes("system-map") || source.includes("doctrine")) return "DOCTRINE_OR_SYSTEM_MAP";
  if (source.includes("manifest")) return "MANIFEST_OR_INDEX";
  if (source.includes("review-queue") || source.includes("review-queues")) return "REVIEW_QUEUE_DERIVATIVE";
  if (source.includes("review-decisions") || source.includes("approval")) return "APPROVAL_DECISION_DERIVATIVE";
  if (source.includes("candidates") || source.includes("generated")) return "GENERATED_DATA_DERIVATIVE";
  if (source.includes("source-pool") || source.includes("source-discovery")) return "SOURCE_DISCOVERY_DERIVATIVE";
  if (source.includes("audio-discovery") || source.includes("audio-repair") || source.includes("quality")) return "QUALITY_OR_REPAIR_DERIVATIVE";
  if (source.includes("publication-bridge") || source.includes("bic-routes") || source.includes("bic-usecases")) return "PUBLICATION_OR_ROUTE_DERIVATIVE";
  if (source.includes("guide") || hints.includes("/audio/kleigh/guide") || hints.includes("mc-bot")) return "VOICE_GUIDE_NOT_KK";
  if (hints.includes("mk-products") || hints.includes("-mk")) return "MK_OR_MK_LIKE_AUDIO";
  if (hints.includes("romance") && !row.theme.includes("romance")) return "WRONG_LANE_ROMANCE_AUDIO";
  if (hints.includes("mothers-day") && !["gratitude_thank_you", "family_parent"].includes(row.theme)) return "WRONG_LANE_MOTHERS_DAY_AUDIO";
  if (hints.includes(".mp3") || hints.includes(".wav") || hints.includes(".m4a")) return "POSSIBLE_AUDIO_SOURCE_REVIEW_REQUIRED";

  return "UNKNOWN_PROVENANCE";
}

function actionFor(provenance) {
  if (provenance === "POSSIBLE_AUDIO_SOURCE_REVIEW_REQUIRED") return "HUMAN_REVIEW_REQUIRED";
  return "HOLD_NOT_APPROVABLE_FROM_BATCH_01";
}

const rows = (queue.queue || []).map((row) => {
  const provenance = classifySource(row);
  const decision = decisionByRecord[row.record_id] || {};

  return {
    record_id: row.record_id,
    review_id: row.review_id,
    decision_id: decision.decision_id || null,
    theme: row.theme,
    source_file: row.source_file,
    audio_hints_count: (row.source_audio_hints || []).length,
    provenance_status: provenance,
    recommended_action: actionFor(provenance),
    reason:
      provenance === "POSSIBLE_AUDIO_SOURCE_REVIEW_REQUIRED"
        ? "May contain usable audio, but human review must confirm actual KK/PIX source, theme fit, and rights lane."
        : "Batch source is derivative, manifest/config/doctrine, guide audio, wrong-lane, or mK-like. Do not approve from this record.",
    public_status_after_filter: "not_public",
    public_route_after_filter: null,
    stripe_url_after_filter: null,
    buyer_exposure_after_filter: "none"
  };
});

const counts = {};
const themeCounts = {};

for (const row of rows) {
  counts[row.provenance_status] = (counts[row.provenance_status] || 0) + 1;
  themeCounts[row.theme] = (themeCounts[row.theme] || 0) + 1;
}

const output = {
  status: "pix_kk_batch_01_provenance_filter",
  name: "PIX/KK Batch 01 Provenance Filter",
  source_queue: queuePath,
  source_decisions: decisionsPath,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  count: rows.length,
  counts,
  theme_counts: themeCounts,
  critical_warning:
    "This provenance filter does not approve candidates, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_rule:
    "A candidate may not advance to approve_internal from derivative config, manifest, doctrine, generated queue, guide audio, wrong-lane audio, or mK-like source records.",
  next_rule:
    "Use this filter to create a smaller human-review set containing only actual KK/PIX audio-source records.",
  rows
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("PIX/KK BATCH 01 PROVENANCE FILTER");
console.log(`count: ${rows.length}`);
for (const [k, v] of Object.entries(counts).sort((a,b) => b[1] - a[1])) {
  console.log(`${k}: ${v}`);
}
console.log(`WROTE ${outputPath}`);
