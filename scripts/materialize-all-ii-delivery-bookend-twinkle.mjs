import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();

const registryPath = "data/ii-delivery-registry/romance-reusable-ii-records.json";
const publicOutDir = "public/ii-delivery/romance";
const tempDir = ".tmp/ii-delivery-materialize";

const twinklePath = "public/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3";

const FRONT_PAD_SECONDS = 1.0;
const BACK_PAD_SECONDS = 1.0;

function fail(message) {
  console.error("FAIL:", message);
  process.exit(1);
}

function run(cmd, args, label) {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: ROOT
  });

  if (result.status !== 0) {
    fail(`${label} failed`);
  }
}

function safeSlug(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

if (!fs.existsSync(registryPath)) fail(`Missing registry: ${registryPath}`);
if (!fs.existsSync(twinklePath)) fail(`Missing required Twinkle / Signature End Sound: ${twinklePath}`);

run("ffmpeg", ["-version"], "ffmpeg availability check");

fs.mkdirSync(publicOutDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const records = registry.records || [];

if (!records.length) fail("No reusable II records found.");

let materialized = 0;

for (const record of records) {
  if (!record.kk_id) fail(`Record missing kk_id: ${record.ii_id || "UNKNOWN"}`);

  const sourcePath = record.local_source_path;

  if (!sourcePath) fail(`${record.ii_id} missing local_source_path.`);
  if (/instro|instrumental/i.test(sourcePath)) fail(`${record.ii_id} points to forbidden INSTRO source.`);
  if (!fs.existsSync(sourcePath)) fail(`${record.ii_id} local source missing: ${sourcePath}`);

  if (record.start_seconds == null || record.end_seconds == null) {
    fail(`${record.ii_id} missing start/end seconds.`);
  }

  const slug = safeSlug(`${record.public_label}-${record.kk_id}`);
  const outRel = `${publicOutDir}/${slug}-bookend-twinkle.mp3`;
  const outAbs = path.join(ROOT, outRel);

  const frontPad = path.join(ROOT, tempDir, `${slug}-front-pad.mp3`);
  const kkClip = path.join(ROOT, tempDir, `${slug}-kk.mp3`);
  const backPad = path.join(ROOT, tempDir, `${slug}-back-pad.mp3`);
  const concatList = path.join(ROOT, tempDir, `${slug}-concat.txt`);

  console.log("");
  console.log("Materializing:", record.ii_id);
  console.log("Source:", sourcePath);
  console.log("KK:", record.kk_id);
  console.log("Output:", outRel);

  run("ffmpeg", [
    "-y",
    "-f", "lavfi",
    "-i", "anullsrc=r=44100:cl=stereo",
    "-t", String(FRONT_PAD_SECONDS),
    "-q:a", "9",
    "-acodec", "libmp3lame",
    frontPad
  ], "front padding");

  run("ffmpeg", [
    "-y",
    "-ss", String(record.start_seconds),
    "-to", String(record.end_seconds),
    "-i", sourcePath,
    "-vn",
    "-ac", "2",
    "-ar", "44100",
    "-q:a", "2",
    kkClip
  ], "KK extract from local GPMC source");

  run("ffmpeg", [
    "-y",
    "-f", "lavfi",
    "-i", "anullsrc=r=44100:cl=stereo",
    "-t", String(BACK_PAD_SECONDS),
    "-q:a", "9",
    "-acodec", "libmp3lame",
    backPad
  ], "back padding");

  fs.writeFileSync(concatList, [
    `file '${frontPad.replace(/'/g, "'\\''")}'`,
    `file '${kkClip.replace(/'/g, "'\\''")}'`,
    `file '${backPad.replace(/'/g, "'\\''")}'`,
    `file '${path.join(ROOT, twinklePath).replace(/'/g, "'\\''")}'`
  ].join("\n") + "\n");

  run("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatList,
    "-c:a", "libmp3lame",
    "-q:a", "2",
    outAbs
  ], "concat padding + KK + Twinkle");

  if (!fs.existsSync(outAbs)) fail(`Output missing after materialization: ${outRel}`);

  record.delivery_audio_url = `/${outRel.replace(/^public\//, "")}`;
  record.delivery_status = "delivery_audio_materialized_bookend_twinkle";
  record.delivery_materialization = {
    law: "front_padding_and_back_padding_and_twinkle_travel_together",
    front_padding_seconds: FRONT_PAD_SECONDS,
    back_padding_seconds: BACK_PAD_SECONDS,
    twinkle_path: `/${twinklePath.replace(/^public\//, "")}`,
    source_kk_audio_is_raw_not_customer_delivery: true,
    source_resolution: "local_gpmc_source",
    local_source_path: sourcePath,
    output_path: record.delivery_audio_url,
    materialized_at: new Date().toISOString()
  };

  materialized++;
}

registry.status = "customer_delivery_audio_materialized";
registry.delivery_law = {
  twinkle_and_padding_travel_together: true,
  applies_to_all_customer_delivery_ii_records: true,
  no_raw_kk_customer_delivery: true,
  no_instrumental_customer_delivery: true
};
registry.updated_at = new Date().toISOString();

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");

console.log("");
console.log("PASS: materialized customer delivery audio.");
console.log("Records materialized:", materialized);
