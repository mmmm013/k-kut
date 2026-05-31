import fs from "node:fs";

const pagePath = "app/find/page.tsx";
const systemMapPath = "data/system-map/k-kut-system-map.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("FIND PATHWAY AUDIT");

if (!fs.existsSync(pagePath)) fail(`Missing ${pagePath}`);
if (!fs.existsSync(systemMapPath)) fail(`Missing ${systemMapPath}`);

const page = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, "utf8") : "";
const map = fs.existsSync(systemMapPath) ? JSON.parse(fs.readFileSync(systemMapPath, "utf8")) : {};

for (const phrase of [
  "What do you need this HUG to say?",
  "Pick one need",
  "MC-BOT",
  "I want to say thank you.",
  "I want to send love or comfort.",
  "I want to celebrate someone.",
  "I need to repair or reconnect."
]) {
  if (!page.includes(phrase)) fail(`Find page missing expected buyer phrase: ${phrase}`);
}

for (const forbidden of [
  "candidate_not_approved",
  "debug",
  "staging",
  "test example",
  "mini-KUT",
  "mkut",
  "mK"
]) {
  if (page.toLowerCase().includes(forbidden.toLowerCase())) {
    fail(`Find page contains forbidden/internal language: ${forbidden}`);
  }
}

const findPath = map.public_buyer_paths?.find((row) => row.path === "/find");
if (!findPath) fail("System map missing /find.");

if (findPath && !String(findPath.purpose || "").includes("Find/Search")) {
  fail("System map /find purpose must identify Find/Search.");
}

const hasMoreForFeeling = map.more_logic?.some((row) => row.label === "More for this feeling");
const hasMoreFromTrack = map.more_logic?.some((row) => row.label === "More from this track");

if (!hasMoreForFeeling) fail("System map missing More for this feeling.");
if (!hasMoreFromTrack) fail("System map missing More from this track.");

if (failed) {
  console.error("FIND PATHWAY AUDIT: FAIL");
  process.exit(1);
}

console.log("FIND PATHWAY AUDIT: PASS");
