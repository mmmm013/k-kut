import fs from "node:fs";
import path from "node:path";

const bridgePath = path.join(
  process.cwd(),
  "data/publication-bridge/public-option-records.generated.json"
);

const parsed = JSON.parse(fs.readFileSync(bridgePath, "utf8"));
const records = Array.isArray(parsed.records) ? parsed.records : [];

function normalizeFamily(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/\b\d{3}\b/g, "")
    .replace(/\blloyd g miller\b/g, "")
    .replace(/\bmusic maykers\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function routeKey(record) {
  return record.public_route || record.intent_lane || "unknown";
}

const byRoute = new Map();

for (const record of records) {
  const key = routeKey(record);
  if (!byRoute.has(key)) byRoute.set(key, []);
  byRoute.get(key).push(record);
}

let failedRoutes = 0;

console.log("KKr Public Bridge Audit");
console.log("records:", records.length);
console.log("routes:", byRoute.size);

for (const [route, routeRecords] of byRoute.entries()) {
  const sourceFamilies = new Map();
  const audioUrls = new Set();
  const missingAudio = [];

  for (const record of routeRecords) {
    const sourceSeed =
      record.source_pix_id_or_track_id ||
      record.display_title ||
      record.audio_delivery_url ||
      "";

    const family = normalizeFamily(sourceSeed);

    if (family) {
      sourceFamilies.set(family, (sourceFamilies.get(family) || 0) + 1);
    }

    if (record.audio_delivery_url) {
      audioUrls.add(record.audio_delivery_url);
    } else {
      missingAudio.push(record.public_option_id || record.display_title || "unknown");
    }
  }

  const total = routeRecords.length;
  const sortedFamilies = [...sourceFamilies.entries()].sort((a, b) => b[1] - a[1]);
  const top = sortedFamilies[0];
  const topShare = top ? top[1] / total : 0;

  const failures = [];

  if (total < 3) failures.push("less_than_3_records");
  if (sourceFamilies.size < 3) failures.push("less_than_3_source_families");
  if (topShare >= 0.5) failures.push("top_source_family_dominates");
  if (audioUrls.size < Math.min(3, total)) failures.push("weak_audio_diversity");
  if (missingAudio.length > 0) failures.push("missing_audio_url");

  console.log("");
  console.log("ROUTE:", route);
  console.log("records:", total);
  console.log("source families:", sourceFamilies.size);
  console.log("top families:", sortedFamilies.slice(0, 5));
  console.log("audio urls:", audioUrls.size);

  if (failures.length) {
    failedRoutes += 1;
    console.log("FAIL:", failures.join(", "));
  } else {
    console.log("PASS");
  }
}

console.log("");
console.log("failed routes:", failedRoutes);

if (failedRoutes > 0) {
  process.exit(1);
}
