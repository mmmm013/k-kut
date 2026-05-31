import fs from "node:fs";
import path from "node:path";

console.log("K-KUT INVENTORY REALITY AUDIT");

const roots = [
  "data",
  "reports",
  "manifests",
  "public",
  "app"
];

const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else files.push(p);
  }
}

for (const root of roots) walk(root);

const jsonFiles = files.filter((f) => f.endsWith(".json"));
const audioFiles = files.filter((f) => /\.(mp3|m4a|wav|aiff|aif)$/i.test(f));

let pixMentions = 0;
let kkMentions = 0;
let iiMentions = 0;
let checkoutMentions = 0;
let audioUrlMentions = 0;

const candidateFiles = [];

for (const file of jsonFiles.concat(files.filter((f) => /\.(tsx|ts|md)$/i.test(f)))) {
  let text = "";
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  const lower = text.toLowerCase();

  const pixCount = (lower.match(/\bpix\b|pix_id|source_pix|track_id/g) || []).length;
  const kkCount = (lower.match(/\bkk\b|kk_id|k_kut|k-kut/g) || []).length;
  const iiCount = (lower.match(/\bii\b|ii_id|delivery audio|ii-delivery/g) || []).length;
  const checkoutCount = (text.match(/buy\.stripe\.com/g) || []).length;
  const audioUrlCount = (text.match(/audioUrl\s*:/g) || []).length;

  pixMentions += pixCount;
  kkMentions += kkCount;
  iiMentions += iiCount;
  checkoutMentions += checkoutCount;
  audioUrlMentions += audioUrlCount;

  if (pixCount || kkCount || iiCount || checkoutCount || audioUrlCount) {
    candidateFiles.push({
      file,
      pixCount,
      kkCount,
      iiCount,
      checkoutCount,
      audioUrlCount
    });
  }
}

const topFiles = candidateFiles
  .sort((a, b) =>
    (b.pixCount + b.kkCount + b.iiCount + b.audioUrlCount + b.checkoutCount) -
    (a.pixCount + a.kkCount + a.iiCount + a.audioUrlCount + a.checkoutCount)
  )
  .slice(0, 25);

const report = {
  status: "inventory_reality_snapshot",
  note: "This is not a sellable-item count. It separates current public surface from broader K-KUT/PIX/KK/II inventory evidence.",
  totals: {
    scanned_files: files.length,
    json_files: jsonFiles.length,
    audio_files_in_repo_public_or_project: audioFiles.length,
    pix_mentions: pixMentions,
    kk_mentions: kkMentions,
    ii_mentions: iiMentions,
    checkout_link_mentions: checkoutMentions,
    audioUrl_mentions_in_code: audioUrlMentions
  },
  top_inventory_evidence_files: topFiles
};

fs.mkdirSync("reports/system-map", { recursive: true });
fs.writeFileSync(
  "reports/system-map/k-kut-inventory-reality.json",
  JSON.stringify(report, null, 2) + "\n"
);

console.log(`SCANNED FILES: ${files.length}`);
console.log(`JSON FILES: ${jsonFiles.length}`);
console.log(`AUDIO FILES FOUND IN REPO TREE: ${audioFiles.length}`);
console.log(`PIX MENTIONS: ${pixMentions}`);
console.log(`KK MENTIONS: ${kkMentions}`);
console.log(`II MENTIONS: ${iiMentions}`);
console.log(`CHECKOUT LINK MENTIONS: ${checkoutMentions}`);
console.log(`audioUrl MENTIONS IN CODE: ${audioUrlMentions}`);
console.log("WROTE reports/system-map/k-kut-inventory-reality.json");
console.log("K-KUT INVENTORY REALITY AUDIT: PASS");
