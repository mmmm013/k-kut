import fs from "node:fs";
import path from "node:path";
import {
  buildStlImportRecords,
  buildStlImportSummary,
  normalizeStlPlaylistMetadata,
} from "./lib/stl-playlist-import.mjs";

const sourcePath = process.argv[2];
const outputPath = process.argv[3] || "private-artifacts/gpmx-stl-vocal-registry.json";
if (!sourcePath) throw new Error("Usage: node scripts/import-stl-playlist-vocal-registry.mjs <playlist.csv> [output.json]");

const sourceName = process.argv[4] || path.basename(sourcePath);
const text = fs.readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, "");
const metadata = normalizeStlPlaylistMetadata({ sourceName }, path.basename(sourcePath));
const records = buildStlImportRecords(text, metadata).map((record) => ({
  disco_track_id: record.disco_track_id,
  stl_id: record.stl_id,
  track_key: record.track_key,
  track_name: record.track_name,
  album: record.album,
  artist: record.artist,
  isrc: record.isrc,
  classification: record.classification,
  mix_type: record.mix_type,
  lane: record.lane,
  source_system: record.source_system,
  snapshot_ts: record.snapshot_ts,
  source: metadata.sourceName,
}));
const totals = buildStlImportSummary(records);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ metadata, imported_at: new Date().toISOString(), totals, records }, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, metadata, totals }, null, 2));
