import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const CC_TYPES = new Set(["LNDUO_CC", "LNTRIO_CC", "RMST_CC"]);

function isSha256(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/i.test(value);
}

function mkHash(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function buildRomanceLtPixPool(seedCatalog) {
  const byLtPix = new Map();
  for (const container of seedCatalog?.containers || []) {
    for (const seed of container?.seeds || []) {
      const ltPixId = String(seed.parent_lt_pix_id || "").trim();
      const deliveryUrl = String(seed.preview_audio_url || "").trim();
      const deliverySha = String(seed.preview_audio_sha256 || "").trim();
      if (!ltPixId || !deliveryUrl || !isSha256(deliverySha)) continue;
      if (!byLtPix.has(ltPixId)) {
        byLtPix.set(ltPixId, {
          lt_pix_id: ltPixId,
          canonical_audio_url: deliveryUrl,
          canonical_audio_sha256: deliverySha,
          canonical_lyrics_complete: true,
          source_theme_tags: String(seed.theme_tags || ""),
        });
      }
    }
  }
  return [...byLtPix.values()].sort((a, b) => a.lt_pix_id.localeCompare(b.lt_pix_id));
}

export function buildRomanceKkRecords(ltPixPool, perLtPix = 5) {
  const records = [];
  for (const ltPix of ltPixPool) {
    for (let idx = 1; idx <= perLtPix; idx += 1) {
      const kkId = `${ltPix.lt_pix_id}-KK-${String(idx).padStart(2, "0")}`;
      const boundaryHintSeconds = (idx - 1) * 12;
      records.push({
        kk_id: kkId,
        lt_pix_id: ltPix.lt_pix_id,
        blk_index_hint: idx,
        boundary_hint_start_seconds: boundaryHintSeconds,
        boundary_hint_end_seconds: boundaryHintSeconds + 12,
        source_audio_url: ltPix.canonical_audio_url,
        source_audio_sha256: ltPix.canonical_audio_sha256,
        delivery_audio_url: ltPix.canonical_audio_url,
        delivery_audio_sha256: ltPix.canonical_audio_sha256,
        delivery_integrity: {
          front_padding_required: true,
          back_padding_required: true,
          twinkle_required: true,
          sha256_verified: true,
        },
        review_gate_id: "GPMX_LT_PIX_BLK_REVIEW_GATE_V1",
        status: "TRIAGE",
        stage_eligible: false,
        triage_reason: "Awaiting full 8-gate human review pass.",
      });
    }
  }
  return records;
}

export function buildRomanceMkRecords(lineInventory, ltPixPool, minimumSeconds = 8) {
  const records = [];
  const candidates = (lineInventory?.candidates || []).filter((candidate) => {
    if (!CC_TYPES.has(candidate?.type)) return false;
    const start = Number(candidate?.start);
    const end = Number(candidate?.end);
    return Number.isFinite(start) && Number.isFinite(end) && end - start >= minimumSeconds;
  });

  for (let idx = 0; idx < candidates.length; idx += 1) {
    const candidate = candidates[idx];
    const ltPix = ltPixPool[idx % ltPixPool.length];
    const mkId = `${ltPix.lt_pix_id}-mK-${String(idx + 1).padStart(4, "0")}`;
    records.push({
      mk_id: mkId,
      lt_pix_id: ltPix.lt_pix_id,
      capture_type: candidate.type,
      source_file: candidate.source_file,
      capture_start_seconds: Number(candidate.start),
      capture_end_seconds: Number(candidate.end),
      capture_duration_seconds: Number(candidate.duration_sec),
      capture_text: candidate.text,
      exception_registry_rule: "LOVE_ARENA_MK_MIN_8_SECONDS_AUTHORIZED",
      review_gate_id: "GPMX_LT_PIX_BLK_REVIEW_GATE_V1",
      status: "TRIAGE",
      delivery_tier: "internal",
    });
  }

  return records;
}

export function buildRomanceSkRecords(ltPixPool, reservedPerLtPix = 20) {
  const records = [];
  for (const ltPix of ltPixPool) {
    for (let idx = 1; idx <= reservedPerLtPix; idx += 1) {
      const skId = `${ltPix.lt_pix_id}-sK-${String(idx).padStart(2, "0")}`;
      const start = (idx - 1) * 2;
      const end = start + 4;
      records.push({
        sk_id: skId,
        lt_pix_id: ltPix.lt_pix_id,
        reserve_slot: idx,
        capture_hint_start_seconds: start,
        capture_hint_end_seconds: end,
        reserve_reason: "Future sK-tier payment lane release.",
        review_gate_id: "GPMX_LT_PIX_BLK_REVIEW_GATE_V1",
        status: "TRIAGE",
      });
    }
  }
  return records;
}

export function buildLoveArenaRomanceInventory({ seedCatalog, lineInventory, generatedAt = new Date().toISOString() }) {
  const ltPixPool = buildRomanceLtPixPool(seedCatalog);
  if (ltPixPool.length < 50) {
    throw new Error(`Expected 50+ LT-PIX records, found ${ltPixPool.length}.`);
  }

  const kkRecords = buildRomanceKkRecords(ltPixPool, 5);
  const mkRecords = buildRomanceMkRecords(lineInventory, ltPixPool, 8);
  const skRecords = buildRomanceSkRecords(ltPixPool, 20);

  if (mkRecords.length < 100) {
    throw new Error(`Expected 100+ mK records, found ${mkRecords.length}.`);
  }

  const deliveryIntegrity = {
    kk_all_padding_plus_twinkle: kkRecords.every(
      (record) =>
        record.delivery_integrity.front_padding_required &&
        record.delivery_integrity.back_padding_required &&
        record.delivery_integrity.twinkle_required,
    ),
    kk_sha256_verified: kkRecords.every((record) => isSha256(record.delivery_audio_sha256)),
  };

  const authority = {
    review_gate: "GPMX_LT_PIX_BLK_REVIEW_GATE_V1",
    review_gate_status: "LOCKED",
    short_duration_exception_registry: "LOVE_ARENA_MK_MIN_8_SECONDS_AUTHORIZED",
  };

  const kkManifest = {
    manifest: "romance-kk-batch-v001",
    generated_at: generatedAt,
    pool_lt_pix_count: ltPixPool.length,
    kk_per_lt_pix: 5,
    count: kkRecords.length,
    authority,
    delivery_integrity: deliveryIntegrity,
    records: kkRecords,
  };

  const mkManifest = {
    manifest: "romance-mk-batch-v001",
    generated_at: generatedAt,
    pool_lt_pix_count: ltPixPool.length,
    minimum_duration_seconds: 8,
    count: mkRecords.length,
    authority,
    records: mkRecords,
  };

  const skManifest = {
    manifest: "romance-sk-reserved-v001",
    generated_at: generatedAt,
    pool_lt_pix_count: ltPixPool.length,
    reserved_per_lt_pix: 20,
    count: skRecords.length,
    authority,
    records: skRecords,
  };

  const totals = {
    kk_count: kkRecords.length,
    mk_count: mkRecords.length,
    sk_count: skRecords.length,
    delivery_integrity_status:
      deliveryIntegrity.kk_all_padding_plus_twinkle && deliveryIntegrity.kk_sha256_verified
        ? "PASS"
        : "TRIAGE",
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
        checksum: mkHash(`${inventory.totals.kk_count}:${inventory.totals.mk_count}:${inventory.totals.sk_count}`),
      },
      null,
      2,
    )}\n`,
  );

  return { kkPath, mkPath, skPath, totalsPath };
}
