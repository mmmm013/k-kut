import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { assertBlkKkMassGenerationAllowed } from "./lib/blk-kk-text-generation-freeze.mjs";

assertBlkKkMassGenerationAllowed(import.meta.url);

const configPath = "manifests/kkr/audio/ii-delivery-bookend-twinkle.json";

function stop(msg) {
  console.error(`STOP: ${msg}`);
  process.exit(1);
}

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: "inherit" });
}

function publicPathFromUrl(url) {
  return path.join("public", String(url || "").replace(/^\//, ""));
}

if (!fs.existsSync(configPath)) stop(`missing ${configPath}`);

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

if (!fs.existsSync(config.signature_end_sound_path)) {
  stop(`missing Signature End Sound / Twinkle at ${config.signature_end_sound_path}`);
}

fs.mkdirSync(config.delivery_root, { recursive: true });

run("node", ["scripts/build-real-hug-kut-manifest.mjs"]);

const manifestUrl = pathToFileURL(path.resolve(config.source_manifest)).href + `?ii=${Date.now()}`;
const { realHugKuts } = await import(manifestUrl);

const rows = realHugKuts?.thanks || [];
if (!Array.isArray(rows) || rows.length < 1) stop("no HUG rows found");

const deliveryRows = [];

for (const row of rows) {
  const source = publicPathFromUrl(row.previewSrc);
  if (!fs.existsSync(source)) stop(`missing raw source audio for ${row.id}: ${source}`);

  const outFile = path.join(config.delivery_root, `${row.id}-ii-delivery.mp3`);
  const silenceFile = path.join(config.delivery_root, `_silence-${row.id}.mp3`);
  const concatFile = path.join(config.delivery_root, `_concat-${row.id}.txt`);

  run("ffmpeg", [
    "-y",
    "-f", "lavfi",
    "-i", "anullsrc=r=44100:cl=stereo",
    "-t", String(config.front_bookend_seconds),
    "-c:a", "libmp3lame",
    "-q:a", "2",
    silenceFile
  ]);

  fs.writeFileSync(
    concatFile,
    [
      `file '${path.resolve(silenceFile)}'`,
      `file '${path.resolve(source)}'`,
      `file '${path.resolve(silenceFile)}'`,
      `file '${path.resolve(config.signature_end_sound_path)}'`
    ].join("\n") + "\n"
  );

  run("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatFile,
    "-vn",
    "-c:a", "libmp3lame",
    "-q:a", "2",
    outFile
  ]);

  fs.rmSync(silenceFile, { force: true });
  fs.rmSync(concatFile, { force: true });

  deliveryRows.push({
    id: row.id,
    label: row.label,
    raw_preview_src: row.previewSrc,
    ii_delivery_src: "/" + outFile.replace(/^public\//, ""),
    front_bookend_seconds: config.front_bookend_seconds,
    back_bookend_seconds: config.back_bookend_seconds,
    signature_end_sound_name: config.signature_end_sound_name,
    signature_end_sound_path: config.signature_end_sound_path
  });

  console.log(`II delivery materialized: ${row.id} -> ${outFile}`);
}

fs.writeFileSync(
  path.join(config.delivery_root, "ii-delivery-manifest.json"),
  JSON.stringify({ status: "materialized", rows: deliveryRows }, null, 2) + "\n"
);

console.log(`DONE: ${deliveryRows.length} II delivery files include bookends + Signature End Sound / Twinkle.`);
