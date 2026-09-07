import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { type FactoryStage, runKey, validateFactoryRun } from "@/lib/bic/factory";

export const dynamic = "force-dynamic";
function authorized(request: NextRequest) { const token = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim(); return trustedProtectedPreview() || validAdminToken(token) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value); }
function serviceClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(); const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim(); return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null; }
export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!input) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const supabase = serviceClient(); if (!supabase) return NextResponse.json({ error: "service_client_unavailable" }, { status: 503 });
  const trackId = String(input.vocal_lt_pix_track_id || "");
  const registry = await supabase.from("gpm_bic_lt_pix_registry").select("*").eq("vocal_lt_pix_track_id", trackId).eq("registry_state", "ACTIVE").maybeSingle();
  if (registry.error || !registry.data) return NextResponse.json({ error: "active_unique_lt_pix_registry_record_required" }, { status: 409 });
  if (registry.data.paired_in_pix_track_id !== input.paired_in_pix_track_id) return NextResponse.json({ error: "paired_in_pix_lineage_mismatch" }, { status: 409 });
  const controls = await supabase.from("gpm_bic_factory_controls").select("*").eq("singleton", true).single();
  if (controls.error) return NextResponse.json({ error: "factory_controls_unavailable" }, { status: 502 });
  const gate = validateFactoryRun(input, controls.data);
  if (!gate.passed) return NextResponse.json({ error: "factory_run_hold", reasons: gate.reasons }, { status: 409 });
  const stage = input.stage as FactoryStage;
  const key = runKey(trackId, stage, registry.data.vocal_source_sha256);
  const measures = { source: "UNIQUE_VOCAL_LT_PIX", paired_in_pix_track_id: registry.data.paired_in_pix_track_id, legacy_duration_slicing: false, requested_stage: stage, evidence_complete: true };
  const saved = await supabase.from("gpm_bic_factory_runs").upsert({ vocal_lt_pix_track_id: trackId, requested_stage: stage, run_key: key, dmaic_state: "ANALYZE", measures, updated_at: new Date().toISOString() }, { onConflict: "run_key" }).select("id,run_key,dmaic_state").single();
  if (saved.error) return NextResponse.json({ error: "factory_run_persist_failed", detail: saved.error.message }, { status: 502 });
  return NextResponse.json({ ok: true, run: saved.data, measures, note: "KK-only run admitted. Candidate derivation remains hold-only until the private type-specific generator supplies a PASS proof for each candidate." });
}
