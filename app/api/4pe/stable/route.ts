import { NextRequest, NextResponse } from "next/server";
import {
  controlPlaneFilePaths,
  listStableIiRecords,
  loadApprovedStableSnapshot,
  materializeApprovedStableIi,
} from "@/lib/4pe/nextRunStablePath";

export const runtime = "nodejs";

function safeObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function safeText(value: unknown, max = 200) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = safeObject(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    const materialized = materializeApprovedStableIi({
      stage_id: safeText(body.stage_id),
      approval_evidence_id: safeText(body.approval_evidence_id),
      approval_reference_id: safeText(body.approval_reference_id),
      approved_by: safeText(body.approved_by) || "unknown_approver",
    });

    return NextResponse.json({
      ok: true,
      status: materialized.idempotent ? "stable_materialization_noop" : "stable_materialized",
      stable_ii_id: materialized.stable.stable_ii_id,
      stage_id: materialized.stable.stage_id,
      registry_id: materialized.registry?.registry_id || "",
      predecessor_stable_ii_id: materialized.stable.predecessor_stable_ii_id,
      superseded_registry_rows: materialized.superseded.map((row) => row.registry_id),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "stable_materialization_failed" },
      { status: 409 },
    );
  }
}

export async function GET() {
  const snapshot = loadApprovedStableSnapshot();
  const paths = controlPlaneFilePaths();
  const stableRows = listStableIiRecords();

  return NextResponse.json({
    ok: true,
    route: "/api/4pe/stable",
    status: snapshot.status,
    stable_row_count: stableRows.length,
    active_stable_count: snapshot.active_records.length,
    stable_ii_ledger: paths.stable_ii_ledger,
    registry_ledger: paths.stable_registry_ledger,
    rule: "Materializes approved Stable II rows and append-only registry rows only.",
  });
}
