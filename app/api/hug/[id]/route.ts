import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { findApprovedPublicOptionByInventoryId } from "@/lib/publication-bridge/approvedPublicOptions";

export const dynamic = "force-dynamic";

type HugRow = Record<string, unknown> & {
  id?: string;
  kut_id?: string;
  k_kut_id?: string;
  audio_url?: string;
  mp3_url?: string;
  clip_url?: string;
};

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

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
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

  const hug = data as HugRow;
  const kutId = firstString(hug.kut_id, hug.k_kut_id, hug.id);
  const rawAudioUrl = firstString(hug.audio_url, hug.mp3_url, hug.clip_url);
  const currentOption = findApprovedPublicOptionByInventoryId(kutId);
  const verifiedPlayable = Boolean(
    currentOption &&
      currentOption.product_family === "HUG" &&
      currentOption.inventory_family === "KK",
  );
  const verifiedAudioUrl = verifiedPlayable
    ? currentOption?.audio_delivery_url || ""
    : "";

  return NextResponse.json({
    id,
    status: "ok",
    hug: {
      ...hug,
      audio_url: verifiedPlayable ? verifiedAudioUrl : "",
      mp3_url: verifiedPlayable ? verifiedAudioUrl : "",
      clip_url: "",
      audio_status: verifiedPlayable ? "current_ii_stage" : "current_ii_hold",
      audio_verified_at: null,
      audio_http_status: verifiedPlayable ? 200 : null,
      audio_content_type: verifiedPlayable ? "audio/mpeg" : null,
      storage_object_name: null,
      raw_audio_url_blocked: rawAudioUrl && rawAudioUrl !== verifiedAudioUrl,
    },
  });
}
