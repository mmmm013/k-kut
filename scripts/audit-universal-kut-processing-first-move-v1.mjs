import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const workOrdersPath = "data/kut-inventory/processing/universal-kut-processing-work-orders-v1.json";
const movePath = "data/kut-inventory/processing/universal-kut-processing-first-move-v1.json";
const moveMdPath = "data/kut-inventory/processing/universal-kut-processing-first-move-v1.md";

if (!fs.existsSync(workOrdersPath)) fail(`Missing work orders: ${workOrdersPath}`);
if (!fs.existsSync(movePath)) fail(`Missing first move file: ${movePath}`);
if (!fs.existsSync(moveMdPath)) fail(`Missing first move markdown: ${moveMdPath}`);

if (fs.existsSync(movePath) && fs.existsSync(workOrdersPath)) {
  const raw = fs.readFileSync(movePath, "utf8");
  const move = JSON.parse(raw);
  const workOrders = JSON.parse(fs.readFileSync(workOrdersPath, "utf8")).workOrders || [];

  if (/approve/i.test(raw)) fail("First move file must not contain old candidate label.");
  if (move.selectedWorkOrderId !== "UKUT-WO-002") fail("First move must be UKUT-WO-002.");
  if (move.selectedSourceCandidateNumber !== 10) fail("First move must be source candidate 10.");
  if (move.fromLane !== "next-in-line-kut-candidate") fail("fromLane must be next-in-line-kut-candidate.");
  if (move.toLane !== "in-processing") fail("toLane must be in-processing.");
  if (move.targetProduct !== null) fail("First move must not set target product.");
  if (move.targetIntentContainer !== null) fail("First move must not set target intent container.");
  if (move.audioRenderedNow !== false) fail("First move must not render audio.");
  if (move.audioProcessedNow !== false) fail("First move must not mark audio processed.");
  if (move.publicReadyNow !== false) fail("First move must not be public-ready.");
  if (move.releaseReadyNow !== false) fail("First move must not be release-ready.");
  if (move.outletReadyNow !== false) fail("First move must not be outlet-ready.");
  if (move.releaseGateAllowedNow !== false) fail("First move must not allow Release Gate.");

  const selected = workOrders.find((wo) => wo.workOrderId === move.selectedWorkOrderId);
  if (!selected) fail("Selected work order does not exist in universal work orders.");
  if (selected?.sourceHumanReviewState !== "next-in-line-kut-candidate") {
    fail("Selected work order must originate from next-in-line-kut-candidate state.");
  }

  const required = JSON.stringify(move.requiredBeforeAnyReleaseDecision || []);
  for (const step of [
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
    if (!required.includes(step)) fail(`Missing required pre-release step: ${step}`);
  }
}

if (fs.existsSync(moveMdPath)) {
  const md = fs.readFileSync(moveMdPath, "utf8");
  if (/approve/i.test(md)) fail("First move markdown must not contain old candidate label.");
  if (/release-ready.*yes/i.test(md)) fail("First move markdown must not mark release-ready.");
}

if (failures.length) {
  console.error("UNIVERSAL KUT PROCESSING FIRST MOVE AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("UNIVERSAL KUT PROCESSING FIRST MOVE AUDIT: PASS");
console.log("UKUT-WO-002 / source candidate 10 is first into processing; it is not rendered or release-ready.");
