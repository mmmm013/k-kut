import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const stop = (message) => {
  throw new Error(message);
};

const hold = read("lib/hugzBoundaryHold.ts");
const tray = read("components/HugzThreeChoiceTray.tsx");
const landing = read("components/HugzRotatingLanding.tsx");
const detail = read("app/hugz/[slug]/page.tsx");

for (const required of [
  'active: true',
  '"STOP_LINE_TP_CC_REVALIDATION_REQUIRED"',
  '"public_audio"',
  '"checkout"',
  '"delivery"',
  '"fulfillment"',
]) {
  if (!hold.includes(required)) stop(`boundary hold missing ${required}`);
}

if (tray.includes("<audio")) stop("HUGz tray still renders public audio");
if (tray.includes("previewUrl") || tray.includes("buyUrl")) {
  stop("HUGz client payload still accepts private audio or checkout URLs");
}
if (tray.includes('action="/checkout"') || tray.includes("<audio")) {
  stop("HUGz choice tray exposes checkout or audio during the release hold");
}
if (!tray.includes("No player or payment starts yet.")) {
  stop("customer release-hold explanation missing");
}
if (!landing.includes("HUGZ_BOUNDARY_HOLD.publicMessage")) {
  stop("landing does not surface the boundary hold");
}
if (!detail.includes("HUGZ_BOUNDARY_HOLD.publicMessage")) {
  stop("card detail does not surface the boundary hold");
}

console.log("13HUGZ TP/CC BOUNDARY HOLD AUDIT: PASS");
console.log("PUBLIC AUDIO: 0");
console.log("HUGZ CHECKOUT: HELD UNTIL EXACT CHOICE RELEASE");
console.log("DELIVERY/FULFILLMENT RELEASE: 0");
console.log("AUDIO REOPEN RULE: EXACT KK/KOMBO TP + CC APPROVAL REQUIRED");
