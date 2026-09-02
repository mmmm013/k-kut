import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";

const WORKLIST_SCHEMA = "GPMX_DEDUPLICATED_CAPTURED_CC_CORRECTION_WORKLIST_V1";
const AUTHORITY_KIND = "CAPTURED_CC_AUTHORITY_ONLY";
const STRICT_PASS = "STRICT_LAST_VOCAL_NOTE_END_PASS";

function fail(message) { throw new Error(`CAPTURED-CC MATERIALIZER: ${message}`); }
function sha256(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) fail(`${label} must be finite`);
  return number;
}
function safeKey(value, label) {
  const text = String(value || "").trim();
  if (!/^[A-Za-z0-9_.:-]{1,240}$/.test(text)) fail(`${label} is invalid`);
  return text;
}
function productFor(iiKey) {
  if (iiKey.includes("_bug_")) return "BUG";
  if (iiKey.includes("_tug_")) return "TUG";
  return "HUG";
}
function priceFor(product) {
  return product === "HUG" ? "7.99" : product === "TUG" ? "4.99" : "1.99";
}

const worklistPath = process.argv[2];
if (!worklistPath) fail("usage: node scripts/kkr/materialize-from-captured-cc-worklist-v1.mjs <deduplicated-captured-cc-correction-worklist.json>");
if (!fs.existsSync(worklistPath)) fail(`worklist not found: ${worklistPath}`);

const worklist = JSON.parse(fs.readFileSync(worklistPath, "utf8"));
if (worklist.schema_version !== WORKLIST_SCHEMA) fail(`schema must be ${WORKLIST_SCHEMA}`);
if (worklist.authority_source_kind !== AUTHORITY_KIND) fail(`authority_source_kind must be ${AUTHORITY_KIND}`);
if (worklist.discovery_search_permitted !== false || worklist.fresh_lt_pix_pass_permitted !== false) {
  fail("fresh LT-PIX discovery/search is forbidden");
}
if (worklist.status !== "CAPTURED_CC_CORRECTIONS_COMPLETE") fail("correction worklist is incomplete; HOLD");
if (!Array.isArray(worklist.items) || worklist.items.length === 0) fail("worklist is empty");
if (!worklist.source_audio_path || !fs.existsSync(worklist.source_audio_path)) fail("render source audio is missing");
if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status !== 0) fail("ffmpeg is required");

const sourceHash = sha256(worklist.source_audio_path);
if (worklist.source_sha256 && worklist.source_sha256 !== sourceHash) fail("render source audio hash mismatch");

const seenWorkItems = new Set();
const seenConsumers = new Set();
const rendered = [];

for (const item of worklist.items) {
  const workItemId = safeKey(item.work_item_id, "work_item_id");
  if (seenWorkItems.has(workItemId)) fail(`duplicate work item: ${workItemId}`);
  seenWorkItems.add(workItemId);
  if (item.authority_source_kind !== AUTHORITY_KIND) fail(`${workItemId} has non-CC authority`);
  if (item.correction?.review_state !== "LAST_VOCAL_NOTE_END_CONFIRMED") fail(`${workItemId} is unreviewed; HOLD`);
  if (item.correction?.boundary_prosecution_state !== STRICT_PASS) fail(`${workItemId} is not ${STRICT_PASS}`);
  if (item.correction?.listening_verified !== true) fail(`${workItemId} lacks listening verification`);

  const start = finite(item.captured_cc?.capture_start_sec, `${workItemId}.capture_start_sec`);
  const storedEnd = finite(item.captured_cc?.stored_capture_end_sec, `${workItemId}.stored_capture_end_sec`);
  const correctedEnd = finite(item.correction?.corrected_capture_end_sec, `${workItemId}.corrected_capture_end_sec`);
  if (start < 0 || storedEnd <= start || correctedEnd <= start) fail(`${workItemId} has invalid boundaries`);
  if (item.correction?.post_vocal_audio_allowed !== false) fail(`${workItemId} must forbid post-vocal audio`);

  for (const rawKey of item.consumer_ii_keys || []) {
    const iiKey = safeKey(rawKey, "consumer_ii_key");
    if (seenConsumers.has(iiKey)) fail(`duplicate consumer II: ${iiKey}`);
    seenConsumers.add(iiKey);
    const product = productFor(iiKey);
    const productDir = product === "HUG" ? "hugs" : product === "TUG" ? "tugs" : "bugs";
    const outDir = path.join("public/ii-delivery", productDir, "comin-true");
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${iiKey}.mp3`);
    execFileSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-ss", start.toFixed(6), "-i", worklist.source_audio_path,
      "-t", (correctedEnd - start).toFixed(6),
      "-map", "0:a:0", "-vn", "-c:a", "libmp3lame", "-q:a", "2", outFile
    ]);
    rendered.push({
      ii_key: iiKey,
      work_item_id: workItemId,
      product_family: product,
      price_usd: priceFor(product),
      authority_source_kind: AUTHORITY_KIND,
      captured_cc_start_sec: start,
      original_stored_cc_end_sec: storedEnd,
      corrected_captured_cc_end_sec: correctedEnd,
      hard_stop_rule: "EXACT_LAST_AUDIBLE_VOCAL_NOTE_END",
      boundary_prosecution_state: STRICT_PASS,
      discovery_search_used: false,
      post_vocal_audio_allowed: false,
      source_audio_sha256: sourceHash,
      audio_path: outFile,
      audio_url: `/${outFile.replace(/^public\\//, "").replaceAll(path.sep, "/")}`,
      sha256: sha256(outFile)
    });
  }
}

const output = {
  schema_version: "GPMX_CAPTURED_CC_LAST_VOCAL_NOTE_END_RENDER_MANIFEST_V1",
  status: "CAPTURED_CC_LAST_VOCAL_NOTE_END_RENDER_COMPLETE",
  authority_source_kind: AUTHORITY_KIND,
  upstream_worklist_path: worklistPath,
  discovery_search_permitted: false,
  hard_stop_rule: "EXACT_LAST_AUDIBLE_VOCAL_NOTE_END",
  item_count: rendered.length,
  items: rendered
};
const outputPath = worklist.output_manifest_path;
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`CAPTURED-CC MATERIALIZER: PASS (${rendered.length} IIs)`);
console.log(`MANIFEST=${outputPath}`);
