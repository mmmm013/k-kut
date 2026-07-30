import fs from "node:fs";

const forbiddenPaths = [
  "backups",
  "recovery-review",
  "staging",
  "data/sentimeant",
  "data/hugz/hugz-seed-catalog-v001.json",
  "public/sentimeant",
  "public/hugz/seed-previews-v001",
  "public/ii-delivery",
  "public/kkr/ii-review",
  "public/audio-system/twinkle-half-volume",
  "lib/sentimeantStrictKkPool.ts",
];
const failures = forbiddenPaths.filter((path) => fs.existsSync(path));

if (failures.length) {
  console.error("LEGACY II ARTIFACT AUDIT: FAIL");
  failures.forEach((path) => console.error("-", path));
  process.exit(1);
}
console.log("LEGACY II ARTIFACT AUDIT: PASS");
console.log("Rules/LLBPs/operations/code: retained");
console.log("Superseded inventory artifacts/assets: removed");
