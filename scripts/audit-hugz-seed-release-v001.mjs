import crypto from "node:crypto";
import fs from "node:fs";

const pool = JSON.parse(
  fs.readFileSync("data/sentimeant/strict-kk-pool-v001.json", "utf8"),
);
const stop = (message) => {
  throw new Error(message);
};
const sha = (path) =>
  crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");

if (pool.status !== "GD_AUTHORIZED_TEMPORARY_KK_RELEASE") stop("strict KK authority missing");
if (pool.story_count !== 13 || pool.audio_count !== 13 || pool.rows.length !== 13) {
  stop("exactly 13 strict KKs required");
}
if (pool.general_2611_catalog_status !== "BLOCKED") stop("general 2,611 catalog hold lost");
if (pool.checkout_status !== "BLOCKED_SEPARATE_PROOF_REQUIRED") {
  stop("checkout must remain held until separate proof passes");
}

const kkIds = new Set();
const sourceShas = new Set();
for (const row of pool.rows) {
  if (!row.kk_id.includes("-KK-")) stop(`non-KK item found: ${row.kk_id}`);
  if (row.source_music_gate_status !== "MUSIC_PASS_STRICT_AUDIO_GATE") {
    stop(`music gate failed: ${row.kk_id}`);
  }
  if (row.twinkle_at_end !== true || row.twinkle_sha256 !== pool.twinkle_sha256) {
    stop(`Twinkle proof failed: ${row.kk_id}`);
  }
  if (row.checkout_status !== "BLOCKED_SEPARATE_PROOF_REQUIRED") {
    stop(`unproven checkout exposed: ${row.kk_id}`);
  }
  if (kkIds.has(row.kk_id)) stop(`duplicate KK ID: ${row.kk_id}`);
  if (sourceShas.has(row.source_audio_sha256)) stop(`duplicate source audio: ${row.kk_id}`);
  kkIds.add(row.kk_id);
  sourceShas.add(row.source_audio_sha256);

  const path = `public${row.delivery_audio_url}`;
  if (!fs.existsSync(path)) stop(`missing strict KK audio: ${path}`);
  if (sha(path) !== row.delivery_audio_sha256) stop(`delivery SHA mismatch: ${row.kk_id}`);
}

const catalog = fs.readFileSync("lib/hugzSeedCatalog.ts", "utf8");
const tray = fs.readFileSync("components/HugzThreeChoiceTray.tsx", "utf8");
if (catalog.includes("KKr-PHR") || catalog.includes("KKr-1LN")) {
  stop("phrase or line candidates remain in HUGz eligibility");
}
if (!catalog.includes('assetKind: "KK"')) stop("strict KK mapping missing");
if (!tray.includes("Checkout held")) stop("checkout hold is not visible");
if (tray.includes("href={seed.buyUrl}")) stop("unproven checkout link remains active");

console.log("HUGZ STRICT KK CORRECTION AUDIT: PASS");
console.log("HUGz Cards: 13");
console.log("Proven strict-music KKs: 13");
console.log("Duplicate KK IDs: 0");
console.log("Duplicate source audio SHAs: 0");
console.log("Phrase/line HUG choices: 0");
console.log("Checkout: BLOCKED_SEPARATE_PROOF_REQUIRED");
console.log("Production deployment authorized: NO");
