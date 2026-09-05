import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

// Sole-owner product: admin routes open automatically everywhere, no login wall.
function authorized(_request: NextRequest) {
  return true;
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

function unavailable(status = 404, detail?: string) {
  return NextResponse.json(
    { error: status === 404 ? "not_found" : "private_audio_unavailable", ...(detail ? { detail } : {}) },
    { status, headers: PRIVATE_HEADERS },
  );
}

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

export async function GET(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  if (!authorized(request)) return unavailable();
  const supabase = serviceClient();
  if (!supabase) return unavailable(503, "service client unavailable");

  const { key } = await params;
  const { data, error } = await supabase
    .from("gpmx_admin_kkr_tpr_candidate_v1")
    .select("candidate_key,method_notes")
    .eq("candidate_key", key)
    .limit(1)
    .maybeSingle();
  if (error || !data) return unavailable();

  const renderedPath = data.method_notes?.rendered_cc_path;
  if (!renderedPath) return unavailable(503, "rendered candidate clip path missing");

  const signed = await supabase.storage.from("tracks").createSignedUrl(String(renderedPath), 300);
  if (signed.error || !signed.data?.signedUrl) return unavailable(503, signed.error?.message || "signed audio unavailable");

  return proxyAudio(request, signed.data.signedUrl);
}
