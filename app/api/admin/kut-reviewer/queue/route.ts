import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeGovernedQueueRows } from "@/lib/admin/kutReviewer";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { validate4peIntakeEvidence } from "@/lib/kkr/intakeEvidenceGate";

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

function hasGovernedCandidateEvidence(row: unknown): boolean {
  const notes = row && typeof row === "object" && "method_notes" in row
    ? (row as { method_notes?: unknown }).method_notes
    : undefined;
  return validate4peIntakeEvidence(notes).passed;
}

function toCandidateReviewerRow(row: any) {
  const notes = row.method_notes && typeof row.method_notes === "object" ? row.method_notes : {};
  return {
    id: row.candidate_key, kut_id: row.candidate_key, display_title: row.authority_title || "Governed vocal CC",
    display_text: row.display_text || null, capture_start_sec: row.start_sec, stored_capture_end_sec: row.end_sec,
    corrected_capture_end_sec: row.end_sec, review_state: row.review_state || "PENDING_GREGORY_REVIEW",
    boundary_prosecution_state: row.evidence_state || "KKR_MACHINE_PROSECUTED",
    source_audio_path: notes.rendered_cc_path || row.audio_path, storage_bucket: notes.rendered_cc_bucket || "tracks",
    product_family: row.ii_type || "GOVERNED_VOCAL_CC", intent_lane: notes.blk_key || row.form_key || "governed vocal CC",
    public_route: null, updated_at: row.updated_at || null, queue_order: Number(notes.queue_order ?? 0),
  };
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });
  const candidateResult = await supabase.from("gpmx_admin_kkr_tpr_candidate_v1").select("*").in("review_state", ["NEEDS_GREGORY_REVIEW", "PENDING_GREGORY_REVIEW"]).order("updated_at", { ascending: true }).limit(100);
  if (candidateResult.error) return NextResponse.json({ error: "governed_cc_queue_read_failed", detail: candidateResult.error.message }, { status: 502 });
  // Legacy timed review packs are not candidate authority. A candidate must carry complete 4PE evidence.
  const admitted = (candidateResult.data || []).filter(hasGovernedCandidateEvidence);
  const queue = normalizeGovernedQueueRows(admitted.map(toCandidateReviewerRow));
  return NextResponse.json({ queue, total: admitted.length, source: "4PE-gated governed vocal CC candidates only", pageLimit: 100 });
}
