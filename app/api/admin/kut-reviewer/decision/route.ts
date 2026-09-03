import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  clampNoTrespassEnd,
  mapDecisionToPatch,
  normalizeGovernedQueueRows,
  type ReviewerAction,
} from "@/lib/admin/kutReviewer";

export const dynamic = "force-dynamic";

const VALID_ACTIONS = new Set<ReviewerAction>(["APPROVE", "TRIM", "HOLD", "REJECT"]);

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

type RequestBody = {
  itemId?: string;
  action?: ReviewerAction;
  correctedEndSec?: number;
};

async function loadQueueRows(supabase: any): Promise<unknown[] | null> {
  const { data, error } = await supabase
    .from("k_kut_audio_qc")
    .select("*")
    .limit(500);

  if (error) return null;
  return data || [];
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as RequestBody | null;
  if (!body?.itemId || !body?.action || !VALID_ACTIONS.has(body.action)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "server_supabase_connection_not_configured" },
      { status: 503 },
    );
  }

  const rows = await loadQueueRows(supabase);
  if (!rows) {
    return NextResponse.json({ error: "governed_queue_read_failed" }, { status: 502 });
  }

  const queue = normalizeGovernedQueueRows(rows);
  const item = queue.find((candidate) => candidate.id === body.itemId);
  if (!item) {
    return NextResponse.json({ error: "item_not_found" }, { status: 404 });
  }

  const correctedEndSec = clampNoTrespassEnd(
    item.startSec,
    item.storedEndSec,
    body.correctedEndSec ?? item.correctedEndSec,
  );

  const patch = mapDecisionToPatch(body.action, correctedEndSec);

  const updateAttempt = await supabase
    .from("k_kut_audio_qc")
    .update(patch)
    .eq("id", item.id)
    .select("id")
    .limit(1);

  if (updateAttempt.error) {
    return NextResponse.json(
      { error: "decision_persist_failed", detail: updateAttempt.error.message },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, itemId: item.id, action: body.action, correctedEndSec });
}
