import fs from "node:fs";

const strictPath = "reports/fathers-day/fathers-day-strict-shortlist.json";
const outJson = "reports/fathers-day/fathers-day-actionable-registry-extract.json";
const outMd = "reports/fathers-day/fathers-day-actionable-registry-extract.md";

if (!fs.existsSync(strictPath)) {
  console.error("Missing strict shortlist:", strictPath);
  process.exit(1);
}

const strict = JSON.parse(fs.readFileSync(strictPath, "utf8"));

const sourceHints = [
  "Life's a Test",
  "Lifes a Test",
  "Life’s a Test",
  "That's a Have To",
  "Thats a Have To",
  "That’s a Have To",
  "Have-To",
  "Have To",
  "That Empty Chair",
  "No Mystery"
];

const buyerTerms = [
  "father",
  "dad",
  "Father's Day",
  "Fathers Day",
  "Father’s Day",
  "empty chair",
  "missing dad",
  "thanks dad",
  "thank you dad",
  "life lesson",
  "role model",
  "proud",
  "support",
  "repair"
];

const rejectFileParts = [
  "/mothers-day/",
  "/audio/kleigh/",
  "/signatures/",
  "instro",
  "instrumental",
  "music maykers",
  "valentine",
  "christmas",
  "xmas"
];

function hasAny(text, terms) {
  const low = String(text || "").toLowerCase();
  return terms.some((t) => low.includes(t.toLowerCase()));
}

function rejectFile(file) {
  return hasAny(file, rejectFileParts);
}

function snippets(text, terms, radius = 420) {
  const lower = text.toLowerCase();
  const out = [];

  for (const term of terms) {
    const idx = lower.indexOf(term.toLowerCase());
    if (idx >= 0) {
      const start = Math.max(0, idx - radius);
      const end = Math.min(text.length, idx + term.length + radius);
      out.push({
        term,
        snippet: text.slice(start, end).replace(/\s+/g, " ").trim()
      });
    }
  }

  return out;
}

const files = [...new Set((strict.textStrict || []).map((x) => x.file))]
  .filter((file) => fs.existsSync(file))
  .filter((file) => !rejectFile(file));

const records = [];

for (const file of files) {
  let text = "";
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const sourceHit = hasAny(text, sourceHints) || hasAny(file, sourceHints);
  const buyerHit = hasAny(text, buyerTerms) || hasAny(file, buyerTerms);

  if (!sourceHit && !buyerHit) continue;

  const sourceSnips = snippets(text, sourceHints);
  const buyerSnips = snippets(text, buyerTerms);

  let priority = "LOW";
  if (sourceSnips.length && buyerSnips.length) priority = "HIGH";
  else if (sourceSnips.length) priority = "MEDIUM_SOURCE";
  else if (buyerSnips.length) priority = "MEDIUM_BUYER";

  records.push({
    file,
    priority,
    sourceHintHits: sourceSnips.map((x) => x.term),
    buyerTermHits: buyerSnips.map((x) => x.term),
    sourceSnippets: sourceSnips.slice(0, 8),
    buyerSnippets: buyerSnips.slice(0, 8),
    nextReviewNeed: "Locate concrete KK id / audio source / delivery candidate; reject if not KK/customer-deliverable."
  });
}

records.sort((a, b) => {
  const rank = { HIGH: 0, MEDIUM_SOURCE: 1, MEDIUM_BUYER: 2, LOW: 3 };
  return rank[a.priority] - rank[b.priority] || a.file.localeCompare(b.file);
});

const report = {
  date: "2026-05-30",
  status: "fathers_day_actionable_registry_extract",
  rule: "This is not public UI. This extracts actionable Father’s Day registry evidence for admin review.",
  records,
  nextActions: [
    "Review HIGH records first.",
    "Identify concrete KK ids and source audio.",
    "Reject non-KK, guide audio, INSTRO, Mother’s Day-only, and direct forbidden holiday assets.",
    "Select 3-5 Father’s Day buyer-safe delivery candidates.",
    "Materialize selected candidates with padding + Twinkle.",
    "Only then create Father’s Day public buyer route/section and run BIC production audit."
  ]
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

let md = "# Father’s Day Actionable Registry Extract\n\n";
md += "Status: fathers_day_actionable_registry_extract\n\n";
md += "Rule: admin-only extraction. Not public UI. Goal is concrete KK/II delivery candidates.\n\n";

md += "## Counts\n\n";
md += `- Files reviewed: ${files.length}\n`;
md += `- Actionable records: ${records.length}\n`;
md += `- HIGH priority: ${records.filter((r) => r.priority === "HIGH").length}\n`;
md += `- MEDIUM_SOURCE priority: ${records.filter((r) => r.priority === "MEDIUM_SOURCE").length}\n`;
md += `- MEDIUM_BUYER priority: ${records.filter((r) => r.priority === "MEDIUM_BUYER").length}\n\n`;

md += "## Records\n\n";
for (const r of records.slice(0, 80)) {
  md += `### ${r.priority}: ${r.file}\n\n`;
  if (r.sourceHintHits.length) md += `- Source hints: ${[...new Set(r.sourceHintHits)].join(", ")}\n`;
  if (r.buyerTermHits.length) md += `- Buyer terms: ${[...new Set(r.buyerTermHits)].join(", ")}\n`;

  if (r.sourceSnippets.length) {
    md += "\nSource snippets:\n";
    for (const s of r.sourceSnippets.slice(0, 3)) {
      md += `- ${s.term}: ${s.snippet}\n`;
    }
  }

  if (r.buyerSnippets.length) {
    md += "\nBuyer snippets:\n";
    for (const s of r.buyerSnippets.slice(0, 3)) {
      md += `- ${s.term}: ${s.snippet}\n`;
    }
  }

  md += "\nNext review need: locate concrete KK id / audio source / delivery candidate.\n\n";
}

md += "## Next Actions\n\n";
for (const action of report.nextActions) md += `- ${action}\n`;

fs.writeFileSync(outMd, md);

console.log("Father’s Day actionable registry extract written.");
console.log("Files reviewed:", files.length);
console.log("Actionable records:", records.length);
console.log("JSON:", outJson);
console.log("MD:", outMd);
