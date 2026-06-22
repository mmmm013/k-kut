import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const jsonPath = "data/kut-inventory/review/bug-human-review-outcome-v1.json";
const mdPath = "data/kut-inventory/review/bug-human-review-outcome-v1.md";
const doctrinePath = "records/doctrine/kut-candidate-next-in-line-not-release-ready.md";
const oldDoctrinePath = "records/doctrine/kut-candidate-next-in-line-not-approved.md";

if (fs.existsSync(oldDoctrinePath)) fail(`Old doctrine file name must not remain: ${oldDoctrinePath}`);
if (!fs.existsSync(doctrinePath)) fail(`Missing doctrine: ${doctrinePath}`);
if (!fs.existsSync(jsonPath)) fail(`Missing JSON: ${jsonPath}`);
if (!fs.existsSync(mdPath)) fail(`Missing markdown: ${mdPath}`);

if (fs.existsSync(jsonPath)) {
  const raw = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(raw);

  const forbiddenPatterns = [
    /"decision"\s*:\s*"approve"/,
    /"humanDecision"\s*:\s*"approve"/,
    /approveForProcessing/,
    /approvedForProcessing/,
    /approved-for-processing-not-public-bug-ready/
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(raw)) fail(`Forbidden old candidate status remains in JSON: ${pattern}`);
  }

  if (data.counts?.nextInLineKutCandidates !== 6) {
    fail("Expected 6 Next-in-line KUT Candidates from the human review export.");
  }

  if (!Array.isArray(data.nextInLineKutCandidates)) {
    fail("Missing nextInLineKutCandidates array.");
  } else {
    if (data.nextInLineKutCandidates.length !== 6) fail("nextInLineKutCandidates array must contain 6 items.");
    for (const item of data.nextInLineKutCandidates) {
      if (item.decision !== "next-in-line-kut-candidate") {
        fail(`Item ${item.bugHumanReviewNumber} must use next-in-line-kut-candidate decision.`);
      }
      if (item.releaseStatus !== "next-in-line-kut-candidate-not-release-ready") {
        fail(`Item ${item.bugHumanReviewNumber} must not be release-ready.`);
      }
      if (item.publicBugIndexAllowedNow !== false) {
        fail(`Item ${item.bugHumanReviewNumber} must not be public-ready now.`);
      }
      if (item.releaseGateAllowedNow !== false) {
        fail(`Item ${item.bugHumanReviewNumber} must not be release-ready now.`);
      }
    }
  }
}

if (fs.existsSync(mdPath)) {
  const md = fs.readFileSync(mdPath, "utf8");
  if (/Approved for processing|Approve for processing|approved-for-processing/.test(md)) {
    fail("Old visible candidate language remains in markdown.");
  }
}

if (failures.length) {
  console.error("KUT CANDIDATE NEXT-IN-LINE LANGUAGE AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("KUT CANDIDATE NEXT-IN-LINE LANGUAGE AUDIT: PASS");
console.log("Human-selected candidates are Next-in-line KUT Candidates, not release-ready items.");
