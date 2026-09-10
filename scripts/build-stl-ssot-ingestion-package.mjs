import fs from "node:fs";
import path from "node:path";
import { buildStlSsotIngestionSql } from "./lib/stl-playlist-import.mjs";

const args = process.argv.slice(2);

function option(name, fallback = "") {
  const index = args.indexOf(name);
  if (index < 0) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${name} requires a value`);
  }
  return value;
}

const csvPath = option("--csv", args[0] || "");
if (!csvPath) {
  throw new Error("Usage: node scripts/build-stl-ssot-ingestion-package.mjs --csv /absolute/path/to/newest-stl.csv [--output /absolute/path/to/package.sql] [--source-name name] [--playlist-name name] [--mix-type FM_LT_PIX] [--lane FM_LT_PIX] [--snapshot-ts 2026-09-10T18:00:00Z] [--source-system STL]");
}

const sourceText = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const sql = buildStlSsotIngestionSql({
  csvText: sourceText,
  fileName: path.basename(csvPath),
  metadata: {
    sourceName: option("--source-name", path.basename(csvPath)),
    playlistName: option("--playlist-name", ""),
    mixType: option("--mix-type", ""),
    lane: option("--lane", ""),
    snapshotTs: option("--snapshot-ts", ""),
    sourceSystem: option("--source-system", ""),
  },
});

const outputPath = option("--output", "");
if (outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, sql);
  console.log(JSON.stringify({ ok: true, outputPath, bytes: Buffer.byteLength(sql) }, null, 2));
} else {
  process.stdout.write(sql);
}
