import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, trustedProtectedPreview, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";

const SOURCES = {
  vocal: "c5b9e589-2db5-41c6-a335-0e3ee7f1f43f",
  instro: "94856625-a4a7-449b-99ac-730d7a39e7b9",
} as const;

function authorized(request: NextRequest) {
  const supplied = request.headers.get("x-admin-token")?.trim() || request.nextUrl.searchParams.get("token")?.trim();
  return trustedProtectedPreview() || validAdminToken(supplied) || validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  if (!authorized(request)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const { kind } = await params;
  if (!(kind in SOURCES)) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const trackId = SOURCES[kind as keyof typeof SOURCES];
  const { data: row, error } = await supabase.from("gpmx_track_storage_audio_resolver_v1")
    .select("track_id,resolved_bucket_id,resolved_object_name,resolver_state")
    .eq("track_id", trackId)
    .single();
  if (error || !row || row.resolver_state !== "RESOLVED_FROM_STORAGE_OBJECT_ID") {
    return NextResponse.json({ error: "source_resolve_failed", detail: error?.message }, { status: 502 });
  }
  const { data: signed, error: signError } = await supabase.storage.from(row.resolved_bucket_id).createSignedUrl(row.resolved_object_name, 300);
  if (signError || !signed?.signedUrl) return NextResponse.json({ error: "sign_failed", detail: signError?.message }, { status: 502 });
  const response = NextResponse.redirect(signed.signedUrl, 307);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}
