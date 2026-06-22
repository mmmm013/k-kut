import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const SCAN_DIRS = [
  "public/hug-delivery",
  "public/ii-delivery",
  "public/kkr/ii-review"
];

const AUDIO_EXT = /\.(mp3|m4a|wav|aiff|aif)$/i;

const MAX_ALLOWED_TRAILING_SILENCE_SECONDS = 0.75;
const SILENCE_DB = "-50dB";
const MIN_SILENCE_DURATION = "0.25";

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;

  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);

    if (st.isDirectory()) walk(p, out);
    else if (AUDIO_EXT.test(p)) out.push(p);
  }

  return out;
}

function hasCommand(cmd) {
  const r = spawnSync("which", [cmd], { encoding: "utf8" });
  return r.status === 0;
}

function durationSeconds(file) {
  const r = spawnSync(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      file
    ],
    { encoding: "utf8" }
  );

  const n = Number.parseFloat(r.stdout.trim());
  return Number.isFinite(n) ? n : null;
}

function trailingSilenceSeconds(file, duration) {
  const r = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-nostats",
      "-i", file,
      "-af", `silencedetect=noise=${SILENCE_DB}:d=${MIN_SILENCE_DURATION}`,
      "-f", "null",
      "-"
    ],
    { encoding: "utf8" }
  );

  const text = `${r.stdout}\n${r.stderr}`;
  const starts = [...text.matchAll(/silence_start:\s*([0-9.]+)/g)].map(m => Number.parseFloat(m[1]));
  const ends = [...text.matchAll(/silence_end:\s*([0-9.]+)/g)].map(m => Number.parseFloat(m[1]));

  if (!starts.length) return 0;

  const lastStart = starts[starts.length - 1];
  const lastEnd = ends.length ? ends[ends.length - 1] : null;

  if (lastEnd !== null && duration - lastEnd > 0.15) return 0;

  return Math.max(0, duration - lastStart);
}

if (!hasCommand("ffmpeg") || !hasCommand("ffprobe")) {
  console.error("FAIL: ffmpeg/ffprobe required for trailing silence QC.");
  process.exit(2);
}

const files = SCAN_DIRS.flatMap(d => walk(d));
const failures = [];

console.log("# NO TRAILING SILENCE AFTER TWINKLE AUDIT");
console.log(`files_scanned: ${files.length}`);
console.log(`max_allowed_trailing_silence_seconds: ${MAX_ALLOWED_TRAILING_SILENCE_SECONDS}`);
console.log("");

for (const file of files) {
  const dur = durationSeconds(file);

  if (dur === null) {
    failures.push({ file, reason: "duration_unreadable" });
    continue;
  }

  const tail = trailingSilenceSeconds(file, dur);

  if (tail > MAX_ALLOWED_TRAILING_SILENCE_SECONDS) {
    failures.push({
      file,
      duration: Number(dur.toFixed(3)),
      trailing_silence_seconds: Number(tail.toFixed(3)),
      reason: "trailing_silence_after_twinkle"
    });
  }
}

if (failures.length) {
  console.log("FAILURES:");
  for (const f of failures) {
    console.log(JSON.stringify(f));
  }
  console.log("");
  console.log(`AUDIT FAIL: ${failures.length} delivery files have trailing silence after final intentional sound.`);
  process.exit(2);
}

console.log("AUDIT PASS");
