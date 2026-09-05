import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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

const VALID_ACTIONS = new Set(["APPROVE", "TRIM", "HOLD", "REJECT"]);
const ACTION_TO_REVIEW_STATE: Record<string, string> = {
  APPROVE: "GREGORY_APPROVED",
  TRIM: "GREGORY_TRIM_REQUESTED",
  HOLD: "GREGORY_HOLD",
  REJECT: "GREGORY_REJECTED",
};

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const supabase = serviceClient();
  if (!supabase) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json_body" }, { status: 400 });
  }

  const candidateKey = String(body?.candidate_key || "").trim();
  const action = String(body?.action || "").trim().toUpperCase();
  const note = body?.note ? String(body.note).trim() : null;

  if (!candidateKey) return NextResponse.json({ error: "candidate_key_required" }, { status: 400 });
  if (!VALID_ACTIONS.has(action)) return NextResponse.json({ error: "invalid_action", allowed: [...VALID_ACTIONS] }, { status: 400 });

  // The table's exact column set isn't version-controlled, so avoid assuming columns
  // beyond what the prosecute route is known to write. Store decision metadata inside
  // the existing jsonb method_notes column instead of guessing at new top-level columns.
  const { data: existing, error: readError } = await supabase
    .from("gpmx_admin_kkr_tpr_candidate_v1")
    .select("candidate_key,method_notes")
    .eq("candidate_key", candidateKey)
    .maybeSingle();
  if (readError) return NextResponse.json({ error: "candidate_read_failed", detail: readError.message }, { status: 502 });
  if (!existing) return NextResponse.json({ error: "candidate_not_found" }, { status: 404 });

  const decidedAt = new Date().toISOString();
  const mergedNotes = {
    ...(existing.method_notes && typeof existing.method_notes === "object" ? existing.method_notes : {}),
    gregory_decision: { action, note, decided_at: decidedAt, reviewer_key: "GREGORY" },
  };

  const { data, error } = await supabase
    .from("gpmx_admin_kkr_tpr_candidate_v1")
    .update({ review_state: ACTION_TO_REVIEW_STATE[action], method_notes: mergedNotes, updated_at: decidedAt })
    .eq("candidate_key", candidateKey)
    .select("candidate_key,review_state,method_notes,updated_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "decision_write_failed", detail: error.message }, { status: 502 });
  if (!data) return NextResponse.json({ error: "candidate_not_found" }, { status: 404 });

  return NextResponse.json({ ok: true, decision: data });
}
