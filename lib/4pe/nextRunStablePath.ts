import fs from "node:fs";
import path from "node:path";

export const NEXT_RUN_4PE_CONTROL_VERSION = "NEXT_RUN_4PE_STABLE_II_V1" as const;

export type NextRunStageRecord = {
  stage_id: string;
  control_version: typeof NEXT_RUN_4PE_CONTROL_VERSION;
  run_key: string;
  delta_key: string;
  source_queue_id: string;
  selected_hug_id: string;
  selected_public_option_id: string;
  selected_hug_title: string;
  product_family: "HUG" | "TUG" | "BUG";
  inventory_family: "KK" | "SK" | "MK";
  price_cents: number;
  staged_payload: Record<string, unknown>;
  created_at: string;
};

export type StableIiRecord = {
  stable_ii_id: string;
  control_version: typeof NEXT_RUN_4PE_CONTROL_VERSION;
  stage_id: string;
  run_key: string;
  delta_key: string;
  source_queue_id: string;
  selected_hug_id: string;
  selected_public_option_id: string;
  selected_hug_title: string;
  product_family: "HUG" | "TUG" | "BUG";
  inventory_family: "KK" | "SK" | "MK";
  price_cents: number;
  approval_evidence_id: string;
  approval_reference_id: string;
  approved_by: string;
  approved_at: string;
  predecessor_stable_ii_id: string;
  created_at: string;
};

export type StableRegistryRow = {
  registry_id: string;
  stable_ii_id: string;
  selected_hug_id: string;
  selected_public_option_id: string;
  registry_state: "ACTIVE" | "SUPERSEDED";
  supersedes_registry_id: string;
  created_at: string;
};

type ControlPlaneEvent = {
  event_id: string;
  control_version: typeof NEXT_RUN_4PE_CONTROL_VERSION;
  event_type:
    | "NEXT_RUN_STAGED"
    | "APPROVAL_LINKED"
    | "PROMOTED_TO_STABLE_II"
    | "REGISTRY_SUPERSEDED"
    | "FAIL_CLOSED_OUTCOME"
    | "PRODUCTION_CONSUMPTION_EMITTED";
  event_payload: Record<string, unknown>;
  created_at: string;
};

function filePaths() {
  const controlDir = path.join(process.cwd(), "data", "4pe-next-run-stable-ii");
  return {
    control_dir: controlDir,
    next_run_stage_ledger: path.join(controlDir, "next-run-stage.jsonl"),
    stable_ii_ledger: path.join(controlDir, "stable-ii.jsonl"),
    stable_registry_ledger: path.join(controlDir, "stable-ii-registry.jsonl"),
    events_ledger: path.join(controlDir, "events.jsonl"),
  };
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function safeText(value: unknown, max = 220) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function safeObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function readJsonLines<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function appendJsonLine(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(value)}\n`);
}

function appendControlEvent(event: Omit<ControlPlaneEvent, "event_id" | "created_at" | "control_version">) {
  appendJsonLine(filePaths().events_ledger, {
    event_id: makeId("evt"),
    control_version: NEXT_RUN_4PE_CONTROL_VERSION,
    event_type: event.event_type,
    event_payload: event.event_payload,
    created_at: new Date().toISOString(),
  } satisfies ControlPlaneEvent);
}

function normalizeFamily(value: unknown): "HUG" | "TUG" | "BUG" {
  const normalized = safeText(value, 10).toUpperCase();
  if (normalized === "TUG") return "TUG";
  if (normalized === "BUG") return "BUG";
  return "HUG";
}

function normalizeInventory(value: unknown): "KK" | "SK" | "MK" {
  const normalized = safeText(value, 10).toUpperCase();
  if (normalized === "SK") return "SK";
  if (normalized === "MK") return "MK";
  return "KK";
}

function activeRegistrySnapshot(rows: StableRegistryRow[]) {
  const byPublicOptionId = new Map<string, StableRegistryRow>();
  const byHugId = new Map<string, StableRegistryRow>();

  for (const row of rows) {
    if (row.registry_state === "ACTIVE") {
      byPublicOptionId.set(row.selected_public_option_id, row);
      byHugId.set(row.selected_hug_id, row);
      continue;
    }

    if (row.registry_state === "SUPERSEDED") {
      const currentByPublic = byPublicOptionId.get(row.selected_public_option_id);
      if (currentByPublic?.registry_id === row.supersedes_registry_id) {
        byPublicOptionId.delete(row.selected_public_option_id);
      }
      const currentByHug = byHugId.get(row.selected_hug_id);
      if (currentByHug?.registry_id === row.supersedes_registry_id) {
        byHugId.delete(row.selected_hug_id);
      }
    }
  }

  return { byPublicOptionId, byHugId };
}

export function listNextRunStageRecords() {
  return readJsonLines<NextRunStageRecord>(filePaths().next_run_stage_ledger);
}

export function listStableIiRecords() {
  return readJsonLines<StableIiRecord>(filePaths().stable_ii_ledger);
}

export function listStableRegistryRows() {
  return readJsonLines<StableRegistryRow>(filePaths().stable_registry_ledger);
}

export function stageNextRunRecord(payload: Record<string, unknown>): NextRunStageRecord {
  const selectedHugId = safeText(payload.selected_hug_id, 160);
  const selectedPublicOptionId = safeText(payload.selected_public_option_id, 200);

  if (!selectedHugId || !selectedPublicOptionId) {
    throw new Error("missing_stage_identity_fields");
  }

  const runKey = safeText(payload.run_key, 200) || `next_run_${Date.now()}`;
  const deltaKey = safeText(payload.delta_key, 200) || `delta_${Date.now()}`;
  const sourceQueueId = safeText(payload.source_queue_id, 200) || "review_queue_unset";
  const rawPrice = typeof payload.price_cents === "number" ? payload.price_cents : Number.NaN;

  const staged: NextRunStageRecord = {
    stage_id: makeId("stage"),
    control_version: NEXT_RUN_4PE_CONTROL_VERSION,
    run_key: runKey,
    delta_key: deltaKey,
    source_queue_id: sourceQueueId,
    selected_hug_id: selectedHugId,
    selected_public_option_id: selectedPublicOptionId,
    selected_hug_title: safeText(payload.selected_hug_title, 220),
    product_family: normalizeFamily(payload.product_family),
    inventory_family: normalizeInventory(payload.inventory_family),
    price_cents: Number.isFinite(rawPrice) ? rawPrice : 799,
    staged_payload: safeObject(payload.metadata),
    created_at: new Date().toISOString(),
  };

  appendJsonLine(filePaths().next_run_stage_ledger, staged);
  appendControlEvent({
    event_type: "NEXT_RUN_STAGED",
    event_payload: {
      stage_id: staged.stage_id,
      run_key: staged.run_key,
      delta_key: staged.delta_key,
      source_queue_id: staged.source_queue_id,
    },
  });

  return staged;
}

export function materializeApprovedStableIi(params: {
  stage_id: string;
  approval_evidence_id: string;
  approval_reference_id?: string;
  approved_by: string;
}) {
  const stageId = safeText(params.stage_id, 200);
  const approvalEvidenceId = safeText(params.approval_evidence_id, 200);
  const approvalReferenceId = safeText(params.approval_reference_id, 200) || approvalEvidenceId;
  const approvedBy = safeText(params.approved_by, 200);

  if (!stageId || !approvalEvidenceId || !approvedBy) {
    throw new Error("missing_approval_materialization_fields");
  }

  const staged = listNextRunStageRecords().find((row) => row.stage_id === stageId);
  if (!staged) throw new Error("next_run_stage_not_found");

  const stableRows = listStableIiRecords();
  const existingStableForStage = stableRows.find((row) => row.stage_id === staged.stage_id);
  if (existingStableForStage) {
    const existingRegistry = listStableRegistryRows().find(
      (row) => row.registry_state === "ACTIVE" && row.stable_ii_id === existingStableForStage.stable_ii_id,
    );
    return {
      stable: existingStableForStage,
      registry: existingRegistry || null,
      superseded: [] as StableRegistryRow[],
      idempotent: true,
    };
  }

  appendControlEvent({
    event_type: "APPROVAL_LINKED",
    event_payload: {
      stage_id: staged.stage_id,
      approval_evidence_id: approvalEvidenceId,
      approval_reference_id: approvalReferenceId,
      approved_by: approvedBy,
    },
  });

  const registryRows = listStableRegistryRows();
  const active = activeRegistrySnapshot(registryRows);
  const currentActive =
    active.byPublicOptionId.get(staged.selected_public_option_id) || active.byHugId.get(staged.selected_hug_id) || null;

  const stable: StableIiRecord = {
    stable_ii_id: makeId("stable"),
    control_version: NEXT_RUN_4PE_CONTROL_VERSION,
    stage_id: staged.stage_id,
    run_key: staged.run_key,
    delta_key: staged.delta_key,
    source_queue_id: staged.source_queue_id,
    selected_hug_id: staged.selected_hug_id,
    selected_public_option_id: staged.selected_public_option_id,
    selected_hug_title: staged.selected_hug_title,
    product_family: staged.product_family,
    inventory_family: staged.inventory_family,
    price_cents: staged.price_cents,
    approval_evidence_id: approvalEvidenceId,
    approval_reference_id: approvalReferenceId,
    approved_by: approvedBy,
    approved_at: new Date().toISOString(),
    predecessor_stable_ii_id: currentActive?.stable_ii_id || "",
    created_at: new Date().toISOString(),
  };
  appendJsonLine(filePaths().stable_ii_ledger, stable);

  const superseded: StableRegistryRow[] = [];
  if (currentActive) {
    const supersededRow: StableRegistryRow = {
      registry_id: makeId("registry"),
      stable_ii_id: currentActive.stable_ii_id,
      selected_hug_id: currentActive.selected_hug_id,
      selected_public_option_id: currentActive.selected_public_option_id,
      registry_state: "SUPERSEDED",
      supersedes_registry_id: currentActive.registry_id,
      created_at: new Date().toISOString(),
    };
    appendJsonLine(filePaths().stable_registry_ledger, supersededRow);
    superseded.push(supersededRow);
    appendControlEvent({
      event_type: "REGISTRY_SUPERSEDED",
      event_payload: {
        superseded_registry_id: currentActive.registry_id,
        replacement_stable_ii_id: stable.stable_ii_id,
      },
    });
  }

  const registry: StableRegistryRow = {
    registry_id: makeId("registry"),
    stable_ii_id: stable.stable_ii_id,
    selected_hug_id: stable.selected_hug_id,
    selected_public_option_id: stable.selected_public_option_id,
    registry_state: "ACTIVE",
    supersedes_registry_id: "",
    created_at: new Date().toISOString(),
  };
  appendJsonLine(filePaths().stable_registry_ledger, registry);

  appendControlEvent({
    event_type: "PROMOTED_TO_STABLE_II",
    event_payload: {
      stage_id: staged.stage_id,
      stable_ii_id: stable.stable_ii_id,
      registry_id: registry.registry_id,
    },
  });

  return { stable, registry, superseded, idempotent: false };
}

export function loadApprovedStableSnapshot() {
  const paths = filePaths();
  if (!fs.existsSync(paths.stable_ii_ledger) || !fs.existsSync(paths.stable_registry_ledger)) {
    return {
      ok: false as const,
      status: "stable_path_missing" as const,
      active_records: [] as StableIiRecord[],
    };
  }

  const stable = listStableIiRecords();
  const registry = listStableRegistryRows();
  const active = activeRegistrySnapshot(registry);
  const byStableId = new Map(stable.map((row) => [row.stable_ii_id, row]));

  const activeRows: StableIiRecord[] = [];
  for (const row of active.byPublicOptionId.values()) {
    const stableRow = byStableId.get(row.stable_ii_id);
    if (!stableRow) continue;
    if (!stableRow.approval_evidence_id || !stableRow.approved_by || !stableRow.approved_at) continue;
    activeRows.push(stableRow);
  }

  return {
    ok: true as const,
    status: "stable_path_ready" as const,
    active_records: activeRows,
  };
}

export function findApprovedStableForFulfillment(selectedPublicOptionId: string, selectedHugId: string) {
  const snapshot = loadApprovedStableSnapshot();
  if (!snapshot.ok) return snapshot;

  const match = snapshot.active_records.find(
    (row) => row.selected_public_option_id === selectedPublicOptionId && row.selected_hug_id === selectedHugId,
  );

  if (!match) {
    return {
      ok: false as const,
      status: "stable_record_not_found" as const,
      active_records: snapshot.active_records,
    };
  }

  return {
    ok: true as const,
    status: "stable_record_found" as const,
    record: match,
  };
}

export function recordFailClosedOutcome(pathway: string, reason: string, details: Record<string, unknown>) {
  appendControlEvent({
    event_type: "FAIL_CLOSED_OUTCOME",
    event_payload: {
      pathway,
      reason,
      details,
    },
  });
}

export function recordProductionConsumptionEmitted(payload: Record<string, unknown>) {
  appendControlEvent({
    event_type: "PRODUCTION_CONSUMPTION_EMITTED",
    event_payload: payload,
  });
}

export function controlPlaneFilePaths() {
  return filePaths();
}
