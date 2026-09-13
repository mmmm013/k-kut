import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { trustedProtectedPreview, validAdminToken } from "@/lib/admin/adminSession";
import { resolveGpmxWav } from "@/lib/gpmx/stlWavResolver";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}

function unavailable(status = 404, detail?: string) {
  return NextResponse.json(
    { error: status === 404 ? "not_found" : "audio_unavailable", ...(detail ? { detail } : {}) },
    { status, headers: PRIVATE_HEADERS },
  );
}

async function proxyAudio(request: NextRequest, upstreamUrl: string, sourceHeaders?: Record<string, string>) {
  const range = request.headers.get("range");
  const upstream = await fetch(upstreamUrl, {
    cache: "no-store",
    headers: { ...sourceHeaders, ...(range ? { range } : {}) },
    signal: AbortSignal.timeout(30_000),
  });
  if (!upstream.ok && upstream.status !== 206) {
    return unavailable(503, `audio upstream ${upstream.status}`);
  }
  const headers = new Headers(PRIVATE_HEADERS);
  for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!trustedProtectedPreview() && !validAdminToken(request.headers.get("x-admin-token"))) return unavailable();
  const service = client();
  if (!service) return unavailable(503, "service client unavailable");

  const { id } = await params;
  if (!/^\d+$/.test(id)) return unavailable();
  const track = await service
    .from("gpm_stl_current_split_inventory_v2")
    .select("disco_track_id")
    .eq("disco_track_id", id)
    .eq("inventory_lane", "FULLMIX")
    .maybeSingle();
  if (track.error || !track.data) return unavailable();

  const stored = await service
    .from("gpmx_track_storage_audio_resolver_v1")
    .select("resolved_bucket_id,resolved_object_name,resolver_state")
    .eq("track_id", id)
    .eq("resolver_state", "RESOLVED_FROM_STORAGE_OBJECT_ID")
    .maybeSingle();

  if (!stored.error && stored.data?.resolved_object_name) {
    const signed = await service.storage
      .from(String(stored.data.resolved_bucket_id || "tracks"))
      .createSignedUrl(String(stored.data.resolved_object_name), 300);
    if (!signed.error && signed.data?.signedUrl) return proxyAudio(request, signed.data.signedUrl);
  }

  try {
    const source = await resolveGpmxWav(id);
    if (!source) return unavailable(503, "original WAV is not available in the current GPMx share authority");
    if (!source.sessionCookie || !source.playlistUrl) return unavailable(503, "GPMx WAV session is unavailable");
    return proxyAudio(request, source.signedWavUrl, {
      accept: "audio/wav,audio/*;q=0.9,*/*;q=0.8",
      cookie: source.sessionCookie,
      referer: source.playlistUrl,
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36",
    });
  } catch (error) {
    return unavailable(503, error instanceof Error ? error.message : String(error));
  }
}
