import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeGovernedQueueRows } from "@/lib/admin/kutReviewer";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const expected = process.env.ADMIN_PREVIEW_TOKEN?.trim();
  const supplied = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim();
  return Boolean(expected && supplied && supplied === expected);
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  return url && key ? createClient(url, key, { db: { schema: "gpmx_backend" }, auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

function toReviewerRow(row: any) {
  return {
    id: row.ii_key,
    kut_id: row.ii_key,
    display_title: row.authority_title,
    display_text: row.display_text,
    capture_start_sec: row.start_sec,
    stored_capture_end_sec: row.end_sec,
    corrected_capture_end_sec: row.end_sec,
    review_state: row.review_state || "PENDING_GREGORY_REVIEW",
    boundary_prosecution_state: row.evidence_state || "RECONCILED_EXISTING_EVIDENCE",
    source_audio_path: row.audio_path,
    storage_bucket: "tracks",
    product_family: row.container_type || row.ii_type,
    intent_lane: row.form_key || row.ii_type,
    public_route: null,
    updated_at: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });

  const { data, error, count } = await supabase
    .from("universal_kut_reviewer_queue_v1")
    .select("*", { count: "exact" })
    .order("playable_rank", { ascending: true })
    .order("authority_title", { ascending: true })
    .order("ii_type", { ascending: true })
    .order("start_sec", { ascending: true, nullsFirst: false })
    .limit(500);

  if (error) return NextResponse.json({ error: "universal_queue_read_failed", detail: error.message }, { status: 502 });

  const queue = normalizeGovernedQueueRows((data || []).map(toReviewerRow));
  const { count: playableTotal } = await supabase.from("universal_kut_reviewer_queue_v1").select("ii_key", { count: "exact", head: true }).eq("playable_rank", 0);
  const { count: cardTotal } = await supabase.from("lt_pix_card_summary_v2").select("card_key", { count: "exact", head: true });

  return NextResponse.json({ queue, total: count || 0, playableTotal: playableTotal || 0, cards: cardTotal || 0, source: "gpmx_backend.universal_kut_reviewer_queue_v1", pageLimit: 500 });
}
