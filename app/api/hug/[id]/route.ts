import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type HugRow = Record<string, unknown> & {
  id?: string;
  kut_id?: string;
  k_kut_id?: string;
  audio_url?: string;
  mp3_url?: string;
  clip_url?: string;
};

type AudioQcRow = {
  kut_id: string;
  delivered_url_or_path: string;
  audio_status: string;
  audio_verified_at: string | null;
  audio_http_status: number | null;
  audio_content_type: string | null;
  storage_object_name: string | null;
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

function isSafePlayableUrl(value: string | null) {
  const raw = value?.trim().toLowerCase();
  if (!raw) return false;
  if (!raw.startsWith("https://")) return false;
  if (!raw.includes(".mp3")) return false;
  if (raw.includes("instro") || raw.includes("instrumental") || raw.includes("mk-products") || raw.includes("/mks/") || raw.includes("mini") || raw.endsWith(".wav")) return false;
  return true;
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

  let playable: AudioQcRow | null = null;

  if (kutId) {
    const { data: qcRow } = await supabase
      .from("k_kut_audio_qc")
      .select("kut_id, delivered_url_or_path, audio_status, audio_verified_at, audio_http_status, audio_content_type, storage_object_name")
      .eq("kut_id", kutId)
      .eq("audio_status", "playable")
      .maybeSingle();

    playable = qcRow as AudioQcRow | null;
  }

  const verifiedAudioUrl = playable?.delivered_url_or_path ?? "";
  const verifiedPlayable = Boolean(
    playable &&
      playable.audio_http_status === 200 &&
      playable.audio_content_type?.startsWith("audio/") &&
      isSafePlayableUrl(verifiedAudioUrl)
  );

  return NextResponse.json({
    id,
    status: "ok",
    hug: {
      ...hug,
      audio_url: verifiedPlayable ? verifiedAudioUrl : "",
      mp3_url: verifiedPlayable ? verifiedAudioUrl : "",
      clip_url: "",
      audio_status: verifiedPlayable ? "playable" : "unverified",
      audio_verified_at: verifiedPlayable ? playable?.audio_verified_at : null,
      audio_http_status: verifiedPlayable ? playable?.audio_http_status : null,
      audio_content_type: verifiedPlayable ? playable?.audio_content_type : null,
      storage_object_name: verifiedPlayable ? playable?.storage_object_name : null,
      raw_audio_url_blocked: rawAudioUrl && rawAudioUrl !== verifiedAudioUrl,
    },
  });
}
