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
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function writeCsv(file, rows, columns) {
  const lines = [columns.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(columns.map((c) => csvEscape(row[c])).join(","));
  }
  fs.writeFileSync(file, lines.join("\n") + "\n");
}

async function getColumns(table) {
  const { data, error } = await supabase.from(table).select("*").limit(1);
  if (error) throw new Error(`${table} column probe: ${error.message}`);
  return Object.keys(data?.[0] ?? {});
}

async function fetchAll(table, pageSize = 1000) {
  let rows = [];
  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase.from(table).select("*").range(from, to);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows = rows.concat(data ?? []);
    console.log(`${table}: fetched ${rows.length}`);
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

async function exportTable(table) {
  try {
    const columns = await getColumns(table);
    const rows = await fetchAll(table);
    const file = path.join(outDir, `${table}.auto.csv`);
    writeCsv(file, rows, columns);
    return { table, columns, rows, count: rows.length, file };
  } catch (err) {
    return { table, error: err.message, columns: [], rows: [], count: 0, file: null };
  }
}

const tables = ["tracks", "k_kuts", "mks"];
const exports = [];

for (const table of tables) {
  exports.push(await exportTable(table));
}

const report = [];
report.push("# KK Inventory Auto Export");
report.push("");
report.push(`Generated: ${new Date().toISOString()}`);
report.push("");

for (const e of exports) {
  report.push(`## ${e.table}`);
  report.push("");
  if (e.error) {
    report.push(`ERROR: ${e.error}`);
  } else {
    report.push(`Count: ${e.count}`);
    report.push(`CSV: ${e.file}`);
    report.push(`Columns: ${e.columns.join(", ")}`);
  }
  report.push("");
}

const kks = exports.find((x) => x.table === "k_kuts");
if (kks && !kks.error) {
  const titleKey = kks.columns.includes("title") ? "title" : null;
  const audioKeys = kks.columns.filter((c) => ["audio_url", "mp3_url", "delivered_url_or_path"].includes(c));
  const passKey = kks.columns.includes("pass_type") ? "pass_type" : null;
  const genKey = kks.columns.includes("generated_by") ? "generated_by" : null;

  let withAudio = 0;
  let withoutAudio = 0;
  const byPass = new Map();
  const byGen = new Map();

  for (const row of kks.rows) {
    const hasAudio = audioKeys.some((k) => row[k]);
    if (hasAudio) withAudio++;
    else withoutAudio++;

    if (passKey) byPass.set(row[passKey] || "(blank)", (byPass.get(row[passKey] || "(blank)") || 0) + 1);
    if (genKey) byGen.set(row[genKey] || "(blank)", (byGen.get(row[genKey] || "(blank)") || 0) + 1);
  }

  report.push("## K-KUT Rollups");
  report.push("");
  report.push(`Audio fields detected: ${audioKeys.join(", ") || "(none)"}`);
  report.push(`With audio field: ${withAudio}`);
  report.push(`Without audio field: ${withoutAudio}`);
  report.push("");
  if (passKey) {
    report.push("By pass_type:");
    for (const [k, v] of [...byPass.entries()].sort()) report.push(`- ${k}: ${v}`);
    report.push("");
  }
  if (genKey) {
    report.push("By generated_by:");
    for (const [k, v] of [...byGen.entries()].sort()) report.push(`- ${k}: ${v}`);
    report.push("");
  }

  report.push("Sample K-KUT rows:");
  for (const row of kks.rows.slice(0, 20)) {
    const bits = [];
    if (titleKey) bits.push(`title=${row[titleKey]}`);
    if (passKey) bits.push(`pass_type=${row[passKey] ?? ""}`);
    if (genKey) bits.push(`generated_by=${row[genKey] ?? ""}`);
    for (const k of audioKeys) if (row[k]) bits.push(`${k}=${row[k]}`);
    report.push(`- ${bits.join(" | ")}`);
  }
  report.push("");
}

const mks = exports.find((x) => x.table === "mks");
if (mks && !mks.error) {
  const audioKeys = mks.columns.filter((c) => ["audio_url", "mp3_url"].includes(c));
  const statusKey = mks.columns.includes("status") ? "status" : null;
  let withAudio = 0;
  let withoutAudio = 0;
  const byStatus = new Map();

  for (const row of mks.rows) {
    const hasAudio = audioKeys.some((k) => row[k]);
    if (hasAudio) withAudio++;
    else withoutAudio++;
    if (statusKey) byStatus.set(row[statusKey] || "(blank)", (byStatus.get(row[statusKey] || "(blank)") || 0) + 1);
  }

  report.push("## mK Rollups");
  report.push("");
  report.push(`Audio fields detected: ${audioKeys.join(", ")}`);
  report.push(`With audio field: ${withAudio}`);
  report.push(`Without audio field: ${withoutAudio}`);
  if (statusKey) {
    report.push("");
    report.push("By status:");
    for (const [k, v] of [...byStatus.entries()].sort()) report.push(`- ${k}: ${v}`);
  }
  report.push("");
}

const reportPath = path.join(outDir, "inventory-summary-auto.md");
fs.writeFileSync(reportPath, report.join("\n"));

console.log("");
console.log(report.join("\n"));
console.log("");
console.log(`REPORT=${reportPath}`);
