import fs from "node:fs";

const files = [
  "app/hug/page.tsx",
  "components/KkutStepMap.tsx",
  "lib/hugRealKutManifest.ts",
];

const banned = [
  /pink/i,
  /rose/i,
  /red/i,
  /purple/i,
  /violet/i,
  /lavender/i,
  /fuchsia/i,
  /placeholder/i,
  /Audio needed/i,
  /Audio not connected/i,
  /PIX/i,
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`BIC FAIL: missing ${file}`);
    process.exit(1);
  }

  const text = fs.readFileSync(file, "utf8");

  for (const rx of banned) {
    if (rx.test(text)) {
      console.error(`BIC FAIL: banned term ${rx} found in ${file}`);
      process.exit(1);
    }
  }
}

const manifestText = fs.readFileSync("lib/hugRealKutManifest.ts", "utf8");
const urls = [...manifestText.matchAll(/previewSrc": "([^"]+\.mp3)"/g)].map((m) => m[1]);

if (urls.length < 8) {
  console.error(`BIC FAIL: only ${urls.length} real KUT MP3 URLs in manifest. Need 8.`);
  process.exit(1);
}

for (const url of urls) {
  const local = "public" + url;
  if (!fs.existsSync(local)) {
    console.error(`BIC FAIL: missing MP3 file ${local}`);
    process.exit(1);
  }
}

const requiredEnv = [
  "NEXT_PUBLIC_KKUT_HUG_PAYMENT_URL",
  "NEXT_PUBLIC_KKUT_REVIEWED_HUG_PAYMENT_URL",
  "NEXT_PUBLIC_KKUT_GIFT_HUG_PAYMENT_URL",
];

for (const key of requiredEnv) {
  if (!process.env[key] || !process.env[key].startsWith("https://")) {
    console.error(`BIC FAIL: missing real Stripe/payment URL env ${key}`);
    process.exit(1);
  }
}

console.log("BIC HUG GATE PASS");
