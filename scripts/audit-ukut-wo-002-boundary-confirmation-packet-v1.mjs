import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const packetPath = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-packet-v1.json";
const packetMdPath = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-packet-v1.md";

if (!fs.existsSync(packetPath)) fail(`Missing packet JSON: ${packetPath}`);
if (!fs.existsSync(packetMdPath)) fail(`Missing packet markdown: ${packetMdPath}`);

if (fs.existsSync(packetPath)) {
  const raw = fs.readFileSync(packetPath, "utf8");
  const packet = JSON.parse(raw);

  if (/approve/i.test(raw)) fail("Boundary packet must not use old candidate language.");
  if (packet.workOrderId !== "UKUT-WO-002") fail("Packet must be for UKUT-WO-002.");
  if (packet.currentLane !== "in-processing") fail("Packet must place UKUT-WO-002 in processing.");
  if (packet.renderAudioNow !== false) fail("Boundary packet must not render audio.");
  if (packet.releaseReadyNow !== false) fail("Boundary packet must not be release-ready.");
  if (packet.releaseGateAllowedNow !== false) fail("Boundary packet must not allow Release Gate.");

  if (!Array.isArray(packet.boundaryTargets) || packet.boundaryTargets.length !== 2) {
    fail("Packet must contain exactly two boundary targets.");
  }

  const ids = JSON.stringify(packet.boundaryTargets || []);
  if (!ids.includes("UKUT-WO-002-BT-001")) fail("Missing short thank-you extract boundary target.");
  if (!ids.includes("UKUT-WO-002-BT-002")) fail("Missing phrase candidate boundary target.");

  const required = JSON.stringify(packet.requiredAfterBoundaryConfirmation || []);
  for (const step of [
    "exact-cut-or-recut",
    "lead-tail-padding",
    "slight-end-fade",
    "twinkle-gpmx-signature-audio-branding",
    "bti-bf-review",
    "neutral-kut-canonicalization",
    "processed-candidate-review",
    "release-gate-or-recut-hold"
  ]) {
    if (!required.includes(step)) fail(`Missing required post-boundary step: ${step}`);
  }
}

if (fs.existsSync(packetMdPath)) {
  const md = fs.readFileSync(packetMdPath, "utf8");
  if (/Render allowed now: yes/i.test(md)) fail("Markdown must not allow render now.");
  if (/release-ready.*yes/i.test(md)) fail("Markdown must not mark release-ready.");
}

if (failures.length) {
  console.error("UKUT-WO-002 BOUNDARY CONFIRMATION PACKET AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("UKUT-WO-002 BOUNDARY CONFIRMATION PACKET AUDIT: PASS");
console.log("Boundary review packet exists; no audio rendered and no release-ready state created.");
