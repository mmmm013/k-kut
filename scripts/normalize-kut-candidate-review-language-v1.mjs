import fs from "node:fs";

const jsonPath = "data/kut-inventory/review/bug-human-review-outcome-v1.json";
const mdPath = "data/kut-inventory/review/bug-human-review-outcome-v1.md";

if (!fs.existsSync(jsonPath)) throw new Error(`Missing ${jsonPath}`);

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

function normalizeString(value) {
  return String(value)
    .replaceAll("approved-for-processing-not-public-bug-ready", "next-in-line-kut-candidate-not-release-ready")
    .replaceAll("Approved for processing", "Next-in-line KUT Candidate")
    .replaceAll("approved for processing", "next-in-line KUT Candidate")
    .replaceAll("Approve for processing", "Next-in-line KUT Candidate")
    .replaceAll("approve for processing", "next-in-line KUT Candidate")
    .replaceAll("Approved items", "Next-in-line KUT Candidates")
    .replaceAll("approved items", "next-in-line KUT Candidates");
}

function walk(value) {
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      let key = k;
      if (key === "approveForProcessing") key = "nextInLineKutCandidates";
      if (key === "approvedForProcessing") key = "nextInLineKutCandidates";
      if (key === "approveDoesNotEqualPublicBugReady") key = "nextInLineKutCandidateDoesNotEqualReleaseReady";
      out[key] = walk(v);
    }
    return out;
  }
  if (typeof value === "string") return normalizeString(value);
  return value;
}

const normalized = walk(data);

const nextItems = [];

function normalizeItem(item) {
  const copy = { ...item };

  if (copy.decision === "approve") copy.decision = "next-in-line-kut-candidate";
  if (copy.humanDecision === "approve") copy.humanDecision = "next-in-line-kut-candidate";

  if (copy.decision === "next-in-line-kut-candidate") {
    copy.candidateState = "next-in-line-kut-candidate";
    copy.releaseStatus = "next-in-line-kut-candidate-not-release-ready";
    copy.publicBugIndexAllowedNow = false;
    copy.releaseGateAllowedNow = false;
    copy.outletAllowedNow = false;
  }

  return copy;
}

if (Array.isArray(normalized.fullLedger)) {
  normalized.fullLedger = normalized.fullLedger.map((item) => {
    const n = normalizeItem(item);
    if (n.decision === "next-in-line-kut-candidate") nextItems.push(n);
    return n;
  });
}

const oldCandidateList = Array.isArray(normalized.nextInLineKutCandidates)
  ? normalized.nextInLineKutCandidates
  : [];

const merged = new Map();
for (const item of [...oldCandidateList, ...nextItems]) {
  const n = normalizeItem(item);
  merged.set(n.bugHumanReviewNumber, n);
}

normalized.nextInLineKutCandidates = [...merged.values()].sort(
  (a, b) => a.bugHumanReviewNumber - b.bugHumanReviewNumber
);

delete normalized.approvedForProcessing;

normalized.counts = normalized.counts || {};
delete normalized.counts.approveForProcessing;
normalized.counts.nextInLineKutCandidates = normalized.nextInLineKutCandidates.length;
normalized.counts.publicBugReadyNow = 0;
normalized.counts.releaseReadyNow = 0;

normalized.statusLanguage = {
  candidateState: "next-in-line-kut-candidate",
  releaseMeaning: "not public-ready, not release-ready, not outlet-ready",
  oldCandidateStateForbidden: true
};

fs.writeFileSync(jsonPath, JSON.stringify(normalized, null, 2) + "\n");

let md = "# BUG Human Review Outcome v1\n\n";
md += `Reviewed: ${normalized.totalReviewed}\n\n`;
md += `- Next-in-line KUT Candidates: ${normalized.counts.nextInLineKutCandidates}\n`;
md += `- Hold / recut: ${normalized.counts.hold}\n`;
md += `- Reject: ${normalized.counts.reject}\n`;
md += `- Public BUG-ready now: 0\n`;
md += `- Release-ready now: 0\n\n`;
md += "Next-in-line KUT Candidate does **not** mean public-ready or release-ready. Each candidate still requires exact cut/recut, GPMx Signature Audio Branding, BTI/BF checks, neutral KUT canonicalization, and final Release Gate / Outlet decision.\n\n";

md += "## Required before release\n\n";
md += "- Padding\n";
md += "- Slight fade at KUT end\n";
md += "- Twinkle / GPMx Signature Audio Branding\n";
md += `- SSOT: \`${normalized.requiredSignatureAudioBrandingBeforeRelease?.ssotPath || normalized.signatureAudioBrandingSsot}\`\n\n`;

md += "## Next-in-line KUT Candidates\n\n";
for (const x of normalized.nextInLineKutCandidates) {
  md += `### ${x.bugHumanReviewNumber}. ${x.sourceAudioFile}\n\n`;
  md += `State: Next-in-line KUT Candidate\n\n`;
  md += `Notes: ${x.notes || "(none)"}\n\n`;
  md += `Release-ready now: no\n\n`;
}

md += "## Hold / recut queue\n\n";
for (const x of normalized.recutOrHoldQueue || []) {
  md += `### ${x.bugHumanReviewNumber}. ${x.sourceAudioFile}\n\n`;
  md += `Notes: ${x.notes || "(none)"}\n\n`;
}

md += "## Rejected\n\n";
for (const x of normalized.rejected || []) {
  md += `### ${x.bugHumanReviewNumber}. ${x.sourceAudioFile}\n\n`;
  md += `Reason: ${x.notes || "(none)"}\n\n`;
}

fs.writeFileSync(mdPath, md.trimEnd() + "\n");

console.log("KUT candidate state normalized.");
console.log(`Next-in-line KUT Candidates: ${normalized.counts.nextInLineKutCandidates}`);
console.log(jsonPath);
console.log(mdPath);
