import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = getSupabase();

  if (!supabase) {
    return NextResponse.json(
      {
        id,
        status: "unavailable",
        error:
          "HUG lookup is temporarily unavailable because Supabase environment variables are not available to this deployment.",
      },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("hugs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      {
        id,
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        id,
        status: "not_found",
        error: "HUG not found.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id,
    status: "ok",
    hug: data,
  });
}
