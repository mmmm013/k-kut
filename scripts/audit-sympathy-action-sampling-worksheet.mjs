import fs from "node:fs";

const worksheetPath = "reports/intent-sampling/sympathy-action-sampling-worksheet.md";

let failed = false;
function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("SYMPATHY ACTION SAMPLING WORKSHEET AUDIT");

if (!fs.existsSync(worksheetPath)) {
  fail(`Missing ${worksheetPath}`);
} else {
  const text = fs.readFileSync(worksheetPath, "utf8");

  for (const phrase of [
    "Gregory review only",
    "Non-public",
    "Non-payable",
    "Decision options: PASS / HOLD / FAIL / REPROCESS",
    "approve the human action, not the title",
    "**Decision:** HOLD",
    "**Gregory notes:**",
    "**Reprocess reason, if any:**"
  ]) {
    if (!text.includes(phrase)) fail(`Missing worksheet phrase: ${phrase}`);
  }
}

if (failed) {
  console.error("SYMPATHY ACTION SAMPLING WORKSHEET AUDIT: FAIL");
  process.exit(1);
}

console.log("SYMPATHY ACTION SAMPLING WORKSHEET AUDIT: PASS");
