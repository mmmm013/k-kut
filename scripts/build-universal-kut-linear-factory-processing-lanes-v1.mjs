import fs from "node:fs";

const decisionsPath = "data/kut-inventory/processing/factory-decisions/universal-kut-linear-factory-decisions-v1.json";
const workOrdersPath = "data/kut-inventory/processing/universal-kut-processing-work-orders-v1.json";
const twinkleBindingPath = "data/audio-branding/gpmx-twinkle-source-binding-v1.json";

const outJson = "data/kut-inventory/processing/linear-lanes/universal-kut-linear-factory-processing-lanes-v1.json";
const outMd = "data/kut-inventory/processing/linear-lanes/universal-kut-linear-factory-processing-lanes-v1.md";

for (const p of [decisionsPath, workOrdersPath, twinkleBindingPath]) {
  if (!fs.existsSync(p)) throw new Error(`Missing required file: ${p}`);
}

const decisions = JSON.parse(fs.readFileSync(decisionsPath, "utf8"));
const workOrders = JSON.parse(fs.readFileSync(workOrdersPath, "utf8")).workOrders || [];
const twinkle = JSON.parse(fs.readFileSync(twinkleBindingPath, "utf8"));

function workOrder(id) {
  return workOrders.find((w) => w.workOrderId === id);
}

function normalizeAdjust(d) {
  const text = String(d.cutEndSeconds || d.note || "").trim();
  const lower = text.toLowerCase();

  const plan = {
    originalInstruction: text,
    targetEndSeconds: null,
    tailExtensionSeconds: null,
    retestRequired: true,
    needsSourceParentOrExtraTail: false
  };

  const stopAt = lower.match(/stop at\s+(\d+(?:\.\d+)?)/);
  if (stopAt) {
    plan.targetEndSeconds = Number(stopAt[1]);
  }

  if (lower.includes("1/3") || lower.includes("one third")) {
    plan.tailExtensionSeconds = 0.333;
    plan.needsSourceParentOrExtraTail = true;
  }

  return plan;
}

const accepted = [];
const adjust = [];

for (const d of decisions.decisions || []) {
  const wo = workOrder(d.workOrderId);
  if (!wo) throw new Error(`Missing work order for ${d.workOrderId}`);

  const base = {
    workOrderId: d.workOrderId,
    sourceCandidateNumber: d.sourceCandidateNumber,
    sourceAudioFile: d.sourceAudioFile || wo.sourceAudioFile,
    sourceNotes: wo.sourceNotes || "",
    candidateRoleHint: wo.candidateRoleHint || "",
    decision: d.decision,
    approveMeans: d.approveMeans || "processing-only-not-release",
    humanNote: d.note || d.cutEndSeconds || "",
    requiredProcessingSteps: [
      "exact-cut-or-recut",
      "lead-tail-padding",
      "slight-end-fade",
      "twinkle-gpmx-signature-audio-branding",
      "processed-candidate-review"
    ],
    twinkleSource: twinkle.canonicalTwinkleSource,
    paddingRequired: true,
    slightEndFadeRequired: true,
    twinkleRequired: true,
    renderAudioNow: false,
    publicReadyNow: false,
    releaseReadyNow: false,
    outletReadyNow: false,
    releaseGateAllowedNow: false
  };

  if (d.decision === "accept-for-processing") {
    accepted.push({
      ...base,
      lane: "accepted-for-processing",
      nextStep: "process-current-boundary-with-padding-fade-twinkle-then-review"
    });
  }

  if (d.decision === "adjust") {
    adjust.push({
      ...base,
      lane: "adjust-recut-required",
      adjustPlan: normalizeAdjust(d),
      nextStep: "render-adjusted-retest-draft-before-final-processing"
    });
  }
}

const payload = {
  version: 1,
  role: "Universal KUT linear factory processing lanes",
  sourceDecisions: decisionsPath,
  acceptedLaneCount: accepted.length,
  adjustLaneCount: adjust.length,
  acceptedForProcessing: accepted,
  adjustOrRecut: adjust,
  laneSummary: {
    acceptedForProcessing: accepted.map((x) => x.workOrderId),
    adjustOrRecut: adjust.map((x) => x.workOrderId)
  },
  renderAudioNow: false,
  publicReadyNow: false,
  releaseReadyNow: false,
  outletReadyNow: false,
  releaseGateAllowedNow: false,
  nextSystemStep: "render-adjusted-retest-drafts-for-adjust-lane-and-process-accepted-lane-with-signature-controls"
};

fs.writeFileSync(outJson, JSON.stringify(payload, null, 2) + "\n");

let md = "# Universal KUT Linear Factory Processing Lanes v1\n\n";
md += "Factory review is complete. This file splits the queue into processing lanes.\n\n";
md += "No item is public-ready, release-ready, or outlet-ready.\n\n";
md += "## Accepted for processing\n\n";
for (const item of accepted) {
  md += `- ${item.workOrderId} / source ${item.sourceCandidateNumber}\n`;
}
md += "\n## Adjust / recut before retest\n\n";
for (const item of adjust) {
  md += `- ${item.workOrderId} / source ${item.sourceCandidateNumber}: ${item.adjustPlan.originalInstruction}\n`;
}
md += "\n## Required before release\n\n";
md += "- exact cut or recut\n";
md += "- padding\n";
md += "- slight end fade\n";
md += "- Twinkle / GPMx Signature Audio Branding\n";
md += "- processed-candidate review\n";
md += "- Release Gate or Recut/Hold\n";

fs.writeFileSync(outMd, md.trimEnd() + "\n");

console.log("UNIVERSAL KUT LINEAR FACTORY PROCESSING LANES BUILT");
console.log(JSON.stringify({
  acceptedForProcessing: payload.laneSummary.acceptedForProcessing,
  adjustOrRecut: payload.laneSummary.adjustOrRecut,
  releaseReadyNow: false
}, null, 2));
