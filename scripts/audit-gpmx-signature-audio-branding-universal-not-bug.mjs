import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const forbidden = [
  "data/kut-inventory/processing/bug-signature-processing-intake-v1.json",
  "data/kut-inventory/processing/bug-signature-processing-intake-v1.md",
  "scripts/build-bug-signature-processing-intake-v1.mjs",
  "scripts/audit-bug-signature-processing-intake-v1.mjs"
];

for (const f of forbidden) {
  if (fs.existsSync(f)) fail(`BUG-specific signature file must not exist: ${f}`);
}

const ssotPath = "data/audio-branding/gpmx-signature-audio-branding-ssot.json";
const universalPath = "data/audio-branding/processing/gpmx-release-bound-signature-processing-intake-v1.json";

if (!fs.existsSync(ssotPath)) fail(`Missing SSOT: ${ssotPath}`);
if (!fs.existsSync(universalPath)) fail(`Missing universal control: ${universalPath}`);

if (fs.existsSync(ssotPath)) {
  const ssot = JSON.parse(fs.readFileSync(ssotPath, "utf8"));
  if (ssot.notBugSpecific !== true) fail("SSOT must be not BUG-specific.");
  if (ssot.sonicLogoEquivalent !== true) fail("SSOT must identify sonic-logo equivalence.");
}

if (fs.existsSync(universalPath)) {
  const u = JSON.parse(fs.readFileSync(universalPath, "utf8"));
  if (u.notBugSpecific !== true) fail("Universal control must be not BUG-specific.");
  if (u.appliesToAllReleaseBoundProducts !== true) fail("Universal control must apply to all release-bound products.");
  if (u.requiredComponentsBeforeReleaseGate?.leadTailPadding !== true) fail("Padding must be required.");
  if (u.requiredComponentsBeforeReleaseGate?.slightEndFade !== true) fail("Slight end fade must be required.");
  if (u.requiredComponentsBeforeReleaseGate?.twinkle !== true) fail("Twinkle must be required.");
}

if (failures.length) {
  console.error("GPMx SIGNATURE AUDIO BRANDING UNIVERSAL / NOT BUG AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("GPMx SIGNATURE AUDIO BRANDING UNIVERSAL / NOT BUG AUDIT: PASS");
console.log("Signature audio branding is universal GPMx sonic branding, not BUG implementation.");
