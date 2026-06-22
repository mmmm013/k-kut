import fs from "node:fs";
import { execFileSync } from "node:child_process";

const decisionPath = "data/kut-inventory/processing/ukut-wo-002-boundary-human-decision-v1.json";
const outJson = "data/kut-inventory/processing/ukut-wo-002-exact-cut-drafts-v1.json";
const outMd = "data/kut-inventory/processing/ukut-wo-002-exact-cut-drafts-v1.md";

if (!fs.existsSync(decisionPath)) throw new Error(`Missing ${decisionPath}`);

const decision = JSON.parse(fs.readFileSync(decisionPath, "utf8"));

if (decision.workOrderId !== "UKUT-WO-002") throw new Error("Wrong work order.");
if (decision.releaseReadyNow !== false) throw new Error("Decision file must not be release-ready.");

const sourceAudio = "public/kks/thank-you/kks-expanded/thank-you-cc-010 2.mp3";
if (!fs.existsSync(sourceAudio)) throw new Error(`Missing source audio: ${sourceAudio}`);

const drafts = [
  {
    draftId: "UKUT-WO-002-DRAFT-BT-001",
    boundaryTargetId: "UKUT-WO-002-BT-001",
    label: "THANK YOU HOME short extract",
    startSeconds: 0,
    endSeconds: 5.5,
    durationSeconds: 5.5,
    humanDecision: "adjust-boundary",
    humanNote: "Adjusted to 5.5 seconds because the implied word 'You' was cut off; KKr must learn not to cut off phrases or sustaining notes.",
    outputPath: "review-sessions/processing/ukut-wo-002/audio/ukut-wo-002-bt-001-exact-cut-draft.mp3"
  },
  {
    draftId: "UKUT-WO-002-DRAFT-BT-002",
    boundaryTargetId: "UKUT-WO-002-BT-002",
    label: "THANK YOU phrase candidate",
    startSeconds: 0,
    endSeconds: 13.5,
    durationSeconds: 13.5,
    humanDecision: "adjust-boundary",
    humanNote: "Adjusted to 13.5 seconds because the end was cut off; add to CC.",
    outputPath: "review-sessions/processing/ukut-wo-002/audio/ukut-wo-002-bt-002-exact-cut-draft.mp3"
  }
];

for (const d of drafts) {
  execFileSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel", "error",
    "-ss", String(d.startSeconds),
    "-t", String(d.durationSeconds),
    "-i", sourceAudio,
    "-acodec", "libmp3lame",
    "-q:a", "2",
    d.outputPath
  ], { stdio: "inherit" });

  if (!fs.existsSync(d.outputPath)) throw new Error(`Failed to render ${d.outputPath}`);
}

const payload = {
  version: 1,
  role: "UKUT-WO-002 exact-cut draft renders",
  workOrderId: "UKUT-WO-002",
  sourceCandidateNumber: 10,
  sourceAudio,
  currentLane: "in-processing",
  draftType: "exact-cut-or-recut-draft",
  renderAudioNow: true,
  renderedForReviewOnly: true,

  paddingApplied: false,
  slightEndFadeApplied: false,
  twinkleApplied: false,
  gpmxSignatureAudioBrandingComplete: false,

  publicReadyNow: false,
  productReadyNow: false,
  releaseReadyNow: false,
  outletReadyNow: false,
  releaseGateAllowedNow: false,

  nextAllowedStep: "apply-required-padding-slight-end-fade-and-twinkle-before-processed-candidate-review",
  drafts
};

fs.writeFileSync(outJson, JSON.stringify(payload, null, 2) + "\n");

let md = "# UKUT-WO-002 Exact-Cut Drafts v1\n\n";
md += "These are exact-cut draft renders for processing review only.\n\n";
md += "They are not public KUTs.\n\n";
md += "They are not release-ready.\n\n";
md += "They do not yet include padding, slight end fade, or Twinkle / GPMx Signature Audio Branding.\n\n";

for (const d of drafts) {
  md += `## ${d.draftId}\n\n`;
  md += `Boundary target: ${d.boundaryTargetId}\n\n`;
  md += `Boundary: ${d.startSeconds}–${d.endSeconds} seconds\n\n`;
  md += `Output: \`${d.outputPath}\`\n\n`;
  md += `Human note: ${d.humanNote}\n\n`;
}

fs.writeFileSync(outMd, md.trimEnd() + "\n");

console.log("UKUT-WO-002 EXACT-CUT DRAFTS RENDERED");
console.log(JSON.stringify({
  renderedDrafts: drafts.length,
  releaseReadyNow: false,
  twinkleApplied: false,
  outputPaths: drafts.map(d => d.outputPath)
}, null, 2));
