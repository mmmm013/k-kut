import fs from "node:fs";

const file = "lib/theme-population/gratitudeRegistry.ts";
const text = fs.readFileSync(file, "utf8");

const failures = [];

const required = [
  "KK-THANK-YOU-S01",
  "KK-THANK-YOU-S02",
  "KK-THANK-YOU-S03",
  "KK-THANK-YOU-S04",
  "KK-THANK-YOU-S05",
  "KK-THANK-YOU-S06",
  "KK-THANK-YOU-S07",
  "KK-THANK-YOU-S08",
  "KK-THANK-YOU-S09",
  "badKkFreeReplacement: true",
  "pixHandle: \"THANK-YOU\""
];

for (const item of required) {
  if (!text.includes(item)) failures.push(`missing: ${item}`);
}

const recordCount = (text.match(/kkId: "KK-THANK-YOU-S/g) || []).length;

console.log("# GRATITUDE ROUTE-SAFE REGISTRY AUDIT");
console.log(`records: ${recordCount}`);
console.log(`failures: ${failures.length}`);

if (recordCount !== 9) failures.push(`expected 9 records, found ${recordCount}`);

if (failures.length) {
  for (const failure of failures) console.log(`- ${failure}`);
  process.exitCode = 2;
} else {
  console.log("AUDIT PASS");
}
