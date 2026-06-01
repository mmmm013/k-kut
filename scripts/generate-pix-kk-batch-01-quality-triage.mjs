import fs from "node:fs";

const inputPath = "data/gpmc-sensory/batch-scale/candidates/pix-kk-batch-01-internal-candidates.json";
const outputPath = "data/gpmc-sensory/batch-scale/quality/pix-kk-batch-01-quality-triage.json";

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const records = input.records || [];

const highRiskThemes = new Set(["apology_repair", "grief_remembrance"]);
const incomeThemes = new Set([
  "birthday",
  "encouragement_support",
  "friendship",
  "gratitude_thank_you",
  "romance_love",
  "anniversary",
  "wedding_forever",
  "family_parent",
  "mentor_recognition",
  "kupid_spark"
]);

function audioStatus(record) {
  if (record.audio_status === "AUDIO_HINTS_EXIST_REVIEW_REQUIRED") return "AUDIO_HINTS_EXIST_REVIEW_REQUIRED";
  if (Array.isArray(record.source_audio_hints) && record.source_audio_hints.length > 0) return "AUDIO_HINTS_EXIST_REVIEW_REQUIRED";
  return "NO_AUDIO_HINT_YET";
}

function qualityStatus(record) {
  if (highRiskThemes.has(record.theme)) return "HIGH_RISK_HOLD_FOR_DEEP_REVIEW";
  if (audioStatus(record) === "NO_AUDIO_HINT_YET") return "HOLD_FOR_AUDIO_DISCOVERY";
  if (incomeThemes.has(record.theme)) return "INCOME_LANE_REVIEW_READY";
  return "STANDARD_REVIEW_REQUIRED";
}

const triage = records.map((record) => ({
  record_id: record.record_id,
  batch_id: record.batch_id,
  theme: record.theme,
  source_file: record.source_file,
  audio_status: audioStatus(record),
  quality_status: qualityStatus(record),
  income_lane: incomeThemes.has(record.theme),
  high_risk_lane: highRiskThemes.has(record.theme),
  review_status_before_triage: record.review_status,
  public_status_after_triage: "not_public",
  public_route_after_triage: null,
  stripe_url_after_triage: null,
  buyer_exposure_after_triage: "none",
  triage_notes: [
    "Do not approve public use from this triage step.",
    "Batch triage only sorts candidates for review priority.",
    "Audio and human review are required before approve_internal.",
    "Public promotion remains a separate approved_public step."
  ]
}));

const counts = {};
const themeCounts = {};

for (const row of triage) {
  counts[row.quality_status] = (counts[row.quality_status] || 0) + 1;
  themeCounts[row.theme] = (themeCounts[row.theme] || 0) + 1;
}

const output = {
  status: "pix_kk_batch_01_quality_triage",
  name: "PIX/KK Batch 01 Quality Triage",
  source_candidates: inputPath,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  count: triage.length,
  counts,
  theme_counts: themeCounts,
  critical_warning:
    "This triage does not approve candidates, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_rule:
    "Only human-reviewed candidates with acceptable audio, safe text, and correct lane fit may advance to approve_internal. Public promotion remains a separate approved_public step.",
  batch_rule:
    "Use batch triage to avoid one-PIX manual marathons. Deep review only for high-risk lanes, exceptions, internal approval, or public promotion.",
  triage
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("PIX/KK BATCH 01 QUALITY TRIAGE");
console.log(`count: ${triage.length}`);
for (const [k, v] of Object.entries(counts)) console.log(`${k}: ${v}`);
console.log("theme_counts:");
for (const [theme, count] of Object.entries(themeCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`${theme}: ${count}`);
}
console.log(`WROTE ${outputPath}`);
