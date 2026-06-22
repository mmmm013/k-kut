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

function checkToken(token: unknown) {
  const expected = process.env.MICHAEL_TP_ACCESS_TOKEN;

  if (!expected) return "Server missing MICHAEL_TP_ACCESS_TOKEN.";
  if (typeof token !== "string" || token !== expected) return "Unauthorized TP access.";

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const err = checkToken(body.token);
    if (err) return NextResponse.json({ error: err }, { status: 401 });

    if (!body.taskId) {
      return NextResponse.json({ error: "Missing taskId." }, { status: 400 });
    }

    const transitionSec = Number(body.transitionSec);
    if (!Number.isFinite(transitionSec) || transitionSec < 0) {
      return NextResponse.json({ error: "Invalid transitionSec." }, { status: 400 });
    }

    const supabase = adminClient();

    const { data, error } = await supabase.rpc("record_tp_mark", {
      p_task_id: body.taskId,
      p_transition_sec: transitionSec,
      p_from_blk_label: body.fromBlkLabel || null,
      p_to_blk_label: body.toBlkLabel || null,
      p_note: body.note || null,
      p_bot_note: body.botNote || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, markId: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown TP mark error." },
      { status: 500 }
    );
  }
}
