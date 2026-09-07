import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";
function authorized(request: NextRequest) { const token = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim(); return trustedProtectedPreview() || validAdminToken(token) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value); }
function serviceClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(); const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim(); return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null; }
const hash = (value: unknown) => typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!input || !String(input.vocal_lt_pix_track_id || "").trim() || !String(input.paired_in_pix_track_id || "").trim() || input.vocal_lt_pix_track_id === input.paired_in_pix_track_id || !String(input.authority_title || "").trim() || !hash(input.vocal_source_sha256) || !hash(input.lyric_authority_sha256)) return NextResponse.json({ error: "unique_vocal_lt_pix_registry_contract_required" }, { status: 400 });
  const supabase = serviceClient(); if (!supabase) return NextResponse.json({ error: "service_client_unavailable" }, { status: 503 });
  const saved = await supabase.from("gpm_bic_lt_pix_registry").upsert({ vocal_lt_pix_track_id: input.vocal_lt_pix_track_id, paired_in_pix_track_id: input.paired_in_pix_track_id, authority_title: input.authority_title, vocal_source_sha256: input.vocal_source_sha256, lyric_authority_sha256: input.lyric_authority_sha256, registry_state: "ACTIVE", updated_at: new Date().toISOString() }, { onConflict: "vocal_lt_pix_track_id" }).select("vocal_lt_pix_track_id,paired_in_pix_track_id,registry_state").single();
  if (saved.error) return NextResponse.json({ error: "lt_pix_registry_persist_failed", detail: saved.error.message }, { status: 502 });
  return NextResponse.json({ ok: true, registry: saved.data });
}
