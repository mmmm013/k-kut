import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const htmlPath = "review-sessions/processing/ukut-wo-002-boundary-confirmation-room-v1.html";
const roomJsonPath = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-room-v1.json";
const decisionPath = "data/kut-inventory/processing/ukut-wo-002-boundary-human-decision-v1.json";
const decisionMdPath = "data/kut-inventory/processing/ukut-wo-002-boundary-human-decision-v1.md";

for (const p of [htmlPath, roomJsonPath, decisionPath, decisionMdPath]) {
  if (!fs.existsSync(p)) fail(`Missing ${p}`);
}

if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, "utf8");

  for (const marker of [
    "AUTO_ADVANCE_ENABLED",
    "nextTarget",
    "previousTarget",
    "copyTerminalSaveCommand",
    "terminal-safe save command",
    "localStorage",
    "activeTargetIndex"
  ]) {
    if (!html.includes(marker)) fail(`Room missing navigation/save marker: ${marker}`);
  }

  if (/release-ready.*yes/i.test(html)) fail("Room must not mark release-ready.");
}

if (fs.existsSync(roomJsonPath)) {
  const room = JSON.parse(fs.readFileSync(roomJsonPath, "utf8"));
  if (room.autoAdvanceOnDecision !== true) fail("Room JSON must require auto-advance on decision.");
  if (room.manualNextButton !== true) fail("Room JSON must require manual Next button.");
  if (room.terminalSafeSaveCommandButton !== true) fail("Room JSON must require terminal-safe save command button.");
  if (room.doNotPasteRawNotesIntoTerminal !== true) fail("Room JSON must block raw notes into Terminal.");
  if (room.releaseReadyNow !== false) fail("Room must not be release-ready.");
}

if (fs.existsSync(decisionPath)) {
  const data = JSON.parse(fs.readFileSync(decisionPath, "utf8"));
  const bt001 = data.decisions?.find((d) => d.boundaryTargetId === "UKUT-WO-002-BT-001");
  const bt002 = data.decisions?.find((d) => d.boundaryTargetId === "UKUT-WO-002-BT-002");

  if (!bt001) fail("Missing BT-001 human decision.");
  if (!bt002) fail("Missing BT-002 human decision.");

  if (bt001?.decision !== "adjust-boundary") fail("BT-001 must be adjusted, not confirmed.");
  if (bt001?.adjustedEnd !== "0:05.5") fail("BT-001 adjusted end must be 0:05.5.");
  if (!/NOT cut off phrases|sustaining notes/i.test(bt001?.humanNote || "")) {
    fail("BT-001 must preserve KKr learning note about not cutting off phrases/sustaining notes.");
  }

  if (bt002?.decision !== "adjust-boundary") fail("BT-002 must be adjusted.");
  if (bt002?.adjustedEnd !== "0:13.5") fail("BT-002 adjusted end must be 0:13.5.");

  if (data.renderAudioNow !== false) fail("Human decision must not render audio.");
  if (data.releaseReadyNow !== false) fail("Human decision must not create release-ready state.");
  const allowedNextSteps = [
    "exact-cut-or-recut-after-human-boundary-decisions",
    "render-adjusted-exact-cut-review-drafts-and-show-next-candidate"
  ];

  if (!allowedNextSteps.includes(data.nextAllowedStep)) {
    fail("Next allowed step must be exact cut/recut or factory render-and-next-candidate flow.");
  }

  if (data.factoryMode !== true) {
    fail("Factory mode must be true after reviewer requested next-candidate flow.");
  }
}

if (failures.length) {
  console.error("UKUT-WO-002 ROOM NAVIGATION + HUMAN DECISION AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("UKUT-WO-002 ROOM NAVIGATION + HUMAN DECISION AUDIT: PASS");
console.log("Decision buttons auto-advance, Next exists, terminal-safe save exists, BT-001 adjusted to 5.5s, BT-002 adjusted to 13.5s; factory mode avoids raw Terminal notes.");
