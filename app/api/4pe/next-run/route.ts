import { NextRequest, NextResponse } from "next/server";
import { listNextRunStageRecords, stageNextRunRecord } from "@/lib/4pe/nextRunStablePath";

export const runtime = "nodejs";

function safeObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = safeObject(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    const staged = stageNextRunRecord(body);
    return NextResponse.json({
      ok: true,
      stage_id: staged.stage_id,
      run_key: staged.run_key,
      delta_key: staged.delta_key,
      status: "next_run_staged_only",
      control_version: staged.control_version,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "next_run_stage_failed" },
      { status: 409 },
    );
  }
}

export async function GET() {
  const staged = listNextRunStageRecords();

  return NextResponse.json({
    ok: true,
    route: "/api/4pe/next-run",
    status: "staging_only",
    staged_count: staged.length,
    rule: "Stages Next Run records only. No direct promotion. No inventory mutation.",
  });
}
