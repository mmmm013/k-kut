import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.production.local", override: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const outDir = "reports/kk-inventory";
fs.mkdirSync(outDir, { recursive: true });

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function writeCsv(file, rows, columns) {
  const lines = [];
  lines.push(columns.map(csvEscape).join(","));
  for (const row of rows) {
    lines.push(columns.map((c) => csvEscape(row[c])).join(","));
  }
  fs.writeFileSync(file, lines.join("\n") + "\n");
}

async function fetchAll(table, columns, pageSize = 1000) {
  let rows = [];
  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from(table)
      .select(columns.join(","))
      .range(from, to);

    if (error) throw new Error(`${table}: ${error.message}`);
    rows = rows.concat(data ?? []);
    console.log(`${table}: fetched ${rows.length}`);
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

const tracksCols = [
  "id",
  "title",
  "artist",
  "album",
  "duration",
  "duration_sec",
  "mp3_url",
  "audio_url",
  "bucket_id",
  "file_path",
  "created_at"
];

const kkCols = [
  "id",
  "title",
  "description",
  "track_id",
  "pass_type",
  "parent_kut_id",
  "generated_by",
  "generation_run_id",
  "mk_index",
  "kk_index",
  "audio_url",
  "mp3_url",
  "status",
  "broken_reason_notes",
  "first_live_date",
  "last_checked_date",
  "checked_by",
  "ai_touched"
];

const mkCols = [
  "id",
  "mk_id",
  "title",
  "phrase",
  "display_text",
  "description",
  "product_or_offer",
  "processed_format",
  "status",
  "source_title",
  "track_id",
  "capture_start_sec",
  "capture_end_sec",
  "audio_url",
  "mp3_url",
  "keenness_score",
  "phrase_type",
  "object_type"
];

async function safeExport(table, columns, fileName) {
  try {
    const rows = await fetchAll(table, columns);
    writeCsv(path.join(outDir, fileName), rows, columns);
    return { table, count: rows.length, file: path.join(outDir, fileName), rows };
  } catch (err) {
    return { table, error: err.message, count: 0, file: null, rows: [] };
  }
}

const tracks = await safeExport("tracks", tracksCols, "tracks.csv");
const kks = await safeExport("k_kuts", kkCols, "k_kuts.csv");
const mks = await safeExport("mks", mkCols, "mks.csv");

const summaries = [tracks, kks, mks];

const report = [];
report.push("# KK Inventory Export");
report.push("");
report.push(`Generated: ${new Date().toISOString()}`);
report.push("");
for (const s of summaries) {
  report.push(`## ${s.table}`);
  report.push("");
  if (s.error) {
    report.push(`ERROR: ${s.error}`);
  } else {
    report.push(`Count: ${s.count}`);
    report.push(`CSV: ${s.file}`);
  }
  report.push("");
}

if (!kks.error) {
  const byPass = new Map();
  const byGen = new Map();
  let withAudio = 0;
  let withoutAudio = 0;

  for (const row of kks.rows) {
    byPass.set(row.pass_type || "(blank)", (byPass.get(row.pass_type || "(blank)") || 0) + 1);
    byGen.set(row.generated_by || "(blank)", (byGen.get(row.generated_by || "(blank)") || 0) + 1);
    if (row.audio_url || row.mp3_url) withAudio++;
    else withoutAudio++;
  }

  report.push("## K-KUT Rollups");
  report.push("");
  report.push(`With audio URL: ${withAudio}`);
  report.push(`Without audio URL: ${withoutAudio}`);
  report.push("");
  report.push("By pass_type:");
  for (const [k, v] of [...byPass.entries()].sort()) report.push(`- ${k}: ${v}`);
  report.push("");
  report.push("By generated_by:");
  for (const [k, v] of [...byGen.entries()].sort()) report.push(`- ${k}: ${v}`);
  report.push("");
}

if (!mks.error) {
  const byStatus = new Map();
  let withAudio = 0;
  let withoutAudio = 0;

  for (const row of mks.rows) {
    byStatus.set(row.status || "(blank)", (byStatus.get(row.status || "(blank)") || 0) + 1);
    if (row.audio_url || row.mp3_url) withAudio++;
    else withoutAudio++;
  }

  report.push("## mK Rollups");
  report.push("");
  report.push(`With audio URL: ${withAudio}`);
  report.push(`Without audio URL: ${withoutAudio}`);
  report.push("");
  report.push("By status:");
  for (const [k, v] of [...byStatus.entries()].sort()) report.push(`- ${k}: ${v}`);
  report.push("");
}

const reportPath = path.join(outDir, "inventory-summary.md");
fs.writeFileSync(reportPath, report.join("\n"));

console.log("");
console.log(report.join("\n"));
console.log("");
console.log(`REPORT=${reportPath}`);
