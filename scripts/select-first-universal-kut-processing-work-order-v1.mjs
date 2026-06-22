import fs from "node:fs";

const workOrdersPath = "data/kut-inventory/processing/universal-kut-processing-work-orders-v1.json";
const outJson = "data/kut-inventory/processing/universal-kut-processing-first-move-v1.json";
const outMd = "data/kut-inventory/processing/universal-kut-processing-first-move-v1.md";

if (!fs.existsSync(workOrdersPath)) throw new Error(`Missing ${workOrdersPath}`);

const source = JSON.parse(fs.readFileSync(workOrdersPath, "utf8"));
const workOrders = source.workOrders || [];

if (workOrders.length !== 6) {
  throw new Error(`Expected 6 universal KUT work orders. Found ${workOrders.length}.`);
}

function score(wo) {
  let s = 0;
  const notes = String(wo.sourceNotes || "");
  const role = String(wo.candidateRoleHint || "");

  if (wo.sourceCandidateNumber === 10) s += 100;
  if (role.includes("thank-you-home-extract")) s += 50;
  if (wo.childTasks?.length) s += 25;
  if (/thank you/i.test(notes)) s += 25;
  if (/0:00|0:04|0:13/i.test(notes)) s += 15;
  if (role.includes("instrumental-study")) s -= 30;
  if (wo.restrictions?.some((r) => r.type === "BTI_CONTEXT_RESTRICTION")) s -= 40;

  return s;
}

const ranked = [...workOrders].map((wo) => ({
  workOrderId: wo.workOrderId,
  sourceCandidateNumber: wo.sourceCandidateNumber,
  sourceAudioFile: wo.sourceAudioFile,
  candidateRoleHint: wo.candidateRoleHint,
  sourceNotes: wo.sourceNotes,
  score: score(wo),
  releaseReadyNow: wo.releaseReadyNow,
  audioRenderedNow: wo.audioRenderedNow,
  productSpecific: wo.productSpecific,
  restrictions: wo.restrictions || [],
  childTasks: wo.childTasks || []
})).sort((a, b) => b.score - a.score);

const selected = ranked[0];
const selectedFull = workOrders.find((wo) => wo.workOrderId === selected.workOrderId);

if (!selectedFull) throw new Error("Selected work order not found.");

const payload = {
  version: 1,
  role: "First universal KUT processing move decision",
  sourceWorkOrdersFile: workOrdersPath,

  selectedWorkOrderId: selectedFull.workOrderId,
  selectedSourceCandidateNumber: selectedFull.sourceCandidateNumber,
  selectedSourceAudioFile: selectedFull.sourceAudioFile,

  fromLane: "next-in-line-kut-candidate",
  toLane: "in-processing",
  moveState: "authorized-first-move-to-in-processing",

  reason: "Best first move because it is a reusable neutral THANK YOU HOME extract with explicit human notes and child tasks, while still requiring all universal processing before any release decision.",

  noProductSpecificRelease: true,
  targetProduct: null,
  targetIntentContainer: null,

  audioRenderedNow: false,
  audioProcessedNow: false,
  publicReadyNow: false,
  productReadyNow: false,
  releaseReadyNow: false,
  outletReadyNow: false,
  releaseGateAllowedNow: false,

  requiredBeforeAnyReleaseDecision: [
    "boundary-confirmation",
    "exact-cut-or-recut",
    "lead-tail-padding",
    "slight-end-fade",
    "twinkle-gpmx-signature-audio-branding",
    "bti-bf-review",
    "neutral-kut-canonicalization",
    "processed-candidate-review",
    "release-gate-or-recut-hold"
  ],

  firstProcessingFocus: {
    primary: "review source candidate 10 as THANK YOU HOME extract",
    childTasks: selectedFull.childTasks || [],
    boundaryReviewRequired: true,
    renderAllowedNow: false,
    releaseDecisionAllowedNow: false
  },

  ranking: ranked
};

fs.writeFileSync(outJson, JSON.stringify(payload, null, 2) + "\n");

let md = "# Universal KUT Processing First Move v1\n\n";
md += `Selected work order: **${payload.selectedWorkOrderId}**\n\n`;
md += `Source candidate: **${payload.selectedSourceCandidateNumber}**\n\n`;
md += `Source audio: \`${payload.selectedSourceAudioFile}\`\n\n`;
md += "Move: `Next-in-line KUT Candidate → In processing`\n\n";
md += "Reason: reusable neutral THANK YOU HOME extract with explicit human direction and child tasks.\n\n";
md += "This does not render audio.\n\n";
md += "This does not make the item product-specific.\n\n";
md += "This does not make the item public-ready, release-ready, or outlet-ready.\n\n";
md += "## Required before any release decision\n\n";
for (const step of payload.requiredBeforeAnyReleaseDecision) {
  md += `- ${step}\n`;
}
md += "\n## Ranked work orders\n\n";
for (const r of ranked) {
  md += `- ${r.workOrderId} / source ${r.sourceCandidateNumber}: score ${r.score}; ${r.candidateRoleHint}\n`;
}

fs.writeFileSync(outMd, md.trimEnd() + "\n");

console.log("UNIVERSAL KUT FIRST MOVE SELECTED");
console.log(JSON.stringify({
  selectedWorkOrderId: payload.selectedWorkOrderId,
  selectedSourceCandidateNumber: payload.selectedSourceCandidateNumber,
  toLane: payload.toLane,
  audioRenderedNow: payload.audioRenderedNow,
  releaseReadyNow: payload.releaseReadyNow,
  productSpecific: payload.noProductSpecificRelease === false
}, null, 2));
console.log(outJson);
console.log(outMd);
