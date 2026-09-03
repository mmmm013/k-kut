import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeGovernedQueueRows } from "@/lib/admin/kutReviewer";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const expected = process.env.ADMIN_PREVIEW_TOKEN?.trim();
  const supplied =
    request.headers.get("x-admin-token")?.trim() ||
    request.nextUrl.searchParams.get("token")?.trim();
  return Boolean(expected && supplied && supplied === expected);
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

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "server_supabase_connection_not_configured" },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("k_kut_audio_qc")
    .select("*")
    .limit(500);

  if (error) {
    return NextResponse.json(
      { error: "governed_queue_read_failed", detail: error.message },
      { status: 502 },
    );
  }

  const queue = normalizeGovernedQueueRows(data || []);

  return NextResponse.json({
    queue,
    total: queue.length,
    source: "supabase.k_kut_audio_qc",
  });
}
