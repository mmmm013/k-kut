import fs from "node:fs";

const inputPath = "data/intent-candidates/sympathy/action-candidates.json";
const outPath = "reports/intent-sampling/sympathy-action-sampling-worksheet.md";

fs.mkdirSync("reports/intent-sampling", { recursive: true });

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const rows = data.rows || [];

let md = "# Sympathy Action-Object Sampling Worksheet\n\n";
md += "Status: Gregory review only. Non-public. Non-payable.\n\n";
md += "Decision options: PASS / HOLD / FAIL / REPROCESS\n\n";
md += "Sampling rule: approve the full match, not the title. The match must include verb + object + situation + direction + opposite-risk + evidence.\n\n";
md += "Locked doctrine: Verb starts the match. Object focuses the match. Situation humanizes the match. Direction colors the match. Opposite meaning protects the match. Evidence proves the match. Sampling measures the match. Registry publishes the match.\n\n";

for (const [index, row] of rows.entries()) {
  md += `## ${index + 1}. ${row.action_verb} + ${row.action_object} — ${row.title_backend_label}\n\n`;
  md += `**Score:** ${row.total_score}\n\n`;
  md += `**Human situation:** ${row.human_situation || ""}\n\n`;
  md += `**Positive directions:** ${(row.positive_directions || []).join(", ")}\n\n`;
  md += `**Negative directions:** ${(row.negative_directions || []).join(", ")}\n\n`;
  md += `**Common use situations:** ${(row.common_use_situations || []).join(", ")}\n\n`;
  md += `**Forbidden use situations:** ${(row.forbidden_use_situations || []).join(", ")}\n\n`;
  md += `**Evidence terms:** ${(row.positive_evidence_terms || []).join(", ")}\n\n`;
  md += `**Object evidence:** ${(row.object_evidence_terms || []).join(", ")}\n\n`;
  md += `**Opposite-meaning risk:** ${(row.opposite_meaning_risk || []).join(", ") || "none"}\n\n`;
  md += `**Meaning context:**\n\n${row.meaning_context || ""}\n\n`;
  md += `**Decision:** HOLD\n\n`;
  md += `**Gregory notes:** \n\n`;
  md += `**Reprocess reason, if any:** \n\n`;
  md += "---\n\n";
}

fs.writeFileSync(outPath, md);
console.log(`WROTE ${outPath}`);
console.log(`ROWS ${rows.length}`);
