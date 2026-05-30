import fs from "node:fs";

const pagePath = "app/mothers-day/thank-you/page.tsx";

const required = [
  ["thank-you-sec-v1a", "V1a"],
  ["thank-you-sec-v1b", "V1b"],
  ["thank-you-sec-prech1", "PreCh1"],
  ["thank-you-sec-ch1", "Ch1"],
  ["thank-you-sec-v2a", "V2a"],
  ["thank-you-sec-v2b", "V2b"],
  ["thank-you-sec-br", "Bridge"],
  ["thank-you-sec-ch2", "Ch2"],
  ["thank-you-sec-outro", "Outro"]
];

const forbiddenLockedLabels = [
  "thank-you-sec-intro",
  "thank-you-sec-v1c",
  "thank-you-sec-v1d"
];

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("THANK YOU BUYER STRUCTURE II AUDIO AUDIT");

const page = fs.readFileSync(pagePath, "utf8");

for (const [id, section] of required) {
  const ii = `/hug-delivery/thank-you/${id}-ii-delivery.mp3`;
  const file = `public/hug-delivery/thank-you/${id}-ii-delivery.mp3`;

  if (!page.includes(`id: "${id}"`)) fail(`Missing locked structure card: ${id}`);
  if (!page.includes(`section: "${section}"`)) fail(`Missing/incorrect section label for ${id}: ${section}`);
  if (!page.includes(`audioUrl: "${ii}"`)) fail(`Missing finished II delivery URL for ${id}: ${ii}`);
  if (!fs.existsSync(file)) fail(`Finished II file missing: ${file}`);
}

for (const id of forbiddenLockedLabels) {
  if (page.includes(`id: "${id}"`)) {
    fail(`Obsolete locked structure card still present: ${id}`);
  }
}

console.log(`Checked ${required.length} locked Thank You buyer structure card(s).`);

if (failed) {
  console.error("THANK YOU BUYER STRUCTURE II AUDIO AUDIT: FAIL");
  process.exit(1);
}

console.log("THANK YOU BUYER STRUCTURE II AUDIO AUDIT: PASS");
