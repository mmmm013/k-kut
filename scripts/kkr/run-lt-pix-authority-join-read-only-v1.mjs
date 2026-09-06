#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const value = (flag) => {
  const i = argv.indexOf(flag);
  return i < 0 ? null : argv[i + 1] || null;
};
const inventoryPath = value("--inventory");
const lyricsPath = value("--lyrics");
const boundariesPath = value("--boundaries");
const outputPath = value("--out");

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"' && quoted && next === '"') { cell += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows.shift().map((v) => v.trim());
  return rows.map((cells) => Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""])));
}

function loadRecords(file) {
  if (!file || !fs.existsSync(file)) return { available: false, records: [] };
  const text = fs.readFileSync(file, "utf8");
  const ext = path.extname(file).toLowerCase();
  let records;
  if (ext === ".json") {
    const parsed = JSON.parse(text);
    records = Array.isArray(parsed) ? parsed : parsed.records || parsed.items || [];
  } else if (ext === ".jsonl") {
    records = text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
  } else records = parseCsv(text);
  return { available: true, records };
}

function idOf(record) {
  return String(record.lt_pix_id || record.id || record.parent_lt_pix_id || "").trim();
}
function mapById(records) {
  return new Map(records.map((r) => [idOf(r), r]).filter(([id]) => id));
}
function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; }
  catch { return []; }
}
function nonempty(value) { return typeof value === "string" ? Boolean(value.trim()) : Boolean(value); }

const inventory = loadRecords(inventoryPath);
const lyrics = loadRecords(lyricsPath);
const boundaries = loadRecords(boundariesPath);
const lyricsById = mapById(lyrics.records);
const boundariesById = mapById(boundaries.records);

const sessionInputsAvailable = inventory.available && lyrics.available && boundaries.available;
const results = inventory.records.map((base) => {
  const id = idOf(base);
  const lyric = lyricsById.get(id) || {};
  const boundary = boundariesById.get(id) || {};
  const fullLyrics = lyric.full_lyrics || base.full_lyrics || "";
  const blks = asArray(boundary.blks || base.blks);
  const pairs = asArray(boundary.vtp_intp_pairs || base.vtp_intp_pairs);
  const missing = [];
  if (!nonempty(base.source_audio_path || base.audio_path)) missing.push("source_audio_path");
  if (!nonempty(base.source_audio_sha256 || base.audio_sha256)) missing.push("source_audio_sha256");
  if (!nonempty(fullLyrics)) missing.push("full_lyrics");
  if (!blks.length) missing.push("sequential_blks");
  if (!pairs.length) missing.push("exact_vtp_intp_pairs");

  const legacyLabels = blks.some((b) => /\b(verse|chorus|bridge|outro|pre.?chorus|v\d|ch\d|br)\b/i.test(String(b.id || b.label || b)));
  const exhaustiveAbsence = base.authority_absent_confirmed === true &&
    nonempty(base.authority_absence_search_receipt);

  let partition = "STAGE";
  if (!sessionInputsAvailable) partition = "TRIAGE_SESSION_ACCESS_REQUIRED";
  else if (exhaustiveAbsence) partition = "BLOCKED_MISSING_AUTHORITY";
  else if (missing.length || legacyLabels) partition = "TRIAGE";

  return {
    lt_pix_id: id,
    partition,
    missing_join_fields: missing,
    legacy_section_labels_detected: legacyLabels,
    lineage_preserved: true,
    audio_mutations: 0
  };
});

const counts = results.reduce((out, row) => {
  out[row.partition] = (out[row.partition] || 0) + 1;
  return out;
}, {});

const report = {
  schema_version: "KKUT_LT_PIX_AUTHORITY_JOIN_REPORT_V1",
  mode: "READ_ONLY",
  generated_at: new Date().toISOString(),
  inputs: {
    inventory: { path: inventoryPath, available: inventory.available },
    lyrics: { path: lyricsPath, available: lyrics.available },
    boundaries: { path: boundariesPath, available: boundaries.available }
  },
  truth: {
    catalog_completion_claimed: false,
    inaccessible_authority_called_missing: false,
    source_audio_mutations: 0,
    database_writes: 0,
    deployments: 0
  },
  counts,
  records: results
};

if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify(report, null, 2));
