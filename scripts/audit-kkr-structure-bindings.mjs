import fs from "node:fs";
import path from "node:path";

const manifestPath = "public/mothers-day/thank-you/kks-expanded/manifest.json";

const required = [
  ["thank-you-sec-v1a", "V1a", "v1a", "/mothers-day/thank-you/kks-expanded/thank-you-sec-v1a.mp3"],
  ["thank-you-sec-v1b", "V1b", "v1b", "/mothers-day/thank-you/kks-expanded/thank-you-sec-v1b.mp3"],
  ["thank-you-sec-prech1", "PreCh1", "prech1", "/mothers-day/thank-you/kks-expanded/thank-you-sec-prech1.mp3"],
  ["thank-you-sec-ch1", "Ch1", "ch1", "/mothers-day/thank-you/kks-expanded/thank-you-sec-ch1.mp3"],
  ["thank-you-sec-v2a", "V2a", "v2a", "/mothers-day/thank-you/kks-expanded/thank-you-sec-v2a.mp3"],
  ["thank-you-sec-v2b", "V2b", "v2b", "/mothers-day/thank-you/kks-expanded/thank-you-sec-v2b.mp3"],
  ["thank-you-sec-br", "Br", "br", "/mothers-day/thank-you/kks-expanded/thank-you-sec-br.mp3"],
  ["thank-you-sec-ch2", "Ch2", "ch2", "/mothers-day/thank-you/kks-expanded/thank-you-sec-ch2.mp3"],
  ["thank-you-sec-outro", "Outro", "outro", "/mothers-day/thank-you/kks-expanded/thank-you-sec-outro.mp3"],
];

let failed = false;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

function existsPublic(url) {
  return fs.existsSync(path.join("public", url.replace(/^\//, "")));
}

function banned(row) {
  const s = JSON.stringify(row || {}).toLowerCase();
  return [
    "-cc-",
    "feelline",
    "linefeel",
    "lnduo",
    "lntrio",
    "pime",
    "rmst",
    "mkut",
    "m-kut",
    "micro",
    "instrumental",
    "instro",
    "non-vocal",
    "non vocal",
    "no vocal",
  ].some((x) => s.includes(x));
}

if (!fs.existsSync(manifestPath)) {
  console.error(`FAIL: missing ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const rows = manifest.kks || [];

for (const [id, section, song_section, audio_url] of required) {
  const row = rows.find((x) => x.id === id);

  if (!row) {
    fail(`missing locked Thank You KK row ${id}`);
    continue;
  }

  if (banned(row)) fail(`${id} contains banned internal/non-KK marker`);
  if (row.section !== section) fail(`${id} section must be "${section}", got "${row.section}"`);
  if (row.song_section !== song_section) fail(`${id} song_section must be "${song_section}", got "${row.song_section}"`);
  if (row.audio_url !== audio_url) fail(`${id} audio_url must be "${audio_url}", got "${row.audio_url}"`);
  if (!existsPublic(audio_url)) fail(`missing audio file for ${id}: ${audio_url}`);
}

if (failed) {
  console.error("\nKKr STRUCTURE BINDING AUDIT: FAIL");
  process.exit(1);
}

console.log("KKr STRUCTURE BINDING AUDIT: PASS");
