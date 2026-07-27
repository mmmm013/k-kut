import crypto from "node:crypto";
import fs from "node:fs";

const EXPECTED_SLUGS = [
  "bad-day",
  "big-win",
  "make-it-right",
  "just-because-care",
  "miss-them",
  "first-day-nerves",
  "proud-of-them",
  "thinking-of-you",
  "long-week",
  "breakup-blues",
  "new-baby",
  "just-because-smile",
  "friends",
];

const BLOCKED_SHAS = new Set([
  "b5c089fafaeaf75019db38a99a164e6074d335cf5a7907c0662e6dc8d5958fb2",
  "dc05fc30d88b3cb56db31550aa7f701a8aa8f5b139e941d76b78e62bc884b84d",
]);

function stop(message) {
  throw new Error(message);
}

function sha256(path) {
  return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}

try {
  const manifestPath = "data/sentimeant/strict-kk-pool-v001.json";
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const carousel = fs.readFileSync("components/CuteHugCarousel.tsx", "utf8");
  const home = fs.readFileSync("app/_sentimeant-home.tsx", "utf8");
  const route = fs.readFileSync("app/sentimeant/[slug]/page.tsx", "utf8");
  const checkout = fs.readFileSync("app/checkout/route.ts", "utf8");
  const catalog = fs.readFileSync("app/api/public-ii-catalog/route.ts", "utf8");

  if (manifest.schema_version !== "SENTIMEANT_13_STRICT_KK_V001") {
    stop("manifest schema drift");
  }
  if (manifest.status !== "GD_AUTHORIZED_TEMPORARY_KK_RELEASE") {
    stop("temporary KK release authorization missing");
  }
  if (manifest.story_count !== 13 || manifest.audio_count !== 13) {
    stop("exact 13 count failed");
  }
  if (!Array.isArray(manifest.rows) || manifest.rows.length !== 13) {
    stop("manifest rows must equal 13");
  }
  if (manifest.general_2611_catalog_status !== "BLOCKED") {
    stop("general catalog must remain blocked");
  }
  if (manifest.checkout_status !== "BLOCKED_SEPARATE_PROOF_REQUIRED") {
    stop("checkout must remain blocked");
  }
  if (manifest.known_mc_bot_no_music_allowed !== 0) {
    stop("MC-BOT/no-music allowance must be zero");
  }

  const slugs = manifest.rows.map((row) => row.slug);
  if (JSON.stringify(slugs) !== JSON.stringify(EXPECTED_SLUGS)) {
    stop("13 story slug order or identity drift");
  }

  const parents = new Set();
  const kks = new Set();
  const sourceShas = new Set();
  const deliveryShas = new Set();

  for (const row of manifest.rows) {
    if (row.source_music_gate_status !== "MUSIC_PASS_STRICT_AUDIO_GATE") {
      stop(`${row.slug}: strict music pass missing`);
    }
    if (!/^LT-PIX-(?:ALLPOSS-\d{5}|ACTIVE-\d+)$/u.test(row.lt_pix_ssot_parent_id)) {
      stop(`${row.slug}: invalid LT-PIX SSOT parent`);
    }
    if (!/^LT-PIX-(?:ALLPOSS-\d{5}|ACTIVE-\d+)-KK-\d+$/u.test(row.kk_id)) {
      stop(`${row.slug}: invalid KK ID`);
    }
    if (!/^[0-9a-f]{64}$/u.test(row.source_audio_sha256)) {
      stop(`${row.slug}: invalid source SHA`);
    }
    if (!/^[0-9a-f]{64}$/u.test(row.delivery_audio_sha256)) {
      stop(`${row.slug}: invalid delivery SHA`);
    }
    if (BLOCKED_SHAS.has(row.source_audio_sha256)) {
      stop(`${row.slug}: known MC-BOT/no-music SHA`);
    }
    if (row.twinkle_at_end !== true) {
      stop(`${row.slug}: Twinkle-at-end proof missing`);
    }
    if (row.checkout_status !== "BLOCKED_SEPARATE_PROOF_REQUIRED") {
      stop(`${row.slug}: checkout unexpectedly opened`);
    }

    parents.add(row.lt_pix_ssot_parent_id);
    kks.add(row.kk_id);
    sourceShas.add(row.source_audio_sha256);
    deliveryShas.add(row.delivery_audio_sha256);

    const file = `public${row.delivery_audio_url}`;
    if (!fs.existsSync(file) || fs.statSync(file).size < 25000) {
      stop(`${row.slug}: delivery audio missing or too small`);
    }
    if (sha256(file) !== row.delivery_audio_sha256) {
      stop(`${row.slug}: delivery SHA mismatch`);
    }
  }

  if (parents.size !== 13) stop("13 unique LT-PIX parents required");
  if (kks.size !== 13) stop("13 unique KKs required");
  if (sourceShas.size !== 13) stop("13 unique source SHAs required");
  if (deliveryShas.size !== 13) stop("13 unique delivery SHAs required");

  if (!carousel.includes('href={`/sentimeant/${slide.slug}`}')) {
    stop("carousel does not use dedicated story routes");
  }
  if (carousel.includes("/find?moment=")) {
    stop("generic /find story routing returned");
  }
  if (carousel.includes("Browse 2,611 HUGs")) {
    stop("unsafe 2,611 browse claim returned");
  }
  if (!home.includes("13 strict-music-proven KKs")) {
    stop("Sentimeant home does not declare exact curated lane");
  }
  if (!route.includes("It is not an MC-BOT script")) {
    stop("story page music distinction missing");
  }

  for (const forbidden of [
    "buy.stripe.com",
    "createPendingH2Order",
    "KK_HUG_PAYMENT_URL",
    "NEXT_PUBLIC_SK_HUG_LINK",
  ]) {
    if (checkout.includes(forbidden)) {
      stop(`checkout hold lost: ${forbidden}`);
    }
  }

  for (const required of [
    "inventoryCount: 0",
    "purchasableCount: 0",
    "records: []",
  ]) {
    if (!catalog.includes(required)) {
      stop(`general catalog hold lost: ${required}`);
    }
  }

  console.log("SENTIMEANT 13 STRICT-MUSIC KK AUDIT PASS");
  console.log("STORIES: 13");
  console.log("STRICT-MUSIC KKS: 13");
  console.log("UNIQUE LT-PIX SSOT PARENTS: 13");
  console.log("MC-BOT / NO-MUSIC: 0");
  console.log("GENERAL 2611 CATALOG: BLOCKED");
  console.log("CHECKOUT: BLOCKED");
} catch (error) {
  console.error("SENTIMEANT 13 STRICT-MUSIC KK AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
