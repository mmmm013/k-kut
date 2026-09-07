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
  const [staged, runs] = await Promise.all([
    supabase.from("gpm_4pe_staged_changes").select("*").eq("stage_state", "STAGED").order("staged_at"),
    supabase.from("gpm_4pe_runs").select("id,run_key,run_state,staged_item_count,started_at,completed_at").order("started_at", { ascending: false }).limit(12),
  ]);
  if (staged.error || runs.error) return NextResponse.json({ error: "four_pe_status_read_failed", detail: staged.error?.message || runs.error?.message }, { status: 502 });
  return NextResponse.json({ staged: staged.data || [], runs: runs.data || [] });
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const discoTrackKey = String(input?.discoTrackKey || "").trim();
  const authorityTitle = String(input?.authorityTitle || "").trim();
  const operation = String(input?.operation || "UPSERT").toUpperCase();
  const sourceLocator = input?.sourceLocator;
  const stlTrackId = sourceLocator && typeof sourceLocator === "object" && !Array.isArray(sourceLocator) ? String((sourceLocator as Record<string, unknown>).stlTrackId || "").trim() : "";
  if (!discoTrackKey || !authorityTitle || !["UPSERT", "REPROCESS", "DELETE"].includes(operation) || !stlTrackId || !validSha256(input?.expectedMixedSha256) || !validSha256(input?.lyricAuthoritySha256)) {
    return NextResponse.json({ error: "valid_disco_stl_stage_contract_required" }, { status: 400 });
  }
  const supabase = fourPeServiceClient();
  if (!supabase) return NextResponse.json({ error: "service_client_unavailable" }, { status: 503 });
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
