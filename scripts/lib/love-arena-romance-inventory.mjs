import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const CC_TYPES = new Set(["LNDUO_CC", "LNTRIO_CC", "RMST_CC"]);
const VALID_STATUS = new Set(["TRIAGE", "STAGE"]);

function isSha256(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function fileSha256(filePath) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function fail(message) {
  throw new Error(`LOVE_ARENA_AUTHORITY_FAIL: ${message}`);
}

function requireLineage(record, kind) {
  const lineage = record?.source_lineage;
  if (!lineage || typeof lineage !== "object") fail(`${kind} ${record?.id || "unknown"} missing source_lineage`);
  for (const key of ["lt_pix_id", "source_audio_sha256", "lyric_event_id", "musical_event_id", "structural_event_id"]) {
    if (!String(lineage[key] || "").trim()) fail(`${kind} ${record?.id || "unknown"} missing source_lineage.${key}`);
  }
}

function assertLineageLtPixMatch(record, kind) {
  if (record?.source_lineage?.lt_pix_id !== record?.lt_pix_id) {
    fail(`${kind} ${record?.id || "unknown"} source_lineage.lt_pix_id must match lt_pix_id`);
  }
}

function forbidGeneratedWindowHints(record, kind) {
  for (const key of Object.keys(record || {})) {
    if (/_hint/i.test(key)) fail(`${kind} ${record?.id || "unknown"} uses forbidden synthetic field ${key}`);
  }
}

export function buildLoveArenaRomanceInventoryFromAuthority({
  authority,
  generatedAt = new Date().toISOString(),
}) {
  if (!authority || typeof authority !== "object") fail("authority bundle missing");
  if (authority.review_gate_id !== "GPMX_LT_PIX_BLK_REVIEW_GATE_V1") fail("review_gate_id must be GPMX_LT_PIX_BLK_REVIEW_GATE_V1");

  const ltPixPool = Array.isArray(authority.lt_pix_pool) ? authority.lt_pix_pool : [];
  if (ltPixPool.length < 50) fail(`expected 50+ LT-PIX rows, found ${ltPixPool.length}`);

  const ltPixIndex = new Map();
  for (const row of ltPixPool) {
    if (!String(row.lt_pix_id || "").trim()) fail("lt_pix_pool row missing lt_pix_id");
    if (!isSha256(row.source_audio_sha256)) fail(`lt_pix_pool ${row.lt_pix_id} missing valid source_audio_sha256`);
    if (row.canonical_lyrics_complete !== true) fail(`lt_pix_pool ${row.lt_pix_id} must lock canonical_lyrics_complete=true`);
    ltPixIndex.set(row.lt_pix_id, row);
  }

  const kkRecords = Array.isArray(authority.kk_records) ? authority.kk_records : [];
  const mkRecords = Array.isArray(authority.mk_records) ? authority.mk_records : [];
  const skRecords = Array.isArray(authority.sk_records) ? authority.sk_records : [];

  for (const kk of kkRecords) {
    kk.id = kk.kk_id;
    forbidGeneratedWindowHints(kk, "KK");
    requireLineage(kk, "KK");
    assertLineageLtPixMatch(kk, "KK");
    if (!VALID_STATUS.has(kk.status)) fail(`KK ${kk.kk_id} has invalid status ${kk.status}`);
    if (!ltPixIndex.has(kk.lt_pix_id)) fail(`KK ${kk.kk_id} references unknown LT-PIX ${kk.lt_pix_id}`);
    if (!isSha256(kk.delivery_audio_sha256)) fail(`KK ${kk.kk_id} missing valid delivery_audio_sha256`);
    if (kk.delivery_integrity?.front_padding_required !== true) fail(`KK ${kk.kk_id} missing front padding proof`);
    if (kk.delivery_integrity?.back_padding_required !== true) fail(`KK ${kk.kk_id} missing back padding proof`);
    if (kk.delivery_integrity?.twinkle_required !== true) fail(`KK ${kk.kk_id} missing twinkle proof`);

    const governedPath = String(kk.delivery_audio_governed_local_path || "").trim();
    if (!governedPath) fail(`KK ${kk.kk_id} missing delivery_audio_governed_local_path for hash verification`);
    const absolute = path.isAbsolute(governedPath) ? governedPath : path.resolve(governedPath);
    if (!fs.existsSync(absolute)) fail(`KK ${kk.kk_id} governed audio not found at ${absolute}`);
    const measuredHash = fileSha256(absolute);
    if (measuredHash !== kk.delivery_audio_sha256) fail(`KK ${kk.kk_id} hash mismatch for governed audio object`);
  }

  for (const mk of mkRecords) {
    mk.id = mk.mk_id;
    forbidGeneratedWindowHints(mk, "mK");
    requireLineage(mk, "mK");
    assertLineageLtPixMatch(mk, "mK");
    if (!VALID_STATUS.has(mk.status)) fail(`mK ${mk.mk_id} has invalid status ${mk.status}`);
    if (!ltPixIndex.has(mk.lt_pix_id)) fail(`mK ${mk.mk_id} references unknown LT-PIX ${mk.lt_pix_id}`);
    if (!CC_TYPES.has(mk.capture_type)) fail(`mK ${mk.mk_id} capture_type must be LNDUO_CC/LNTRIO_CC/RMST_CC`);
    if (mk.delivery_tier !== "internal") fail(`mK ${mk.mk_id} must remain internal tier`);
    if (typeof mk.capture_duration_seconds !== "number" || mk.capture_duration_seconds < 8) {
      fail(`mK ${mk.mk_id} must satisfy authorized 8+ second minimum`);
    }
  }

  for (const sk of skRecords) {
    sk.id = sk.sk_id;
    forbidGeneratedWindowHints(sk, "sK");
    requireLineage(sk, "sK");
    assertLineageLtPixMatch(sk, "sK");
    if (!VALID_STATUS.has(sk.status)) fail(`sK ${sk.sk_id} has invalid status ${sk.status}`);
    if (!ltPixIndex.has(sk.lt_pix_id)) fail(`sK ${sk.sk_id} references unknown LT-PIX ${sk.lt_pix_id}`);
  }

  const deliveryIntegrity = {
    kk_all_padding_plus_twinkle: true,
    kk_sha256_verified_against_governed_audio: true,
  };

  const authorityMeta = {
    review_gate: authority.review_gate_id,
    review_gate_status: "LOCKED",
    source_bundle_id: String(authority.bundle_id || ""),
    source_bundle_generated_at: String(authority.generated_at || ""),
    short_duration_exception_registry: "LOVE_ARENA_MK_MIN_8_SECONDS_AUTHORIZED",
  };

  const kkManifest = {
    manifest: "romance-kk-batch-v001",
    generated_at: generatedAt,
    pool_lt_pix_count: ltPixPool.length,
    count: kkRecords.length,
    authority: authorityMeta,
    delivery_integrity: deliveryIntegrity,
    records: kkRecords,
  };

  const mkManifest = {
    manifest: "romance-mk-batch-v001",
    generated_at: generatedAt,
    pool_lt_pix_count: ltPixPool.length,
    minimum_duration_seconds: 8,
    count: mkRecords.length,
    authority: authorityMeta,
    records: mkRecords,
  };

  const skManifest = {
    manifest: "romance-sk-reserved-v001",
    generated_at: generatedAt,
    pool_lt_pix_count: ltPixPool.length,
    count: skRecords.length,
    authority: authorityMeta,
    records: skRecords,
  };

  const totals = {
    kk_count: kkRecords.length,
    mk_count: mkRecords.length,
    sk_count: skRecords.length,
    delivery_integrity_status: "PASS",
  };

  return { ltPixPool, kkManifest, mkManifest, skManifest, totals };
}

export function writeLoveArenaRomanceInventory({ repoRoot, inventory }) {
  const outDir = path.join(repoRoot, "manifests", "kkr");
  fs.mkdirSync(outDir, { recursive: true });

  const kkPath = path.join(outDir, "romance-kk-batch-v001.json");
  const mkPath = path.join(outDir, "romance-mk-batch-v001.json");
  const skPath = path.join(outDir, "romance-sk-reserved-v001.json");
  const totalsPath = path.join(outDir, "romance-kut-generation-summary-v001.json");

  fs.writeFileSync(kkPath, `${JSON.stringify(inventory.kkManifest, null, 2)}\n`);
  fs.writeFileSync(mkPath, `${JSON.stringify(inventory.mkManifest, null, 2)}\n`);
  fs.writeFileSync(skPath, `${JSON.stringify(inventory.skManifest, null, 2)}\n`);
  fs.writeFileSync(
    totalsPath,
    `${JSON.stringify(
      {
        generated_at: inventory.kkManifest.generated_at,
        totals: inventory.totals,
        output_files: [kkPath, mkPath, skPath],
      },
      null,
      2,
    )}\n`,
  );

  return { kkPath, mkPath, skPath, totalsPath };
}
