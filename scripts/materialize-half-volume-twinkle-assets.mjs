import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const policy = JSON.parse(
  fs.readFileSync("data/audio-law/twinkle-volume-policy.json", "utf8")
);

const gain = policy.default_delivery_gain ?? 0.5;
const outDir = "public/audio-system/twinkle-half-volume";
fs.mkdirSync(outDir, { recursive: true });

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else found.push(full);
  }
  return found;
}

const audioFiles = walk("public")
  .filter((file) => /\.(mp3|wav|m4a)$/i.test(file))
  .filter((file) => /twinkle|signature|get-so-down/i.test(file))
  .filter((file) => !file.includes("twinkle-half-volume"));

const materialized = [];

for (const source of audioFiles) {
  const base = path.basename(source).replace(/\.(mp3|wav|m4a)$/i, "");
  const out = path.join(outDir, `${base}-twinkle-50.mp3`);

  try {
    execFileSync("ffmpeg", [
      "-y",
      "-i",
      source,
      "-filter:a",
      `volume=${gain}`,
      "-codec:a",
      "libmp3lame",
      "-q:a",
      "2",
      out
    ], { stdio: "ignore" });

    materialized.push({ source, out, gain });
  } catch (error) {
    console.error(`FAILED ${source}`);
    console.error(error.message);
    process.exit(1);
  }
}

fs.writeFileSync(
  "reports/audio-law/twinkle-half-volume-materialization.json",
  JSON.stringify({
    status: "materialized",
    gain,
    count: materialized.length,
    materialized
  }, null, 2) + "\n"
);

console.log(`TWINKLE HALF-VOLUME MATERIALIZED: ${materialized.length}`);
for (const row of materialized) {
  console.log(`${row.source} -> ${row.out}`);
}
