import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export async function GET() {
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: HEADERS });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) {
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: HEADERS });
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.storage
    .from("tracks")
    .createSignedUrl("638_alive-n-kickin_blk1_v1.mp3", 30);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: HEADERS });
  }

  const response = NextResponse.redirect(data.signedUrl, 307);
  for (const [name, value] of Object.entries(HEADERS)) response.headers.set(name, value);
  return response;
}
