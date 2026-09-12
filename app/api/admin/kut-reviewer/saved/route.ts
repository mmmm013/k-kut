import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, validAdminSession, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };

export async function GET(request: NextRequest) {
  // This recovery surface must not inherit the legacy always-true preview bypass.
  if (!validAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value) && !validAdminToken(request.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "owner_session_required" }, { status: 401, headers });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.GPMC_KUT_SUPABASE_SECRET_KEY;
  if (!url || !key) return NextResponse.json({ error: "service_unavailable" }, { status: 503, headers });
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const audioId = request.nextUrl.searchParams.get("audio");
  if (audioId) {
    const { data, error } = await db.from("gpmx_saved_kut_review_inventory_v1").select("storage_bucket,storage_object_path").eq("record_key", audioId).eq("object_exists", true).maybeSingle();
    if (error || !data) return NextResponse.json({ error: "saved_audio_not_resolved" }, { status: error ? 503 : 404, headers });
    const signed = await db.storage.from(data.storage_bucket).createSignedUrl(data.storage_object_path, 120);
    if (signed.error || !signed.data) return NextResponse.json({ error: "audio_signing_failed" }, { status: 503, headers });
    try {
      const range = request.headers.get("range");
      const audio = await fetch(signed.data.signedUrl, { headers: range ? { range } : {}, cache: "no-store", signal: AbortSignal.timeout(20000) });
      if (!audio.ok) return NextResponse.json({ error: "stored_audio_fetch_failed" }, { status: 502, headers });
      const out = new Headers(headers);
      for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) {
        const value = audio.headers.get(name); if (value) out.set(name, value);
      }
      return new NextResponse(audio.body, { status: audio.status, headers: out });
    } catch { return NextResponse.json({ error: "stored_audio_fetch_failed" }, { status: 502, headers }); }
  }
  const items: Record<string, unknown>[] = [];
  for (let offset = 0; ; offset += 500) {
    const page = await db.from("gpmx_saved_kut_review_inventory_v1").select("record_key,title,parent_title,product_layer,inventory_state,object_exists,source_table,source_record_id,capture_start_sec,capture_end_sec").order("object_exists", { ascending: false }).order("record_key").range(offset, offset + 499);
    if (page.error) return NextResponse.json({ error: "saved_inventory_read_failed" }, { status: 503, headers });
    items.push(...(page.data || []));
    if ((page.data || []).length < 500) break;
  }
  const decisions = await db.from("gpmx_saved_kut_review_decisions_v1").select("*").order("created_at");
  if (decisions.error) return NextResponse.json({ error: "saved_decisions_read_failed" }, { status: 503, headers });
  return NextResponse.json({ items, decisions: decisions.data, total: items.length, linkedAudio: items.filter(item => item.object_exists).length }, { headers });
}
