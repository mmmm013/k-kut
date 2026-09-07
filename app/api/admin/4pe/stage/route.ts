import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { fourPeServiceClient, validSha256 } from "@/lib/fourPe/service";

export const dynamic = "force-dynamic";
function authorized(request: NextRequest) {
  const token = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim();
  return trustedProtectedPreview() || validAdminToken(token) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const supabase = fourPeServiceClient();
  if (!supabase) return NextResponse.json({ error: "service_client_unavailable" }, { status: 503 });
  const [staged, runs, tracks] = await Promise.all([
    supabase.from("gpm_4pe_staged_changes").select("*").eq("stage_state", "STAGED").order("staged_at"),
    supabase.from("gpm_4pe_runs").select("id,run_key,run_state,staged_item_count,started_at,completed_at").order("started_at", { ascending: false }).limit(12),
    supabase.from("tracks").select("id,title,kkr_track_title,bucket_id,source_path,storage_object_id,source_status,pix_source_type,is_instrumental").eq("pix_source_type", "LT-PIX").eq("source_status", "active").eq("is_instrumental", false).order("title").limit(2000),
  ]);
  if (staged.error || runs.error || tracks.error) return NextResponse.json({ error: "four_pe_status_read_failed", detail: staged.error?.message || runs.error?.message || tracks.error?.message }, { status: 502 });
  return NextResponse.json({
    staged: staged.data || [], runs: runs.data || [],
    availableTracks: (tracks.data || []).map((track) => ({ id: track.id, title: track.kkr_track_title || track.title })),
  });
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const trackId = String(input?.trackId || "").trim();
  const operation = String(input?.operation || "UPSERT").toUpperCase();
  if (!trackId || !["UPSERT", "REPROCESS", "DELETE"].includes(operation) || !validSha256(input?.expectedMixedSha256) || !validSha256(input?.lyricAuthoritySha256)) {
    return NextResponse.json({ error: "valid_disco_stl_stage_contract_required" }, { status: 400 });
  }
  const supabase = fourPeServiceClient();
  if (!supabase) return NextResponse.json({ error: "service_client_unavailable" }, { status: 503 });
  const authority = await supabase.from("tracks").select("id,title,kkr_track_title,bucket_id,source_path,storage_object_id,pix_source_type,source_status,is_instrumental").eq("id", trackId).eq("pix_source_type", "LT-PIX").eq("source_status", "active").eq("is_instrumental", false).maybeSingle();
  if (authority.error || !authority.data) return NextResponse.json({ error: "active_lt_pix_authority_required", detail: authority.error?.message }, { status: 409 });
  const discoTrackKey = authority.data.id;
  const authorityTitle = authority.data.kkr_track_title || authority.data.title;
  const sourceLocator = {
    authority: "DISCO_STL",
    supabaseLtPixTrackId: authority.data.id,
    storageObjectId: authority.data.storage_object_id,
    bucket: authority.data.bucket_id,
    path: authority.data.source_path,
  };
  const existing = await supabase.from("gpm_4pe_staged_changes").select("id").eq("disco_track_key", discoTrackKey).eq("stage_state", "STAGED").maybeSingle();
  if (existing.error) return NextResponse.json({ error: "staging_lookup_failed", detail: existing.error.message }, { status: 502 });
  const payload = {
    disco_track_key: discoTrackKey,
    authority_title: authorityTitle,
    operation,
    source_locator: sourceLocator,
    expected_mixed_sha256: input?.expectedMixedSha256 || null,
    lyric_authority: input?.lyricAuthority && typeof input.lyricAuthority === "object" ? input.lyricAuthority : {},
    lyric_authority_sha256: input?.lyricAuthoritySha256 || null,
    requested_types: ["KK"],
    staged_reason: String(input?.stagedReason || "NEXT_RUN"),
    updated_at: new Date().toISOString(),
  };
  const result = existing.data
    ? await supabase.from("gpm_4pe_staged_changes").update(payload).eq("id", existing.data.id).select().single()
    : await supabase.from("gpm_4pe_staged_changes").insert(payload).select().single();
  if (result.error) return NextResponse.json({ error: "stage_failed", detail: result.error.message }, { status: 502 });
  return NextResponse.json({ ok: true, staged: result.data });
}

export async function DELETE(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const id = request.nextUrl.searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "stage_id_required" }, { status: 400 });
  const supabase = fourPeServiceClient();
  if (!supabase) return NextResponse.json({ error: "service_client_unavailable" }, { status: 503 });
  const result = await supabase.from("gpm_4pe_staged_changes").update({ stage_state: "CANCELED", updated_at: new Date().toISOString() }).eq("id", id).eq("stage_state", "STAGED");
  if (result.error) return NextResponse.json({ error: "cancel_failed", detail: result.error.message }, { status: 502 });
  return NextResponse.json({ ok: true });
}
