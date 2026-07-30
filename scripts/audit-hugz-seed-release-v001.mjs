import fs from "node:fs";

const catalog = fs.readFileSync("lib/hugzSeedCatalog.ts", "utf8");
const tray = fs.readFileSync("components/HugzThreeChoiceTray.tsx", "utf8");
const forbidden = [
  "previewUrl",
  "buyUrl",
  "release-gate-v004",
  "seed-previews-v001",
  "strict-kk-v001",
];

if (!catalog.includes("seedCount: 0") || !catalog.includes("seeds: []")) {
  throw new Error("HUGz discovery containers must remain empty until true-inventory approval");
}
for (const value of forbidden) {
  if (catalog.includes(value) || tray.includes(value)) {
    throw new Error(`superseded II inventory escaped removal: ${value}`);
  }
}
if ((catalog.match(/\bcard\("/gu) || []).length !== 13) {
  throw new Error("13 non-II HUGz discovery containers required");
}

console.log("HUGz TRUE-INVENTORY EMPTY-CONTAINER AUDIT: PASS");
console.log("HUGz Cards: 13");
console.log("Legacy IIs: 0");
console.log("Public audio URLs: 0");
console.log("Checkout URLs: 0");
