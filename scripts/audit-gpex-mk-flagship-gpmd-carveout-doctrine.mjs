import fs from "node:fs";

const p = "data/system-map/gpex-mk-flagship-gpmd-carveout-doctrine.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("GPEX MK FLAGSHIP GPMD CARVE-OUT DOCTRINE AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);

  for (const phrase of [
    "Use mKs-only for flagship and likely all GPMDs.",
    "This doctrine does not change current K-KUT public buyer flow.",
    "mKs remain banned from current public K-KUT buyer flow unless explicitly re-approved later.",
    "mKs may be right for flagship and GPMD systems.",
    "They remain out of current K-KUT buyer flow."
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const forbiddenNow of [
    "mKs in /find buyer flow",
    "mKs in current K-KUT checkout",
    "mKs in public HUG sales language",
    "mKs in buyer emails or fulfillment proof",
    "mKs in public pages without explicit re-approval"
  ]) {
    if (!data.not_allowed_now?.includes(forbiddenNow)) {
      fail(`Missing not_allowed_now guard: ${forbiddenNow}`);
    }
  }
}

if (failed) {
  console.error("GPEX MK FLAGSHIP GPMD CARVE-OUT DOCTRINE AUDIT: FAIL");
  process.exit(1);
}

console.log("GPEX MK FLAGSHIP GPMD CARVE-OUT DOCTRINE AUDIT: PASS");
