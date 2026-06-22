import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const discoveryPath = "data/audio-branding/gpmx-twinkle-source-discovery-v1.json";
const bindingPath = "data/audio-branding/gpmx-twinkle-source-binding-v1.json";
const ssotPath = "data/audio-branding/gpmx-signature-audio-branding-ssot.json";
const preferred = "public/signature/sti/gpm-sti-twinkle-v001-vol0275.mp3";

for (const p of [discoveryPath, bindingPath, ssotPath]) {
  if (!fs.existsSync(p)) fail(`Missing ${p}`);
}

if (fs.existsSync(discoveryPath)) {
  const d = JSON.parse(fs.readFileSync(discoveryPath, "utf8"));

  if (d.playableTwinkleFound !== true) fail("Playable Twinkle must be found.");
  if (!d.preferredCandidate) fail("preferredCandidate is required.");
  if (String(d.preferredCandidate).includes("\n")) fail("preferredCandidate must be one path, not a multiline blob.");
  if (!fs.existsSync(d.preferredCandidate)) fail(`preferredCandidate does not exist: ${d.preferredCandidate}`);
  if (!d.candidates?.includes(preferred)) fail(`Discovery must include STI preferred source: ${preferred}`);
}

if (fs.existsSync(bindingPath)) {
  const b = JSON.parse(fs.readFileSync(bindingPath, "utf8"));

  if (b.canonicalTwinkleSource !== preferred) fail(`Canonical Twinkle source must be ${preferred}.`);
  if (b.canonicalTwinkleSourceExists !== true) fail("Canonical Twinkle source must exist.");
  if (b.sourceClass !== "universal-sti-signature-source") fail("Twinkle source must be universal STI signature source.");
  if (b.requiredBeforeReleaseGate !== true) fail("Twinkle must be required before Release Gate.");
  if (b.appliesUniversally !== true) fail("Twinkle must apply universally.");
  if (b.productSpecific !== false) fail("Twinkle binding must not be product-specific.");
  if (b.releaseReadyNow !== false) fail("Binding must not create release-ready state.");
}

if (fs.existsSync(ssotPath)) {
  const ssot = JSON.parse(fs.readFileSync(ssotPath, "utf8"));

  if (ssot.canonicalTwinkleSource !== preferred) fail("SSOT must expose canonicalTwinkleSource.");
  if (ssot.gpmxTwinkleSourceBinding?.canonicalTwinkleSource !== preferred) fail("SSOT binding must point to canonical STI Twinkle.");
  if (ssot.gpmxTwinkleSourceBinding?.requiredBeforeReleaseGate !== true) fail("SSOT must keep Twinkle required before Release Gate.");
}

if (failures.length) {
  console.error("GPMx TWINKLE SOURCE DISCOVERY/BINDING AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("GPMx TWINKLE SOURCE DISCOVERY/BINDING AUDIT: PASS");
console.log("Canonical STI Twinkle is one playable path and is bound into the GPMx Signature Audio Branding SSOT.");
