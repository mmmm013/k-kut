import fs from "node:fs";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("4PE TRANSFER TEMPLATE AUDIT");

const templatePath = "templates/4pe-transfer/MSC_TT_BIZ_TRANSFER_TEMPLATE.json";
const standardPath = "docs/4pe-learning/4PE_TRANSFER_RECORD_STANDARD.md";

if (!fs.existsSync(templatePath)) fail(`Missing ${templatePath}`);
if (!fs.existsSync(standardPath)) fail(`Missing ${standardPath}`);

if (fs.existsSync(templatePath)) {
  const t = JSON.parse(fs.readFileSync(templatePath, "utf8"));

  for (const key of [
    "source_system",
    "translator",
    "target_system",
    "msc_case",
    "voc_focus",
    "msc_findings",
    "tt_translations",
    "dmaic_map",
    "bic_result",
    "biz_doctrine",
    "next_controlled_cleanup"
  ]) {
    if (!(key in t)) fail(`Template missing key: ${key}`);
  }

  if (t.source_system !== "4PE-BIZ-MSC") fail("source_system must be 4PE-BIZ-MSC");
  if (t.translator !== "4PE-BIZ-TT") fail("translator must be 4PE-BIZ-TT");
  if (t.target_system !== "4PE-BIZ-BIZ") fail("target_system must be 4PE-BIZ-BIZ");

  for (const key of ["define", "measure", "analyze", "improve", "control"]) {
    if (!(key in (t.dmaic_map || {}))) fail(`DMAIC map missing: ${key}`);
  }
}

if (fs.existsSync(standardPath)) {
  const s = fs.readFileSync(standardPath, "utf8");

  for (const phrase of [
    "MSC proves.",
    "TT translates.",
    "BIZ generalizes.",
    "VOC aims.",
    "DMAIC improves.",
    "BIC gates.",
    "PKK governs."
  ]) {
    if (!s.includes(phrase)) fail(`Standard missing phrase: ${phrase}`);
  }
}

if (failed) {
  console.error("4PE TRANSFER TEMPLATE AUDIT: FAIL");
  process.exit(1);
}

console.log("4PE TRANSFER TEMPLATE AUDIT: PASS");
