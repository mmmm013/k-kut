import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const manifestPath = "public/mothers-day/thank-you/kks-expanded/manifest.json";

const bannedWords = [
  "twinkle",
  "signature",
  "branding",
  "brand",
  "tag",
  "spoken",
  "voice",
  "bot",
  "magic-tail",
  "magic tail",
  "padding",
  "padded"
];

function sh(args) {
  return execFileSync(args[0], args.slice(1), { encoding: "utf8" }).trim();
}

function publicPath(url) {
  return path.join("public", url.replace(/^\//, ""));
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const rows = (manifest.kks || []).filter((row) =>
  String(row.id || "").startsWith("thank-you-sec-")
);

let failed = false;

for (const row of rows) {
  const blob = JSON.stringify(row).toLowerCase();

  for (const banned of bannedWords) {
    if (blob.includes(banned)) {
      console.error(`FAIL: ${row.id} contains banned dressing/padding marker: ${banned}`);
      failed = true;
    }
  }

  const file = publicPath(row.audio_url || "");
  if (!fs.existsSync(file)) {
    console.error(`FAIL: missing audio ${row.id}: ${file}`);
    failed = true;
    continue;
  }

  const dur = sh([
    "ffprobe",
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    file
  ]);

  console.log(`${row.id} | ${row.section} | ${dur}s | ${file}`);
}

if (failed) {
  console.error("\nKK AUDIO NO-PADDING / NO-TWINKLE AUDIT: FAIL");
  process.exit(1);
}

console.log("\nKK AUDIO NO-PADDING / NO-TWINKLE AUDIT: PASS");
