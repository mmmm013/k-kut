import fs from "node:fs";

const orderPath = "manifests/kkr/dispatch/thank-you-kk8-bridge-br-materialization.json";
const required = "public/mothers-day/thank-you/kks-expanded/thank-you-sec-br.mp3";

if (!fs.existsSync(orderPath)) {
  console.error(`STOP: missing targeted export order ${orderPath}`);
  process.exit(1);
}

const order = JSON.parse(fs.readFileSync(orderPath, "utf8"));

if (fs.existsSync(required)) {
  console.log("TARGETED EXPORT COMPLETE: thank-you-sec-br.mp3 exists.");
  process.exit(0);
}

console.error("TARGETED KKr-BIZ-MSC EXPORT REQUIRED");
console.error(`PIX: ${order.pix}`);
console.error(`Legacy structure: ${order.legacy_structure_id} / ${order.legacy_title}`);
console.error(`Canonical structure: ${order.canonical_structure}`);
console.error(`Required output: ${order.canonical_delivery_audio}`);
console.error("");
console.error("Use controlled KK generation from the Thank You source audio.");
console.error("Do not use old generic public samples.");
console.error("Do not use CCs, mKs, micros, Sandman, magic tails, or timing as qualification.");
process.exit(1);
