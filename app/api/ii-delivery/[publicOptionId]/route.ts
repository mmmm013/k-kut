import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  currentIiPrivateAudio,
  findCurrentIiPrivateAudio,
} from "@/lib/currentIiPrivateAudio";
import { findApprovedPublicOptionByPublicOptionId } from "@/lib/publication-bridge/approvedPublicOptions";

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
  const option = findApprovedPublicOptionByPublicOptionId(publicOptionId);
  if (!option) return unavailable();

  const privateAudio = findCurrentIiPrivateAudio(
    option.kk_id_or_delivery_object_id,
  );
  if (
    !privateAudio ||
    privateAudio.authority_state !== "STAGE_CONTROLLED_PURCHASE_CANARY"
  ) {
    return unavailable();
  }

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
      privateAudio.storage_object_path,
      currentIiPrivateAudio.customerPreviewSignedUrlTtlSeconds,
    );

  if (error || !data?.signedUrl) return unavailable(503);

  const response = NextResponse.redirect(data.signedUrl, 307);
  for (const [name, value] of Object.entries(RESPONSE_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}
