import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

function tokenError(req: NextRequest) {
  const expected = process.env.MICHAEL_TP_ACCESS_TOKEN;
  const supplied = req.nextUrl.searchParams.get("token");

  if (!expected) return "Server missing MICHAEL_TP_ACCESS_TOKEN.";
  if (!supplied || supplied !== expected) return "Unauthorized TP access.";

  return null;
}

export async function GET(req: NextRequest) {
  const err = tokenError(req);
  if (err) return NextResponse.json({ error: err }, { status: 401 });

  try {
    const supabase = adminClient();

    const progress = await supabase
      .from("v_michael_kleigh_tp_progress")
      .select("*")
      .order("sequence_order", { ascending: true });

    if (!progress.error) {
      return NextResponse.json({ rows: progress.data || [] });
    }

    const queue = await supabase
      .from("v_michael_kleigh_tp_queue")
      .select("*")
      .order("sequence_order", { ascending: true });

    if (queue.error) {
      return NextResponse.json({ error: queue.error.message }, { status: 500 });
    }

    return NextResponse.json({ rows: queue.data || [] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown queue error." },
      { status: 500 }
    );
  }
}
