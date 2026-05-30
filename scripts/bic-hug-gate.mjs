
// KK SLOT LAW:
// Full LT-PIX with SSOT track: prefer 8 real customer-facing KKs.
// Phantom PIX / original-element sets: show only real available KKs, even if 4-7.
// Never fake-fill to 8.
// KK-Kombos are request/review path only and must be contiguous.
// CCs are internal only and never customer-facing.
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { execFileSync } from "node:child_process";

function loadDotEnvLocal() {
  const file = ".env.local";
  if (!fs.existsSync(file)) return;

  const text = fs.readFileSync(file, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnvLocal();


const files = [
  "app/hug/page.tsx",
  "components/KkutStepMap.tsx",
  "lib/hugRealKutManifest.ts",
];

// Brand rule:
// Brown / amber / tan / warm black / gold are the base K-KUT colors.
// Decorative, celebratory, romance, holiday, and excitement colors are allowed.
// BIC bans unsafe content/audio states, not colors.
const banned = [
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
];

for (const key of requiredEnv) {
  const value = process.env[key] || "";
  const lower = value.toLowerCase();

  if (!value.startsWith("https://buy.stripe.com/")) {
    console.error(`BIC FAIL: missing real Stripe payment link env ${key}`);
    process.exit(1);
  }

  if (
    lower.includes("your_real") ||
    lower.includes("paste") ||
    lower.includes("replace") ||
    lower.includes("example") ||
    lower.includes("test_link")
  ) {
    console.error(`BIC FAIL: placeholder Stripe payment link env ${key}`);
    process.exit(1);
  }
}


// Current customer law: intro-only KKs are banned.
// Every customer-facing KK must contain vocals.
const hugManifestText = fs.existsSync("lib/hugRealKutManifest.ts")
  ? fs.readFileSync("lib/hugRealKutManifest.ts", "utf8").toLowerCase()
  : "";

for (const banned of [
  "intro",
  "intro only",
  "intro-only",
  "instrumental",
  "instro",
  "no vocal",
  "non-vocal",
  "non vocal",
  "\"vocals\":false",
  "\"has_vocals\":false",
  "\"contains_vocals\":false"
]) {
  if (hugManifestText.includes(banned)) {
    console.error(`BIC FAIL: banned non-vocal/intro KK marker found in HUG manifest: ${banned}`);
    process.exit(1);
  }
}


// K-KUT LAW:
// Customer-facing HUG options must be KKs only.
// Do not allow mKs, mKUTs, micros, generic CCs, intro-only, or arbitrary audio-folder pulls.
const kkManifest = fs.existsSync("lib/hugRealKutManifest.ts")
  ? fs.readFileSync("lib/hugRealKutManifest.ts", "utf8").toLowerCase()
  : "";

for (const banned of [
  "mkut",
  "m-kut",
  "/mk/",
  "/mks/",
  "micro",
  "micros",
  "intro",
  "intro-only",
  "intro only",
  "instrumental",
  "instro",
  "non-vocal",
  "non vocal",
  "no vocal"
]) {
  if (kkManifest.includes(banned)) {
    console.error(`BIC FAIL: HUG manifest contains banned non-KK marker: ${banned}`);
    process.exit(1);
  }
}

// Every customer-facing record must identify as KK/K-KUT/KUT-Kandidate.
// This is intentionally strict. If it fails, the manifest is not customer-safe.
if (
  !kkManifest.includes("k-kut") &&
  !kkManifest.includes("kk") &&
  !kkManifest.includes("kut-kandidate") &&
  !kkManifest.includes("kut_kandidate")
) {
  console.error("BIC FAIL: HUG manifest does not identify options as KK/K-KUT/KUT-Kandidate inventory.");
  process.exit(1);
}


// CUSTOMER-FACING HUG LAW:
// HUG options must be KKs only.
// CCs are internal inventory and can never be pulled or used directly by users.
// mKs/mKUTs/micros/generic audio are also banned.
const hugManifest = fs.existsSync("lib/hugRealKutManifest.ts")
  ? fs.readFileSync("lib/hugRealKutManifest.ts", "utf8").toLowerCase()
  : "";

for (const banned of [
  "line-cc",
  "cc_ready",
  "cc-ready",
  "line-cc-ready",
  "lnduo",
  "lntrio",
  "pime",
  "rmst",
  "mkut",
  "m-kut",
  "micro",
  "micros",
  "public/audio/",
  "intro",
  "instrumental",
  "instro",
  "non-vocal",
  "non vocal",
  "no vocal"
]) {
  if (hugManifest.includes(banned)) {
    console.error(`BIC FAIL: HUG manifest contains banned non-KK/internal marker: ${banned}`);
    process.exit(1);
  }
}


const hasLockedKkSource =
  hugManifest.includes('"source": "KK_STRUCTURE_LOCKED"') ||
  hugManifest.includes('"source":"KK_STRUCTURE_LOCKED"') ||
  hugManifest.includes('"source": "KK_STRUCTURE_DISPATCHED"') ||
  hugManifest.includes('"source":"KK_STRUCTURE_DISPATCHED"') ||
  hugManifest.includes('"source": "KK_ONLY"') ||
  hugManifest.includes('"source":"KK_ONLY"') ||
  hugManifest.includes('"source": "kk_only"') ||
  hugManifest.includes('"source":"kk_only"');




if (
  !hugManifest.includes("public/mothers-day/thank-you/kks/manifest.json") &&
  !hugManifest.includes("public/mothers-day/thank-you/kks-expanded/manifest.json") &&
  !hugManifest.includes("data/holiday-kks/mothers-day-thank-you-kks.json") &&
  !hugManifest.includes("data/holiday-kks/mothers-day-promo-sets.json")
) {
  console.error("BIC FAIL: HUG manifest does not reference allowed KK source manifests.");
  process.exit(1);
}

execFileSync("node", ["scripts/audit-kkr-staging-audio-proof-status.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/kkr-prosecute-dispatch-audit.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/audit-kkr-structure-bindings.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/audit-kkr-no-structure-audio-split.mjs"], { stdio: "inherit" });

execFileSync("node", ["scripts/build-real-hug-kut-manifest.mjs"], { stdio: "inherit" });


execFileSync("node", ["scripts/build-real-hug-kut-manifest.mjs"], { stdio: "inherit" });

const manifestModuleUrl = pathToFileURL(path.resolve("lib/hugRealKutManifest.ts")).href + "?bic=" + Date.now();
const { realHugKuts } = await import(manifestModuleUrl);

const hugRows = realHugKuts?.thanks || [];

if (!Array.isArray(hugRows) || hugRows.length < 1) {
  console.error("BIC FAIL: HUG manifest has no rows.");
  process.exit(1);
}

const allowedKkSources = new Set([
  "KK_STRUCTURE_LOCKED",
  "KK_STRUCTURE_DISPATCHED",
  "KK_ONLY",
  "kk_only"
]);

for (const row of hugRows) {
  if (!allowedKkSources.has(row.source)) {
    console.error(`BIC FAIL: HUG row is not locked KK sourced: ${row.id} source=${row.source}`);
    process.exit(1);
  }
}

console.log("BIC HUG GATE PASS");
