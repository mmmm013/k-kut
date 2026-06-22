import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const rulePath = "data/kut-inventory/processing/kut-candidate-rolling-queue-rule-v1.json";
const doctrinePath = "records/doctrine/kut-candidate-rolling-queue-rule.md";
const outcomePath = "data/kut-inventory/review/bug-human-review-outcome-v1.json";

if (!fs.existsSync(rulePath)) fail(`Missing rolling queue rule: ${rulePath}`);
if (!fs.existsSync(doctrinePath)) fail(`Missing rolling queue doctrine: ${doctrinePath}`);
if (!fs.existsSync(outcomePath)) fail(`Missing candidate outcome file: ${outcomePath}`);

if (fs.existsSync(rulePath)) {
  const rule = JSON.parse(fs.readFileSync(rulePath, "utf8"));

  if (rule.noFixedApprovedPile !== true) fail("Rolling queue must forbid fixed approved pile.");
  if (rule.oldApprovedPileForbidden !== true) fail("Old approved pile must be forbidden.");
  if (rule.candidateState !== "next-in-line-kut-candidate") fail("Candidate state must be next-in-line-kut-candidate.");
  if (!rule.laneSequence?.includes("in-processing")) fail("Lane must include in-processing.");
  if (!rule.laneSequence?.includes("processed-candidate-review")) fail("Lane must include processed-candidate-review.");
  if (!rule.laneSequence?.includes("release-gate")) fail("Lane must include release-gate.");
  if (!rule.alternateLaneSequence?.includes("recut-or-hold")) fail("Alternate lane must include recut-or-hold.");
  if (rule.replacementRule?.whenCandidateMovesToProcessing !== "remove from next-in-line lane") {
    fail("Candidate must leave next-in-line lane when moved to processing.");
  }
  if (rule.signatureAudioBrandingStillRequired !== true) fail("Signature Audio Branding must remain required.");
  if (rule.releaseGateStillRequired !== true) fail("Release Gate must remain required.");
}

if (fs.existsSync(outcomePath)) {
  const raw = fs.readFileSync(outcomePath, "utf8");
  const outcome = JSON.parse(raw);

  if (/approved-for-processing|approveForProcessing|approvedForProcessing/.test(raw)) {
    fail("Old approved-processing language must not remain in candidate outcome JSON.");
  }

  if (outcome.counts?.nextInLineKutCandidates !== 6) {
    fail("Expected 6 Next-in-line KUT Candidates currently in candidate outcome.");
  }

  for (const item of outcome.nextInLineKutCandidates || []) {
    if (item.decision !== "next-in-line-kut-candidate") {
      fail(`Candidate ${item.bugHumanReviewNumber} must use next-in-line-kut-candidate state.`);
    }
    if (item.releaseGateAllowedNow !== false) {
      fail(`Candidate ${item.bugHumanReviewNumber} must not be release-gate-ready now.`);
    }
  }
}

if (failures.length) {
  console.error("KUT CANDIDATE ROLLING QUEUE AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("KUT CANDIDATE ROLLING QUEUE AUDIT: PASS");
console.log("No fixed approved pile; candidates move through a replenishing processing lane.");
