import fs from "node:fs";
import path from "node:path";

const source = "data/holiday-kks/mothers-day-thank-you-kks.json";
const out = "lib/hugRealKutManifest.ts";

function walk(value, rows = []) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, rows);
  } else if (value && typeof value === "object") {
    if (typeof value.audio_url === "string" && value.audio_url.endsWith(".mp3")) {
      rows.push(value);
    }
    for (const v of Object.values(value)) walk(v, rows);
  }
  return rows;
}

if (!fs.existsSync(source)) {
  console.error(`STOP: missing ${source}`);
  process.exit(1);
}

const json = JSON.parse(fs.readFileSync(source, "utf8"));

const rows = walk(json)
  .filter((row) => {
    const url = row.audio_url;
    const lower = url.toLowerCase();

    if (lower.includes("instro")) return false;
    if (lower.includes("instrumental")) return false;

    const local = path.join("public", url.replace(/^\//, ""));
    return fs.existsSync(local);
  })
  .slice(0, 8);

if (rows.length < 8) {
  console.error(`STOP: only ${rows.length} real MP3-backed KUTs found. Need 8. No fake rows.`);
  process.exit(1);
}

const fallback = [
  ["Warm thank-you kut", "Best first choice for gratitude.", "Final chorus + outro"],
  ["Simple appreciation kut", "Clean, direct thank-you.", "Hook / refrain"],
  ["Family support kut", "For someone who showed up.", "Verse lift"],
  ["Quiet thanks kut", "Soft and personal.", "Outro"],
  ["Big gratitude kut", "For major help or sacrifice.", "Final chorus"],
  ["Friendship thanks kut", "Warm friend-to-friend send.", "Chorus"],
  ["Encouraging thanks kut", "Thanks plus support.", "Bridge to chorus"],
  ["Close-family thank-you kut", "Personal and meaningful.", "Final chorus + outro"],
];

const manifest = rows.map((row, index) => ({
  id: String(row.id || row.kut_id || `thanks-${String(index + 1).padStart(2, "0")}`),
  label: String(row.title || row.label || fallback[index][0]),
  fit: String(row.fit || row.description || fallback[index][1]),
  section: String(row.section || fallback[index][2]),
  previewSrc: String(row.audio_url),
}));

fs.writeFileSync(
  out,
  `export const realHugKuts = ${JSON.stringify({ thanks: manifest }, null, 2)} as const;\n`
);

console.log(`WROTE ${out} with ${manifest.length} real MP3-backed KUTs`);
