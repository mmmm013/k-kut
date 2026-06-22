import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const jsonPath = "data/kut-inventory/processing/ukut-wo-002-exact-cut-drafts-v1.json";
const mdPath = "data/kut-inventory/processing/ukut-wo-002-exact-cut-drafts-v1.md";

if (!fs.existsSync(jsonPath)) fail(`Missing ${jsonPath}`);
if (!fs.existsSync(mdPath)) fail(`Missing ${mdPath}`);

if (fs.existsSync(jsonPath)) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  if (data.workOrderId !== "UKUT-WO-002") fail("Drafts must be for UKUT-WO-002.");
  if (data.currentLane !== "in-processing") fail("Drafts must remain in-processing.");
  if (data.renderAudioNow !== true) fail("Exact-cut draft render should be true.");
  if (data.renderedForReviewOnly !== true) fail("Drafts must be review-only.");

  if (data.paddingApplied !== false) fail("Padding must not be marked applied yet.");
  if (data.slightEndFadeApplied !== false) fail("Slight end fade must not be marked applied yet.");
  if (data.twinkleApplied !== false) fail("Twinkle must not be marked applied yet.");
  if (data.gpmxSignatureAudioBrandingComplete !== false) fail("Signature branding must not be complete yet.");

  if (data.publicReadyNow !== false) fail("Drafts must not be public-ready.");
  if (data.productReadyNow !== false) fail("Drafts must not be product-ready.");
  if (data.releaseReadyNow !== false) fail("Drafts must not be release-ready.");
  if (data.outletReadyNow !== false) fail("Drafts must not be outlet-ready.");
  if (data.releaseGateAllowedNow !== false) fail("Drafts must not allow Release Gate.");

  if (!Array.isArray(data.drafts) || data.drafts.length !== 2) fail("Expected exactly 2 draft renders.");

  const bt001 = data.drafts?.find(d => d.boundaryTargetId === "UKUT-WO-002-BT-001");
  const bt002 = data.drafts?.find(d => d.boundaryTargetId === "UKUT-WO-002-BT-002");

  if (!bt001) fail("Missing BT-001 draft.");
  if (!bt002) fail("Missing BT-002 draft.");

  if (bt001?.endSeconds !== 5.5) fail("BT-001 must end at 5.5 seconds.");
  if (!/sustaining notes/i.test(bt001?.humanNote || "")) fail("BT-001 must keep sustaining-note learning note.");
  if (bt002?.endSeconds !== 13.5) fail("BT-002 must end at 13.5 seconds.");

  for (const d of data.drafts || []) {
    if (!fs.existsSync(d.outputPath)) fail(`Missing rendered draft audio: ${d.outputPath}`);
    if (d.outputPath.startsWith("public/")) fail(`Draft must not render into public/: ${d.outputPath}`);
  }
}

if (failures.length) {
  console.error("UKUT-WO-002 EXACT-CUT DRAFT AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("UKUT-WO-002 EXACT-CUT DRAFT AUDIT: PASS");
console.log("Two review-only exact-cut drafts exist; not public, not Twinkled, not release-ready.");
