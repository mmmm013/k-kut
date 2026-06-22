import fs from "node:fs";

const shortlistPath = "data/kut-inventory/review/bug-human-review-playable-shortlist.json";
const ssotPath = "data/audio-branding/gpmx-signature-audio-branding-ssot.json";
const outJson = "data/kut-inventory/review/bug-human-review-outcome-v1.json";
const outMd = "data/kut-inventory/review/bug-human-review-outcome-v1.md";

const decisions = [
  { n: 1, decision: "approve", notes: "BUT JUST musical (INSTRO) piece. Study it & add it to the IN/O-PIX group, you think?" },
  { n: 2, decision: "hold", notes: "" },
  { n: 3, decision: "hold", notes: "Runs past proper TP into next BLK's vocal. So cut accurately." },
  { n: 4, decision: "hold", notes: "Cut off at line, like a bird, always flying. Do NOT start next vocal line." },
  { n: 5, decision: "reject", notes: "Start NOR End were accurate." },
  { n: 6, decision: "hold", notes: "See pattern of running PAST first SUB-TP, I guess we call these for kuts vs KKs. Lock & monitor." },
  { n: 7, decision: "hold", notes: "Cut out initial middle-of-line start, & use only NEXT Phrase, & NOT current following vocals." },
  { n: 8, decision: "hold", notes: "Start earlier, end at \"where the road may lead\", NOT abruptly." },
  { n: 9, decision: "reject", notes: "FAR TOO MANY lines!!!!!" },
  { n: 10, decision: "approve", notes: "Save this as unique. Should NEXT CC initial \"Yeah....Thank You\" vocal, which is initial vocal. 0:00-0:04 is TPs for this TRM/Salutation. NEED THAT thank you, to use & store among THANK YOUs HOME. Another kut CAN be start to 0:13, as a PHRZ." },
  { n: 11, decision: "hold", notes: "Almost, but cuts off in middle of LPR/LTR." },
  { n: 12, decision: "approve", notes: "Needs Twinkle" },
  { n: 13, decision: "hold", notes: "Almost perfect but is AS BIG as LTRs get, right? Catch that?" },
  { n: 14, decision: "approve", notes: "Uses \"her\" in 2nd line, so cannot be used for traditionally-male oriented uses. & add Twinkle." },
  { n: 15, decision: "hold", notes: "Should start at 0:08. Stop at 0:13.75." },
  { n: 16, decision: "approve", notes: "Twinkle" },
  { n: 17, decision: "hold", notes: "Stop 1 kut at :11. Also, Keep but add 1 second." },
  { n: 18, decision: "hold", notes: "Start at 3 seconds." },
  { n: 19, decision: "hold", notes: "Start at 7 seconds. Stop sooner, at 17 seconds." },
  { n: 20, decision: "hold", notes: "Create 1 kut at 8 seconds. Still use entire kut but cut off vocal in middle." },
  { n: 21, decision: "hold", notes: "Start at 3 seconds." },
  { n: 22, decision: "approve", notes: "" }
];

if (!fs.existsSync(shortlistPath)) throw new Error(`Missing shortlist: ${shortlistPath}`);
if (!fs.existsSync(ssotPath)) throw new Error(`Missing GPMx Signature Audio Branding SSOT: ${ssotPath}`);

const ssot = JSON.parse(fs.readFileSync(ssotPath, "utf8"));
const shortlist = JSON.parse(fs.readFileSync(shortlistPath, "utf8"));
const byNumber = new Map((shortlist.items || []).map((item) => [item.bugHumanReviewNumber, item]));

function tagsFor(d) {
  const notes = d.notes.toLowerCase();
  const tags = [];

  tags.push("requires-gpmx-signature-audio-branding");
  tags.push("requires-padding");
  tags.push("requires-end-fade");
  tags.push("requires-twinkle");

  if (notes.includes("twinkle")) tags.push("explicit-human-note-needs-twinkle");
  if (notes.includes("in/o-pix") || notes.includes("ino") || notes.includes("instro")) tags.push("route-in-o-pix-study");
  if (notes.includes("thank you")) tags.push("thank-you-home");
  if (notes.includes("0:00-0:04")) tags.push("trm-salutation-0-00-to-0-04");
  if (notes.includes("0:13")) tags.push("phrzkut-0-00-to-0-13");
  if (notes.includes("\"her\"") || notes.includes("her")) tags.push("gender-limited-her-line");
  if (notes.includes("start at")) tags.push("needs-start-trim");
  if (notes.includes("stop")) tags.push("needs-stop-trim");
  if (notes.includes("cut")) tags.push("needs-recut");
  if (notes.includes("too many lines")) tags.push("too-long-for-bug");

  return [...new Set(tags)];
}

function releaseStatusFor(d) {
  if (d.decision === "reject") return "rejected";
  if (d.decision === "hold") return "hold-needs-recut-or-review";
  return "approved-for-processing-not-public-bug-ready";
}

function signatureRequirement() {
  return {
    ssotPath,
    requiredBeforeReleaseGate: true,
    requiredBeforeOutlet: true,
    requiredAtProcessingIntake: true,
    requiredAtKkrToHomeRegistration: true,
    notOptional: true,
    notUponDemand: true,
    componentsRequired: {
      padding: ssot.components.padding.required === true,
      endFade: ssot.components.endFade.required === true,
      twinkle: ssot.components.twinkle.required === true
    },
    appliedNow: false,
    releaseBlockedUntilApplied: true,
    processingIntakeMustApply: true
  };
}

const ledger = decisions.map((d) => {
  const item = byNumber.get(d.n);
  if (!item) throw new Error(`Decision references missing item ${d.n}`);

  const tags = tagsFor(d);

  return {
    bugHumanReviewNumber: d.n,
    decision: d.decision,
    notes: d.notes,
    sourceAudioFile: item.sourceAudioFile,
    sourceAudioUrl: item.sourceAudioUrl,
    bugLane: item.bugLane,
    releaseStatus: releaseStatusFor(d),
    tags,
    gpmxSignatureAudioBranding: signatureRequirement(),
    publicBugIndexAllowedNow: false,
    releaseGateAllowedNow: false,
    outletAllowedNow: false,
    reasonPublicBugIndexBlocked: d.decision === "approve"
      ? "Approved for processing/classification only; still requires recut where applicable, GPMx Signature Audio Branding from SSOT, neutral KUT canonicalization, BTI/BF checks, and final release gate."
      : d.decision === "hold"
        ? "Hold item requires recut/timing/audio review and Signature Audio Branding before release."
        : "Rejected by human review.",
    requiredNextActions:
      d.decision === "approve"
        ? [
            "Preserve human notes.",
            "Process required trims/routing restrictions where applicable.",
            "Apply GPMx Signature Audio Branding from SSOT: padding, slight end fade, Twinkle.",
            "Canonicalize into neutral KUT inventory only after final audio pass.",
            "Run BUG Short-KUT audit before entering BUG eligible index."
          ]
        : d.decision === "hold"
          ? [
              "Create recut instruction from notes.",
              "Re-listen after recut.",
              "Apply GPMx Signature Audio Branding only after approved processing pass.",
              "Do not enter BUG eligible index."
            ]
          : [
              "Keep rejection record.",
              "Do not enter BUG eligible index."
            ]
  };
});

const approved = ledger.filter((x) => x.decision === "approve");
const holds = ledger.filter((x) => x.decision === "hold");
const rejects = ledger.filter((x) => x.decision === "reject");

const outcome = {
  version: 1,
  role: "BUG human review outcome v1",
  generatedAt: new Date().toISOString(),
  sourceShortlist: shortlistPath,
  signatureAudioBrandingSsot: ssotPath,
  publicBugIndexAllowedFromThisOutcome: false,
  releaseGateAllowedFromThisOutcome: false,
  outletAllowedFromThisOutcome: false,
  totalReviewed: ledger.length,
  counts: {
    approveForProcessing: approved.length,
    hold: holds.length,
    reject: rejects.length,
    publicBugReadyNow: 0,
    releaseReadyNow: 0
  },
  doctrine: {
    approveDoesNotEqualPublicBugReady: true,
    paddingTwinkleDpAreStisNotBugProductsByDefault: true,
    allReleaseBoundProductsRequireSignatureAudioBranding: true,
    signatureAudioBrandingIsNotOptional: true,
    signatureAudioBrandingIsNotUponDemand: true,
    bugRequiresShortKutOnly: true,
    bugPriceCents: 199,
    bugRepeatMax: 5,
    repeatedBugRequiresSchedule: true
  },
  requiredSignatureAudioBrandingBeforeRelease: {
    padding: true,
    slightEndFade: true,
    twinkle: true,
    ssotPath
  },
  approvedForProcessing: approved,
  recutOrHoldQueue: holds,
  rejected: rejects,
  fullLedger: ledger
};

fs.writeFileSync(outJson, JSON.stringify(outcome, null, 2) + "\n");

let md = "# BUG Human Review Outcome v1\n\n";
md += `Reviewed: ${ledger.length}\n\n`;
md += `- Approve for processing: ${approved.length}\n`;
md += `- Hold / recut: ${holds.length}\n`;
md += `- Reject: ${rejects.length}\n`;
md += `- Public BUG-ready now: 0\n`;
md += `- Release-ready now: 0\n\n`;
md += "Approve does **not** mean public BUG-ready. Approved items still require processing, BTI/BF limits, neutral KUT canonicalization, GPMx Signature Audio Branding, and final release gate.\n\n";
md += "## Required before release\n\n";
md += "- Padding\n";
md += "- Slight fade at KUT end\n";
md += "- Twinkle / GPMx Signature Audio Branding\n";
md += `- SSOT: \`${ssotPath}\`\n\n`;

md += "## Approved for processing\n\n";
for (const x of approved) {
  md += `### ${x.bugHumanReviewNumber}. ${x.sourceAudioFile}\n\n`;
  md += `Decision: ${x.decision}\n\n`;
  md += `Notes: ${x.notes || "(none)"}\n\n`;
  md += `Tags: ${x.tags.join(", ") || "(none)"}\n\n`;
  md += `Release blocked until Signature Audio Branding applied: yes\n\n`;
}

md += "## Hold / recut queue\n\n";
for (const x of holds) {
  md += `### ${x.bugHumanReviewNumber}. ${x.sourceAudioFile}\n\n`;
  md += `Notes: ${x.notes || "(none)"}\n\n`;
}

md += "## Rejected\n\n";
for (const x of rejects) {
  md += `### ${x.bugHumanReviewNumber}. ${x.sourceAudioFile}\n\n`;
  md += `Reason: ${x.notes || "(none)"}\n\n`;
}

fs.writeFileSync(outMd, md.trimEnd() + "\n");

console.log("BUG HUMAN REVIEW OUTCOME RECORDED WITH REQUIRED SIGNATURE AUDIO BRANDING");
console.log(`Reviewed: ${ledger.length}`);
console.log(`Approve for processing: ${approved.length}`);
console.log(`Hold / recut: ${holds.length}`);
console.log(`Reject: ${rejects.length}`);
console.log("Public BUG-ready now: 0");
console.log("Release-ready now: 0");
console.log(outJson);
console.log(outMd);
