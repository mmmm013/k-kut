import fs from "node:fs";

const triagePath = "data/gpmc-sensory/income-fill/quality/income-fill-sprint-01-quality-triage.json";
const outputPath = "data/gpmc-sensory/income-fill/audio-repair/income-fill-sprint-01-audio-repair-plan.json";

const triage = JSON.parse(fs.readFileSync(triagePath, "utf8"));
const rows = triage.triage || [];

const repairRows = rows.map((row) => {
  const needs =
    row.quality_status === "HOLD_FOR_AUDIO_REPAIR"
      ? "replace_wrong_lane_audio"
      : "discover_theme_matched_audio";

  return {
    record_id: row.record_id,
    theme: row.theme,
    current_audio_delivery_url: row.audio_delivery_url,
    current_audio_status: row.audio_status,
    current_quality_status: row.quality_status,
    repair_need: needs,
    required_audio_status_after_repair: "THEME_MATCHED_AUDIO_HINT_REVIEW_REQUIRED",
    public_status_after_repair_plan: "not_public",
    public_route_after_repair_plan: null,
    stripe_url_after_repair_plan: null,
    buyer_exposure_after_repair_plan: "none",
    repair_instruction:
      row.quality_status === "HOLD_FOR_AUDIO_REPAIR"
        ? "Remove wrong-lane audio hint and replace only with a theme-matched KK audio candidate."
        : "Find a theme-matched KK audio candidate from real source material before approval.",
    acceptance_rule:
      "Audio must match theme, feeling, and intended use before approve_internal. Public promotion remains separate."
  };
});

const counts = {};
for (const row of repairRows) {
  counts[row.repair_need] = (counts[row.repair_need] || 0) + 1;
}

const output = {
  status: "income_fill_sprint_01_audio_repair_plan",
  name: "Income Fill Sprint 01 Audio Repair Plan",
  source_triage: triagePath,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  count: repairRows.length,
  counts,
  critical_warning:
    "This plan does not approve candidates, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_rule:
    "Only theme-matched audio plus clean text review may advance a candidate to approve_internal.",
  repair: repairRows
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("INCOME FILL SPRINT 01 AUDIO REPAIR PLAN");
console.log(`count: ${repairRows.length}`);
for (const [k, v] of Object.entries(counts)) console.log(`${k}: ${v}`);
console.log(`WROTE ${outputPath}`);
