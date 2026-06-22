import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const roomPath = "review-sessions/processing/ukut-wo-002-boundary-confirmation-room-v1.html";
const jsonPath = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-room-v1.json";
const mdPath = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-room-v1.md";

for (const p of [roomPath, jsonPath, mdPath]) {
  if (!fs.existsSync(p)) fail(`Missing boundary room artifact: ${p}`);
}

if (fs.existsSync(jsonPath)) {
  const raw = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(raw);

  if (/approve/i.test(raw)) fail("Boundary room JSON must not contain old candidate label.");
  if (data.workOrderId !== "UKUT-WO-002") fail("Room must be for UKUT-WO-002.");
  if (data.boundaryTargets?.length !== 2) fail("Room must contain exactly two boundary targets.");
  if (!raw.includes("UKUT-WO-002-BT-001")) fail("Missing BT-001.");
  if (!raw.includes("UKUT-WO-002-BT-002")) fail("Missing BT-002.");
  if (data.renderAudioNow !== false) fail("Room must not render audio.");
  if (data.releaseReadyNow !== false) fail("Room must not mark release-ready.");
  if (data.releaseGateAllowedNow !== false) fail("Room must not allow Release Gate.");
}

if (fs.existsSync(roomPath)) {
  const html = fs.readFileSync(roomPath, "utf8");
  if (!html.includes("<audio")) fail("HTML room must include audio player.");
  if (!html.includes("UKUT-WO-002-BT-001")) fail("HTML missing BT-001.");
  if (!html.includes("UKUT-WO-002-BT-002")) fail("HTML missing BT-002.");
  if (/release-ready.*yes/i.test(html)) fail("HTML must not mark release-ready.");
  if (/audio render.*yes/i.test(html)) fail("HTML must not mark audio rendered.");
}

if (failures.length) {
  console.error("UKUT-WO-002 BOUNDARY CONFIRMATION ROOM AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("UKUT-WO-002 BOUNDARY CONFIRMATION ROOM AUDIT: PASS");
console.log("Playable boundary room exists; review only, no render and no release-ready state.");
