import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { validateBicCandidate } from "@/lib/bic/iiControl";

export const dynamic = "force-dynamic";
function authorized(request: NextRequest) {
  const token = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim();
  return trustedProtectedPreview() || validAdminToken(token) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}
export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const candidate = await request.json().catch(() => null);
  if (!candidate || typeof candidate !== "object") return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const gate = validateBicCandidate(candidate as Record<string, unknown>);
  if (!gate.passed) return NextResponse.json({ error: "bic_admission_hold", reasons: gate.reasons }, { status: 409 });
  const input = candidate as Record<string, any>;
  if (!/^[A-Za-z0-9._:-]+$/.test(String(input.candidate_key || "")) || !String(input.blk_key || "")) return NextResponse.json({ error: "candidate_identity_required" }, { status: 400 });
  const supabase = serviceClient();
  if (!supabase) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });
  const payload = {
    candidate_key: input.candidate_key, authority_title: String(input.authority_title || input.candidate_key),
    lt_pix_track_id: input.lt_pix_track_id, in_pix_track_id: input.in_pix_track_id, source_audio_sha256: input.source_audio_sha256,
    ii_type: input.ii_type, blk_key: input.blk_key, start_sec: input.start_sec, end_sec: input.end_sec,
    evidence: input.evidence, definition_proof: input.definition_proof, rendering: input.rendering,
    dmaic_state: "CONTROL", reviewer_state: "PENDING_GREGORY_REVIEW", updated_at: new Date().toISOString(),
  };
  const saved = await supabase.from("gpm_bic_ii_candidates").upsert(payload, { onConflict: "candidate_key" }).select("id,candidate_key,ii_type,reviewer_state").single();
  if (saved.error) return NextResponse.json({ error: "bic_candidate_persist_failed", detail: saved.error.message }, { status: 502 });
  await supabase.from("gpm_bic_ii_events").insert({ candidate_id: saved.data.id, stage: "CONTROL", outcome: "ADMITTED", measures: { ii_type: payload.ii_type, lt_pix_track_id: payload.lt_pix_track_id, in_pix_track_id: payload.in_pix_track_id } });
  return NextResponse.json({ ok: true, candidate: saved.data });
}
