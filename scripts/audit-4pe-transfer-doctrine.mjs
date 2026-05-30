import fs from "node:fs";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("4PE BIZ MSC/TT/BIZ TRANSFER DOCTRINE AUDIT");

const doctrinePath = "docs/4pe-learning/4PE_BIZ_MSC_TT_BIZ_TRANSFER_DOCTRINE.md";
const recordPath = "data/4pe-transfer/2026-05-30-k-kut-audio-law-transfer.json";

if (!fs.existsSync(doctrinePath)) fail(`Missing ${doctrinePath}`);
if (!fs.existsSync(recordPath)) fail(`Missing ${recordPath}`);

if (fs.existsSync(doctrinePath)) {
  const text = fs.readFileSync(doctrinePath, "utf8");
  for (const required of [
    "MSC proves.",
    "TT translates.",
    "BIZ generalizes.",
    "VOC aims.",
    "DMAIC improves.",
    "BIC gates.",
    "PKK governs.",
    "AUDIO CAN NEVER LEAVE AN II"
  ]) {
    if (!text.includes(required)) fail(`Doctrine missing: ${required}`);
  }
}

if (fs.existsSync(recordPath)) {
  const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));

  if (record.source_system !== "4PE-BIZ-MSC") fail("source_system must be 4PE-BIZ-MSC");
  if (record.translator !== "4PE-BIZ-TT") fail("translator must be 4PE-BIZ-TT");
  if (record.target_system !== "4PE-BIZ-BIZ") fail("target_system must be 4PE-BIZ-BIZ");

  for (const key of ["define", "measure", "analyze", "improve", "control"]) {
    if (!record.dmaic_map?.[key]) fail(`Missing DMAIC map key: ${key}`);
  }

  if (!String(record.bic_result || "").includes("Finished II delivery package live")) {
    fail("Transfer record must capture finished II delivery BIC result.");
  }
}

if (failed) {
  console.error("4PE BIZ MSC/TT/BIZ TRANSFER DOCTRINE AUDIT: FAIL");
  process.exit(1);
}

console.log("4PE BIZ MSC/TT/BIZ TRANSFER DOCTRINE AUDIT: PASS");
