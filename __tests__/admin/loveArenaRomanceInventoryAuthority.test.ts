import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createHash } from "node:crypto";
import { buildLoveArenaRomanceInventoryFromAuthority } from "../../scripts/lib/love-arena-romance-inventory.mjs";

function sha256(filePath: string) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function makeLtPixPool() {
  return Array.from({ length: 50 }, (_, index) => {
    const n = String(index + 1).padStart(4, "0");
    return {
      lt_pix_id: `LT-PIX-${n}`,
      source_audio_sha256: "a".repeat(64),
      canonical_lyrics_complete: true,
    };
  });
}

function makeLineage(ltPixId: string) {
  return {
    lt_pix_id: ltPixId,
    source_audio_sha256: "a".repeat(64),
    lyric_event_id: "lyr-1",
    musical_event_id: "mus-1",
    structural_event_id: "str-1",
  };
}

test("requires hash verification against governed audio object bytes", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "love-arena-"));
  const audioPath = path.join(tmp, "governed-audio.mp3");
  fs.writeFileSync(audioPath, "governed-audio-object");
  const validSha = sha256(audioPath);

  const authority = {
    bundle_id: "bundle-1",
    review_gate_id: "GPMX_LT_PIX_BLK_REVIEW_GATE_V1",
    generated_at: "2026-09-08T00:00:00.000Z",
    lt_pix_pool: makeLtPixPool(),
    kk_records: [
      {
        kk_id: "kk-1",
        lt_pix_id: "LT-PIX-0001",
        delivery_audio_sha256: validSha,
        delivery_audio_governed_local_path: audioPath,
        delivery_integrity: {
          front_padding_required: true,
          back_padding_required: true,
          twinkle_required: true,
        },
        status: "TRIAGE",
        source_lineage: makeLineage("LT-PIX-0001"),
      },
    ],
    mk_records: [
      {
        mk_id: "mk-1",
        lt_pix_id: "LT-PIX-0001",
        capture_type: "LNDUO_CC",
        capture_duration_seconds: 8,
        delivery_tier: "internal",
        status: "TRIAGE",
        source_lineage: makeLineage("LT-PIX-0001"),
      },
    ],
    sk_records: [
      {
        sk_id: "sk-1",
        lt_pix_id: "LT-PIX-0001",
        status: "TRIAGE",
        source_lineage: makeLineage("LT-PIX-0001"),
      },
    ],
  };

  const inventory = buildLoveArenaRomanceInventoryFromAuthority({ authority });
  assert.equal(inventory.kkManifest.count, 1);
  assert.equal(inventory.totals.delivery_integrity_status, "PASS");

  authority.kk_records[0].delivery_audio_sha256 = "b".repeat(64);
  assert.throws(() => buildLoveArenaRomanceInventoryFromAuthority({ authority }));
});

test("rejects synthetic window hints and LT-PIX lineage mismatches", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "love-arena-"));
  const audioPath = path.join(tmp, "governed-audio.mp3");
  fs.writeFileSync(audioPath, "governed-audio-object");
  const validSha = sha256(audioPath);

  const authority = {
    bundle_id: "bundle-2",
    review_gate_id: "GPMX_LT_PIX_BLK_REVIEW_GATE_V1",
    generated_at: "2026-09-08T00:00:00.000Z",
    lt_pix_pool: makeLtPixPool(),
    kk_records: [
      {
        kk_id: "kk-1",
        lt_pix_id: "LT-PIX-0001",
        boundary_hint_start_seconds: 12,
        delivery_audio_sha256: validSha,
        delivery_audio_governed_local_path: audioPath,
        delivery_integrity: {
          front_padding_required: true,
          back_padding_required: true,
          twinkle_required: true,
        },
        status: "TRIAGE",
        source_lineage: makeLineage("LT-PIX-0001"),
      },
    ],
    mk_records: [
      {
        mk_id: "mk-1",
        lt_pix_id: "LT-PIX-0001",
        capture_type: "LNDUO_CC",
        capture_duration_seconds: 8,
        delivery_tier: "internal",
        status: "TRIAGE",
        source_lineage: makeLineage("LT-PIX-0002"),
      },
    ],
    sk_records: [],
  };

  assert.throws(() => buildLoveArenaRomanceInventoryFromAuthority({ authority }));
});
