import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const htmlPath = "review-sessions/processing/universal-kut-processing-factory-room-v1.html";
const jsonPath = "data/kut-inventory/processing/universal-kut-processing-factory-room-v1.json";

if (!fs.existsSync(htmlPath)) fail(`Missing ${htmlPath}`);
if (!fs.existsSync(jsonPath)) fail(`Missing ${jsonPath}`);

if (fs.existsSync(jsonPath)) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  if (data.runtimeSafeDataBlock !== true) fail("Factory must use runtime-safe data block.");
  if (data.factoryMode !== true) fail("Factory mode must be true.");
  if (data.activeWorkbenchMode !== true) fail("Active workbench mode must be true.");
  if (data.plainDecisionButtonsRequired !== true) fail("Plain decision buttons must be required.");
  if (data.approveDoesNotMeanRelease !== true) fail("Approve must not mean release.");
  if (data.recutAdjustOpensRequiredForm !== true) fail("Recut/adjust must open required form.");
  if (data.finishSaveRequiredAtEndOfQueue !== true) fail("Finish/save must be required at end of queue.");
  if (!Array.isArray(data.activeQueue) || data.activeQueue.length < 1) fail("Active queue must exist.");
  if (data.releaseReadyNow !== false) fail("Factory room must not mark release-ready.");
  if (data.releaseGateAllowedNow !== false) fail("Factory room must not allow Release Gate.");
}

if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, "utf8");

  for (const marker of [
    'id="queue-data"',
    "renderActiveCandidate();",
    "APPROVE FOR PROCESSING",
    "NEEDS RECUT / ADJUST",
    "HOLD",
    "REJECT",
    "SAVE RECUT / ADJUST AND GO NEXT",
    "FINISH / SAVE FACTORY DECISIONS",
    "process-approved-items-and-recut-adjust-items-by-lane"
  ]) {
    if (!html.includes(marker)) fail(`Factory workbench missing marker: ${marker}`);
  }

  if (html.includes("${queueJson}")) fail("HTML must not contain unexpanded queueJson template marker.");
  if (html.includes("${JSON.stringify")) fail("HTML must not contain unexpanded nested template marker.");
  if (/APPROVE FOR RELEASE/i.test(html)) fail("Factory must not say APPROVE FOR RELEASE.");
}

if (failures.length) {
  console.error("UNIVERSAL KUT PROCESSING FACTORY WORKBENCH AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("UNIVERSAL KUT PROCESSING FACTORY WORKBENCH AUDIT: PASS");
console.log("Factory workbench is runtime-safe: no dead Loading state, plain controls, recut lane, finish/save step.");
