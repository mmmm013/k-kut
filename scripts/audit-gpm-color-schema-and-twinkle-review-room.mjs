import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const colorPath = "data/brand/gpm-color-schema-v1.json";
const doctrinePath = "records/doctrine/gpm-color-schema-required-for-review-rooms.md";
const roomPath = "review-sessions/processing/ukut-wo-002-boundary-confirmation-room-v1.html";
const roomJsonPath = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-room-v1.json";

if (!fs.existsSync(colorPath)) fail(`Missing GPM color schema: ${colorPath}`);
if (!fs.existsSync(doctrinePath)) fail(`Missing GPM color doctrine: ${doctrinePath}`);
if (!fs.existsSync(roomPath)) fail(`Missing playable room: ${roomPath}`);
if (!fs.existsSync(roomJsonPath)) fail(`Missing playable room JSON: ${roomJsonPath}`);

if (fs.existsSync(colorPath)) {
  const color = JSON.parse(fs.readFileSync(colorPath, "utf8"));
  if (color.requiredForReviewRooms !== true) fail("GPM color schema must be required for review rooms.");
  for (const key of ["gpmBlack", "gpmDeepGreen", "gpmGreen", "gpmGold", "gpmCream", "gpmSoftWhite"]) {
    if (!color.tokens?.[key]) fail(`Missing GPM color token: ${key}`);
  }
}

if (fs.existsSync(roomPath)) {
  const html = fs.readFileSync(roomPath, "utf8");

  for (const required of [
    "GPM-COLOR-SCHEMA-V1",
    "--gpm-black",
    "--gpm-green",
    "--gpm-gold",
    "Twinkle / GPMx Signature Audio Branding",
    "Sonic Branding Gate",
    "data/brand/gpm-color-schema-v1.json",
    "data/audio-branding/gpmx-signature-audio-branding-ssot.json"
  ]) {
    if (!html.includes(required)) fail(`Room missing required GPM/Twinkle marker: ${required}`);
  }

  if (/release-ready.*yes/i.test(html)) fail("Room must not mark release-ready.");
  if (/audio rendered.*yes/i.test(html)) fail("Room must not mark audio rendered.");
}

if (fs.existsSync(roomJsonPath)) {
  const room = JSON.parse(fs.readFileSync(roomJsonPath, "utf8"));
  if (room.gpmColorSchema !== colorPath) fail("Room JSON must bind GPM color schema.");
  if (room.signatureAudioBrandingSsot !== "data/audio-branding/gpmx-signature-audio-branding-ssot.json") {
    fail("Room JSON must bind GPMx Signature Audio Branding SSOT.");
  }
  if (room.twinkleRequiredBeforeRelease !== true) fail("Room JSON must require Twinkle before release.");
  if (room.releaseReadyNow !== false) fail("Room JSON must not mark release-ready.");
  if (room.renderAudioNow !== false) fail("Room JSON must not render audio.");
}

if (failures.length) {
  console.error("GPM COLOR SCHEMA + TWINKLE REVIEW ROOM AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("GPM COLOR SCHEMA + TWINKLE REVIEW ROOM AUDIT: PASS");
console.log("Playable room uses GPM color schema and exposes Twinkle / GPMx Signature Audio Branding gate.");
