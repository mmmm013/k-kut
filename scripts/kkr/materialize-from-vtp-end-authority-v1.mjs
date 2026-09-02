import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";

const STRICT_PASS = "STRICT_VTP_END_NO_CUTOFF_PASS";
const AUTHORITY_SCHEMA = "GPMX_VTP_END_AUTHORITY_V1";

function fail(message) {
  throw new Error(`VTP-END MATERIALIZER: ${message}`);
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function ensureFfmpeg() {
  if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status !== 0) {
    fail("ffmpeg is required to render governed II audio");
  }
}

function safeKey(value, label) {
  const text = String(value || "").trim();
  if (!/^[A-Za-z0-9_-]{1,200}$/.test(text)) fail(`${label} is invalid: ${text}`);
  return text;
}

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) fail(`${label} must be a finite number`);
  return number;
}

function exactPrice(product) {
  if (product === "HUG") return "7.99";
  if (product === "TUG") return "4.99";
  if (product === "BUG") return "1.99";
  fail(`unsupported product family: ${product}`);
}

function inventoryFamily(product) {
  if (product === "HUG") return "KK";
  if (product === "TUG") return "SK";
  if (product === "BUG") return "MK";
  fail(`unsupported product family: ${product}`);
}

const authorityPath = process.argv[2];
if (!authorityPath) {
  fail("usage: node scripts/kkr/materialize-from-vtp-end-authority-v1.mjs <authority.json>");
}
if (!fs.existsSync(authorityPath)) fail(`authority file not found: ${authorityPath}`);

const authority = JSON.parse(fs.readFileSync(authorityPath, "utf8"));
if (authority.schema_version !== AUTHORITY_SCHEMA) fail(`schema must be ${AUTHORITY_SCHEMA}`);
if (authority.status !== "COMPLETE_STRICT_VTP_END_AUTHORITY") fail("authority is not complete; HOLD");
if (!authority.lt_pix_key) fail("missing lt_pix_key");
if (!authority.source_audio_path || !fs.existsSync(authority.source_audio_path)) {
  fail(`authoritative source audio missing: ${authority.source_audio_path || "UNSET"}`);
}
if (!Array.isArray(authority.items) || authority.items.length === 0) fail("authority contains no II items");

ensureFfmpeg();

const ltPixKey = safeKey(authority.lt_pix_key, "lt_pix_key");
const sourceAudioPath = authority.source_audio_path;
const outputRoot = authority.output_root || "public/ii-delivery";
const manifestPath = authority.output_manifest_path || `data/ii-delivery-registry/${ltPixKey}-strict-vtp-end-v1.json`;
const sourceSha256 = sha256(sourceAudioPath);

if (authority.source_sha256 && authority.source_sha256 !== sourceSha256) {
  fail("source audio SHA-256 does not match authority");
}

const seen = new Set();
const rendered = [];

for (const raw of authority.items) {
  const iiKey = safeKey(raw.ii_key, "ii_key");
  if (seen.has(iiKey)) fail(`duplicate ii_key: ${iiKey}`);
  seen.add(iiKey);

  const product = String(raw.product_family || "").toUpperCase();
  if (!new Set(["HUG", "TUG", "BUG"]).has(product)) fail(`invalid product_family for ${iiKey}`);
  if (raw.boundary_prosecution_state !== STRICT_PASS) fail(`${iiKey} is not ${STRICT_PASS}`);
  if (raw.listening_verified !== true) fail(`${iiKey} lacks listening verification`);
  if (raw.post_vocal_audio_allowed !== false) fail(`${iiKey} must explicitly forbid post-vocal audio`);
  if (raw.next_pair_trespass === true) fail(`${iiKey} trespasses into the next pair`);
  if (raw.mid_vocal_cutoff === true) fail(`${iiKey} cuts a vocal`);

  const sourceStartSec = finiteNumber(raw.source_start_sec, `${iiKey}.source_start_sec`);
  const vtpEndSec = finiteNumber(raw.vtp_end_sec, `${iiKey}.vtp_end_sec`);
  if (sourceStartSec < 0 || vtpEndSec <= sourceStartSec) fail(`${iiKey} has invalid start/end order`);
  if (raw.source_end_sec !== undefined && Number(raw.source_end_sec) !== vtpEndSec) {
    fail(`${iiKey} source_end_sec must equal vtp_end_sec exactly`);
  }

  const displayTitle = String(raw.display_title || "").trim();
  const interpretation = String(raw.interpretation_summary || raw.buyer_intent || "").trim();
  if (!displayTitle) fail(`${iiKey} missing display_title`);
  if (!interpretation) fail(`${iiKey} missing interpretation_summary`);

  const productDir = product === "HUG" ? "hugs" : product === "TUG" ? "tugs" : "bugs";
  const outDir = path.join(outputRoot, productDir, ltPixKey);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${iiKey}.mp3`);

  const duration = vtpEndSec - sourceStartSec;
  execFileSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", sourceStartSec.toFixed(6),
    "-i", sourceAudioPath,
    "-t", duration.toFixed(6),
    "-map", "0:a:0",
    "-vn",
    "-c:a", "libmp3lame",
    "-q:a", "2",
    outFile,
  ]);

  rendered.push({
    ii_key: iiKey,
    lt_pix_key: ltPixKey,
    product_family: product,
    inventory_family: inventoryFamily(product),
    display_title: displayTitle,
    interpretation_summary: interpretation,
    price_usd: exactPrice(product),
    source_start_sec: sourceStartSec,
    vtp_end_sec: vtpEndSec,
    source_end_sec: vtpEndSec,
    rendered_duration_sec: Number(duration.toFixed(6)),
    boundary_prosecution_state: STRICT_PASS,
    listening_verified: true,
    post_vocal_audio_allowed: false,
    next_pair_trespass: false,
    mid_vocal_cutoff: false,
    source_audio_sha256: sourceSha256,
    audio_path: outFile,
    audio_url: `/${outFile.replace(/^public\//, "").replaceAll(path.sep, "/")}`,
    sha256: sha256(outFile),
  });
}

const manifest = {
  schema_version: "GPMX_STRICT_VTP_END_RENDER_MANIFEST_V1",
  status: "STRICT_VTP_END_RENDER_COMPLETE",
  lt_pix_key: ltPixKey,
  source_audio_path: sourceAudioPath,
  source_sha256: sourceSha256,
  hard_stop_rule: "END_EXACTLY_AT_LAST_AUDIBLE_VOCAL_NOTE_VTP_END",
  no_grandfathered_boundaries: true,
  post_vocal_audio_allowed: false,
  item_count: rendered.length,
  items: rendered,
};

fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`STRICT VTP-END MATERIALIZER: PASS (${rendered.length} IIs)`);
console.log(`MANIFEST=${manifestPath}`);
