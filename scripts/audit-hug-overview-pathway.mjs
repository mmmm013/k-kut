import fs from "node:fs";

const hugPath = "app/hug/page.tsx";
const systemMapPath = "data/system-map/k-kut-system-map.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("HUG OVERVIEW PATHWAY AUDIT");

if (!fs.existsSync(hugPath)) fail(`Missing ${hugPath}`);
if (!fs.existsSync(systemMapPath)) fail(`Missing ${systemMapPath}`);

const hug = fs.existsSync(hugPath) ? fs.readFileSync(hugPath, "utf8") : "";
const systemMap = fs.existsSync(systemMapPath)
  ? JSON.parse(fs.readFileSync(systemMapPath, "utf8"))
  : {};

for (const phrase of [
  "HUG",
  "K-KUT",
  "private",
  "music"
]) {
  if (!hug.includes(phrase)) fail(`/hug page missing buyer phrase: ${phrase}`);
}

const hasCheckoutPath =
  hug.includes("/checkout") ||
  hug.includes("buy.stripe.com") ||
  hug.includes("/personal") ||
  hug.includes("/find");

if (!hasCheckoutPath) {
  fail("/hug must route buyer toward checkout, personal, or find.");
}

for (const forbidden of [
  "candidate_not_approved",
  "debug",
  "staging",
  "test example",
  "mini-KUT",
  "mkut",
  "sympathy_candidate"
]) {
  if (hug.includes(forbidden)) fail(`/hug contains forbidden public leak term: ${forbidden}`);
}

const hugMap = systemMap.public_buyer_paths?.find((row) => row.path === "/hug");

if (!hugMap) {
  fail("System map missing /hug pathway.");
} else {
  if (hugMap.payment_allowed !== true) fail("/hug system map should allow payment path.");
  if (hugMap.audio_allowed !== true) fail("/hug system map should allow audio path.");
}

if (failed) {
  console.error("HUG OVERVIEW PATHWAY AUDIT: FAIL");
  process.exit(1);
}

console.log("HUG OVERVIEW PATHWAY AUDIT: PASS");
