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
    id: row.ii_key, kut_id: row.ii_key, display_title: row.parent_title || row.authority_title || "Pre-made II",
    display_text: row.display_text || row.section_label || null,
    capture_start_sec: row.start_seconds, stored_capture_end_sec: row.end_seconds, corrected_capture_end_sec: row.end_seconds,
    review_state: row.review_pack_state || "NEEDS_GREGORY_REVIEW",
    boundary_prosecution_state: row.approval_state || "PREMADE_REVIEW_PACK",
    source_audio_path: row.local_audio_path, storage_bucket: "tracks", product_family: row.ii_type,
    intent_lane: row.section_label || row.kk_no || row.ii_type, public_route: null, updated_at: row.updated_at || null, queue_order: row.queue_order ?? null,
  };
}

function toCandidateReviewerRow(row: any) {
  const notes = row.method_notes && typeof row.method_notes === "object" ? row.method_notes : {};
  return {
    id: row.candidate_key,
    kut_id: row.candidate_key,
    display_title: row.authority_title || "Governed vocal CC",
    display_text: row.display_text || null,
    capture_start_sec: row.start_sec,
    stored_capture_end_sec: row.end_sec,
    corrected_capture_end_sec: row.end_sec,
    review_state: row.review_state || "NEEDS_GREGORY_REVIEW",
    boundary_prosecution_state: row.evidence_state || "KKR_MACHINE_PROSECUTED",
    source_audio_path: notes.rendered_cc_path || row.audio_path,
    storage_bucket: notes.rendered_cc_bucket || "tracks",
    product_family: row.ii_type || "GOVERNED_VOCAL_CC",
    intent_lane: notes.blk_key || row.form_key || "governed vocal CC",
    public_route: null,
    updated_at: row.updated_at || null,
    queue_order: -1,
  };
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });
  const [candidateResult, seedResult] = await Promise.all([
    supabase.from("gpmx_admin_kkr_tpr_candidate_v1").select("*").in("review_state", ["NEEDS_GREGORY_REVIEW", "PENDING_GREGORY_REVIEW", "OWNER_HELD"]).order("updated_at", { ascending: true }).limit(100),
    supabase.from("gpmc_v012_vocal_ii_review_queue_v1").select("*", { count: "exact" }).order("parent_title", { ascending: true }).order("kk_no", { ascending: true, nullsFirst: false }).order("start_seconds", { ascending: true, nullsFirst: false }).limit(1001),
  ]);
  if (candidateResult.error) return NextResponse.json({ error: "governed_cc_queue_read_failed", detail: candidateResult.error.message }, { status: 502 });
  if (seedResult.error) return NextResponse.json({ error: "premade_vocal_queue_read_failed", detail: seedResult.error.message }, { status: 502 });
  const combined = [
    ...(candidateResult.data || []).map(toCandidateReviewerRow),
    ...(seedResult.data || []).map(toReviewerRow),
  ];
  const queue = [...new Map(normalizeGovernedQueueRows(combined).map((item) => [item.id, item])).values()];
  return NextResponse.json({ queue, total: (candidateResult.data?.length || 0) + (seedResult.count || 0), source: "governed CC candidates plus pre-made vocal II review packs; deduped by item key", pageLimit: 1101 });
}
