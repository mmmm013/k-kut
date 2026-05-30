import fs from "node:fs";

const inputPath = "data/intent-candidates/sympathy/action-candidates.json";
const outPath = "reports/intent-sampling/sympathy-action-sampling-worksheet.md";

fs.mkdirSync("reports/intent-sampling", { recursive: true });

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const rows = data.rows || [];

let md = "# Sympathy Action Sampling Worksheet\n\n";
md += "Status: Gregory review only. Non-public. Non-payable.\n\n";
md += "Decision options: PASS / HOLD / FAIL / REPROCESS\n\n";
md += "Sampling rule: approve the human action, not the title. A candidate must comfort, carry, honor, shelter, remember, sit-with, walk-beside, or endure in a grief-safe way.\n\n";

for (const [index, row] of rows.entries()) {
  md += `## ${index + 1}. ${row.action_verb} — ${row.title_backend_label}\n\n`;
  md += `**Score:** ${row.total_score}\n\n`;
  md += `**Evidence:** ${(row.positive_evidence_terms || []).join(", ")}\n\n`;
  md += `**Source:** ${row.source_file}\n\n`;
  md += `**Meaning context:**\n\n`;
  md += `${row.meaning_context || ""}\n\n`;
  md += `**Decision:** HOLD\n\n`;
  md += `**Gregory notes:** \n\n`;
  md += `**Reprocess reason, if any:** \n\n`;
  md += "---\n\n";
}

fs.writeFileSync(outPath, md);
console.log(`WROTE ${outPath}`);
console.log(`ROWS ${rows.length}`);
