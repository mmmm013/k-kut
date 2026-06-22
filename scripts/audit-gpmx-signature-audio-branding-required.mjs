import fs from "node:fs";

const ssotPath = "data/audio-branding/gpmx-signature-audio-branding-ssot.json";
const outcomePath = "data/kut-inventory/review/bug-human-review-outcome-v1.json";

const failures = [];
const fail = (m) => failures.push(m);

if (!fs.existsSync(ssotPath)) fail(`Missing SSOT: ${ssotPath}`);

let ssot = null;
if (fs.existsSync(ssotPath)) {
  ssot = JSON.parse(fs.readFileSync(ssotPath, "utf8"));
  if (ssot.notBugSpecific !== true) fail("Signature Audio Branding must be marked not BUG-specific.");
  if (ssot.sonicLogoEquivalent !== true) fail("Signature Audio Branding must be marked as sonic-logo equivalent.");
  if (ssot.productOwnershipRule?.notOwnedByAnySingleProduct !== true) fail("Signature Audio Branding must not be owned by any single product.");
  if (ssot.productOwnershipRule?.bugIsOnlyDownstreamConsumer !== true) fail("BUG must be marked only as a downstream consumer.");
  if (!String(ssot.brandFunction || "").includes("audio logo")) fail("SSOT must identify the brand function as audio logo / sonic brand mark.");
  if (ssot.requiredBeforeReleaseGate !== true) fail("SSOT must require Signature Audio Branding before Release Gate.");
  if (ssot.requiredBeforeOutlet !== true) fail("SSOT must require Signature Audio Branding before Outlet.");
  if (ssot.requiredAtProcessingIntake !== true) fail("SSOT must require Signature Audio Branding at processing intake.");
  if (ssot.requiredAtKkrToHomeRegistration !== true) fail("SSOT must require Signature Audio Branding at KKr to HOME registration.");
  if (ssot.notOptional !== true) fail("SSOT must mark Signature Audio Branding not optional.");
  if (ssot.notUponDemand !== true) fail("SSOT must mark Signature Audio Branding not demand-based.");
  if (ssot.components?.padding?.required !== true) fail("Padding must be required.");
  if (ssot.components?.endFade?.required !== true) fail("End fade must be required.");
  if (ssot.components?.twinkle?.required !== true) fail("Twinkle must be required.");
  if (ssot.processingRule?.releaseGateFailsClosedWhenMissing !== true) fail("Release Gate must fail closed when missing signature components.");
  if (ssot.processingRule?.outletFailsClosedWhenMissing !== true) fail("Outlet must fail closed when missing signature components.");
}

if (fs.existsSync(outcomePath)) {
  const outcome = JSON.parse(fs.readFileSync(outcomePath, "utf8"));

  if (outcome.requiredSignatureAudioBrandingBeforeRelease?.padding !== true) fail("Outcome must require padding before release.");
  if (outcome.requiredSignatureAudioBrandingBeforeRelease?.slightEndFade !== true) fail("Outcome must require slight end fade before release.");
  if (outcome.requiredSignatureAudioBrandingBeforeRelease?.twinkle !== true) fail("Outcome must require Twinkle before release.");
  if (outcome.publicBugIndexAllowedFromThisOutcome !== false) fail("Outcome must not allow direct public BUG index entry.");
  if (outcome.releaseGateAllowedFromThisOutcome !== false) fail("Outcome must not allow direct release gate.");
  if (outcome.outletAllowedFromThisOutcome !== false) fail("Outcome must not allow direct outlet.");
  if (outcome.counts?.releaseReadyNow !== 0) fail("Outcome releaseReadyNow must remain 0.");

  for (const item of outcome.fullLedger || []) {
    const sig = item.gpmxSignatureAudioBranding;
    if (!sig) fail(`Item ${item.bugHumanReviewNumber} missing signature branding block.`);
    else {
      if (sig.componentsRequired?.padding !== true) fail(`Item ${item.bugHumanReviewNumber} missing required padding.`);
      if (sig.componentsRequired?.endFade !== true) fail(`Item ${item.bugHumanReviewNumber} missing required endFade.`);
      if (sig.componentsRequired?.twinkle !== true) fail(`Item ${item.bugHumanReviewNumber} missing required Twinkle.`);
      if (sig.releaseBlockedUntilApplied !== true) fail(`Item ${item.bugHumanReviewNumber} must be release-blocked until signature applied.`);
    }
    if (item.releaseGateAllowedNow !== false) fail(`Item ${item.bugHumanReviewNumber} must not be release gate allowed now.`);
    if (item.outletAllowedNow !== false) fail(`Item ${item.bugHumanReviewNumber} must not be outlet allowed now.`);
  }
}

if (failures.length) {
  console.error("GPMx SIGNATURE AUDIO BRANDING REQUIRED AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("GPMx SIGNATURE AUDIO BRANDING REQUIRED AUDIT: PASS");
console.log("Padding, slight end fade, and Twinkle are required from SSOT before Release Gate / Outlet.");
