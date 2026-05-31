import fs from "node:fs";

const worksheetPath = "reports/intent-sampling/sympathy-action-sampling-worksheet.md";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("SYMPATHY ACTION-OBJECT SAMPLING WORKSHEET AUDIT");

if (!fs.existsSync(worksheetPath)) {
  fail(`Missing ${worksheetPath}`);
} else {
  const text = fs.readFileSync(worksheetPath, "utf8");

  const candidateHeadings = text.match(/^##\s+\d+\./gm) || [];
  if (candidateHeadings.length < 1) {
    fail("Worksheet has zero candidate rows. Regenerate action candidates before sampling.");
  }

  for (const phrase of [
    "Gregory review only",
    "Non-public",
    "Non-payable",
    "verb + object + situation + direction + opposite-risk + evidence",
    "Verb starts the match. Object focuses the match.",
    "**Positive directions:**",
    "**Negative directions:**",
    "**Object evidence:**",
    "**Opposite-meaning risk:**",
    "**Decision:** HOLD",
    "**Gregory notes:**",
    "**Reprocess reason, if any:**"
  ]) {
    if (!text.includes(phrase)) fail(`Missing worksheet phrase: ${phrase}`);
  }

  if (text.includes("NO_OBJECT")) {
    fail("Worksheet contains NO_OBJECT. Step 30 object inference is incomplete.");
  }
}

if (failed) {
  console.error("SYMPATHY ACTION-OBJECT SAMPLING WORKSHEET AUDIT: FAIL");
  process.exit(1);
}

console.log("SYMPATHY ACTION-OBJECT SAMPLING WORKSHEET AUDIT: PASS");
