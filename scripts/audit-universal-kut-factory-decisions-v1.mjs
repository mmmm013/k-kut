import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const jsonPath = "data/kut-inventory/processing/factory-decisions/universal-kut-factory-decisions-v1.json";
const mdPath = "data/kut-inventory/processing/factory-decisions/universal-kut-factory-decisions-v1.md";

if (!fs.existsSync(jsonPath)) fail(`Missing ${jsonPath}`);
if (!fs.existsSync(mdPath)) fail(`Missing ${mdPath}`);

if (fs.existsSync(jsonPath)) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  if (data.factoryMode !== true) fail("Factory mode must be true.");
  if (data.approveDoesNotMeanRelease !== true) fail("Approve must not mean release.");
  if (!Array.isArray(data.decisions) || data.decisions.length !== 4) fail("Expected 4 queue decisions.");

  const expected = ["UKUT-WO-003", "UKUT-WO-004", "UKUT-WO-005", "UKUT-WO-006"];
  for (const id of expected) {
    const d = data.decisions.find((x) => x.workOrderId === id);
    if (!d) fail(`Missing decision for ${id}`);
    if (d?.decision !== "approve-for-processing") fail(`${id} must be approve-for-processing.`);
    if (d?.approveMeans !== "processing-only-not-release") fail(`${id} approve meaning must be processing-only-not-release.`);
    if (d?.releaseReadyNow !== false) fail(`${id} must not be release-ready.`);
    if (d?.releaseGateAllowedNow !== false) fail(`${id} must not allow Release Gate.`);
  }

  if (!data.laneSummary?.approvedForProcessing?.includes("UKUT-WO-006")) {
    fail("Last decision UKUT-WO-006 must be preserved as approved-for-processing.");
  }

  if (data.renderAudioNow !== false) fail("Decision file must not render audio.");
  if (data.publicReadyNow !== false) fail("Decision file must not create public-ready state.");
  if (data.releaseReadyNow !== false) fail("Decision file must not create release-ready state.");
  if (data.outletReadyNow !== false) fail("Decision file must not create outlet-ready state.");
  if (data.releaseGateAllowedNow !== false) fail("Decision file must not allow Release Gate.");
}

if (failures.length) {
  console.error("UNIVERSAL KUT FACTORY DECISIONS AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("UNIVERSAL KUT FACTORY DECISIONS AUDIT: PASS");
console.log("Factory queue decisions saved; APPROVE is processing-only, not release-ready.");
