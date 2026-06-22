import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const manifestPath = "data/kk-sets/fathers-day-product-statements.json";
const data = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const items = data.items ?? data.products ?? [];
const listKey = data.items ? "items" : "products";

const existingAudio = new Set(
  items
    .map((item) => item.audioUrl || item.publicAudioUrl || item.localReviewFile || "")
    .filter(Boolean)
    .map((url) => url.replace(/^public\//, "/"))
);

const existingIds = new Set(items.map((item) => item.id).filter(Boolean));
const template = items[0] ?? {};

const trackedFiles = execFileSync("git", ["ls-files", "-z", "public"], {
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean)
  .filter((file) => /\.(mp3|m4a|wav)$/i.test(file));

const forbiddenPath = /(review|proof|source|raw|master|staging|_work|admin|test|tmp|temp)/i;

const groups = [
  {
    key: "ring-the-bell",
    publicFamily: "Ring the Bell",
    match: /(ring[-_ ]?the[-_ ]?bell|ring.*bell|bell.*ring)/i,
    lane: "Proud / respect",
    copy: "A bright, steady music moment for honoring Dad with lift and presence.",
  },
  {
    key: "im-no-mystery",
    publicFamily: "I’m No Mystery",
    match: /(i.?m[-_ ]?no[-_ ]?mystery|im[-_ ]?no[-_ ]?mystery|no[-_ ]?mystery)/i,
    lane: "Strong / steady",
    copy: "A clear music moment for a Dad who stands solid and true.",
  },
  {
    key: "in-the-end",
    publicFamily: "In the End",
    match: /(in[-_ ]?the[-_ ]?end|intheend)/i,
    lane: "Remembered",
    copy: "A reflective music moment for legacy, memory, and what lasts.",
  },
  {
    key: "have-to-duet",
    publicFamily: "Have-To / Duet",
    match: /(have[-_ ]?to|haveto|duet)/i,
    lane: "Grateful",
    copy: "A grounded music moment for duty, devotion, and showing up.",
  },
];

function slug(input) {
  return String(input)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function titleFromFile(file, fallback) {
  const base = path.basename(file).replace(/\.(mp3|m4a|wav)$/i, "");
  const cleaned = base
    .replace(/twinkle[-_ ]?2sec[-_ ]?sooner/gi, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned.length < 3) return fallback;

  return cleaned
    .split(" ")
    .map((part) => {
      const lower = part.toLowerCase();
      if (["a", "and", "of", "the", "to", "in"].includes(lower)) return lower;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function carryInternalReleaseFields(base, target) {
  for (const [key, value] of Object.entries(base)) {
    if (
      /twinkle|canonical/i.test(key) ||
      ["inventoryState", "releasePath", "pricingRule", "tierId", "tierLabel", "priceCents", "priceLabel", "promoPriceLabel"].includes(key)
    ) {
      target[key] = value;
    }
  }

  target.tierId = target.tierId ?? "k-kut";
  target.tierLabel = target.tierLabel ?? "K-KUT";
  target.priceCents = target.priceCents ?? 499;
  target.priceLabel = target.priceLabel ?? "$4.99";
  target.promoPriceLabel = target.promoPriceLabel ?? "$4.99";

  return target;
}

const additions = [];

for (const group of groups) {
  const matches = trackedFiles
    .filter((file) => file.startsWith("public/"))
    .filter((file) => !forbiddenPath.test(file))
    .filter((file) => group.match.test(file))
    .filter((file) => !existingAudio.has(`/${file.replace(/^public\//, "")}`))
    .sort()
    .slice(0, 4);

  for (const file of matches) {
    const audioUrl = `/${file.replace(/^public\//, "")}`;
    const fileTitle = titleFromFile(file, group.publicFamily);
    const id = `fd-variety-${group.key}-${slug(fileTitle)}`;

    if (existingIds.has(id)) continue;

    const item = carryInternalReleaseFields(template, {
      id,
      publicTitle: fileTitle,
      productTitle: fileTitle,
      title: fileTitle,
      typeLabel: "K-KUT",
      sizeDistinction: "K-KUT",
      publicFamily: group.publicFamily,
      feelingLane: group.lane,
      displayCopy: group.copy,
      audioUrl,
      checkoutUrl: `/checkout?product=${encodeURIComponent(id)}`,
    });

    additions.push(item);
    existingAudio.add(audioUrl);
    existingIds.add(id);
  }
}

if (additions.length < 4) {
  console.error(`STOP: only found ${additions.length} new tracked public audio matches.`);
  console.error("Found additions:");
  for (const item of additions) console.error(`- ${item.publicFamily}: ${item.audioUrl}`);
  console.error("");
  console.error("Run this search and paste output:");
  console.error("find public -type f \\( -iname '*.mp3' -o -iname '*.m4a' -o -iname '*.wav' \\) | grep -Ei 'ring|bell|mystery|in.the.end|have|duet'");
  process.exit(1);
}

data[listKey] = [...items, ...additions];

fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2) + "\n");

console.log(`ADDED ${additions.length} Father’s Day variety options:`);
for (const item of additions) {
  console.log(`- ${item.publicFamily} | ${item.publicTitle} | ${item.audioUrl}`);
}
