import fs from "node:fs";
import { execFileSync } from "node:child_process";

const lanePath = "data/kut-inventory/processing/linear-lanes/universal-kut-linear-factory-processing-lanes-v1.json";
const outJson = "data/kut-inventory/processing/linear-lanes/universal-kut-adjust-retest-drafts-v1.json";
const outMd = "data/kut-inventory/processing/linear-lanes/universal-kut-adjust-retest-drafts-v1.md";
const outDir = "review-sessions/processing/linear-lanes/adjust-retest";

fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(lanePath)) throw new Error(`Missing ${lanePath}`);

const lane = JSON.parse(fs.readFileSync(lanePath, "utf8"));
const adjustItems = lane.adjustOrRecut || [];

function durationSeconds(file) {
  try {
    const out = execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      file
    ], { encoding: "utf8" }).trim();
    return Number(out);
  } catch {
    return null;
  }
}

const renderedDrafts = [];
const blockedAdjustments = [];

for (const item of adjustItems) {
  const source = item.sourceAudioFile;
  const plan = item.adjustPlan || {};

  if (!fs.existsSync(source)) {
    blockedAdjustments.push({
      workOrderId: item.workOrderId,
      sourceCandidateNumber: item.sourceCandidateNumber,
      sourceAudioFile: source,
      blockedReason: "source-audio-file-missing",
      renderAudioNow: false
    });
    continue;
  }

  if (typeof plan.targetEndSeconds === "number") {
    const outputPath = `${outDir}/${item.workOrderId.toLowerCase()}-adjust-retest-draft.mp3`;

    execFileSync("ffmpeg", [
      "-y",
      "-hide_banner",
      "-loglevel", "error",
      "-ss", "0",
      "-t", String(plan.targetEndSeconds),
      "-i", source,
      "-acodec", "libmp3lame",
      "-q:a", "2",
      outputPath
    ], { stdio: "inherit" });

    renderedDrafts.push({
      workOrderId: item.workOrderId,
      sourceCandidateNumber: item.sourceCandidateNumber,
      sourceAudioFile: source,
      adjustmentType: "target-end-seconds",
      targetEndSeconds: plan.targetEndSeconds,
      outputPath,
      retestRequired: true,
      renderAudioNow: true,
      publicReadyNow: false,
      releaseReadyNow: false,
      releaseGateAllowedNow: false
    });

    continue;
  }

  if (typeof plan.tailExtensionSeconds === "number") {
    blockedAdjustments.push({
      workOrderId: item.workOrderId,
      sourceCandidateNumber: item.sourceCandidateNumber,
      sourceAudioFile: source,
      adjustmentType: "tail-extension",
      requiredTailExtensionSeconds: plan.tailExtensionSeconds,
      currentSourceDurationSeconds: durationSeconds(source),
      blockedReason: "needs-parent-or-untrimmed-source-tail; do-not-fake-with-silence",
      retestRequired: true,
      renderAudioNow: false,
      publicReadyNow: false,
      releaseReadyNow: false,
      releaseGateAllowedNow: false
    });
  }
}

const payload = {
  version: 1,
  role: "Universal KUT adjust-lane retest drafts",
  sourceLane: lanePath,
  renderedDraftCount: renderedDrafts.length,
  blockedAdjustmentCount: blockedAdjustments.length,
  renderedDrafts,
  blockedAdjustments,
  renderAudioNow: renderedDrafts.length > 0,
  renderedForRetestOnly: true,
  publicReadyNow: false,
  productReadyNow: false,
  releaseReadyNow: false,
  outletReadyNow: false,
  releaseGateAllowedNow: false,
  nextSystemStep: "retest-rendered-adjust-drafts-and-bind-parent-source-for-blocked-tail-extension"
};

fs.writeFileSync(outJson, JSON.stringify(payload, null, 2) + "\n");

let md = "# Universal KUT Adjust Retest Drafts v1\n\n";
md += "These are retest drafts only.\n\n";
md += "No public-ready, product-ready, outlet-ready, or release-ready state is created.\n\n";

md += "## Rendered retest drafts\n\n";
if (renderedDrafts.length) {
  for (const draft of renderedDrafts) {
    md += `- ${draft.workOrderId} / source ${draft.sourceCandidateNumber}: cut 0–${draft.targetEndSeconds}s → \`${draft.outputPath}\`\n`;
  }
} else {
  md += "- none\n";
}

md += "\n## Blocked adjustments\n\n";
if (blockedAdjustments.length) {
  for (const block of blockedAdjustments) {
    md += `- ${block.workOrderId} / source ${block.sourceCandidateNumber}: ${block.blockedReason}\n`;
  }
} else {
  md += "- none\n";
}

fs.writeFileSync(outMd, md.trimEnd() + "\n");

console.log("UNIVERSAL KUT ADJUST RETEST DRAFTS BUILT");
console.log(JSON.stringify({
  renderedDrafts: renderedDrafts.map((x) => x.workOrderId),
  blockedAdjustments: blockedAdjustments.map((x) => x.workOrderId),
  releaseReadyNow: false
}, null, 2));
