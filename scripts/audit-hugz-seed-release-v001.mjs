import crypto from "node:crypto";
import fs from "node:fs";

const manifest = JSON.parse(
  fs.readFileSync("data/hugz/hugz-seed-catalog-v001.json", "utf8"),
);
const stop = (message) => {
  throw new Error(message);
};
const sha = (path) =>
  crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");

if (manifest.temporary_hugz_count !== 13 || manifest.containers.length !== 13) {
  stop("13 HUGz Cards required");
}
if (manifest.terminology_lock.HUGz_is_II !== false) {
  stop("HUGz Card must never be classified as an II");
}
if (manifest.terminology_lock.HUGz_is_HUG !== false) {
  stop("HUGz Card must never be classified as the purchased HUG");
}
if (
  manifest.general_catalog_status !== "HOLD_OUTSIDE_HUGZ_TEMP_REVENUE_LANE"
) {
  stop("general catalog hold must remain outside the HUGz revenue lane");
}
if (new Set(manifest.containers.map((container) => container.hugz_slug)).size !== 13) {
  stop("13 unique HUGz Card slugs required");
}

let totalSeeds = 0;
for (const container of manifest.containers) {
  if (
    container.is_ii !== false ||
    container.is_media_asset !== false ||
    container.is_hug_dp !== false
  ) {
    stop(`HUGz Card identity violation: ${container.hugz_slug}`);
  }
  if (container.seed_count < 3 || container.seeds.length < 3) {
    stop(`HUGz Card must contain at least three choices: ${container.hugz_slug}`);
  }
  if (new Set(container.seeds.map((seed) => seed.seed_asset_id)).size !== container.seeds.length) {
    stop(`duplicate choice inside HUGz Card: ${container.hugz_slug}`);
  }
  if (
    new Set(container.seeds.map((seed) => seed.source_audio_sha256)).size !==
    container.seeds.length
  ) {
    stop(`duplicate source audio inside HUGz Card: ${container.hugz_slug}`);
  }

  for (const seed of container.seeds) {
    totalSeeds += 1;
    if (seed.hugz_is_ii !== false || seed.hugz_is_asset !== false) {
      stop(`choice confused with HUGz Card: ${seed.seed_asset_id}`);
    }
    if (!seed.hug_dp_payment_url.includes("client_reference_id=")) {
      stop(`missing exact selected-II payment reference: ${seed.seed_asset_id}`);
    }
    if (seed.price_cents !== 799) {
      stop(`wrong HUG price: ${seed.seed_asset_id}`);
    }
    const path = `public${seed.preview_audio_url}`;
    if (!fs.existsSync(path)) stop(`missing preview: ${path}`);
    if (sha(path) !== seed.preview_audio_sha256) {
      stop(`preview SHA mismatch: ${seed.seed_asset_id}`);
    }
  }
}

if (totalSeeds !== manifest.total_seed_options || totalSeeds !== 104) {
  stop("104 existing HUG choices required");
}

const offerLaw = fs.readFileSync("lib/productOfferLaw.ts", "utf8");
const detail = fs.readFileSync("app/hugz/[slug]/page.tsx", "utf8");
const tray = fs.readFileSync("components/HugzThreeChoiceTray.tsx", "utf8");
const governance = fs.readFileSync(
  "docs/site-governance/K_KUT_HUG_TUG_BUG_OFFER_LAW_V001.md",
  "utf8",
);

for (const required of [
  'priceCents: 799',
  'priceCents: 499',
  'priceCents: 199',
  '["KK", "KOMBO"]',
  '["sK"]',
  '["TRM", "XCLM", "VSND"]',
  'optionsVisibleAtOnce: 3',
]) {
  if (!offerLaw.includes(required)) stop(`offer law missing: ${required}`);
}

if (!detail.includes("HugzThreeChoiceTray")) {
  stop("HUGz Card detail must use the three-choice tray");
}
if (!detail.includes("Choose one KK or KOMBO")) {
  stop("HUGz Card must state that HUG choices are KKs or KOMBOs");
}
if (!tray.includes("Choose this HUG")) {
  stop("$7.99 HUG checkout action missing");
}
if (!tray.includes("Listening volume")) {
  stop("local listening-volume control missing");
}
if (!governance.includes("No other source form is eligible for a BUG")) {
  stop("BUG source restriction missing");
}

for (const [path, text] of [
  ["offer law", offerLaw],
  ["HUGz detail", detail],
  ["HUGz tray", tray],
  ["governance", governance],
]) {
  if (text.includes("12.99")) stop(`obsolete $12.99 found in ${path}`);
}

console.log("GPMX HUGZ CARD INCOME OFFER AUDIT: PASS");
console.log(`HUGz Cards: ${manifest.containers.length}`);
console.log(`HUG choices: ${totalSeeds}`);
console.log("Visible choices per tray: 3");
console.log("HUG: KK/KOMBO · $7.99");
console.log("TUG: sK · $4.99");
console.log("BUG: mK from TRM/XCLM/VSND only · $1.99");
