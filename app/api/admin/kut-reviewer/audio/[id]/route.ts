import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { normalizeGovernedQueueRows } from "@/lib/admin/kutReviewer";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function authorized(request: NextRequest) {
  const expected = process.env.ADMIN_PREVIEW_TOKEN?.trim();
  const supplied =
    request.headers.get("x-admin-token")?.trim() ||
    request.nextUrl.searchParams.get("token")?.trim();
  return Boolean(expected && supplied && supplied === expected);
}

function unavailable(status = 404) {
  return NextResponse.json(
    { error: status === 404 ? "not_found" : "private_audio_unavailable" },
    { status, headers: PRIVATE_HEADERS },
  );
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!authorized(request)) return unavailable();

  const supabase = createServiceClient();
  if (!supabase) return unavailable(503);

  const { id } = await params;
  const { data, error } = await supabase
    .from("k_kut_audio_qc")
    .select("*")
    .limit(500);

  if (error) return unavailable(503);

  const queue = normalizeGovernedQueueRows(data || []);
  const item = queue.find((candidate) => candidate.id === id);
  if (!item) return unavailable();

  const { data: signed, error: signedError } = await supabase.storage
    .from(item.sourceAudioBucket)
    .createSignedUrl(item.sourceAudioPath, 300);

  if (signedError || !signed?.signedUrl) return unavailable(503);

  const response = NextResponse.redirect(signed.signedUrl, 307);
  for (const [name, value] of Object.entries(PRIVATE_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}
