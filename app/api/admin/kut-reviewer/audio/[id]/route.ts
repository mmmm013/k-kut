import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";
import { validateBicCandidate } from "@/lib/bic/iiControl";
export const dynamic = "force-dynamic";
const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow, noarchive" };
function authorized(request: NextRequest) { const token = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim(); return trustedProtectedPreview() || validAdminToken(token) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value); }
function serviceClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(); const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim(); return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null; }
function unavailable(status = 404, detail?: string) { return NextResponse.json({ error: status === 404 ? "not_found" : "private_audio_unavailable", ...(detail ? { detail } : {}) }, { status, headers: PRIVATE_HEADERS }); }
async function proxyAudio(request: NextRequest, url: string) { const headers = new Headers(); const range = request.headers.get("range"); if (range) headers.set("range", range); const upstream = await fetch(url, { headers, cache: "no-store" }); if (!upstream.ok && upstream.status !== 206) return unavailable(503, `upstream audio ${upstream.status}`); const responseHeaders = new Headers(PRIVATE_HEADERS); ["content-type", "content-length", "content-range", "accept-ranges"].forEach((name) => { const value = upstream.headers.get(name); if (value) responseHeaders.set(name, value); }); return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders }); }
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return unavailable(); const supabase = serviceClient(); if (!supabase) return unavailable(503, "service client unavailable"); const { id } = await params;
  const catalog = await supabase.from("gpm_4pe_ii_catalog").select("rendered_artifact_id,definition_proof").eq("ii_key", id).eq("review_state", "PENDING_TPR").eq("catalog_state", "STAGED").maybeSingle();
  if (catalog.error) return unavailable(503, catalog.error.message);
  if (catalog.data?.definition_proof?.passed === true) {
    const artifact = await supabase.from("gpm_4pe_artifacts").select("storage_bucket,storage_path").eq("id", catalog.data.rendered_artifact_id).single();
    if (artifact.error || !artifact.data?.storage_path) return unavailable(503, artifact.error?.message || "verified render path missing");
    const signed = await supabase.storage.from(artifact.data.storage_bucket || "tracks").createSignedUrl(artifact.data.storage_path, 300);
    if (signed.error || !signed.data?.signedUrl) return unavailable(503, signed.error?.message || "private render unavailable");
    return proxyAudio(request, signed.data.signedUrl);
  }
  const result = await supabase.from("gpm_bic_ii_candidates").select("*").eq("candidate_key", id).eq("dmaic_state", "CONTROL").eq("reviewer_state", "PENDING_GREGORY_REVIEW").maybeSingle();
  if (result.error) return unavailable(503, result.error.message); if (!result.data || !validateBicCandidate(result.data).passed) return unavailable();
  const rendering = result.data.rendering as Record<string, unknown>; const path = String(rendering.private_object_path || ""); const bucket = String(rendering.private_bucket || "tracks"); if (!path) return unavailable(503, "verified render path missing");
  const signed = await supabase.storage.from(bucket).createSignedUrl(path, 300); if (signed.error || !signed.data?.signedUrl) return unavailable(503, signed.error?.message || "private render unavailable"); return proxyAudio(request, signed.data.signedUrl);
}
