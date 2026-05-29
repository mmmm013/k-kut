import fs from "node:fs";

const inventoryPath = "reports/kk-inventory/k_kuts.auto.csv";
const outJson = "reports/ii-candidates/mother-hope-kk-candidates.json";
const outMd = "reports/ii-candidates/mother-hope-kk-candidates.md";

if (!fs.existsSync(inventoryPath)) {
  console.error("Missing inventory:", inventoryPath);
  process.exit(1);
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"' && quoted && next === '"') {
      cur += '"';
      i++;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }

  out.push(cur);
  return out;
}

function cleanPublicTitle(s) {
  return String(s || "")
    .replace(/^\s*\d+\s*-\s*/g, "")
    .replace(/\bMusic Maykers\b/gi, "")
    .replace(/\bLT-PIX\b/gi, "")
    .replace(/\s+-\s+/g, " - ")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s*-\s*/, "")
    .replace(/\.mp3$/i, "")
    .trim();
}

const wantedTerms = [
  "mother", "mom", "mum", "mama", "momma",
  "hope", "thank you", "thanks", "heart", "love",
  "guide", "shelter", "comfort", "carry", "light"
];

const forbiddenTerms = [
  "instro",
  "instrumental",
  "instrumentals",
  "no vocal",
  "no vocals",
  "bed only",
  "music bed",
  "christmas",
  "xmas",
  "holiday lt-pix",
  "holiday-lt-pix",
  "valentine",
  "valentine's day",
  "mothers day",
  "mother's day",
  "father's day",
  "fathers day"
];

function hasAny(text, terms) {
  const t = String(text || "").toLowerCase();
  return terms.some((term) => t.includes(term));
}

function emotionLevel(text) {
  const t = String(text || "").toLowerCase();
  let score = 0;

  if (/\bhope\b|\bfaith\b|\bpray|\bbelieve|\blight\b/.test(t)) score += 3;
  if (/\bmother\b|\bmom\b|\bmum\b|\bmama\b|\bmomma\b/.test(t)) score += 3;
  if (/\bthank|\blove|\bheart|\bhold|\bcare|\bcomfort\b|\bshelter\b|\bguide\b/.test(t)) score += 2;
  if (/\bcry|\btears|\bmiss|\bempty|\bgrief|\bdark|\bbroken\b/.test(t)) score += 2;

  if (score >= 7) return "deep";
  if (score >= 4) return "warm";
  if (score >= 2) return "light";
  return "review";
}

const lines = fs.readFileSync(inventoryPath, "utf8").split(/\r?\n/).filter(Boolean);
const rows = [];
const seen = new Set();

for (const line of lines) {
  const lower = line.toLowerCase();

  if (hasAny(lower, forbiddenTerms)) continue;
  if (!hasAny(lower, wantedTerms)) continue;

  const cols = parseCsvLine(line);

  const id = cols[0] || "";
  const title = cols[1] || "";
  const type = cols[2] || "";
  const sourceId = cols[3] || "";
  const sourceFile = cols[4] || "";
  const start = Number(cols[9] || 0);
  const end = Number(cols[10] || 0);
  const method = cols[11] || "";
  const audioUrl = cols.find((v) => /^https?:\/\//.test(v)) || "";

  if (!id || seen.has(id)) continue;
  seen.add(id);

  // Buyer-flow report is KK-only.
  if (type !== "KK") continue;

  const hay = `${title} ${sourceFile}`;

  rows.push({
    id,
    type,
    public_title_candidate: cleanPublicTitle(title),
    public_source_label: cleanPublicTitle(sourceFile),
    internal_title: title,
    internal_source_file: sourceFile,
    source_id: sourceId,
    start_seconds: Number.isFinite(start) ? start : null,
    end_seconds: Number.isFinite(end) ? end : null,
    duration_seconds: Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, end - start) : null,
    method,
    audio_url: audioUrl,
    emotion_level: emotionLevel(hay),
    reuse_status: "existing_pre_made_kk",
    duplicate_policy: "do_not_remint"
  });
}

rows.sort((a, b) => {
  const rank = { deep: 0, warm: 1, light: 2, review: 3 };
  return (rank[a.emotion_level] ?? 9) - (rank[b.emotion_level] ?? 9)
    || String(a.public_source_label).localeCompare(String(b.public_source_label))
    || (a.start_seconds ?? 999999) - (b.start_seconds ?? 999999);
});

const grouped = {};
for (const row of rows) {
  const key = row.public_source_label || "Unlabeled";
  grouped[key] ||= [];
  grouped[key].push(row);
}

fs.writeFileSync(outJson, JSON.stringify({
  report: "mother-hope-kk-candidates",
  laws_applied: [
    "NO INSTRO",
    "NO direct same-holiday LT-PIX",
    "NO Music Maykers public display",
    "KK-only buyer candidate report",
    "NO duplicate II"
  ],
  total_kk_candidates: rows.length,
  groups: grouped
}, null, 2) + "\n");

let md = "# Mother / Hope KK Candidates\n\n";
md += `Total existing KK candidates found: ${rows.length}\n\n`;
md += "Rules applied: KK-only. NO INSTRO. NO direct same-holiday LT-PIX. No Music Maykers public display. No duplicate II.\n\n";

for (const [source, items] of Object.entries(grouped)) {
  md += `## ${source}\n\n`;
  for (const r of items.slice(0, 25)) {
    md += `- ${r.emotion_level.toUpperCase()} | ${r.start_seconds}-${r.end_seconds}s | ${r.public_title_candidate} | kk=${r.id}\n`;
  }
  if (items.length > 25) md += `- ... ${items.length - 25} more\n`;
  md += "\n";
}

fs.writeFileSync(outMd, md);

console.log("Mother/Hope KK candidate search complete.");
console.log("Total KK candidates:", rows.length);
console.log("JSON:", outJson);
console.log("MD:", outMd);
