import fs from "node:fs";

const candidatePath = "data/intent-candidates/sympathy/candidates.json";
const approvedPath = "data/intent-approved/sympathy-registry.json";
const outPath = "reports/intent-sampling/sympathy-candidate-report.md";

const candidates = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
const approved = JSON.parse(fs.readFileSync(approvedPath, "utf8"));

const forbiddenSignals = [
  "heart pound",
  "call it love",
  "love like that",
  "spark",
  "romance",
  "wedding",
  "kiss",
  "desire",
  "lover",
  "sexy",
  "party",
  "confidence",
  "celebration"
];

function signalHits(row) {
  const haystack = [
    row.title,
    row.source_pix,
    row.section_context,
    row.lyric_context,
    row.notes,
    ...(row.tags || []),
    ...(row.intents || [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return forbiddenSignals.filter((signal) => haystack.includes(signal));
}

const rows = candidates.rows || [];

let md = "";
md += "# Sympathy Intent Candidate Report\n\n";
md += "Status: candidate review only. No publication from this file.\n\n";
md += `Candidate rows: ${rows.length}\n\n`;
md += `Approved registry rows: ${(approved.rows || []).length}\n\n`;

if (rows.length === 0) {
  md += "No candidates loaded yet.\n";
} else {
  md += "| ID | Title | Suggested Decision | Signal Hits | Notes |\n";
  md += "|---|---|---|---|---|\n";

  for (const row of rows) {
    const hits = signalHits(row);
    const suggested =
      hits.length > 0
        ? "FAIL_OR_REPROCESS"
        : row.human_approved === true
          ? "POSSIBLE_PASS_REVIEW"
          : "HOLD";

    md += `| ${row.id || ""} | ${row.title || ""} | ${suggested} | ${hits.join(", ") || "none"} | ${row.notes || ""} |\n`;
  }
}

fs.writeFileSync(outPath, md);
console.log(`WROTE ${outPath}`);
