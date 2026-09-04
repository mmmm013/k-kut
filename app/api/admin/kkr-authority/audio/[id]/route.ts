import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  currentIiPrivateAudio,
  findCurrentIiPrivateAudio,
} from "@/lib/currentIiPrivateAudio";

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

function unavailable(status = 404) {
  return NextResponse.json(
    { error: status === 404 ? "not_found" : "private_audio_unavailable" },
    { status, headers: PRIVATE_HEADERS },
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!authorized(request)) return unavailable();

  const { id } = await params;
  const record = findCurrentIiPrivateAudio(id);
  if (!record?.owner_review_enabled) return unavailable();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) return unavailable(503);

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.storage
    .from(currentIiPrivateAudio.bucket)
    .createSignedUrl(
      record.storage_object_path,
      currentIiPrivateAudio.signedUrlTtlSeconds,
    );

  if (error || !data?.signedUrl) return unavailable(503);

  const response = NextResponse.redirect(data.signedUrl, 307);
  for (const [name, value] of Object.entries(PRIVATE_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}
