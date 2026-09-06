import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";
const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow, noarchive" };
function authorized(request: NextRequest) { const supplied = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim(); return trustedProtectedPreview() || validAdminToken(supplied) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value); }
function serviceClient() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(); const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim(); return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null; }
function unavailable(status = 404, detail?: string) { return NextResponse.json({ error: status === 404 ? "not_found" : "private_audio_unavailable", ...(detail ? { detail } : {}) }, { status, headers: PRIVATE_HEADERS }); }

async function proxyAudio(request: NextRequest, url: string) {
  const headers = new Headers();
  const range = request.headers.get("range");
  if (range) headers.set("range", range);
  const upstream = await fetch(url, { headers, cache: "no-store", redirect: "follow" });
  if (!upstream.ok && upstream.status !== 206) return unavailable(503, `upstream audio ${upstream.status}`);
  const responseHeaders = new Headers(PRIVATE_HEADERS);
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  if (!responseHeaders.has("content-type")) responseHeaders.set("content-type", "audio/mpeg");
  responseHeaders.set("accept-ranges", upstream.headers.get("accept-ranges") || "bytes");
  return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return unavailable();
  const supabase = serviceClient();
  if (!supabase) return unavailable(503, "service client unavailable");
  const { id } = await params;
  const { data, error } = await supabase.from("gpmx_admin_kut_reviewer_queue_v1")
    .select("ii_key,authority_title,audio_path,playable_rank,source_track_ref")
    .eq("ii_key", id).in("review_state", ["READY_FOR_REVIEW", "NEEDS_GREGORY_REVIEW"]).limit(1).maybeSingle();
  if (error || !data || data.playable_rank !== 0) return unavailable();

  // Fresh-inventory law: resolve the exact LT-PIX family by track id first.
  // Never infer the source object from display title or a legacy URL/filename.
  if (data.source_track_ref) {
    const { data: resolved } = await supabase.from("gpmx_track_storage_audio_resolver_v1")
      .select("resolved_bucket_id,resolved_object_name,resolver_state,delivery_ready")
      .eq("track_id", String(data.source_track_ref))
      .eq("resolver_state", "RESOLVED_FROM_STORAGE_OBJECT_ID")
      .limit(1).maybeSingle();
    if (resolved?.resolved_object_name) {
      const bucket = String(resolved.resolved_bucket_id || "tracks");
      const signed = await supabase.storage.from(bucket).createSignedUrl(String(resolved.resolved_object_name), 300);
      if (!signed.error && signed.data?.signedUrl) return proxyAudio(request, signed.data.signedUrl);
    }
  }

  // Compatibility fallback for older reviewer evidence only. Fresh inventory must carry source_track_ref.
  if (!data.audio_path) return unavailable(503, "fresh inventory source_track_ref did not resolve");
  const pathValue = String(data.audio_path);
  if (/^https?:\/\//i.test(pathValue)) return proxyAudio(request, pathValue);
  if (pathValue.startsWith("public/")) return proxyAudio(request, new URL("/" + pathValue.replace(/^public\//, ""), request.url).toString());
  let bucket = "tracks"; let path = pathValue;
  if (pathValue.startsWith("current-ii/")) { bucket = "ii-delivery"; path = pathValue; }
  const signed = await supabase.storage.from(bucket).createSignedUrl(path, 300);
  if (signed.error || !signed.data?.signedUrl) return unavailable(503, signed.error?.message || "signed audio unavailable");
  return proxyAudio(request, signed.data.signedUrl);
}
