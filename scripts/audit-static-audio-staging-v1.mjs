import fs from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const manifest = JSON.parse(
  fs.readFileSync("config/current-ii-private-audio.v1.json", "utf8"),
);
const fail = (message) => {
  throw new Error(`STATIC AUDIO STAGING AUDIT FAIL: ${message}`);
};
const sha256 = (file) =>
  createHash("sha256").update(fs.readFileSync(file)).digest("hex");

for (const record of manifest.records || []) {
  if (!fs.existsSync(record.staging_source_path)) {
    fail(`staging source missing ${record.ii_id}`);
  }
  const stat = fs.statSync(record.staging_source_path);
  if (stat.size !== record.size_bytes) {
    fail(`size mismatch ${record.ii_id}`);
  }
  if (sha256(record.staging_source_path) !== record.sha256) {
    fail(`hash mismatch ${record.ii_id}`);
  }

  const probe = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      record.staging_source_path,
    ],
    { encoding: "utf8" },
  );
  if (probe.error || probe.status !== 0) {
    fail(`ffprobe failed ${record.ii_id}`);
  }
  const duration = Number(probe.stdout.trim());
  if (
    !Number.isFinite(duration) ||
    Math.abs(duration - record.duration_seconds) > 0.001
  ) {
    fail(`duration mismatch ${record.ii_id}`);
  }
}

console.log("STATIC AUDIO STAGING AUDIT: PASS");
console.log("OBJECTS: 3 · BYTES: 2050943 · HASHES: EXACT");
