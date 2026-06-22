import fs from "node:fs";

const file = "lib/theme-population/loveAnniversaryRegistry.ts";
const text = fs.readFileSync(file, "utf8");

const failures = [];

const required = [
  "A Love like That",
  "ALLT-105529524",
  "KK-ALLT-105529524-S02",
  "KK-ALLT-105529524-S04",
  "KK-ALLT-105529524-S06",
  "KK-ALLT-105529524-S07",
  "PENDING_APPROVED_K_KUT_DELIVERY_PATH",
  "handoff_received_not_public",
  "badKkFreeReplacement: true"
];

for (const item of required) {
  if (!text.includes(item)) failures.push(`missing: ${item}`);
}

const recordCount = (text.match(/kkId: "KK-ALLT-105529524-S/g) || []).length;
const pendingAudioCount = (text.match(/audioUrl: "PENDING_APPROVED_K_KUT_DELIVERY_PATH"/g) || []).length;

console.log("# LOVE / ANNIVERSARY ROUTE-SAFE REGISTRY AUDIT");
console.log(`records: ${recordCount}`);
console.log(`pending_audio_paths: ${pendingAudioCount}`);
console.log(`failures: ${failures.length}`);

if (recordCount !== 6) failures.push(`expected 6 records, found ${recordCount}`);
if (pendingAudioCount !== 6) failures.push(`expected all 6 audio paths to remain pending, found ${pendingAudioCount}`);

if (text.includes("/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3")) {
  failures.push("contaminated old A Love like That II delivery URL was found");
}

if (failures.length) {
  for (const failure of failures) console.log(`- ${failure}`);
  process.exitCode = 2;
} else {
  console.log("AUDIT PASS");
}
