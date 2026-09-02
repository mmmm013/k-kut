import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";

const STRICT_PASS = "STRICT_VTP_END_NO_CUTOFF_PASS";
const AUTHORITY_SCHEMA = "GPMX_CAPTURED_CC_VTP_END_AUTHORITY_V1";
const AUTHORITY_SOURCE_KIND = "CAPTURED_CC_AUTHORITY_ONLY";

function fail(message) {
  throw new Error(`CAPTURED-CC MATERIALIZER: ${message}`);
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
  if (!/^[A-Za-z0-9_.:-]{1,240}$/.test(text)) fail(`${label} is invalid: ${text}`);
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
  fail("usage: node scripts/kkr/materialize-from-vtp-end-authority-v1.mjs <captured-cc-authority.json>");
}
if (!fs.existsSync(authorityPath)) fail(`authority file not found: ${authorityPath}`);

const authority = JSON.parse(fs.readFileSync(authorityPath, "utf8"));
if (authority.schema_version !== AUTHORITY_SCHEMA) fail(`schema must be ${AUTHORITY_SCHEMA}`);
if (authority.authority_source_kind !== AUTHORITY_SOURCE_KIND) fail(`authority_source_kind must be ${AUTHORITY_SOURCE_KIND}`);
if (authority.discovery_search_permitted !== false) fail("fresh discovery/search is forbidden during LT-PIX reprocessing");
if (authority.status !== "COMPLETE_CAPTURED_CC_VTP_END_AUTHORITY") fail("captured CC authority is incomplete; HOLD");
if (!authority.lt_pix_key) fail("missing lt_pix_key");
if (!authority.source_audio_path || !fs.existsSync(authority.source_audio_path)) {
  fail(`authoritative source audio missing: ${authority.source_audio_path || "UNSET"}`);
}
if (!Array.isArray(authority.items) || authority.items.length === 0) fail("authority contains no captured CC items");

ensureFfmpeg();

const ltPixKey = safeKey(authority.lt_pix_key, "lt_pix_key");
const sourceAudioPath = authority.source_audio_path;
const outputRoot = authority.output_root || "public/ii-delivery";
const manifestPath = authority.output_manifest_path || `data/ii-delivery-registry/${ltPixKey}-captured-cc-vtp-end-v1.json`;
const sourceSha256 = sha256(sourceAudioPath);

if (authority.source_sha256 && authority.source_sha256 !== sourceSha256) {
  fail("source audio SHA-256 does not match captured authority");
}

const seen = new Set();
const rendered = [];

for (const raw of authority.items) {
  const iiKey = safeKey(raw.ii_key, "ii_key");
  if (seen.has(iiKey)) fail(`duplicate ii_key: ${iiKey}`);
  seen.add(iiKey);

  const product = String(raw.product_family || "").toUpperCase();
  if (!new Set(["HUG", "TUG", "BUG"]).has(product)) fail(`invalid product_family for ${iiKey}`);

  const captured = raw.captured_cc_authority;
  if (!captured || typeof captured !== "object") fail(`${iiKey} is missing captured_cc_authority`);
  const sourceTable = safeKey(captured.source_table, `${iiKey}.captured_cc_authority.source_table`);
  const sourceRecordId = safeKey(captured.source_record_id, `${iiKey}.captured_cc_authority.source_record_id`);
  if (captured.capture_state !== "CAPTURED") fail(`${iiKey} CC is not in CAPTURED state`);
  if (captured.discovery_search_used === true) fail(`${iiKey} used forbidden fresh discovery/search`);

  if (raw.boundary_prosecution_state !== STRICT_PASS) fail(`${iiKey} is not ${STRICT_PASS}`);
  if (raw.listening_verified !== true) fail(`${iiKey} lacks listening verification`);
  if (raw.post_vocal_audio_allowed !== false) fail(`${iiKey} must explicitly forbid post-vocal audio`);
  if (raw.next_pair_trespass === true) fail(`${iiKey} trespasses into the next pair`);
  if (raw.mid_vocal_cutoff === true) fail(`${iiKey} cuts a vocal`);

  const capturedStartSec = finiteNumber(captured.capture_start_sec, `${iiKey}.capture_start_sec`);
  const capturedEndSec = finiteNumber(captured.capture_end_sec, `${iiKey}.capture_end_sec`);
  const validatedVtpEndSec = finiteNumber(raw.validated_vtp_end_sec, `${iiKey}.validated_vtp_end_sec`);

  if (capturedStartSec < 0 || capturedEndSec <= capturedStartSec) fail(`${iiKey} has invalid captured CC boundaries`);
  if (validatedVtpEndSec <= capturedStartSec) fail(`${iiKey} has invalid validated VTP-END`);

  // Reprocessing may correct the stored CC endpoint during review, but rendering is
  // permitted only after that corrected stored endpoint itself equals the exact VTP-END.
  if (Math.abs(capturedEndSec - validatedVtpEndSec) > 0.000001) {
    fail(`${iiKey} captured CC end (${capturedEndSec}) is not yet corrected to validated VTP-END (${validatedVtpEndSec}); update stored CC authority first`);
  }

  const displayTitle = String(raw.display_title || "").trim();
  const interpretation = String(raw.interpretation_summary || raw.buyer_intent || "").trim();
  if (!displayTitle) fail(`${iiKey} missing display_title`);
  if (!interpretation) fail(`${iiKey} missing interpretation_summary`);

  const productDir = product === "HUG" ? "hugs" : product === "TUG" ? "tugs" : "bugs";
  const outDir = path.join(outputRoot, productDir, ltPixKey);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${iiKey}.mp3`);

  const duration = validatedVtpEndSec - capturedStartSec;
  execFileSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-ss", capturedStartSec.toFixed(6),
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
    authority_source_kind: AUTHORITY_SOURCE_KIND,
    captured_cc_source_table: sourceTable,
    captured_cc_source_record_id: sourceRecordId,
    captured_cc_start_sec: capturedStartSec,
    captured_cc_end_sec: capturedEndSec,
    validated_vtp_end_sec: validatedVtpEndSec,
    rendered_duration_sec: Number(duration.toFixed(6)),
    boundary_prosecution_state: STRICT_PASS,
    listening_verified: true,
    post_vocal_audio_allowed: false,
    next_pair_trespass: false,
    mid_vocal_cutoff: false,
    discovery_search_used: false,
    source_audio_sha256: sourceSha256,
    audio_path: outFile,
    audio_url: `/${outFile.replace(/^public\//, "").replaceAll(path.sep, "/")}`,
    sha256: sha256(outFile),
  });
}

const manifest = {
  schema_version: "GPMX_CAPTURED_CC_STRICT_VTP_END_RENDER_MANIFEST_V1",
  status: "CAPTURED_CC_STRICT_VTP_END_RENDER_COMPLETE",
  lt_pix_key: ltPixKey,
  source_audio_path: sourceAudioPath,
  source_sha256: sourceSha256,
  authority_source_kind: AUTHORITY_SOURCE_KIND,
  discovery_search_permitted: false,
  hard_stop_rule: "END_EXACTLY_AT_LAST_AUDIBLE_VOCAL_NOTE_VTP_END",
  captured_cc_required: true,
  stored_cc_end_must_equal_validated_vtp_end: true,
  no_grandfathered_boundaries: true,
  post_vocal_audio_allowed: false,
  item_count: rendered.length,
  items: rendered,
};

fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`CAPTURED-CC VTP-END MATERIALIZER: PASS (${rendered.length} IIs)`);
console.log(`MANIFEST=${manifestPath}`);
