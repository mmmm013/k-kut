import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const jsonPath = "data/kut-inventory/processing/universal-kut-processing-work-orders-v1.json";
const mdPath = "data/kut-inventory/processing/universal-kut-processing-work-orders-v1.md";

if (!fs.existsSync(jsonPath)) fail(`Missing work order JSON: ${jsonPath}`);
if (!fs.existsSync(mdPath)) fail(`Missing work order markdown: ${mdPath}`);

if (fs.existsSync(jsonPath)) {
  const raw = fs.readFileSync(jsonPath, "utf8");
  const data = JSON.parse(raw);

  if (/approve/i.test(raw)) fail("Work order JSON must not contain the old candidate label.");
  if (data.workOrderCount !== 6) fail("Expected exactly 6 work orders.");
  if (data.noReleaseReadyItems !== true) fail("Work orders must not create release-ready items.");
  if (data.noAudioRenderedByThisFile !== true) fail("Work orders must not render audio.");
  if (data.noProductSpecificRelease !== true) fail("Work orders must not be product-specific release records.");

  for (const wo of data.workOrders || []) {
    if (wo.sourceHumanReviewState !== "next-in-line-kut-candidate") {
      fail(`${wo.workOrderId} must source from next-in-line-kut-candidate state.`);
    }
    if (wo.workOrderState !== "queued-for-universal-kut-processing") {
      fail(`${wo.workOrderId} must be queued for universal KUT processing.`);
    }
    if (wo.productSpecific !== false) fail(`${wo.workOrderId} must not be product-specific.`);
    if (wo.targetProduct !== null) fail(`${wo.workOrderId} must not assign a target product.`);
    if (wo.audioRenderedNow !== false) fail(`${wo.workOrderId} must not render audio now.`);
    if (wo.releaseReadyNow !== false) fail(`${wo.workOrderId} must not be release-ready now.`);
    if (wo.outletReadyNow !== false) fail(`${wo.workOrderId} must not be outlet-ready now.`);
    if (wo.releaseGateAllowedNow !== false) fail(`${wo.workOrderId} must not pass Release Gate now.`);

    const steps = JSON.stringify(wo.requiredProcessingSteps || []);
    for (const required of [
      "boundary-confirmation",
      "exact-cut-or-recut",
      "lead-tail-padding",
      "slight-end-fade",
      "twinkle-gpmx-signature-audio-branding",
      "bti-bf-review",
      "neutral-kut-canonicalization",
      "processed-candidate-review",
      "release-gate-or-recut-hold"
    ]) {
      if (!steps.includes(required)) fail(`${wo.workOrderId} missing required step: ${required}`);
    }

    if (wo.requiredSignatureAudioBranding?.paddingRequired !== true) fail(`${wo.workOrderId} missing required padding.`);
    if (wo.requiredSignatureAudioBranding?.slightEndFadeRequired !== true) fail(`${wo.workOrderId} missing required slight end fade.`);
    if (wo.requiredSignatureAudioBranding?.twinkleRequired !== true) fail(`${wo.workOrderId} missing required Twinkle.`);
  }
}

if (fs.existsSync(mdPath)) {
  const md = fs.readFileSync(mdPath, "utf8");
  if (/approve/i.test(md)) fail("Work order markdown must not contain the old candidate label.");
  if (/Release-ready now: yes/i.test(md)) fail("Markdown must not mark any work order release-ready.");
  if (/Audio rendered now: yes/i.test(md)) fail("Markdown must not mark audio as rendered.");
}

if (failures.length) {
  console.error("UNIVERSAL KUT PROCESSING WORK ORDERS AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("UNIVERSAL KUT PROCESSING WORK ORDERS AUDIT: PASS");
console.log("6 universal KUT work orders exist; none are product-specific, rendered, public-ready, or release-ready.");
