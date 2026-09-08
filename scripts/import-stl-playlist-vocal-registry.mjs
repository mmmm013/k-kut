import fs from "node:fs";
import path from "node:path";

const sourcePath = process.argv[2];
const outputPath = process.argv[3] || "private-artifacts/gpmx-stl-vocal-registry.json";
if (!sourcePath) throw new Error("Usage: node scripts/import-stl-playlist-vocal-registry.mjs <playlist.csv> [output.json]");

function parseCsv(text) {
  const rows = []; let row = []; let field = ""; let quote = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i], next = text[i + 1];
    if (c === '"' && quote && next === '"') { field += '"'; i += 1; }
    else if (c === '"') quote = !quote;
    else if (c === ',' && !quote) { row.push(field); field = ""; }
    else if ((c === '\n' || c === '\r') && !quote) { if (c === '\r' && next === '\n') i += 1; row.push(field); if (row.some((v) => v.trim())) rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] || ""])));
}
function normalized(value) { return String(value || "").toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim(); }
function classify(track) {
  const name = normalized(track["Track name"]);
  const album = normalized(track.Album);
  if (/\b(instro|instrumental|instro only)\b/.test(name) || /\binstrumental\b/.test(album)) return "IN_PIX_CANDIDATE";
  if (/\bcover\b/.test(name) || /\bcover\b/.test(album)) return "HOLD_RIGHTS_OR_MASTER_VERIFICATION";
  return "VOCAL_LT_PIX_CANDIDATE";
}
const rows = parseCsv(fs.readFileSync(sourcePath, "utf8").replace(/^\uFEFF/, ""));
const records = rows.map((track) => ({
  disco_track_id: String(track["Track ID"] || "").trim(), track_name: String(track["Track name"] || "").trim(),
  album: String(track.Album || "").trim(), artist: String(track.Artist || "").trim(), isrc: String(track.ISRC || "").trim(),
  classification: classify(track), source: "GPMx STL Playlist 09-08-26.csv",
})).filter((record) => record.disco_track_id && record.track_name);
const totals = Object.fromEntries(["VOCAL_LT_PIX_CANDIDATE", "IN_PIX_CANDIDATE", "HOLD_RIGHTS_OR_MASTER_VERIFICATION"].map((state) => [state, records.filter((record) => record.classification === state).length]));
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ source: "GPMx STL Playlist 09-08-26.csv", imported_at: new Date().toISOString(), totals, records }, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, totals }, null, 2));
