import fs from "node:fs";

const files = [
  "lib/personal-route-pages/ApprovedPersonalRoutePage.tsx",
  "app/personal/anniversary/page.tsx",
  "app/personal/apology/page.tsx"
];

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("DEDICATED PERSONAL OPTION PAGES AUDIT");

for (const file of files) {
  if (!fs.existsSync(file)) fail(`Missing ${file}`);
}

const shared = fs.existsSync(files[0]) ? fs.readFileSync(files[0], "utf8") : "";
const anniversary = fs.existsSync(files[1]) ? fs.readFileSync(files[1], "utf8") : "";
const apology = fs.existsSync(files[2]) ? fs.readFileSync(files[2], "utf8") : "";

for (const phrase of [
  "public-option-records.generated.json",
  "approved HUG options for this exact personal route",
  "No raw inventory, no generic personal cards, and no mixed-route options appear here.",
  "Approved Ready Now",
  "Send this {title} HUG"
]) {
  if (!shared.includes(phrase)) fail(`Shared page missing phrase: ${phrase}`);
}

if (!anniversary.includes('publicRoute="/personal/anniversary"')) {
  fail("Anniversary page must use /personal/anniversary public route.");
}

if (!apology.includes('publicRoute="/personal/apology"')) {
  fail("Apology page must use /personal/apology public route.");
}

for (const forbidden of [
  "Your Heart Poundin",
  "PERSONAL_II_OPTIONS",
  "Send this Personal HUG",
  "romance-router.json",
  "candidate_not_approved",
  "mk-products",
  "internal_proof",
  "public publication bridge"
]) {
  for (const file of files) {
    const src = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
    if (src.includes(forbidden)) fail(`${file} contains forbidden term: ${forbidden}`);
  }
}

const generated = JSON.parse(
  fs.readFileSync("data/publication-bridge/public-option-records.generated.json", "utf8")
);

const byRoute = new Map();
for (const row of generated.records || []) {
  byRoute.set(row.public_route, (byRoute.get(row.public_route) || 0) + 1);
}

if (byRoute.get("/personal/anniversary") !== 1) {
  fail("Expected /personal/anniversary to have exactly 1 approved option.");
}

if (byRoute.get("/personal/apology") !== 1) {
  fail("Expected /personal/apology to have exactly 1 approved option.");
}

if (failed) {
  console.error("DEDICATED PERSONAL OPTION PAGES AUDIT: FAIL");
  process.exit(1);
}

console.log("DEDICATED PERSONAL OPTION PAGES AUDIT: PASS");
