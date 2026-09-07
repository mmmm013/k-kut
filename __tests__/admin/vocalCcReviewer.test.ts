import assert from "node:assert/strict";
import test from "node:test";
import { validateVocalCcForTpr, vocalCcRender } from "../../lib/admin/vocalCcReviewer.ts";

const hash = "a".repeat(64);
const candidate = {
  source_relation: "VOCAL_LT_PIX_CC",
  evidence_state: "KKR_MACHINE_PROSECUTED_PENDING_OWNER_STRICT_END",
  start_sec: 0,
  end_sec: 15.62,
  method_notes: {
    full_lyric_read: true,
    legacy_fixed_window_used: false,
    separation_operation: "HTDEMUCS_TWO_STEMS_VOCALS_FROM_INSTRUMENTAL",
    source_audio_sha256: hash,
    derived_vocal_evidence_sha256: hash,
    derived_in_pix_sha256: hash,
    rendered_cc_sha256: hash,
    rendered_cc_bucket: "tracks",
    rendered_cc_path: "kkr/4pe/song/cc.wav",
  },
};

test("admits a verified vocal-derived CC before II type assignment", () => {
  assert.deepEqual(validateVocalCcForTpr(candidate), { passed: true, reasons: [] });
  assert.deepEqual(vocalCcRender(candidate), { bucket: "tracks", path: "kkr/4pe/song/cc.wav" });
});

test("rejects legacy fixed-duration slices", () => {
  assert.equal(validateVocalCcForTpr({ ...candidate, method_notes: { ...candidate.method_notes, legacy_fixed_window_used: true } }).passed, false);
});
