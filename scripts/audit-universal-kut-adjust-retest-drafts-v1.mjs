import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const jsonPath = "data/kut-inventory/processing/linear-lanes/universal-kut-adjust-retest-drafts-v1.json";
const mdPath = "data/kut-inventory/processing/linear-lanes/universal-kut-adjust-retest-drafts-v1.md";

if (!fs.existsSync(jsonPath)) fail(`Missing ${jsonPath}`);
if (!fs.existsSync(mdPath)) fail(`Missing ${mdPath}`);

if (fs.existsSync(jsonPath)) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const wo006 = data.renderedDrafts?.find((x) => x.workOrderId === "UKUT-WO-006");
  const wo005 = data.blockedAdjustments?.find((x) => x.workOrderId === "UKUT-WO-005");

  if (!wo006) fail("UKUT-WO-006 must have a rendered retest draft.");
  if (wo006?.targetEndSeconds !== 4) fail("UKUT-WO-006 retest must cut at 4 seconds.");
  if (wo006?.outputPath && !fs.existsSync(wo006.outputPath)) fail(`Missing WO-006 retest audio: ${wo006.outputPath}`);

  if (!wo005) fail("UKUT-WO-005 must be blocked until parent/untrimmed source tail is bound.");
  if (wo005?.requiredTailExtensionSeconds !== 0.333) fail("UKUT-WO-005 must preserve 1/3-second tail request.");
  if (!String(wo005?.blockedReason || "").includes("do-not-fake-with-silence")) fail("WO-005 must not be faked with silence.");

  if (data.renderedForRetestOnly !== true) fail("Drafts must be retest-only.");
  if (data.publicReadyNow !== false) fail("Must not create public-ready state.");
  if (data.releaseReadyNow !== false) fail("Must not create release-ready state.");
  if (data.releaseGateAllowedNow !== false) fail("Must not allow Release Gate.");
}

if (failures.length) {
  console.error("UNIVERSAL KUT ADJUST RETEST DRAFTS AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("UNIVERSAL KUT ADJUST RETEST DRAFTS AUDIT: PASS");
console.log("WO-006 rendered for retest; WO-005 correctly blocked for parent-source tail. No release-ready state.");
