import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Sole-owner product: admin routes open automatically everywhere, no login wall.
function authorized(_request: NextRequest) {
  return true;
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const supabase = serviceClient();
  if (!supabase) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });

  const { data, error, count } = await supabase
    .from("gpmx_admin_kkr_tpr_candidate_v1")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: "tpr_candidate_read_failed", detail: error.message }, { status: 502 });

  const queue = (data || []).map((row: any) => ({
    candidate_key: row.candidate_key,
    card_key: row.card_key,
    authority_title: row.authority_title,
    display_text: row.display_text,
    ii_type: row.ii_type,
    container_type: row.container_type,
    form_key: row.form_key,
    start_sec: row.start_sec,
    end_sec: row.end_sec,
    review_state: row.review_state,
    evidence_state: row.evidence_state,
    lyric_authority_sha256: row.lyric_authority_sha256,
    method_notes: row.method_notes,
    updated_at: row.updated_at,
    decided_at: row.decided_at || null,
    decision_note: row.decision_note || null,
  }));

  return NextResponse.json({
    queue,
    total: count || 0,
    source: "gpmx_admin_kkr_tpr_candidate_v1 (direct read, bypasses the reviewer-queue view)",
  });
}
