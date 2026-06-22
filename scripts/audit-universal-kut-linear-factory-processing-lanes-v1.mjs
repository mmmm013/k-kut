import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const lanePath = "data/kut-inventory/processing/linear-lanes/universal-kut-linear-factory-processing-lanes-v1.json";
const laneMdPath = "data/kut-inventory/processing/linear-lanes/universal-kut-linear-factory-processing-lanes-v1.md";

if (!fs.existsSync(lanePath)) fail(`Missing ${lanePath}`);
if (!fs.existsSync(laneMdPath)) fail(`Missing ${laneMdPath}`);

if (fs.existsSync(lanePath)) {
  const data = JSON.parse(fs.readFileSync(lanePath, "utf8"));

  if (data.acceptedLaneCount !== 2) fail("Expected 2 accepted-for-processing items.");
  if (data.adjustLaneCount !== 2) fail("Expected 2 adjust/recut items.");

  for (const id of ["UKUT-WO-003", "UKUT-WO-004"]) {
    if (!data.laneSummary.acceptedForProcessing.includes(id)) fail(`Missing accepted item ${id}`);
  }

  for (const id of ["UKUT-WO-005", "UKUT-WO-006"]) {
    if (!data.laneSummary.adjustOrRecut.includes(id)) fail(`Missing adjust item ${id}`);
  }

  const wo005 = data.adjustOrRecut.find((x) => x.workOrderId === "UKUT-WO-005");
  const wo006 = data.adjustOrRecut.find((x) => x.workOrderId === "UKUT-WO-006");

  if (wo005?.adjustPlan?.tailExtensionSeconds !== 0.333) fail("UKUT-WO-005 must preserve 1/3-second tail adjustment.");
  if (wo005?.adjustPlan?.retestRequired !== true) fail("UKUT-WO-005 must require retest.");
  if (wo006?.adjustPlan?.targetEndSeconds !== 4) fail("UKUT-WO-006 must preserve stop-at-4-seconds adjustment.");
  if (wo006?.adjustPlan?.retestRequired !== true) fail("UKUT-WO-006 must require retest.");

  for (const item of [...data.acceptedForProcessing, ...data.adjustOrRecut]) {
    if (item.paddingRequired !== true) fail(`${item.workOrderId} must require padding.`);
    if (item.slightEndFadeRequired !== true) fail(`${item.workOrderId} must require slight end fade.`);
    if (item.twinkleRequired !== true) fail(`${item.workOrderId} must require Twinkle.`);
    if (item.releaseReadyNow !== false) fail(`${item.workOrderId} must not be release-ready.`);
    if (item.releaseGateAllowedNow !== false) fail(`${item.workOrderId} must not allow Release Gate.`);
  }

  if (data.renderAudioNow !== false) fail("Lane compiler must not render audio now.");
  if (data.releaseReadyNow !== false) fail("Lane compiler must not create release-ready state.");
  if (data.releaseGateAllowedNow !== false) fail("Lane compiler must not allow Release Gate.");
}

if (failures.length) {
  console.error("UNIVERSAL KUT LINEAR FACTORY PROCESSING LANES AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("UNIVERSAL KUT LINEAR FACTORY PROCESSING LANES AUDIT: PASS");
console.log("Linear factory decisions split into accepted and adjust lanes; no release-ready state created.");
