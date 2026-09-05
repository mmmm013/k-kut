import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { validate4peIntakeEvidence } from "@/lib/kkr/intakeEvidenceGate";
import { nextR4uLifecycle, R4U_CONTROL_VERSION } from "@/lib/r4u/intakeRun";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const LT_PIX_TRACK_ID = "c5b9e589-2db5-41c6-a335-0e3ee7f1f43f";
const IN_PIX_TRACK_ID = "94856625-a4a7-449b-99ac-730d7a39e7b9";
const LYRIC_SHA = "9657508e03e3ecb35c3341525fb3b67039ca50999ee957c13dfbbe19e27e8ec3";
function authorized(r: NextRequest) { const t = r.headers.get("x-admin-token")?.trim() || r.nextUrl.searchParams.get("token")?.trim(); return trustedProtectedPreview() || validAdminToken(t) || validAdminSession(r.cookies.get(ADMIN_SESSION_COOKIE)?.value); }
function client() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(), key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim(); return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null; }
function shell() { return { id: 0, queue_order: 0, authority_title: "TORN MEMORIES", lt_track_id: LT_PIX_TRACK_ID, in_track_id: IN_PIX_TRACK_ID, writer_pattern_mode: "FULL_LYRIC_BLK_SISTER_PAIR", review_state: "INTAKE", owner_directive: "Map full lyric BLKs before any KUT candidate creation.", structure_notes: null }; }
async function exactSourceHash(s: NonNullable<ReturnType<typeof client>>) {
  const q = await s.from("gpmx_track_storage_audio_resolver_v1").select("resolved_bucket_id,resolved_object_name,resolver_state").eq("track_id", LT_PIX_TRACK_ID).maybeSingle();
  if (q.error || !q.data || q.data.resolver_state !== "RESOLVED_FROM_STORAGE_OBJECT_ID") throw new Error("LT_PIX_SOURCE_RESOLUTION_REQUIRED");
  const file = await s.storage.from(String(q.data.resolved_bucket_id)).download(String(q.data.resolved_object_name));
  if (file.error || !file.data) throw new Error("LT_PIX_PRIVATE_SOURCE_DOWNLOAD_REQUIRED");
  return createHash("sha256").update(Buffer.from(await file.data.arrayBuffer())).digest("hex");
}
export async function GET(r: NextRequest) {
  if (!authorized(r)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const s = client(); if (!s) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });
  const q = await s.from("gpm_r4u_intake_runs").select("evidence,lifecycle_state").eq("source_track_id", LT_PIX_TRACK_ID).maybeSingle();
  if (q.error) return NextResponse.json({ error: "r4u_run_read_failed", detail: q.error.message }, { status: 502 });
  return NextResponse.json({ queue: [{ ...shell(), review_state: q.data?.lifecycle_state || "INTAKE", structure_notes: (q.data?.evidence as any)?.mapping_notes || null }] });
}
export async function POST(r: NextRequest) {
  if (!authorized(r)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const body = await r.json().catch(() => null) as { reviewState?: string; structureNotes?: string } | null;
  if (!body?.structureNotes) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  let mapping: any; try { mapping = JSON.parse(body.structureNotes); } catch { return NextResponse.json({ error: "invalid_mapping_json" }, { status: 400 }); }
  const s = client(); if (!s) return NextResponse.json({ error: "server_supabase_connection_not_configured" }, { status: 503 });
  let sourceHash: string; try { sourceHash = await exactSourceHash(s); } catch (error) { return NextResponse.json({ error: "source_verification_failed", detail: error instanceof Error ? error.message : "source verification failed" }, { status: 502 }); }
  const intakeEvidence = { full_lyric_read: mapping.full_lyric_read === true, lyric_authority_sha256: LYRIC_SHA, source_audio_sha256: sourceHash, lt_pix_track_id: LT_PIX_TRACK_ID, in_pix_track_id: IN_PIX_TRACK_ID, blks: (mapping.blks || []).map((blk: any) => ({ id: blk.id, lines: blk.lines, vtp: { start_sec: blk.vtpStart, end_sec: blk.vtpEnd }, intp: { start_sec: blk.intpStart, end_sec: blk.intpEnd }, sister_pair_id: `${blk.id}__SISTER_PAIR`, mgs: blk.mgs })) };
  const gate = validate4peIntakeEvidence({ intake_evidence: intakeEvidence });
  const lifecycle = nextR4uLifecycle({ intake_evidence: intakeEvidence }, { kk_hug: 100, sk_tug: 100, mk_bug: 100 });
  if (body.reviewState === "STRUCTURE_IDENTIFIED" && !gate.passed) return NextResponse.json({ error: "incomplete_4pe_intake_evidence", detail: gate.reasons.join(",") }, { status: 400 });
  const saved = await s.from("gpm_r4u_intake_runs").upsert({ control_version: R4U_CONTROL_VERSION, source_track_id: LT_PIX_TRACK_ID, lt_pix_track_id: LT_PIX_TRACK_ID, in_pix_track_id: IN_PIX_TRACK_ID, source_audio_sha256: sourceHash, lyric_authority_sha256: LYRIC_SHA, lifecycle_state: lifecycle, baseline_snapshot: { control_version: R4U_CONTROL_VERSION, baseline: "FAIL_CLOSED_NO_CANDIDATE_OR_PROMOTION_BEFORE_COMPLETE_EVIDENCE" }, evidence: { mapping_notes: mapping, intake_evidence: intakeEvidence }, batch_request: { kk_hug: 100, sk_tug: 100, mk_bug: 100 }, updated_at: new Date().toISOString() }, { onConflict: "source_track_id" }).select("id,lifecycle_state").single();
  if (saved.error) return NextResponse.json({ error: "r4u_run_persist_failed", detail: saved.error.message }, { status: 502 });
  await s.from("gpm_r4u_run_events").insert({ run_id: saved.data.id, event_type: "INTAKE_EVIDENCE_SAVED", event_payload: { passed: gate.passed, reasons: gate.reasons, lifecycle } });
  return NextResponse.json({ ok: true, run: saved.data, evidence: gate });
}
