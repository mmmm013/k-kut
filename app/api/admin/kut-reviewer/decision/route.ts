import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { clampNoTrespassEnd, type ReviewerAction } from "@/lib/admin/kutReviewer";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";
const VALID_ACTIONS = new Set<ReviewerAction>(["APPROVE", "TRIM", "HOLD", "REJECT"]);
function authorized(request: NextRequest) { const supplied = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim(); return trustedProtectedPreview() || validAdminToken(supplied) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value); }
function serviceClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(); const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim(); return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null; }
type RequestBody = { itemId?: string; action?: ReviewerAction; correctedEndSec?: number };

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const body = await request.json().catch(() => null) as RequestBody | null;
  if (!body?.itemId || !body.action || !VALID_ACTIONS.has(body.action)) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const supabase = serviceClient(); if (!supabase) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });
  const query = await supabase.from("gpmx_admin_kut_reviewer_queue_v1").select("ii_key,card_key,start_sec,end_sec,source_relation,evidence_state").eq("ii_key", body.itemId).in("review_state", ["READY_FOR_REVIEW", "NEEDS_GREGORY_REVIEW"]).limit(1).maybeSingle();
  if (query.error || !query.data) return NextResponse.json({ error: "item_not_found", detail: query.error?.message }, { status: 404 });
  const item = query.data;
  const correctedEndSec = clampNoTrespassEnd(Number(item.start_sec), Number(item.end_sec), body.correctedEndSec ?? Number(item.end_sec));
  const insert = await supabase.from("gpmx_admin_kut_review_decision_v1").insert({ ii_key: item.ii_key, card_key: item.card_key, action: body.action, original_start_sec: item.start_sec, original_end_sec: item.end_sec, corrected_end_sec: correctedEndSec, reviewer_key: "GREGORY", source_relation: item.source_relation, evidence_state: item.evidence_state }).select("id").single();
  if (insert.error) return NextResponse.json({ error: "decision_persist_failed", detail: insert.error.message }, { status: 502 });
  return NextResponse.json({ ok: true, decisionId: insert.data.id, itemId: item.ii_key, action: body.action, correctedEndSec });
}
