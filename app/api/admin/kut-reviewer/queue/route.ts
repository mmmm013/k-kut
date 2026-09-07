import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { validateBicCandidate } from "@/lib/bic/iiControl";
import { normalizeGovernedQueueRows } from "@/lib/admin/kutReviewer";

export const dynamic = "force-dynamic";
function authorized(request: NextRequest) { const token = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim(); return trustedProtectedPreview() || validAdminToken(token) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value); }
function serviceClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(); const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim(); return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null; }
function toReviewerRow(row: any) {
  const rendering = row.rendering && typeof row.rendering === "object" ? row.rendering : {};
  return { ii_key: row.candidate_key, display_title: row.authority_title, display_text: row.blk_key, start_sec: row.start_sec, end_sec: row.end_sec, review_state: row.reviewer_state, boundary_prosecution_state: row.dmaic_state, source_audio_path: rendering.private_object_path, storage_bucket: rendering.private_bucket || "tracks", product_family: row.ii_type, intent_lane: row.blk_key, updated_at: row.updated_at, queue_order: 0 };
}
export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const supabase = serviceClient(); if (!supabase) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });
  const result = await supabase.from("gpm_bic_ii_candidates").select("*").eq("dmaic_state", "CONTROL").eq("reviewer_state", "PENDING_GREGORY_REVIEW").order("updated_at", { ascending: true }).limit(500);
  if (result.error) return NextResponse.json({ error: "bic_inventory_read_failed", detail: result.error.message }, { status: 502 });
  const admitted = (result.data || []).filter((row: any) => validateBicCandidate(row).passed);
  return NextResponse.json({ queue: normalizeGovernedQueueRows(admitted.map(toReviewerRow)), total: admitted.length, source: "BIC EE inventory: LT-PIX lineage + 4PE + type-specific definition pass", pageLimit: 500 });
}
