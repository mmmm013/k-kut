import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const manifestPath = "data/kk-sets/fathers-day-product-statements.json";
const inventoryPath = "data/kut-inventory/neutral-kut-inventory.json";
const neutralAudioDir = "public/kuts/inventory";

fs.mkdirSync(path.dirname(inventoryPath), { recursive: true });
fs.mkdirSync(neutralAudioDir, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const key = Array.isArray(manifest.items) ? "items" : "products";
if (!Array.isArray(manifest[key])) {
  throw new Error(`No items/products array found in ${manifestPath}`);
}

let inventory = { version: 1, updatedAt: new Date().toISOString(), items: [] };
if (fs.existsSync(inventoryPath)) {
  try {
    inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
    inventory.items ||= [];
  } catch {}
}

const byKutId = new Map((inventory.items || []).map((x) => [x.kutId, x]));

function fileFromUrl(raw) {
  if (!raw) return null;
  const s = String(raw);
  if (s.startsWith("public/")) return s;
  return "public/" + s.replace(/^\//, "");
}

function publicUrlFromFile(file) {
  return "/" + file.replace(/^public\//, "");
}

for (let i = 0; i < manifest[key].length; i++) {
  const item = manifest[key][i];
  const oldAudioUrl = item.audioUrl || item.publicAudioUrl || item.localReviewFile;
  const oldFile = fileFromUrl(oldAudioUrl);

  if (!oldFile || !fs.existsSync(oldFile)) {
    throw new Error(`Missing audio for slot ${i + 1}: ${oldAudioUrl}`);
  }

  const buf = fs.readFileSync(oldFile);
  const hash = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 12).toUpperCase();

  const iiId = `II-${hash}`;
  const kkId = `KK-${hash}`;
  const kutId = `KUT-${hash}`;
  const neutralFile = `${neutralAudioDir}/${kutId}${path.extname(oldFile).toLowerCase() || ".mp3"}`;
  const neutralUrl = publicUrlFromFile(neutralFile);

  if (!fs.existsSync(neutralFile)) {
    fs.copyFileSync(oldFile, neutralFile);
  }

  const oldTitle =
    item.internalTitle ||
    item.publicTitle ||
    item.productTitle ||
    item.title ||
    item.id ||
    `KUT source ${i + 1}`;

  const oldFamily =
    item.publicFamily ||
    item.sourceFamily ||
    item.feelingLane ||
    item.family ||
    null;

  const invRecord = {
    audioInventoryId: iiId,
    iiId,
    kkId,
    kutId,
    canonicalAudioUrl: neutralUrl,
    canonicalAudioFile: neutralFile,
    role: "neutral-kut-audio-inventory",
    sourceLineage: {
      legacyInternalTitle: oldTitle,
      legacySourceFamily: oldFamily,
      legacyNonCanonicalAudioUrl: oldAudioUrl,
      legacyNonCanonicalAudioFile: oldFile
    },
    selectionMetadata: {
      feelingLane: item.feelingLane ?? null,
      publicFamily: item.publicFamily ?? null,
      sizeDistinction: item.sizeDistinction ?? null,
      tierId: item.tierId ?? null,
      tierLabel: item.tierLabel ?? null,
      displayCopy: item.displayCopy ?? null
    },
    releaseMetadata: {
      canonicalTwinkleId: item.canonicalTwinkleId ?? null,
      twinkleRequired: item.twinkleRequired ?? null,
      twinkleApplied: item.twinkleApplied ?? null,
      twinkleAttachPoint: item.twinkleAttachPoint ?? null,
      canonicalTwinkleSource: item.canonicalTwinkleSource ?? null,
      twinkleApplicationGain: item.twinkleApplicationGain ?? null,
      twinkleRole: item.twinkleRole ?? null,
      releaseStatus: item.releaseStatus ?? item.status ?? null
    },
    updatedAt: new Date().toISOString()
  };

  byKutId.set(kutId, { ...(byKutId.get(kutId) || {}), ...invRecord });

  item.id = `SLOT-${String(i + 1).padStart(3, "0")}`;
  item.publicDisplayCode = `KK${i + 1}`;
  item.audioInventoryId = iiId;
  item.iiId = iiId;
  item.kkId = kkId;
  item.kutId = kutId;
  item.audioUrl = neutralUrl;

  delete item.publicTitle;
  delete item.productTitle;
  delete item.title;
  delete item.internalTitle;
  delete item.legacyAudioUrl;
  delete item.publicAudioUrl;
  delete item.localReviewFile;
}

inventory.updatedAt = new Date().toISOString();
inventory.items = [...byKutId.values()].sort((a, b) => a.kutId.localeCompare(b.kutId));

fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2) + "\n");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log("THEME CONTAINER BOUNDARY MIGRATION COMPLETE");
console.log(`Container slots: ${manifest[key].length}`);
console.log(`Neutral inventory items: ${inventory.items.length}`);
for (const item of manifest[key]) {
  console.log(`${item.publicDisplayCode} -> ${item.kutId} -> ${item.audioUrl}`);
}
