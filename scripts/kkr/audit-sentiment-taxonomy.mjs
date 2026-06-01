import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "data/kkr/sentiment-match-taxonomy.json");
const taxonomy = JSON.parse(fs.readFileSync(file, "utf8"));

const requiredTop = [
  "system",
  "goal",
  "public_experience",
  "recipient_lanes",
  "sentiment_lanes",
  "situation_lanes",
  "emotional_weights",
  "public_card_shapes",
  "match_record_schema",
  "public_release_gates",
  "minimum_public_route_standard",
  "route_profiles"
];

let failures = [];

for (const key of requiredTop) {
  if (!(key in taxonomy)) failures.push(`missing top-level key: ${key}`);
}

for (const key of ["recipient_lanes", "sentiment_lanes", "situation_lanes", "emotional_weights"]) {
  if (!Array.isArray(taxonomy[key]) || taxonomy[key].length < 5) {
    failures.push(`${key} must contain at least 5 entries`);
  }
}

if (!taxonomy.route_profiles || Object.keys(taxonomy.route_profiles).length < 5) {
  failures.push("route_profiles must contain at least 5 profiles");
}

for (const [profileId, profile] of Object.entries(taxonomy.route_profiles || {})) {
  if (!profile.user_phrase) failures.push(`${profileId}: missing user_phrase`);
  if (!Array.isArray(profile.include) || profile.include.length < 3) {
    failures.push(`${profileId}: include needs at least 3 terms`);
  }
  if (!Array.isArray(profile.exclude) || profile.exclude.length < 2) {
    failures.push(`${profileId}: exclude needs at least 2 terms`);
  }
}

console.log("KKr Sentiment Taxonomy Audit");
console.log("recipient lanes:", taxonomy.recipient_lanes?.length || 0);
console.log("sentiment lanes:", taxonomy.sentiment_lanes?.length || 0);
console.log("situation lanes:", taxonomy.situation_lanes?.length || 0);
console.log("emotional weights:", taxonomy.emotional_weights?.length || 0);
console.log("route profiles:", Object.keys(taxonomy.route_profiles || {}).length);

if (failures.length) {
  console.log("\nFAIL");
  for (const failure of failures) console.log("-", failure);
  process.exit(1);
}

console.log("\nPASS");
