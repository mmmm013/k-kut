import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { clampNoTrespassEnd, type ReviewerAction } from "@/lib/admin/kutReviewer";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { validateBicCandidate } from "@/lib/bic/iiControl";
export const dynamic = "force-dynamic";
const VALID_ACTIONS = new Set<ReviewerAction>(["APPROVE", "TRIM", "HOLD", "REJECT"]);
function authorized(request: NextRequest) { const token = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim(); return trustedProtectedPreview() || validAdminToken(token) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value); }
function serviceClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(); const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim(); return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null; }
export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 }); const body = await request.json().catch(() => null) as { itemId?: string; action?: ReviewerAction; correctedEndSec?: number } | null;
  if (!body?.itemId || !body.action || !VALID_ACTIONS.has(body.action)) return NextResponse.json({ error: "invalid_request" }, { status: 400 }); const supabase = serviceClient(); if (!supabase) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });
  const result = await supabase.from("gpm_bic_ii_candidates").select("*").eq("candidate_key", body.itemId).eq("dmaic_state", "CONTROL").eq("reviewer_state", "PENDING_GREGORY_REVIEW").maybeSingle();
  if (result.error) return NextResponse.json({ error: "bic_inventory_read_failed", detail: result.error.message }, { status: 502 }); if (!result.data || !validateBicCandidate(result.data).passed) return NextResponse.json({ error: "candidate_not_admitted" }, { status: 409 });
  const end = clampNoTrespassEnd(Number(result.data.start_sec), Number(result.data.end_sec), body.correctedEndSec ?? Number(result.data.end_sec)); const state = { APPROVE: "OWNER_APPROVED", TRIM: "OWNER_TRIMMED", HOLD: "OWNER_HELD", REJECT: "OWNER_REJECTED" }[body.action];
  const update = await supabase.from("gpm_bic_ii_candidates").update({ reviewer_state: state, ...(body.action === "TRIM" ? { end_sec: end } : {}), updated_at: new Date().toISOString() }).eq("id", result.data.id); if (update.error) return NextResponse.json({ error: "decision_persist_failed", detail: update.error.message }, { status: 502 });
  await supabase.from("gpm_bic_ii_events").insert({ candidate_id: result.data.id, stage: "CONTROL", outcome: state, measures: { action: body.action, original_end_sec: result.data.end_sec, corrected_end_sec: end } });
  return NextResponse.json({ ok: true, itemId: body.itemId, action: body.action, correctedEndSec: end });
}
