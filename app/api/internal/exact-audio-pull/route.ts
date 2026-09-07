import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function sameText(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function unavailable() {
  return NextResponse.json({ error: "not_found" }, { status: 404, headers: PRIVATE_HEADERS });
}

export async function POST(request: NextRequest) {
  const rawToken = request.headers.get("x-gpmx-one-time-pull")?.trim() || "";
  if (!/^[A-Za-z0-9_-]{43}$/.test(rawToken)) return unavailable();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) return unavailable();

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const tokenHash = sha256(rawToken);
  const now = new Date().toISOString();
  const { data: row, error } = await supabase
    .from("gpmx_temp_private_audio_pull")
    .update({ used_at: now })
    .eq("token_sha256", tokenHash)
    .is("used_at", null)
    .gt("expires_at", now)
    .select("token_sha256,storage_object_id,bucket_id,object_name")
    .maybeSingle();

  if (error || !row || !sameText(String(row.token_sha256), tokenHash)) return unavailable();
  if (String(row.storage_object_id) !== "672f572b-99e3-4676-a4a0-259121bbde61") return unavailable();
  if (String(row.bucket_id) !== "tracks" || String(row.object_name) !== "GOTTA KEEP MOVIN'.mp3") return unavailable();

  const { data, error: downloadError } = await supabase.storage
    .from(String(row.bucket_id))
    .download(String(row.object_name));
  if (downloadError || !data) return unavailable();

  return new NextResponse(data.stream(), {
    status: 200,
    headers: {
      ...PRIVATE_HEADERS,
      "Content-Type": data.type || "audio/mpeg",
      "Content-Length": String(data.size),
      "Content-Disposition": "attachment; filename=source.mp3",
    },
  });
}
