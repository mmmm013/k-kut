import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeGovernedQueueRows } from "@/lib/admin/kutReviewer";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const supplied = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim();
  return trustedProtectedPreview() || validAdminToken(supplied) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

function toReviewerRow(row: any) {
  return {
    id: row.ii_key, kut_id: row.ii_key, display_title: row.authority_title, display_text: row.display_text,
    capture_start_sec: row.start_sec, stored_capture_end_sec: row.end_sec, corrected_capture_end_sec: row.end_sec,
    review_state: row.review_state || "PENDING_GREGORY_REVIEW", boundary_prosecution_state: row.evidence_state || "RECONCILED_EXISTING_EVIDENCE",
    source_audio_path: row.audio_path, storage_bucket: "tracks", product_family: row.container_type || row.ii_type,
    intent_lane: row.form_key || row.ii_type, public_route: null, updated_at: row.updated_at, queue_order: row.playable_rank,
  };
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });
  const { data, error, count } = await supabase.from("gpmx_admin_kut_reviewer_queue_v1").select("*", { count: "exact" }).order("playable_rank", { ascending: true }).order("authority_title", { ascending: true }).order("ii_type", { ascending: true }).order("start_sec", { ascending: true, nullsFirst: false }).limit(500);
  if (error) return NextResponse.json({ error: "universal_queue_read_failed", detail: error.message }, { status: 502 });
  const queue = normalizeGovernedQueueRows((data || []).map(toReviewerRow));
  const { count: playableTotal } = await supabase.from("gpmx_admin_kut_reviewer_queue_v1").select("ii_key", { count: "exact", head: true }).eq("playable_rank", 0);
  const { count: cardTotal } = await supabase.from("gpmx_admin_lt_pix_card_summary_v1").select("card_key", { count: "exact", head: true });
  return NextResponse.json({ queue, total: count || 0, playableTotal: playableTotal || 0, cards: cardTotal || 0, source: "gpmx_backend via service-role-only public bridge", pageLimit: 500 });
}
