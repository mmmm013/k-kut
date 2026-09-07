import { NextRequest, NextResponse } from "next/server";
import { fourPeServiceClient, validSha256, workerAuthorized } from "@/lib/fourPe/service";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  if (!workerAuthorized(request.headers.get("authorization"))) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const input = await request.json().catch(() => ({})) as Record<string, unknown>;
  const workerId = String(input.workerId || "").trim();
  if (!workerId) return NextResponse.json({ error: "worker_id_required" }, { status: 400 });
  const supabase = fourPeServiceClient();
  if (!supabase) return NextResponse.json({ error: "service_client_unavailable" }, { status: 503 });
  const result = await supabase.rpc("gpm_4pe_claim_next_item", { p_worker_id: workerId });
  if (result.error) return NextResponse.json({ error: "claim_failed", detail: result.error.message }, { status: 502 });
  return NextResponse.json({ job: result.data?.[0] || null });
}

export async function PATCH(request: NextRequest) {
  if (!workerAuthorized(request.headers.get("authorization"))) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const input = await request.json().catch(() => null) as Record<string, any> | null;
  const allowedStates = ["AWAITING_STEM_SEPARATION","AWAITING_STRUCTURE_ANALYSIS","AWAITING_LYRIC_PROSECUTION","AWAITING_KK_RENDER","AWAITING_TPR","CATALOGED","ARCHIVED","HOLD","REJECTED"];
  if (!input?.itemId || !allowedStates.includes(input.nextState) || !input.completedStep) return NextResponse.json({ error: "valid_completion_contract_required" }, { status: 400 });
  const artifacts = Array.isArray(input.artifacts) ? input.artifacts : [];
  if (artifacts.some((artifact: any) => !artifact?.artifact_role || !validSha256(artifact?.sha256))) return NextResponse.json({ error: "artifact_hash_required" }, { status: 400 });
  const supabase = fourPeServiceClient();
  if (!supabase) return NextResponse.json({ error: "service_client_unavailable" }, { status: 503 });
  const item = await supabase.rpc("gpm_4pe_complete_step", {
    p_item_id: input.itemId,
    p_completed_step: input.completedStep,
    p_next_state: input.nextState,
    p_checkpoint: input.checkpoint && typeof input.checkpoint === "object" ? input.checkpoint : {},
    p_error: input.error || null,
    p_artifacts: artifacts,
  });
  if (item.error) return NextResponse.json({ error: "completion_failed", detail: item.error.message }, { status: 409 });
  return NextResponse.json({ ok: true, item: item.data });
}
