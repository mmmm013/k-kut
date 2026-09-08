import fs from "node:fs";
import path from "node:path";
import {
  listStableIiRecords,
  loadApprovedStableSnapshot,
  recordFailClosedOutcome,
  recordProductionConsumptionEmitted,
} from "../lib/4pe/nextRunStablePath.ts";

export type NextRun4peProductionWorkerResult =
  | {
      ok: true;
      emitted_count: number;
      output_file: string;
      records: Array<Record<string, unknown>>;
    }
  | {
      ok: false;
      error: string;
      emitted_count: 0;
    };

function successorMap() {
  const byPredecessor = new Map<string, string>();
  for (const row of listStableIiRecords()) {
    if (row.predecessor_stable_ii_id) {
      byPredecessor.set(row.predecessor_stable_ii_id, row.stable_ii_id);
    }
  }
  return byPredecessor;
}

function replacementHistory(stableIiId: string) {
  const byId = new Map(listStableIiRecords().map((row) => [row.stable_ii_id, row]));
  const history: string[] = [];
  let cursor = byId.get(stableIiId);

  while (cursor?.predecessor_stable_ii_id) {
    history.push(cursor.predecessor_stable_ii_id);
    cursor = byId.get(cursor.predecessor_stable_ii_id);
  }

  return history;
}

export function runNextRun4peProductionWorker(): NextRun4peProductionWorkerResult {
  const stable = loadApprovedStableSnapshot();

  if (!stable.ok) {
    recordFailClosedOutcome("workers/next-run-4pe-production-worker.ts", "stable_path_missing", {
      stable_status: stable.status,
    });
    return {
      ok: false,
      error: "stable_path_missing_fail_closed",
      emitted_count: 0,
    };
  }

  const successors = successorMap();
  const records = stable.active_records.map((row) => ({
    stable_ii_id: row.stable_ii_id,
    selected_hug_id: row.selected_hug_id,
    selected_public_option_id: row.selected_public_option_id,
    product_family: row.product_family,
    inventory_family: row.inventory_family,
    price_cents: row.price_cents,
    approval_evidence_id: row.approval_evidence_id,
    approved_by: row.approved_by,
    approved_at: row.approved_at,
    predecessor_stable_ii_id: row.predecessor_stable_ii_id,
    successor_stable_ii_id: successors.get(row.stable_ii_id) || "",
    replacement_history: replacementHistory(row.stable_ii_id),
  }));

  const outputDir = path.join(process.cwd(), "inbox", "4pe-production-consumption");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputFile = path.join(
    outputDir,
    `${new Date().toISOString().replace(/[:.]/g, "-")}-stable-ii-consumption.json`,
  );
  fs.writeFileSync(outputFile, `${JSON.stringify({ records }, null, 2)}\n`);

  recordProductionConsumptionEmitted({
    emitted_count: records.length,
    output_file: outputFile,
    source: "approved_stable_ii_only",
  });

  return {
    ok: true,
    emitted_count: records.length,
    output_file: outputFile,
    records,
  };
}
