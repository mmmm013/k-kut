import fs from "node:fs";

const publicFiles = [
  "app/find/page.tsx",
  "app/hug/page.tsx",
  "app/personal/page.tsx",
  "app/personal/birthday/page.tsx",
  "app/romance/page.tsx",
  "app/wedding/page.tsx",
  "app/kupid/page.tsx",
  "app/holiday/page.tsx"
];

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("NO PUBLIC BRIDGE LANGUAGE AUDIT");

for (const file of publicFiles) {
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, "utf8");

  for (const forbidden of [
    "Approved bridge options",
    "public publication bridge",
    "publication bridge only",
    "bridge records",
    "bridge record",
    "Bridge options"
  ]) {
    if (src.includes(forbidden)) {
      fail(`${file} contains public-facing internal bridge term: ${forbidden}`);
    }
  }
}

const find = fs.readFileSync("app/find/page.tsx", "utf8");

for (const required of [
  "Approved HUG options",
  "All approved HUG options",
  "These options are approved for public K-KUT HUG browsing.",
  "More for this feeling",
  "More from this track"
]) {
  if (!find.includes(required)) {
    fail(`/find missing buyer-safe phrase: ${required}`);
  }
}

if (failed) {
  console.error("NO PUBLIC BRIDGE LANGUAGE AUDIT: FAIL");
  process.exit(1);
}

console.log("NO PUBLIC BRIDGE LANGUAGE AUDIT: PASS");
