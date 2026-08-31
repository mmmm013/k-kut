import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  approvedIiRelease,
  findApprovedIiReleaseByPublicOptionId,
} from "@/lib/approvedIiRelease";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function unavailable(status = 404) {
  return NextResponse.json(
    { error: status === 404 ? "not_found" : "preview_unavailable" },
    { status, headers: RESPONSE_HEADERS },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicOptionId: string }> },
) {
  const { publicOptionId } = await params;
  const item = findApprovedIiReleaseByPublicOptionId(publicOptionId);
  if (!item) return unavailable();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) return unavailable(503);

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.storage
    .from(item.storageBucket)
    .createSignedUrl(
      item.storageObjectPath,
      approvedIiRelease.signedUrlTtlSeconds,
    );

  if (error || !data?.signedUrl) return unavailable(503);

  const response = NextResponse.redirect(data.signedUrl, 307);
  for (const [name, value] of Object.entries(RESPONSE_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}
