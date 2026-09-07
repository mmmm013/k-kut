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
  const [catalog, legacy] = await Promise.all([
    supabase.from("gpm_4pe_ii_catalog").select("*").eq("review_state", "PENDING_TPR").eq("catalog_state", "STAGED").order("created_at").limit(500),
    supabase.from("gpm_bic_ii_candidates").select("*").eq("dmaic_state", "CONTROL").eq("reviewer_state", "PENDING_GREGORY_REVIEW").order("updated_at", { ascending: true }).limit(500),
  ]);
  if (catalog.error || legacy.error) return NextResponse.json({ error: "four_pe_inventory_read_failed", detail: catalog.error?.message || legacy.error?.message }, { status: 502 });
  const catalogRows = (catalog.data || []).filter((row: any) => row.definition_proof?.passed === true);
  const artifactIds = catalogRows.map((row: any) => row.rendered_artifact_id);
  const artifacts = artifactIds.length ? await supabase.from("gpm_4pe_artifacts").select("id,storage_bucket,storage_path").in("id", artifactIds) : { data: [], error: null };
  if (artifacts.error) return NextResponse.json({ error: "four_pe_artifact_read_failed", detail: artifacts.error.message }, { status: 502 });
  const artifactById = new Map((artifacts.data || []).map((artifact: any) => [artifact.id, artifact]));
  const productionRows = catalogRows.map((row: any) => {
    const artifact: any = artifactById.get(row.rendered_artifact_id) || {};
    return { ii_key: row.ii_key, display_title: row.authority_title, display_text: row.blk_key, start_sec: row.start_sec, end_sec: row.end_sec, review_state: row.review_state, boundary_prosecution_state: "TPR", source_audio_path: artifact.storage_path, storage_bucket: artifact.storage_bucket || "tracks", product_family: row.ii_type, intent_lane: row.tp_key, updated_at: row.created_at, queue_order: 0 };
  });
  const admittedLegacy = (legacy.data || []).filter((row: any) => validateBicCandidate(row).passed).map(toReviewerRow);
  const queue = normalizeGovernedQueueRows([...productionRows, ...admittedLegacy]);
  return NextResponse.json({ queue, total: queue.length, source: "4PE immutable II catalog + governed legacy queue", pageLimit: 500 });
}
