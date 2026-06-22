import fs from "node:fs";

const firstMovePath = "data/kut-inventory/processing/universal-kut-processing-first-move-v1.json";
const workOrdersPath = "data/kut-inventory/processing/universal-kut-processing-work-orders-v1.json";

const outJson = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-packet-v1.json";
const outMd = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-packet-v1.md";

for (const p of [firstMovePath, workOrdersPath]) {
  if (!fs.existsSync(p)) throw new Error(`Missing required file: ${p}`);
}

const firstMove = JSON.parse(fs.readFileSync(firstMovePath, "utf8"));
const workOrders = JSON.parse(fs.readFileSync(workOrdersPath, "utf8")).workOrders || [];

if (firstMove.selectedWorkOrderId !== "UKUT-WO-002") {
  throw new Error("First move is not UKUT-WO-002.");
}

const wo = workOrders.find((x) => x.workOrderId === "UKUT-WO-002");
if (!wo) throw new Error("Missing UKUT-WO-002 in work orders.");

const packet = {
  version: 1,
  role: "Boundary confirmation packet for first in-processing universal KUT work order",

  workOrderId: "UKUT-WO-002",
  sourceCandidateNumber: 10,
  sourceAudioFile: wo.sourceAudioFile,
  currentLane: "in-processing",

  purpose: "Confirm exact boundaries before any audio render, padding, fade, Twinkle, canonical KUT assignment, or Release Gate decision.",

  renderAudioNow: false,
  audioProcessedNow: false,
  publicReadyNow: false,
  releaseReadyNow: false,
  outletReadyNow: false,
  releaseGateAllowedNow: false,

  boundaryTargets: [
    {
      boundaryTargetId: "UKUT-WO-002-BT-001",
      label: "THANK YOU HOME short extract",
      proposedStart: "0:00",
      proposedEnd: "0:04",
      humanNote: "Save 0:00–0:04 as TRM / salutation / thank-you extract.",
      requiredDecision: "confirm, adjust, or reject boundary before rendering",
      renderAllowedNow: false
    },
    {
      boundaryTargetId: "UKUT-WO-002-BT-002",
      label: "THANK YOU phrase candidate",
      proposedStart: "0:00",
      proposedEnd: "0:13",
      humanNote: "Possible phrase candidate only if the boundary is musically clean.",
      requiredDecision: "confirm, adjust, or reject boundary before rendering",
      renderAllowedNow: false
    }
  ],

  requiredAfterBoundaryConfirmation: [
    "exact-cut-or-recut",
    "lead-tail-padding",
    "slight-end-fade",
    "twinkle-gpmx-signature-audio-branding",
    "bti-bf-review",
    "neutral-kut-canonicalization",
    "processed-candidate-review",
    "release-gate-or-recut-hold"
  ]
};

fs.writeFileSync(outJson, JSON.stringify(packet, null, 2) + "\n");

let md = "# UKUT-WO-002 Boundary Confirmation Packet v1\n\n";
md += "This packet moves UKUT-WO-002 into boundary review only.\n\n";
md += "It does not render audio.\n\n";
md += "It does not make the candidate release-ready.\n\n";
md += `Source audio: \`${packet.sourceAudioFile}\`\n\n`;

for (const target of packet.boundaryTargets) {
  md += `## ${target.boundaryTargetId}\n\n`;
  md += `Label: ${target.label}\n\n`;
  md += `Proposed boundary: ${target.proposedStart}–${target.proposedEnd}\n\n`;
  md += `Human note: ${target.humanNote}\n\n`;
  md += "Render allowed now: no\n\n";
}

md += "## Required after boundary confirmation\n\n";
for (const step of packet.requiredAfterBoundaryConfirmation) {
  md += `- ${step}\n`;
}

fs.writeFileSync(outMd, md.trimEnd() + "\n");

console.log("UKUT-WO-002 BOUNDARY CONFIRMATION PACKET BUILT");
console.log(outJson);
console.log(outMd);
