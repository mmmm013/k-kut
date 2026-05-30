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

function extractTiming(text) {
  const m = text.match(/\b(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)s\b/i);
  return m ? { start_seconds: m[1], end_seconds: m[2] } : { start_seconds: "", end_seconds: "" };
}

function hasHardReject(text) {
  const n = norm(text);
  return HARD_REJECT.some((term) => n.includes(norm(term)));
}

function variantRegex(variant) {
  const v = escRegex(variant)
    .replace(/['’]/g, "['’]")
    .replace(/\s+/g, "\\s+");
  return new RegExp(v, "i");
}

function isActualTitleKKRow(windowText, variants) {
  const text = windowText.replace(/\s+/g, " ");

  for (const variant of variants) {
    const title = escRegex(variant)
      .replace(/['’]/g, "['’]")
      .replace(/\s+/g, "\\s+");

    const patterns = [
      new RegExp(`${title}\\s*\\|\\s*${title}\\s*[—-]\\s*KK\\s*\\d+`, "i"),
      new RegExp(`${title}\\s*[—-]\\s*KK\\s*\\d+`, "i"),
      new RegExp(`\\|\\s*${title}\\s*\\|\\s*${title}\\s*[—-]\\s*KK\\s*\\d+`, "i")
    ];

    if (patterns.some((rx) => rx.test(text))) return true;
  }

  return false;
}

function findWindows(text, variants) {
  const windows = [];
  const normalizedText = text;

  for (const variant of variants) {
    const rx = variantRegex(variant);
    let remaining = normalizedText;
    let offset = 0;

    while (true) {
      const m = rx.exec(remaining);
      if (!m) break;

      const absolute = offset + m.index;
      const start = Math.max(0, absolute - 260);
      const end = Math.min(normalizedText.length, absolute + 420);
      windows.push(normalizedText.slice(start, end));

      offset = absolute + Math.max(variant.length, 1);
      remaining = normalizedText.slice(offset);
    }
  }

  return windows;
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

  for (const source of authority.approved_sources) {
    const variants = [source.canonical, source.display, ...(source.variants || [])]
      .filter(Boolean);

    for (const windowText of findWindows(text, variants)) {
      const clean = windowText.replace(/\s+/g, " ").trim();

      if (hasHardReject(clean)) {
        rejected.push({
          source: source.display,
          file,
          reason: "hard_reject_term",
          evidence: clean.slice(0, 260)
        });
        continue;
      }

      if (!isActualTitleKKRow(clean, variants)) {
        rejected.push({
          source: source.display,
          file,
          reason: "not_actual_title_kk_row",
          evidence: clean.slice(0, 260)
        });
        continue;
      }

      const timing = extractTiming(clean);

      groups[source.display].push({
        source: source.display,
        canonical: source.canonical,
        file,
        evidence_type: "CLEAN_KK_ROW",
        queue: extractQueue(clean),
        kk_id: extractUuid(clean),
        audio_url: extractUrl(clean),
        start_seconds: timing.start_seconds,
        end_seconds: timing.end_seconds,
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
      row.start_seconds,
      row.end_seconds,
      row.raw_evidence
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (groups[source].length === 0) {
    unresolved.push(`${source}: no clean title-authority KK rows found yet.`);
  }
}

const result = {
  status: "strict_clean_fathers_day_kk_pool",
  rule: "Only actual title-authority KK rows are included. Source evidence, nearby text, INSTRO, Music Maykers, romance, KUPID, and unrelated rows are rejected.",
  approved_sources: authority.approved_sources.map((s) => s.display),
  groups,
  unresolved,
  rejected_count: rejected.length,
  rejected_sample: rejected.slice(0, 50)
};

fs.mkdirSync("reports/fathers-day", { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + "\n");

let md = "# Father’s Day KK Pool — STRICT CLEAN KK ROWS ONLY\n\n";
md += `${result.rule}\n\n`;

md += "## Clean KK Row Counts\n\n";
for (const [source, rows] of Object.entries(groups)) {
  md += `- ${source}: ${rows.length} clean KK rows\n`;
}

md += "\n## Unresolved Sources\n\n";
if (unresolved.length) {
  for (const item of unresolved) md += `- ${item}\n`;
} else {
  md += "PASS: all approved sources have clean KK rows.\n";
}

md += "\n## Rejected Evidence Count\n\n";
md += `Rejected noisy / unsafe / non-title rows: ${rejected.length}\n`;

md += "\n## Clean Detail\n\n";
for (const [source, rows] of Object.entries(groups)) {
  md += `### ${source}\n\n`;

  if (!rows.length) {
    md += "- No clean KK rows found yet.\n\n";
    continue;
  }

  for (const row of rows.slice(0, 80)) {
    md += `- CLEAN_KK_ROW`;
    if (row.queue) md += ` | queue=${row.queue}`;
    if (row.kk_id) md += ` | kk=${row.kk_id}`;
    if (row.audio_url) md += ` | audio=${row.audio_url}`;
    if (row.start_seconds !== "") md += ` | ${row.start_seconds}-${row.end_seconds}s`;
    md += ` | file=${row.file}`;
    md += ` | evidence=${row.raw_evidence.replace(/\s+/g, " ").slice(0, 240)}\n`;
  }

  md += "\n";
}

fs.writeFileSync(OUT_MD, md);

console.log("Strict clean Father’s Day KK pool written.");
console.log("JSON:", OUT_JSON);
console.log("MD:", OUT_MD);
console.log("Rejected:", rejected.length);
console.log("Unresolved:", unresolved.length);

if (Object.values(groups).every((rows) => rows.length === 0)) {
  console.error("FAIL: no clean KK rows found for any approved Father’s Day source.");
  process.exit(1);
}
