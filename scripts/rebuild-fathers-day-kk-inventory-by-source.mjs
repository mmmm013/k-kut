import fs from "node:fs";

const authorityPath = "data/fathers-day/fathers-day-source-authority.json";

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
  "i am a fighter",
  "salt of the earth",
  "best of the nights of our lives",
  "why does life have to be this hard",
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

function slug(value) {
  return norm(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function hasHardReject(text) {
  const n = norm(text);
  return HARD_REJECT.some((term) => n.includes(norm(term)));
}

function urls(text) {
  return [...String(text).matchAll(/https?:\/\/[^\s|"]+/gi)].map((m) => m[0]);
}

function uuid(text) {
  const m = String(text).match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  return m ? m[0] : "";
}

function queue(text) {
  const m = String(text).match(/\b(active_kk_\d+|tbkk_\d+)\b/i);
  return m ? m[1] : "";
}

function kkNumber(text) {
  const m = String(text).match(/(?:—|-)\s*KK\s*(\d+)\b/i);
  return m ? Number(m[1]) : null;
}

function splitRows(text) {
  const flat = String(text)
    .replace(/\r/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\s+-\s+(?=active_kk_\d+)/g, "\nactive_kk_")
    .replace(/\s+-\s+(?=tbkk_\d+)/g, "\ntbkk_")
    .replace(/\s+-\s+(?=\d{6}\s*\|)/g, "\n")
    .replace(/\s+-\s+(?=[^|\n]{2,160}\s+—\s+KK\s+\d+)/g, "\n");

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

function sourceVariants(source) {
  return [source.canonical, source.display, ...(source.variants || [])].filter(Boolean);
}

function rowMentionsSource(row, source) {
  const n = norm(row);
  return sourceVariants(source).some((v) => n.includes(norm(v)));
}

function sourceKeysFromRow(row, source) {
  const keys = new Set();

  for (const v of sourceVariants(source)) {
    const nv = norm(v);
    if (nv) keys.add(nv);
    if (nv) keys.add(slug(nv));
  }

  for (const url of urls(row)) {
    const decoded = decodeURIComponent(url);
    const nurl = norm(decoded);
    for (const v of sourceVariants(source)) {
      if (nurl.includes(norm(v))) {
        keys.add(nurl);
        keys.add(slug(decoded));
      }
    }
  }

  const best = row.match(/\bBEST=([^|"\n]+)/i);
  if (best && rowMentionsSource(best[1], source)) {
    keys.add(norm(best[1]));
    keys.add(slug(best[1]));
  }

  return [...keys].filter(Boolean);
}

function isPotentialKKRow(row) {
  return (
    /\b(active_kk_\d+|tbkk_\d+)\b/i.test(row) ||
    /\bkk=[a-f0-9-]{36}\b/i.test(row) ||
    /(?:—|-)\s*KK\s*\d+\b/i.test(row) ||
    /\bKK count:\s*\d+\b/i.test(row)
  );
}

function rowBelongsToSource(row, source, sourceKeys) {
  const n = norm(row);
  const rowSlug = slug(row);

  if (rowMentionsSource(row, source)) return true;

  const best = row.match(/\bBEST=([^|"\n]+)/i);
  if (best && rowMentionsSource(best[1], source)) return true;

  for (const key of sourceKeys) {
    if (!key) continue;
    if (n.includes(key)) return true;
    if (rowSlug.includes(key)) return true;
  }

  return false;
}

function classifyRow(row) {
  if (/\bactive_kk_\d+\b/i.test(row)) return "active_kk";
  if (/\btbkk_\d+\b/i.test(row)) return "tbkk";
  if (/\bkk=[a-f0-9-]{36}\b/i.test(row)) return "kk_equals";
  if (/(?:—|-)\s*KK\s*\d+\b/i.test(row)) return "title_dash_kk";
  if (/\bKK count:\s*\d+\b/i.test(row)) return "kk_count_summary";
  return "source_evidence";
}

const authority = JSON.parse(read(authorityPath));

const sourceRegistry = {};
const inventory = {};
const rejected = [];

for (const source of authority.approved_sources) {
  sourceRegistry[source.display] = {
    display: source.display,
    canonical: source.canonical,
    variants: sourceVariants(source),
    source_keys: [],
    source_urls: [],
    evidence: []
  };

  inventory[source.display] = [];
}

for (const file of SEARCH_FILES) {
  const text = read(file);
  if (!text) continue;

  const rows = splitRows(text);

  for (const row of rows) {
    if (hasHardReject(row)) continue;

    for (const source of authority.approved_sources) {
      if (!rowMentionsSource(row, source)) continue;

      const reg = sourceRegistry[source.display];

      for (const key of sourceKeysFromRow(row, source)) reg.source_keys.push(key);

      for (const url of urls(row)) {
        const decoded = decodeURIComponent(url);
        if (sourceVariants(source).some((v) => norm(decoded).includes(norm(v)))) {
          reg.source_urls.push(url);
        }
      }

      if (reg.evidence.length < 20) {
        reg.evidence.push({
          file,
          row: row.replace(/\s+/g, " ").slice(0, 500)
        });
      }
    }
  }
}

for (const reg of Object.values(sourceRegistry)) {
  reg.source_keys = [...new Set(reg.source_keys)].filter(Boolean);
  reg.source_urls = [...new Set(reg.source_urls)].filter(Boolean);
}

for (const file of SEARCH_FILES) {
  const text = read(file);
  if (!text) continue;

  const rows = splitRows(text);

  for (const row of rows) {
    if (!isPotentialKKRow(row)) continue;

    if (hasHardReject(row)) {
      rejected.push({ file, reason: "hard_reject", row: row.slice(0, 300) });
      continue;
    }

    for (const source of authority.approved_sources) {
      const reg = sourceRegistry[source.display];

      if (!rowBelongsToSource(row, source, reg.source_keys)) continue;

      inventory[source.display].push({
        source: source.display,
        source_canonical: source.canonical,
        evidence_type: classifyRow(row),
        file,
        queue: queue(row),
        kk_id: uuid(row),
        kk_number: kkNumber(row),
        audio_urls: urls(row),
        raw_proof_only: true,
        delivery_status: "not_customer_delivery_not_materialized",
        row: row.replace(/\s+/g, " ").slice(0, 700)
      });
    }
  }
}

for (const source of Object.keys(inventory)) {
  const seen = new Set();

  inventory[source] = inventory[source].filter((item) => {
    const key = [
      item.source,
      item.evidence_type,
      item.queue,
      item.kk_id,
      item.kk_number,
      item.audio_urls.join(","),
      item.row
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const unresolved = Object.entries(inventory)
  .filter(([, rows]) => rows.length === 0)
  .map(([source]) => `${source}: no source-identity KK inventory rows found yet.`);

const result = {
  status: "fathers_day_source_identity_kk_inventory_qa",
  rule: "PIX title is not a buyer match signal. Source authority locates allowed source material. Rows are inventoried only when source identity is supported; suspect linkage is separated from confirmed inventory.",
  source_registry: sourceRegistry,
  inventory,
  unresolved,
  rejected_count: rejected.length,
  rejected_sample: rejected.slice(0, 50)
};

fs.mkdirSync("reports/fathers-day", { recursive: true });
fs.writeFileSync("reports/fathers-day/fathers-day-source-identity-kk-inventory.json", JSON.stringify(result, null, 2) + "\n");

let md = "# Father’s Day KK Inventory — Source Identity QA Rebuild\n\n";
md += "PIX title is not a buyer match signal. It is used only for authority, provenance, lookup, labeling, and backend tracking.\n\n";
md += "Raw KK proof remains separate from customer II delivery audio.\n\n";

md += "## Source Identity Registry\n\n";
for (const [source, reg] of Object.entries(sourceRegistry)) {
  md += `### ${source}\n\n`;
  md += `- source keys: ${reg.source_keys.length}\n`;
  md += `- source urls: ${reg.source_urls.length}\n`;
  for (const url of reg.source_urls.slice(0, 8)) md += `  - ${url}\n`;
  md += "\n";
}

md += "## Inventory Counts\n\n";
for (const [source, rows] of Object.entries(inventory)) {
  const byType = rows.reduce((acc, row) => {
    acc[row.evidence_type] = (acc[row.evidence_type] || 0) + 1;
    return acc;
  }, {});

  md += `- ${source}: ${rows.length} raw KK inventory/proof row(s)`;
  const typeText = Object.entries(byType).map(([k, v]) => `${k}=${v}`).join(", ");
  if (typeText) md += ` (${typeText})`;
  md += "\n";
}

md += "\n## Unresolved\n\n";
if (unresolved.length) {
  for (const item of unresolved) md += `- ${item}\n`;
} else {
  md += "PASS: all approved sources have source-identity KK inventory rows.\n";
}

md += "\n## Detail\n\n";
for (const [source, rows] of Object.entries(inventory)) {
  md += `### ${source}\n\n`;

  if (!rows.length) {
    md += "- No source-identity KK rows found yet.\n\n";
    continue;
  }

  for (const row of rows.slice(0, 120)) {
    md += `- ${row.evidence_type}`;
    if (row.queue) md += ` | queue=${row.queue}`;
    if (row.kk_id) md += ` | kk=${row.kk_id}`;
    if (row.kk_number !== null) md += ` | kk_number=${row.kk_number}`;
    if (row.audio_urls.length) md += ` | audio=${row.audio_urls[0]}`;
    md += ` | file=${row.file}`;
    md += ` | delivery=${row.delivery_status}`;
    md += ` | evidence=${row.row.slice(0, 260)}\n`;
  }

  md += "\n";
}

fs.writeFileSync("reports/fathers-day/fathers-day-source-identity-kk-inventory.md", md);

console.log("Father’s Day source-identity KK inventory rebuilt.");
console.log("MD: reports/fathers-day/fathers-day-source-identity-kk-inventory.md");
console.log("JSON: reports/fathers-day/fathers-day-source-identity-kk-inventory.json");

for (const [source, rows] of Object.entries(inventory)) {
  console.log(`${source}: ${rows.length}`);
}

if (Object.values(inventory).every((rows) => rows.length === 0)) {
  console.error("FAIL: no Father’s Day source-identity KK inventory rows found.");
  process.exit(1);
}
