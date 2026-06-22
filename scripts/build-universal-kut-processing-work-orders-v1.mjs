import fs from "node:fs";

const outcomePath = "data/kut-inventory/review/bug-human-review-outcome-v1.json";
const ssotPath = "data/audio-branding/gpmx-signature-audio-branding-ssot.json";
const rollingRulePath = "data/kut-inventory/processing/kut-candidate-rolling-queue-rule-v1.json";

const outJson = "data/kut-inventory/processing/universal-kut-processing-work-orders-v1.json";
const outMd = "data/kut-inventory/processing/universal-kut-processing-work-orders-v1.md";

for (const p of [outcomePath, ssotPath, rollingRulePath]) {
  if (!fs.existsSync(p)) throw new Error(`Missing required source: ${p}`);
}

const outcome = JSON.parse(fs.readFileSync(outcomePath, "utf8"));
const ssot = JSON.parse(fs.readFileSync(ssotPath, "utf8"));
const rollingRule = JSON.parse(fs.readFileSync(rollingRulePath, "utf8"));

const candidates = outcome.nextInLineKutCandidates || [];

if (candidates.length !== 6) {
  throw new Error(`Expected 6 Next-in-line KUT Candidates. Found ${candidates.length}.`);
}

function sourceAudio(item) {
  return item.sourceAudioFile || item.sourceAudioPath || item.audioFile || item.path || "SOURCE_AUDIO_PENDING";
}

function candidateRoleHint(item) {
  const n = item.bugHumanReviewNumber;
  if (n === 1) return "neutral-instrumental-study-and-boundary-confirmation";
  if (n === 10) return "thank-you-home-extract-and-neutral-kut-canonicalization";
  return "neutral-kut-boundary-confirmation-and-signature-processing";
}

function restrictionNotes(item) {
  const notes = String(item.notes || "");
  const restrictions = [];

  if (/her/i.test(notes)) {
    restrictions.push({
      type: "BTI_CONTEXT_RESTRICTION",
      rule: "contains gendered reference; restrict use context until BTI confirms allowed placement"
    });
  }

  if (/twinkle/i.test(notes)) {
    restrictions.push({
      type: "SIGNATURE_AUDIO_REQUIRED",
      rule: "Twinkle specifically noted by human reviewer; still required universally for all release-bound processing"
    });
  }

  return restrictions;
}

function childTasks(item) {
  const n = item.bugHumanReviewNumber;
  if (n !== 10) return [];

  return [
    {
      childTaskId: "THANK-YOU-HOME-EXTRACT-001",
      boundaryInstruction: "review candidate 0:00–0:04 as TRM / salutation / thank-you extract",
      outputStatus: "not-rendered-not-release-ready"
    },
    {
      childTaskId: "THANK-YOU-HOME-EXTRACT-002",
      boundaryInstruction: "review candidate 0:00–0:13 as phrase candidate only if boundary is musically clean",
      outputStatus: "not-rendered-not-release-ready"
    }
  ];
}

const requiredProcessingSteps = [
  {
    step: "boundary-confirmation",
    required: true,
    status: "not-started",
    purpose: "confirm exact musical and lyric start/end before any render"
  },
  {
    step: "exact-cut-or-recut",
    required: true,
    status: "not-started",
    purpose: "create clean neutral KUT source candidate only after boundary confirmation"
  },
  {
    step: "lead-tail-padding",
    required: true,
    status: "not-started",
    ssot: ssotPath
  },
  {
    step: "slight-end-fade",
    required: true,
    status: "not-started",
    ssot: ssotPath
  },
  {
    step: "twinkle-gpmx-signature-audio-branding",
    required: true,
    status: "not-started",
    ssot: ssotPath
  },
  {
    step: "bti-bf-review",
    required: true,
    status: "not-started",
    purpose: "confirm branding template, restrictions, context, and guardrails"
  },
  {
    step: "neutral-kut-canonicalization",
    required: true,
    status: "not-started",
    purpose: "assign neutral KUT identity only after processing proof"
  },
  {
    step: "processed-candidate-review",
    required: true,
    status: "not-started",
    purpose: "human review after processing, before Release Gate"
  },
  {
    step: "release-gate-or-recut-hold",
    required: true,
    status: "blocked-until-processing-complete",
    purpose: "final decision lane; not available at work-order creation"
  }
];

const workOrders = candidates.map((item, index) => {
  const n = item.bugHumanReviewNumber;
  return {
    workOrderId: `UKUT-WO-${String(index + 1).padStart(3, "0")}`,
    sourceCandidateNumber: n,
    sourceHumanReviewState: "next-in-line-kut-candidate",
    sourceAudioFile: sourceAudio(item),
    sourceNotes: item.notes || "",
    candidateRoleHint: candidateRoleHint(item),

    workOrderState: "queued-for-universal-kut-processing",
    nextLaneWhenStarted: "in-processing",
    exitLanesAfterProcessing: [
      "processed-candidate-review",
      "recut-or-hold"
    ],

    universalKUTProcessingOnly: true,
    productSpecific: false,
    targetProduct: null,
    targetIntentContainer: null,

    audioRenderedNow: false,
    audioProcessedNow: false,
    publicReadyNow: false,
    productReadyNow: false,
    releaseReadyNow: false,
    outletReadyNow: false,
    releaseGateAllowedNow: false,

    candidateLeavesNextInLineWhenStarted: true,
    nextInLineReplacementRequiredAfterStart: true,

    requiredSignatureAudioBranding: {
      ssot: ssotPath,
      paddingRequired: true,
      slightEndFadeRequired: true,
      twinkleRequired: true,
      appliesUniversally: true
    },

    requiredProcessingSteps,
    restrictions: restrictionNotes(item),
    childTasks: childTasks(item),

    finalState: "not-release-ready"
  };
});

const payload = {
  version: 1,
  role: "Universal KUT processing work orders for Next-in-line KUT Candidates",
  createdFrom: "next-in-line-kut-candidate review outcome",
  sourceHumanReviewFile: outcomePath,
  rollingQueueRule: rollingRulePath,
  signatureAudioBrandingSsot: ssotPath,

  noProductSpecificRelease: true,
  noAudioRenderedByThisFile: true,
  noReleaseReadyItems: true,
  workOrderCount: workOrders.length,

  laneRule: {
    noFixedCandidatePile: rollingRule.noFixedApprovedPile === true,
    sourceLane: "next-in-line-kut-candidate",
    nextLane: "in-processing",
    afterProcessing: [
      "processed-candidate-review",
      "release-gate-or-recut-hold"
    ]
  },

  workOrders
};

fs.writeFileSync(outJson, JSON.stringify(payload, null, 2) + "\n");

let md = "# Universal KUT Processing Work Orders v1\n\n";
md += "These are universal KUT processing work orders for the 6 Next-in-line KUT Candidates.\n\n";
md += "They are not product-specific.\n\n";
md += "They do not create release-ready audio.\n\n";
md += "They do not render audio.\n\n";
md += "They move candidates toward controlled processing only.\n\n";
md += "## Required processing before any release decision\n\n";
md += "1. Boundary confirmation\n";
md += "2. Exact cut or recut\n";
md += "3. Lead/tail padding\n";
md += "4. Slight end fade\n";
md += "5. Twinkle / GPMx Signature Audio Branding\n";
md += "6. BTI/BF review\n";
md += "7. Neutral KUT canonicalization\n";
md += "8. Processed candidate review\n";
md += "9. Release Gate or Recut/Hold\n\n";

for (const wo of workOrders) {
  md += `## ${wo.workOrderId}\n\n`;
  md += `Source candidate: ${wo.sourceCandidateNumber}\n\n`;
  md += `Source audio: \`${wo.sourceAudioFile}\`\n\n`;
  md += `State: ${wo.workOrderState}\n\n`;
  md += `Role hint: ${wo.candidateRoleHint}\n\n`;
  md += `Release-ready now: no\n\n`;
  md += `Audio rendered now: no\n\n`;
  md += `Product-specific: no\n\n`;
  md += `Notes: ${wo.sourceNotes || "(none)"}\n\n`;

  if (wo.restrictions.length) {
    md += "Restrictions / controls:\n\n";
    for (const r of wo.restrictions) {
      md += `- ${r.type}: ${r.rule}\n`;
    }
    md += "\n";
  }

  if (wo.childTasks.length) {
    md += "Child tasks:\n\n";
    for (const task of wo.childTasks) {
      md += `- ${task.childTaskId}: ${task.boundaryInstruction}; ${task.outputStatus}\n`;
    }
    md += "\n";
  }
}

fs.writeFileSync(outMd, md.trimEnd() + "\n");

console.log("UNIVERSAL KUT PROCESSING WORK ORDERS BUILT");
console.log(JSON.stringify({
  workOrderCount: workOrders.length,
  audioRenderedNow: 0,
  releaseReadyNow: 0,
  productSpecific: 0
}, null, 2));
console.log(outJson);
console.log(outMd);
