import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const SOURCE_PATH = process.env.A_LOVE_LIKE_THAT_SOURCE_PATH?.trim();
const SOURCE_SHA256 = "6ea1bca85e3f33b2bac0e03b70f6ae8037e83dee53c3d87bf9012f39cfa29afb";
const START_SECONDS = 0;
const END_SECONDS = 34.875;
const FRONT_PAD_SECONDS = 1;
const BACK_PAD_SECONDS = 1;
const TWINKLE_GAIN = 0.75;
const TWINKLE_PATH = "public/signature/sti/gpm-sti-twinkle-v001-stop-at-audio-end.mp3";
const OUTPUT_PATH =
  "staging/current-ii-private-audio-v1/21155af2dbfefdf2ff90bec6b0a2458485dfd178994b430054edca8aa635b6b1.mp3";

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function sha256(filePath) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

if (!SOURCE_PATH) {
  fail("Set A_LOVE_LIKE_THAT_SOURCE_PATH to the canonical LT-PIX MP3.");
}
if (!fs.existsSync(SOURCE_PATH)) fail(`Source file not found: ${SOURCE_PATH}`);
if (sha256(SOURCE_PATH) !== SOURCE_SHA256) {
  fail("Source hash does not match the governed LT-PIX object.");
}
if (!fs.existsSync(TWINKLE_PATH)) fail(`Twinkle file not found: ${TWINKLE_PATH}`);

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

execFileSync(
  "ffmpeg",
  [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-i",
    SOURCE_PATH,
    "-i",
    TWINKLE_PATH,
    "-f",
    "lavfi",
    "-t",
    String(FRONT_PAD_SECONDS),
    "-i",
    "anullsrc=r=44100:cl=stereo",
    "-f",
    "lavfi",
    "-t",
    String(BACK_PAD_SECONDS),
    "-i",
    "anullsrc=r=44100:cl=stereo",
    "-filter_complex",
    [
      "[2:a]atrim=duration=1,asetpts=PTS-STARTPTS[front]",
      `[0:a]atrim=start=${START_SECONDS}:end=${END_SECONDS},asetpts=PTS-STARTPTS,aresample=44100,aformat=channel_layouts=stereo[kk]`,
      "[3:a]atrim=duration=1,asetpts=PTS-STARTPTS[back]",
      `[1:a]volume=${TWINKLE_GAIN},asetpts=PTS-STARTPTS,aresample=44100,aformat=channel_layouts=stereo[twinkle]`,
      "[front][kk][back][twinkle]concat=n=4:v=0:a=1[out]",
    ].join(";"),
    "-map",
    "[out]",
    "-vn",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "144k",
    OUTPUT_PATH,
  ],
  { stdio: "inherit" },
);

console.log("PASS: A LOVE LIKE THAT boundary-repair candidate materialized.");
console.log(`Boundary: ${START_SECONDS.toFixed(3)}-${END_SECONDS.toFixed(3)}`);
console.log(`SHA-256: ${sha256(OUTPUT_PATH)}`);
console.log("Output: local non-deploying private-audio staging");
