import fs from "node:fs";
import path from "node:path";

const manifestPath = "public/kks/thank-you/kks-expanded/manifest.json";

const locked = [
  "thank-you-sec-v1a",
  "thank-you-sec-v1b",
  "thank-you-sec-prech1",
  "thank-you-sec-ch1",
  "thank-you-sec-v2a",
  "thank-you-sec-v2b",
  "thank-you-sec-br",
  "thank-you-sec-ch2",
  "thank-you-sec-outro",
];

let failed = false;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

if (!fs.existsSync(manifestPath)) {
  console.error(`FAIL: missing manifest ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const rows = manifest.kks || [];

for (const id of locked) {
  const row = rows.find((x) => x.id === id);

  if (!row) {
    fail(`locked structure row missing: ${id}`);
    continue;
  }

  if (!row.audio_url) {
    fail(`${id} has no audio_url`);
    continue;
  }

  const local = path.join("public", row.audio_url.replace(/^\//, ""));
  if (!fs.existsSync(local)) {
    fail(`${id} structure exists but delivery audio is missing: ${local}`);
  }
}

if (failed) {
  console.error("\nKKr NO STRUCTURE/AUDIO SPLIT AUDIT: FAIL");
  process.exit(1);
}

console.log("KKr NO STRUCTURE/AUDIO SPLIT AUDIT: PASS");
