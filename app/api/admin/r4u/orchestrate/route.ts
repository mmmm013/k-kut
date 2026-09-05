import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { canOrchestrateR4uBatch } from "@/lib/r4u/intakeRun";

export const dynamic = "force-dynamic";
function authorized(r: NextRequest) { const t = r.headers.get("x-admin-token")?.trim() || r.nextUrl.searchParams.get("token")?.trim(); return trustedProtectedPreview() || validAdminToken(t) || validAdminSession(r.cookies.get(ADMIN_SESSION_COOKIE)?.value); }
function client() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(), key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim(); return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null; }

// Deliberately does not generate inventory. A later generator consumes only this BATCH_READY signal.
export async function POST(r: NextRequest) {
  if (!authorized(r)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const s = client(); if (!s) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });
  const { data, error } = await s.from("gpm_r4u_intake_runs").select("id,lifecycle_state,evidence,batch_request").eq("source_track_id", "c5b9e589-2db5-41c6-a335-0e3ee7f1f43f").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "r4u_run_not_ready", detail: error?.message }, { status: 409 });
  const gate = canOrchestrateR4uBatch(data);
  if (!gate.allowed) return NextResponse.json({ error: "r4u_batch_blocked", detail: gate.reasons.join(","), lifecycle: gate.state }, { status: 409 });
  await s.from("gpm_r4u_run_events").insert({ run_id: data.id, event_type: "BATCH_ORCHESTRATION_AUTHORIZED", event_payload: data.batch_request });
  return NextResponse.json({ ok: true, lifecycle: "BATCH_READY", batch: data.batch_request, note: "No inventory was generated. REVIEWING begins only after a class-specific, evidence-backed generator creates review items." });
}
