import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  findApprovedStableForFulfillment,
  loadApprovedStableSnapshot,
  materializeApprovedStableIi,
  stageNextRunRecord,
} from "../../lib/4pe/nextRunStablePath.ts";

function withTempCwd(fn: () => void) {
  const previous = process.cwd();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "k-kut-4pe-"));
  process.chdir(tempDir);
  try {
    fn();
  } finally {
    process.chdir(previous);
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

test("fails closed when stable path is missing", () => {
  withTempCwd(() => {
    const lookup = findApprovedStableForFulfillment("public_missing", "hug_missing");
    assert.equal(lookup.ok, false);
    assert.equal(lookup.status, "stable_path_missing");
  });
});

test("materializes approved stage into stable row and active registry", () => {
  withTempCwd(() => {
    const staged = stageNextRunRecord({
      run_key: "run_1",
      delta_key: "delta_1",
      source_queue_id: "queue_1",
      selected_hug_id: "hug_1",
      selected_public_option_id: "public_1",
      selected_hug_title: "Title 1",
      product_family: "HUG",
      inventory_family: "KK",
      price_cents: 799,
    });

    const promoted = materializeApprovedStableIi({
      stage_id: staged.stage_id,
      approval_evidence_id: "approval_1",
      approval_reference_id: "review_1",
      approved_by: "reviewer_1",
    });

    assert.equal(promoted.idempotent, false);
    assert.equal(promoted.stable.stage_id, staged.stage_id);

    const lookup = findApprovedStableForFulfillment("public_1", "hug_1");
    assert.equal(lookup.ok, true);
    if (!lookup.ok) return;
    assert.equal(lookup.record.stable_ii_id, promoted.stable.stable_ii_id);

    const snapshot = loadApprovedStableSnapshot();
    assert.equal(snapshot.ok, true);
    assert.equal(snapshot.active_records.length, 1);
  });
});

test("preserves predecessor history when a stable row is superseded", () => {
  withTempCwd(() => {
    const stageOne = stageNextRunRecord({
      run_key: "run_hist",
      delta_key: "delta_1",
      source_queue_id: "queue_hist",
      selected_hug_id: "hug_hist",
      selected_public_option_id: "public_hist",
      selected_hug_title: "First",
      product_family: "HUG",
      inventory_family: "KK",
      price_cents: 799,
    });

    const firstPromotion = materializeApprovedStableIi({
      stage_id: stageOne.stage_id,
      approval_evidence_id: "approval_hist_1",
      approval_reference_id: "review_hist_1",
      approved_by: "reviewer_hist",
    });

    const stageTwo = stageNextRunRecord({
      run_key: "run_hist",
      delta_key: "delta_2",
      source_queue_id: "queue_hist",
      selected_hug_id: "hug_hist",
      selected_public_option_id: "public_hist",
      selected_hug_title: "Second",
      product_family: "HUG",
      inventory_family: "KK",
      price_cents: 799,
    });

    const secondPromotion = materializeApprovedStableIi({
      stage_id: stageTwo.stage_id,
      approval_evidence_id: "approval_hist_2",
      approval_reference_id: "review_hist_2",
      approved_by: "reviewer_hist",
    });

    assert.equal(secondPromotion.stable.predecessor_stable_ii_id, firstPromotion.stable.stable_ii_id);

    const lookup = findApprovedStableForFulfillment("public_hist", "hug_hist");
    assert.equal(lookup.ok, true);
    if (!lookup.ok) return;
    assert.equal(lookup.record.stable_ii_id, secondPromotion.stable.stable_ii_id);
  });
});
