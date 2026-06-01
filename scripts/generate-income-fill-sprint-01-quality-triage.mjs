import fs from "node:fs";

const inputPath = "data/gpmc-sensory/income-fill/candidates/income-fill-sprint-01-internal-candidates.json";
const outputPath = "data/gpmc-sensory/income-fill/quality/income-fill-sprint-01-quality-triage.json";

const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const records = input.records || [];

function audioStatus(record) {
  const url = record.audio_delivery_url || "";

  if (!url) return "NO_AUDIO_HINT_YET";

  const lower = url.toLowerCase();

  if (record.theme === "birthday" && (lower.includes("romance") || lower.includes("mothers-day") || lower.includes("thank-you"))) {
    return "WRONG_LANE_AUDIO_HINT";
  }

  if (record.theme === "encouragement_support" && lower.includes("romance")) {
    return "WRONG_LANE_AUDIO_HINT";
  }

  if (record.theme === "friendship" && lower.includes("romance")) {
    return "WRONG_LANE_AUDIO_HINT";
  }

  return "HAS_AUDIO_HINT_REVIEW_REQUIRED";
}

function qualityStatus(record) {
  const audio = audioStatus(record);

  if (audio === "WRONG_LANE_AUDIO_HINT") return "HOLD_FOR_AUDIO_REPAIR";
  if (audio === "NO_AUDIO_HINT_YET") return "HOLD_FOR_AUDIO_DISCOVERY";
  return "REVIEW_TEXT_AND_AUDIO";
}

const triage = records.map((record) => ({
  record_id: record.record_id,
  theme: record.theme,
  source_title: record.source_title,
  audio_delivery_url: record.audio_delivery_url,
  audio_status: audioStatus(record),
  quality_status: qualityStatus(record),
  review_status_before_triage: record.review_status,
  public_status_after_triage: "not_public",
  public_route_after_triage: null,
  stripe_url_after_triage: null,
  buyer_exposure_after_triage: "none",
  triage_notes: [
    "Do not approve public use from this triage step.",
    "Wrong-lane or missing audio must be repaired before internal approval.",
    "Text metadata may be useful, but audio must match theme and feeling."
  ]
}));

const counts = {};
for (const row of triage) {
  counts[row.quality_status] = (counts[row.quality_status] || 0) + 1;
}

const output = {
  status: "income_fill_sprint_01_quality_triage",
  name: "Income Fill Sprint 01 Quality Triage",
  source_candidates: inputPath,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  count: triage.length,
  counts,
  critical_warning:
    "This triage does not approve candidates. It identifies missing audio, wrong-lane audio, and review needs before any internal approval or public promotion.",
  approval_rule:
    "Only candidates with theme-matched audio and clean text review may advance to approve_internal. Public promotion remains a separate step.",
  triage
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("INCOME FILL SPRINT 01 QUALITY TRIAGE");
console.log(`count: ${triage.length}`);
for (const [k, v] of Object.entries(counts)) {
  console.log(`${k}: ${v}`);
}
console.log(`WROTE ${outputPath}`);
