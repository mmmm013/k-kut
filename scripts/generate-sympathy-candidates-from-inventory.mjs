import fs from "node:fs";
import path from "node:path";
import { assertBlkKkMassGenerationAllowed } from "./lib/blk-kk-text-generation-freeze.mjs";

assertBlkKkMassGenerationAllowed(import.meta.url);

const outDir = "data/intent-candidates/sympathy";
const outJson = `${outDir}/candidates.json`;
const outMd = `${outDir}/candidate-report.md`;

fs.mkdirSync(outDir, { recursive: true });

const sourceFiles = [
  "reports/kk-inventory/k_kuts.auto.csv",
  ...fs.existsSync("reports/title-blind-kut-batch-scoring-csvs")
    ? fs.readdirSync("reports/title-blind-kut-batch-scoring-csvs")
        .filter((f) => f.endsWith(".csv"))
        .map((f) => `reports/title-blind-kut-batch-scoring-csvs/${f}`)
    : []
].filter((f) => fs.existsSync(f));

const positiveSignals = [
  "grief",
  "sympathy",
  "memorial",
  "remembrance",
  "remember",
  "comfort",
  "support",
  "loss",
  "missing",
  "miss you",
  "care",
  "peace",
  "gentle",
  "shelter",
  "carry",
  "dark days",
  "beside me",
  "always there",
  "listening",
  "healing",
  "hope",
  "through",
  "remain"
];

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
  "birthday",
  "anniversary",
  "valentine",
  "kupid",
  "baby i miss you",
  "baby we're through",
  "baby we are through",
  "breakup",
  "ex ",
  "test example"
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (quoted && ch === '"' && next === '"') {
      cell += '"';
      i++;
      continue;
    }

    if (ch === '"') {
      quoted = !quoted;
      continue;
    }

    if (!quoted && ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!quoted && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell || row.length) {
    row.push(cell);
    if (row.some((v) => v.trim() !== "")) rows.push(row);
  }

  return rows;
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((h, i) => {
    obj[h || `col_${i}`] = row[i] ?? "";
  });
  return obj;
}

function haystack(obj) {
  return Object.values(obj)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hits(text, terms) {
  return terms.filter((term) => text.includes(term));
}

function hardRejectRow(obj, text) {
  const title = String(
    obj.title ||
      obj.track_title ||
      obj.pix_title ||
      obj.song_title ||
      obj.name ||
      ""
  ).toLowerCase();

  const typeText = String(
    obj.type ||
      obj.kut_type ||
      obj.asset_type ||
      obj.kind ||
      ""
  ).toLowerCase();

  // Public buyer flow is KK-only. For high-risk Sympathy sampling,
  // keep candidate review KK-only too unless admin explicitly opens mK review.
  if (title.includes("— mk") || title.includes(" mK ".toLowerCase()) || /\bmk\b/i.test(title)) {
    return "reject_mk";
  }

  if (typeText.includes("mk") || typeText.includes("mini")) {
    return "reject_mk";
  }

  if (title.includes("test example")) return "reject_test_example";

  if (title.includes("baby i miss you")) return "reject_romance_missing";
  if (title.includes("baby we're through") || title.includes("baby we are through")) return "reject_breakup";
  if (text.includes("breakup")) return "reject_breakup";

  return "";
}

const candidates = [];
const seen = new Set();

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  const rows = parseCsv(text);
  if (rows.length < 2) continue;

  const headers = rows[0].map((h) => h.trim());
  for (const row of rows.slice(1)) {
    const obj = rowToObject(headers, row);
    const h = haystack(obj);

    const hardRejectReason = hardRejectRow(obj, h);
    if (hardRejectReason) continue;

    const positiveHits = hits(h, positiveSignals);
    if (positiveHits.length === 0) continue;

    const forbiddenHits = hits(h, forbiddenSignals);

    const id =
      obj.id ||
      obj.k_kut_id ||
      obj.kk_id ||
      obj.track_id ||
      obj.source_id ||
      `${file}:${candidates.length + 1}`;

    const title =
      obj.title ||
      obj.track_title ||
      obj.pix_title ||
      obj.song_title ||
      obj.name ||
      "Untitled candidate";

    const key = `${id}:${title}`;
    if (seen.has(key)) continue;
    seen.add(key);

    candidates.push({
      id: String(id),
      title: String(title),
      source_file: file,
      source_pix: obj.pix_title || obj.track_title || obj.song_title || obj.source_pix || "",
      section_context:
        obj.section ||
        obj.kut_section ||
        obj.lyric_context ||
        obj.context ||
        obj.description ||
        "",
      raw_fields: obj,
      intent: "sympathy_candidate",
      positive_signal_hits: positiveHits,
      forbidden_signal_hits: forbiddenHits,
      suggested_sampling_status:
        forbiddenHits.length > 0 ? "REPROCESS" : "HOLD",
      publication_allowed: false,
      human_approved: false,
      audio_delivery_safe: false,
      buyer_copy_safe: false,
      receiver_risk_reviewed: false,
      payment_allowed: false,
      sampling_notes: ""
    });
  }
}

candidates.sort((a, b) => {
  const aScore = a.positive_signal_hits.length - a.forbidden_signal_hits.length * 3;
  const bScore = b.positive_signal_hits.length - b.forbidden_signal_hits.length * 3;
  return bScore - aScore;
});

const limited = candidates.slice(0, 150);

const payload = {
  status: "candidate_pool_generated_non_public",
  intent: "sympathy",
  publication_allowed: false,
  generated_at: new Date().toISOString(),
  source_files_scanned: sourceFiles,
  candidate_count: limited.length,
  rule: "Candidate rows are not approved and cannot publish. Gregory samples candidates after KKr scoring.",
  rows: limited
};

fs.writeFileSync(outJson, JSON.stringify(payload, null, 2) + "\n");

let md = "";
md += "# Sympathy Candidate Sampling Report\n\n";
md += "Status: non-public candidate review only.\n\n";
md += `Generated: ${payload.generated_at}\n\n`;
md += `Candidates: ${limited.length}\n\n`;
md += "| # | Suggested | Title | Positive Signals | Forbidden Signals | Source |\n";
md += "|---:|---|---|---|---|---|\n";

limited.forEach((row, index) => {
  md += `| ${index + 1} | ${row.suggested_sampling_status} | ${String(row.title).replaceAll("|", "/")} | ${row.positive_signal_hits.join(", ") || "none"} | ${row.forbidden_signal_hits.join(", ") || "none"} | ${path.basename(row.source_file)} |\n`;
});

fs.writeFileSync(outMd, md);

console.log(`WROTE ${outJson}`);
console.log(`WROTE ${outMd}`);
console.log(`CANDIDATES ${limited.length}`);
