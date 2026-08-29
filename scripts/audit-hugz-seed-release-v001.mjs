import fs from "node:fs";

const manifest = JSON.parse(
  fs.readFileSync("data/hugz/hugz-seed-catalog-v001.json", "utf8"),
);
const stop = (message) => {
  throw new Error(message);
};
const KK_AUDIO_PREFIX =
  "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/release-gate-v004/";

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
if (manifest.schema_version !== "GPMX_13_HUGZ_104_FULL_KK_V002") {
  stop("full-KK HUGz authority schema missing");
}
if (
  manifest.inventory_authority?.eligible_kk_count !== 2611 ||
  manifest.inventory_authority?.required_family !== "KK" ||
  manifest.inventory_authority?.required_public_storage_status !==
    "PUBLIC_STORAGE_VERIFIED" ||
  manifest.inventory_authority?.required_twinkle_at_end !== "YES"
) {
  stop("2,611-KK storage authority is incomplete");
}
if (new Set(manifest.containers.map((container) => container.hugz_slug)).size !== 13) {
  stop("13 unique HUGz Card slugs required");
}

let totalSeeds = 0;
const allSeedIds = new Set();
const allSeedShas = new Set();
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
    if (allSeedIds.has(seed.seed_asset_id)) {
      stop(`duplicate choice across HUGz Cards: ${seed.seed_asset_id}`);
    }
    if (allSeedShas.has(seed.source_audio_sha256)) {
      stop(`duplicate audio across HUGz Cards: ${seed.seed_asset_id}`);
    }
    allSeedIds.add(seed.seed_asset_id);
    allSeedShas.add(seed.source_audio_sha256);
    if (seed.hugz_is_ii !== false || seed.hugz_is_asset !== false) {
      stop(`choice confused with HUGz Card: ${seed.seed_asset_id}`);
    }
    if (!seed.hug_dp_payment_url.includes("client_reference_id=")) {
      stop(`missing exact selected-II payment reference: ${seed.seed_asset_id}`);
    }
    if (seed.price_cents !== 799) {
      stop(`wrong HUG price: ${seed.seed_asset_id}`);
    }
    if (seed.seed_asset_kind !== "KK") {
      stop(`non-KK choice in HUGz Card: ${seed.seed_asset_id}`);
    }
    if (!/^LT-PIX-ALLPOSS-\d{5}-KK-\d+$/u.test(seed.seed_asset_id)) {
      stop(`invalid full KK identity: ${seed.seed_asset_id}`);
    }
    if (seed.seed_role !== "FULLY_DRESSED_SONG_SEGMENT_HUG") {
      stop(`choice is not a fully dressed song segment: ${seed.seed_asset_id}`);
    }
    if (
      seed.music_authority !== "PUBLIC_STORAGE_VERIFIED" ||
      seed.twinkle_at_end !== true
    ) {
      stop(`strict music dressing missing: ${seed.seed_asset_id}`);
    }
    if (!seed.preview_audio_url.startsWith(KK_AUDIO_PREFIX)) {
      stop(`choice does not use governed full-KK audio: ${seed.seed_asset_id}`);
    }
    if (
      seed.preview_audio_sha256 !== seed.source_audio_sha256 ||
      !/^[0-9a-f]{64}$/u.test(seed.preview_audio_sha256)
    ) {
      stop(`governed KK SHA mismatch: ${seed.seed_asset_id}`);
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
if (!tray.includes("Exact music choices in release review")) {
  stop("TP/CC boundary hold is missing");
}
if (tray.includes("<audio") || tray.includes("href={seed.buyUrl}")) {
  stop("private audio or direct Stripe URL escaped the TP/CC boundary hold");
}
if (tray.includes('action="/checkout"')) {
  stop("HUGz checkout escaped while exact customer choices are held");
}
if (!governance.includes("No other source form is eligible for a BUG")) {
  stop("BUG source restriction missing");
}
if (!governance.includes("no obsolete $12.99 offer is displayed or sold")) {
  stop("obsolete $12.99 prohibition missing from governance");
}

for (const [path, text] of [
  ["offer law", offerLaw],
  ["HUGz detail", detail],
  ["HUGz tray", tray],
]) {
  if (text.includes("12.99")) stop(`obsolete $12.99 found in ${path}`);
}

console.log("GPMX HUGZ CARD INCOME OFFER AUDIT: PASS");
console.log(`HUGz Cards: ${manifest.containers.length}`);
console.log(`HUG choices: ${totalSeeds}`);
console.log("HUG choice inventory: 104 distinct full KKs");
console.log("Phrase/line/TRM choices: 0");
console.log("Visible choices per tray: 3");
console.log("Public audio: HELD FOR TP/CC REVALIDATION");
console.log("HUGz checkout: HELD UNTIL EXACT CHOICE RELEASE");
console.log("HUG: KK/KOMBO · $7.99");
console.log("TUG: sK · $4.99");
console.log("BUG: mK from TRM/XCLM/VSND only · $1.99");
