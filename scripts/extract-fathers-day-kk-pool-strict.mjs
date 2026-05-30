import fs from "node:fs";

const authorityPath = "data/fathers-day/fathers-day-source-authority.json";
const OUT_JSON = "reports/fathers-day/fathers-day-kk-pool.strict.json";
const OUT_MD = "reports/fathers-day/fathers-day-kk-pool.strict.md";

const SEARCH_FILES = [
  "reports/fathers-day/fathers-day-actionable-registry-extract.md",
  "reports/fathers-day/fathers-day-actionable-registry-extract.json",
  "reports/fathers-day/fathers-day-buyer-candidates.md",
  "reports/fathers-day/fathers-day-buyer-candidates.json",
  "data/fathers-day/fathers-day-more-router.json"
];

const HARD_REJECT = [
  "instro",
  "instrumental",
  "music maykers",
  "a love like that",
  "don't call it love",
  "don’t call it love",
  "your heart poundin",
  "your heart pounding",
  "your touch",
  "romance-router",
  "kupid",
  "valentine"
];

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function escRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractUuid(text) {
  const m = text.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  return m ? m[0] : "";
}

function extractQueue(text) {
  const m = text.match(/\b(active_kk_\d+|tbkk_\d+)\b/i);
  return m ? m[1] : "";
}

function extractUrl(text) {
  const m = text.match(/https?:\/\/[^\s|"]+/i);
  return m ? m[0] : "";
}

function hasHardReject(text) {
  const n = norm(text);
  return HARD_REJECT.some((term) => n.includes(norm(term)));
}

function titlePattern(title) {
  return escRegex(title)
    .replace(/['’]/g, "['’]")
    .replace(/\s+/g, "\\s+");
}

function rowIsExactTitleKK(row, variants) {
  const clean = row.replace(/\s+/g, " ").trim();

  if (hasHardReject(clean)) return false;

  for (const variant of variants) {
    const t = titlePattern(variant);

    const patterns = [
      new RegExp(`(?:^|\\|)\\s*${t}\\s*\\|\\s*${t}\\s*[—-]\\s*KK\\s*\\d+\\b`, "i"),
      new RegExp(`(?:^|\\|)\\s*${t}\\s*[—-]\\s*KK\\s*\\d+\\b`, "i")
    ];

    if (patterns.some((rx) => rx.test(clean))) return true;
  }

  return false;
}

function splitRows(text) {
  const flat = text
    .replace(/\r/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\s+-\s+(?=active_kk_\d+)/g, "\nactive_kk_")
    .replace(/\s+-\s+(?=tbkk_\d+)/g, "\ntbkk_")
    .replace(/\s+-\s+(?=\d{6}\s*\|)/g, "\n");

  const rows = [];

  for (const line of flat.split(/\n/)) {
    const clean = line.trim();
    if (!clean) continue;

    const markers = [...clean.matchAll(/(?:active_kk_\d+|tbkk_\d+|\b\d{6}\s*\|)/g)];

    if (markers.length <= 1) {
      rows.push(clean);
      continue;
    }

    for (let i = 0; i < markers.length; i++) {
      const start = markers[i].index ?? 0;
      const end = i + 1 < markers.length ? markers[i + 1].index ?? clean.length : clean.length;
      rows.push(clean.slice(start, end).trim());
    }
  }

  return rows.filter(Boolean);
}

const authority = JSON.parse(read(authorityPath));
const groups = {};
const rejected = [];
const unresolved = [];

for (const source of authority.approved_sources) {
  groups[source.display] = [];
}

for (const file of SEARCH_FILES) {
  const text = read(file);
  if (!text) continue;

  const rows = splitRows(text);

  for (const source of authority.approved_sources) {
    const variants = [source.canonical, source.display, ...(source.variants || [])].filter(Boolean);

    for (const row of rows) {
      const clean = row.replace(/\s+/g, " ").trim();

      if (!variants.some((v) => norm(clean).includes(norm(v)))) continue;

      if (!rowIsExactTitleKK(clean, variants)) {
        rejected.push({
          source: source.display,
          file,
          reason: hasHardReject(clean) ? "hard_reject_term" : "not_exact_title_kk_row",
          evidence: clean.slice(0, 260)
        });
        continue;
      }

      const titleFields = clean.split("|").map((x) => x.trim()).slice(0, 3).join(" | ");
      const variantsNorm = variants.map(norm);
      const hasExactTitleInLeadFields = variantsNorm.some((v) => norm(titleFields).includes(v));

      if (!hasExactTitleInLeadFields) {
        rejected.push({
          source: source.display,
          file,
          reason: "approved_title_not_in_lead_fields",
          evidence: clean.slice(0, 260)
        });
        continue;
      }

      groups[source.display].push({
        source: source.display,
        canonical: source.canonical,
        file,
        evidence_type: "EXACT_TITLE_KK_ROW",
        queue: extractQueue(clean),
        kk_id: extractUuid(clean),
        audio_url: extractUrl(clean),
        raw_evidence: clean.slice(0, 500)
      });
    }
  }
}

for (const source of Object.keys(groups)) {
  const seen = new Set();

  groups[source] = groups[source].filter((row) => {
    const key = [
      row.source,
      row.queue,
      row.kk_id,
      row.audio_url,
      row.raw_evidence
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (groups[source].length === 0) {
    unresolved.push(`${source}: no exact title-authority KK rows found yet.`);
  }
}

const result = {
  status: "strict_exact_fathers_day_kk_pool",
  rule: "Only exact title-authority KK rows are included. Nearby source evidence, adjacent row bleed, INSTRO, Music Maykers, romance, KUPID, and unrelated rows are rejected.",
  approved_sources: authority.approved_sources.map((s) => s.display),
  groups,
  unresolved,
  rejected_count: rejected.length,
  rejected_sample: rejected.slice(0, 50)
};

fs.mkdirSync("reports/fathers-day", { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + "\n");

let md = "# Father’s Day KK Pool — STRICT EXACT TITLE KK ROWS ONLY\n\n";
md += `${result.rule}\n\n`;

md += "## Exact KK Row Counts\n\n";
for (const [source, rows] of Object.entries(groups)) {
  md += `- ${source}: ${rows.length} exact KK rows\n`;
}

md += "\n## Unresolved Sources\n\n";
if (unresolved.length) {
  for (const item of unresolved) md += `- ${item}\n`;
} else {
  md += "PASS: all approved sources have exact KK rows.\n";
}

md += "\n## Rejected Evidence Count\n\n";
md += `Rejected noisy / unsafe / non-exact rows: ${rejected.length}\n`;

md += "\n## Exact Detail\n\n";
for (const [source, rows] of Object.entries(groups)) {
  md += `### ${source}\n\n`;

  if (!rows.length) {
    md += "- No exact KK rows found yet.\n\n";
    continue;
  }

  for (const row of rows.slice(0, 80)) {
    md += `- EXACT_TITLE_KK_ROW`;
    if (row.queue) md += ` | queue=${row.queue}`;
    if (row.kk_id) md += ` | kk=${row.kk_id}`;
    if (row.audio_url) md += ` | audio=${row.audio_url}`;
    md += ` | file=${row.file}`;
    md += ` | evidence=${row.raw_evidence.replace(/\s+/g, " ").slice(0, 240)}\n`;
  }

  md += "\n";
}

fs.writeFileSync(OUT_MD, md);

console.log("Strict exact Father’s Day KK pool written.");
console.log("JSON:", OUT_JSON);
console.log("MD:", OUT_MD);
console.log("Rejected:", rejected.length);
console.log("Unresolved:", unresolved.length);

if (Object.values(groups).every((rows) => rows.length === 0)) {
  console.error("FAIL: no exact KK rows found for any approved Father’s Day source.");
  process.exit(1);
}
