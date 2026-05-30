import fs from "node:fs";

const authority = JSON.parse(fs.readFileSync("data/fathers-day/fathers-day-source-authority.json", "utf8"));

const OUT_JSON = "reports/fathers-day/fathers-day-kk-pool.strict.json";
const OUT_MD = "reports/fathers-day/fathers-day-kk-pool.strict.md";

const SEARCH_FILES = [
  "reports/fathers-day/fathers-day-actionable-registry-extract.md",
  "reports/fathers-day/fathers-day-actionable-registry-extract.json",
  "reports/fathers-day/fathers-day-buyer-candidates.md",
  "reports/fathers-day/fathers-day-buyer-candidates.json",
  "data/fathers-day/fathers-day-more-router.json"
];

const excluded = authority.excluded_titles.map((s) => s.toLowerCase());

function read(file) {
  try { return fs.readFileSync(file, "utf8"); }
  catch { return ""; }
}

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function hasExcluded(text) {
  const n = norm(text);
  return excluded.some((x) => n.includes(norm(x)));
}

function splitCandidateChunks(text) {
  return text
    .replace(/\r/g, "")
    .split(/\n| - active_kk_| - tbkk_| - [a-f0-9]{8}-[a-f0-9-]{27,}/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractUuid(text) {
  const m = text.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  return m ? m[0] : "";
}

function extractTiming(text) {
  const m = text.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)s/i);
  if (!m) return { start: "", end: "" };
  return { start: m[1], end: m[2] };
}

function isKKEvidence(text) {
  const n = norm(text);
  return (
    n.includes(" kk ") ||
    n.includes("— kk") ||
    n.includes(" kk=") ||
    n.includes("active_kk") ||
    n.includes("tbkk_")
  );
}

const groups = {};

for (const src of authority.approved_sources) {
  groups[src.display] = [];
}

for (const file of SEARCH_FILES) {
  const text = read(file);
  if (!text) continue;

  const chunks = splitCandidateChunks(text);

  for (const src of authority.approved_sources) {
    const variants = [src.canonical, src.display, ...src.variants].map(norm);

    for (const chunk of chunks) {
      const n = norm(chunk);
      if (!variants.some((v) => n.includes(v))) continue;
      if (hasExcluded(chunk)) continue;

      const isEvidence = isKKEvidence(chunk);
      const uuid = extractUuid(chunk);
      const timing = extractTiming(chunk);

      groups[src.display].push({
        source: src.display,
        canonical: src.canonical,
        file,
        evidence_type: isEvidence ? "KK_ROW_EVIDENCE" : "SOURCE_EVIDENCE",
        kk_id: uuid,
        start_seconds: timing.start,
        end_seconds: timing.end,
        raw_evidence: chunk.slice(0, 500)
      });
    }
  }
}

for (const key of Object.keys(groups)) {
  const seen = new Set();
  groups[key] = groups[key].filter((row) => {
    const dedupe = [row.file, row.kk_id, row.start_seconds, row.end_seconds, row.raw_evidence].join("|");
    if (seen.has(dedupe)) return false;
    seen.add(dedupe);
    return true;
  });
}

const contamination = [];
for (const [source, rows] of Object.entries(groups)) {
  for (const row of rows) {
    if (hasExcluded(row.raw_evidence)) contamination.push(row);
  }
}

const collapseWarnings = [];
for (const [source, rows] of Object.entries(groups)) {
  const kkRows = rows.filter((r) => r.evidence_type === "KK_ROW_EVIDENCE");
  if (rows.length > 0 && kkRows.length === 0) {
    collapseWarnings.push(`${source}: only source evidence found; needs concrete KK-row expansion.`);
  }
}

const result = {
  status: "strict_fathers_day_kk_pool",
  rule: authority.rule,
  approved_sources: authority.approved_sources.map((s) => s.display),
  excluded_titles: authority.excluded_titles,
  groups,
  contamination_count: contamination.length,
  collapse_warnings: collapseWarnings
};

fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + "\n");

let md = "# Father’s Day KK Pool — STRICT TITLE AUTHORITY\n\n";
md += `${authority.rule}\n\n`;
md += "## Approved Source Counts\n\n";

for (const [source, rows] of Object.entries(groups)) {
  const kkRows = rows.filter((r) => r.evidence_type === "KK_ROW_EVIDENCE").length;
  md += `- ${source}: ${rows.length} evidence rows; ${kkRows} KK-row evidence rows\n`;
}

md += "\n## Contamination Audit\n\n";
md += contamination.length ? `FAIL: ${contamination.length} contaminated rows\n` : "PASS: no excluded titles found in strict output\n";

md += "\n## Collapse Warnings\n\n";
if (collapseWarnings.length) {
  for (const w of collapseWarnings) md += `- ${w}\n`;
} else {
  md += "PASS: no source-only collapse warnings\n";
}

md += "\n## Detail\n\n";
for (const [source, rows] of Object.entries(groups)) {
  md += `### ${source}\n\n`;
  for (const row of rows.slice(0, 80)) {
    md += `- ${row.evidence_type}`;
    if (row.kk_id) md += ` | kk=${row.kk_id}`;
    if (row.start_seconds !== "") md += ` | ${row.start_seconds}-${row.end_seconds}s`;
    md += ` | file=${row.file}`;
    md += ` | evidence=${row.raw_evidence.replace(/\s+/g, " ").slice(0, 220)}\n`;
  }
  md += "\n";
}

fs.writeFileSync(OUT_MD, md);

console.log("Strict Father’s Day KK pool written.");
console.log("JSON:", OUT_JSON);
console.log("MD:", OUT_MD);
console.log("Contamination:", contamination.length);
console.log("Collapse warnings:", collapseWarnings.length);

if (contamination.length) process.exit(1);
