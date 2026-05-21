import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const manifestPath = "manifests/wedding/forever-and-a-day-wedding-kut-section-map.draft.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const source = manifest.source_local_path;
const outDir = "incoming/wedding-forever-and-a-day/kuts";

if (!fs.existsSync(source)) {
  console.error(`Missing source file: ${source}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

for (const kut of manifest.kuts) {
  const out = path.join(outDir, `${kut.id}.mp3`);
  const duration = Number(kut.end_sec) - Number(kut.start_sec);

  console.log(`CUT ${kut.id}: ${kut.start_sec}s -> ${kut.end_sec}s (${duration}s)`);

  const result = spawnSync("ffmpeg", [
    "-y",
    "-ss", String(kut.start_sec),
    "-t", String(duration),
    "-i", source,
    "-vn",
    "-codec:a", "libmp3lame",
    "-b:a", "192k",
    out
  ], { stdio: "inherit" });

  if (result.status !== 0) {
    console.error(`Failed cutting ${kut.id}`);
    process.exit(result.status ?? 1);
  }
}

console.log("Done. Draft Wedding KUT cuts written to:", outDir);
