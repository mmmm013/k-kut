import assert from "node:assert/strict";
import test from "node:test";

import {
  clampNoTrespassEnd,
  mapDecisionToPatch,
  nextQueueIndexAfterDecision,
  normalizeGovernedQueueRows,
} from "../../lib/admin/kutReviewer.ts";

test("normalizes governed queue rows and keeps pending entries", () => {
  const rows = [
    {
      id: "qc-1",
      kut_id: "kut-1",
      title: "Waiting for Light",
      capture_start_sec: 12.03,
      stored_capture_end_sec: 37.88,
      corrected_capture_end_sec: 50,
      source_audio_bucket: "ii-delivery",
      source_audio_path: "current-ii/romance/kut-1/audio.mp3",
      review_state: "PENDING_LAST_VOCAL_NOTE_END_REVIEW",
      boundary_prosecution_state: "HOLD",
      intent_lane: "romance",
      product_family: "HUG",
      updated_at: "2026-09-01T00:00:00.000Z",
    },
    {
      id: "qc-2",
      kut_id: "kut-2",
      title: "Already approved",
      capture_start_sec: 10,
      stored_capture_end_sec: 20,
      corrected_capture_end_sec: 20,
      source_audio_path: "current-ii/romance/kut-2/audio.mp3",
      review_state: "LAST_VOCAL_NOTE_END_CONFIRMED",
      boundary_prosecution_state: "STRICT_LAST_VOCAL_NOTE_END_PASS",
    },
  ];

  const queue = normalizeGovernedQueueRows(rows);
  assert.equal(queue.length, 1);
  assert.equal(queue[0].id, "qc-1");
  assert.equal(queue[0].correctedEndSec, 37.88);
  assert.equal(queue[0].sourceAudioBucket, "ii-delivery");
});

test("clamps endpoint so END cannot trespass", () => {
  assert.equal(clampNoTrespassEnd(10, 20, 25), 20);
  assert.equal(clampNoTrespassEnd(10, 20, 9), 10);
  assert.equal(clampNoTrespassEnd(10, 20, 18.1234), 18.123);
});

test("maps review actions to persisted decision patch", () => {
  const approved = mapDecisionToPatch("APPROVE", 33.5);
  assert.equal(approved.review_state, "LAST_VOCAL_NOTE_END_CONFIRMED");
  assert.equal(approved.boundary_prosecution_state, "STRICT_LAST_VOCAL_NOTE_END_PASS");
  assert.equal(approved.post_vocal_audio_allowed, false);

  const hold = mapDecisionToPatch("HOLD", 33.5);
  assert.equal(hold.review_state, "HOLD");
  assert.equal(hold.listening_verified, false);

  const rejected = mapDecisionToPatch("REJECT", 33.5);
  assert.equal(rejected.review_state, "REJECTED_LAST_VOCAL_NOTE_END");
});

test("advances queue index after decision", () => {
  assert.equal(nextQueueIndexAfterDecision(0, 5), 0);
  assert.equal(nextQueueIndexAfterDecision(3, 5), 3);
  assert.equal(nextQueueIndexAfterDecision(0, 1), 0);
});
