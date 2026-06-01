import fs from "node:fs";

const discoveryPath = "data/gpmc-sensory/income-fill/audio-discovery/income-fill-sprint-01-theme-audio-discovery.json";
const repairPath = "data/gpmc-sensory/income-fill/audio-repair/income-fill-sprint-01-audio-repair-plan.json";
const outputPath = "data/gpmc-sensory/income-fill/audio-intake/income-fill-sprint-01-audio-intake-needs.json";

const discovery = JSON.parse(fs.readFileSync(discoveryPath, "utf8"));
const repair = JSON.parse(fs.readFileSync(repairPath, "utf8"));

const themes = ["birthday", "encouragement_support", "friendship"];

const needs = themes.map((theme) => {
  const audioCount = discovery.themes?.[theme]?.candidate_audio_count || 0;
  const target = 8;
  const deficit = Math.max(0, target - audioCount);

  return {
    theme,
    target_theme_matched_audio_candidates: target,
    discovered_theme_audio_candidates: audioCount,
    audio_intake_deficit: deficit,
    need_status:
      deficit === 0
        ? "AUDIO_POOL_READY_FOR_REVIEW"
        : audioCount > 0
          ? "PARTIAL_AUDIO_INTAKE_NEEDED"
          : "FULL_AUDIO_INTAKE_NEEDED",
    intake_sources_allowed: [
      "existing unreleased GPMC audio",
      "approved PIX/KUT source files",
      "newly exported theme-matched KKs",
      "human-reviewed audio clips only"
    ],
    intake_sources_not_allowed: [
      "wrong-lane romance audio",
      "wrong-lane Mothers Day audio",
      "unreviewed AI audio",
      "public buyer exposure before approval"
    ],
    public_status_after_intake_plan: "not_public",
    public_route_after_intake_plan: null,
    stripe_url_after_intake_plan: null,
    buyer_exposure_after_intake_plan: "none",
    instruction:
      deficit === 0
        ? "Review discovered theme audio for match quality."
        : `Find or export ${deficit} theme-matched audio candidates for ${theme} before approve_internal.`
  };
});

const output = {
  status: "income_fill_sprint_01_audio_intake_needs",
  name: "Income Fill Sprint 01 Audio Intake Needs",
  source_theme_audio_discovery: discoveryPath,
  source_repair_plan: repairPath,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  target_per_theme: 8,
  total_audio_intake_deficit: needs.reduce((sum, n) => sum + n.audio_intake_deficit, 0),
  critical_warning:
    "This intake plan does not approve candidates, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_rule:
    "Only human-reviewed, theme-matched audio may repair internal candidates before approve_internal. Public promotion remains separate.",
  needs
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("INCOME FILL SPRINT 01 AUDIO INTAKE NEEDS");
console.log(`total_audio_intake_deficit: ${output.total_audio_intake_deficit}`);
for (const row of needs) {
  console.log(`${row.theme}: discovered=${row.discovered_theme_audio_candidates} deficit=${row.audio_intake_deficit} status=${row.need_status}`);
}
console.log(`WROTE ${outputPath}`);
