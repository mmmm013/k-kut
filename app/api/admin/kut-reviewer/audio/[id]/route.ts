import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const PRIVATE_HEADERS = { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow, noarchive" };

function authorized(request: NextRequest) {
  const expected = process.env.ADMIN_PREVIEW_TOKEN?.trim();
  const supplied = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim();
  return Boolean(expected && supplied && supplied === expected);
}
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}
function unavailable(status = 404) { return NextResponse.json({ error: status === 404 ? "not_found" : "private_audio_unavailable" }, { status, headers: PRIVATE_HEADERS }); }

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return unavailable();
  const supabase = serviceClient();
  if (!supabase) return unavailable(503);
  const { id } = await params;
  const { data, error } = await supabase.schema("gpmx_backend").from("universal_kut_reviewer_queue_v1").select("ii_key,audio_path,playable_rank").eq("ii_key", id).limit(1).maybeSingle();
  if (error || !data || data.playable_rank !== 0 || !data.audio_path) return unavailable();
  const pathValue = String(data.audio_path);
  if (/^https?:\/\//i.test(pathValue)) return NextResponse.redirect(pathValue, 307);
  if (pathValue.startsWith("public/")) {
    const response = NextResponse.redirect(new URL("/" + pathValue.replace(/^public\//, ""), request.url), 307);
    Object.entries(PRIVATE_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }
  let bucket = "tracks";
  let path = pathValue;
  if (pathValue.startsWith("current-ii/")) { bucket = "ii-delivery"; path = pathValue; }
  const signed = await supabase.storage.from(bucket).createSignedUrl(path, 300);
  if (signed.error || !signed.data?.signedUrl) return unavailable(503);
  const response = NextResponse.redirect(signed.data.signedUrl, 307);
  Object.entries(PRIVATE_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}
