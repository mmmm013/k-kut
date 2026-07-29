import crypto from "node:crypto";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("data/hugz/hugz-seed-catalog-v001.json", "utf8"));
const stop = (message) => { throw new Error(message); };
const sha = (path) => crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");

if (manifest.temporary_hugz_count !== 13 || manifest.containers.length !== 13) stop("13 temporary HUGz required");
if (manifest.terminology_lock.HUGz_is_II !== false) stop("HUGz must never be classified as II");
if (manifest.terminology_lock.HUGz_is_HUG !== false) stop("HUGz must never be classified as HUG DP");
if (manifest.general_catalog_status !== "HOLD_OUTSIDE_HUGZ_TEMP_REVENUE_LANE") stop("general catalog hold must remain");
if (new Set(manifest.containers.map((c) => c.hugz_slug)).size !== 13) stop("13 unique HUGz slugs required");
let totalSeeds = 0;
for (const container of manifest.containers) {
  if (container.is_ii !== false || container.is_media_asset !== false || container.is_hug_dp !== false) stop(`container identity violation: ${container.hugz_slug}`);
  if (container.seed_count < 2 || container.seeds.length < 2) stop(`HUGz must contain multiple seeds: ${container.hugz_slug}`);
  if (new Set(container.seeds.map((s) => s.seed_asset_id)).size !== container.seeds.length) stop(`duplicate seed: ${container.hugz_slug}`);
  if (new Set(container.seeds.map((s) => s.source_audio_sha256)).size !== container.seeds.length) stop(`duplicate source audio inside HUGz: ${container.hugz_slug}`);
  for (const seed of container.seeds) {
    totalSeeds += 1;
    if (seed.hugz_is_ii !== false || seed.hugz_is_asset !== false) stop(`seed confused with HUGz: ${seed.seed_asset_id}`);
    if (!seed.hug_dp_payment_url.includes("client_reference_id=")) stop(`missing HUG DP reference: ${seed.seed_asset_id}`);
    if (seed.price_cents !== 799) stop(`wrong price: ${seed.seed_asset_id}`);
    const path = "public" + seed.preview_audio_url;
    if (!fs.existsSync(path)) stop(`missing preview: ${path}`);
    if (sha(path) !== seed.preview_audio_sha256) stop(`preview SHA mismatch: ${seed.seed_asset_id}`);
  }
}
if (totalSeeds !== manifest.total_seed_options || totalSeeds < 26) stop("seed total invalid");
const detail = fs.readFileSync("app/hugz/[slug]/page.tsx", "utf8");
if (!detail.includes("Package this music as a HUG")) stop("HUG DP checkout action missing");
console.log("GPMX HUGZ TEMP REVENUE SEED RELEASE AUDIT: PASS");
console.log(`HUGz: ${manifest.containers.length}`);
console.log(`MUSIC SEEDS: ${totalSeeds}`);
console.log("HUGz CLASSIFIED AS IIs: 0");
console.log("HUG DP CHECKOUT PRICE: $7.99");
