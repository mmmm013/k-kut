import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function terms(q: string) {
  const base = String(q || "").toLowerCase().split(/\s+/).filter(Boolean);
  const add: Record<string, string[]> = {
    mother: ["mom", "mama", "love", "care", "home", "heart", "family", "gentle"],
    mom: ["mother", "mama", "love", "care", "home", "heart"],
    love: ["heart", "miss", "care", "together", "forever"],
    happy: ["love", "bright", "joy", "smile", "dance", "good"],
    blue: ["sad", "miss", "lonely", "heart", "comfort"],
  };
  const set = new Set(base);
  base.forEach((b) => (add[b] || []).forEach((x) => set.add(x)));
  return [...set].slice(0, 20);
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") || "";
  const expanded = terms(q);

  let query = supabase
    .from("k_kuts")
    .select("kut_id,kut_title,delivered_url_or_path,capture_start_sec,capture_end_sec")
    .eq("product_or_offer", "mK")
    .eq("status_ok_or_broken", "active")
    .not("delivered_url_or_path", "is", null)
    .neq("delivered_url_or_path", "")
    .limit(8);

  if (expanded.length) {
    query = query.or(
      expanded.map((t) => `kut_title.ilike.%${t.replace(/[%_,]/g, "")}%`).join(",")
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const moments = (data || []).map((r: any) => ({
    id: r.kut_id,
    title: r.kut_title || "K-KUT Moment",
    mk_title: r.kut_title || "K-KUT Moment",
    display_text: r.kut_title || "A real-audio moment.",
    role: "mK",
    type: "mK",
    start_ms: typeof r.capture_start_sec === "number" ? r.capture_start_sec * 1000 : null,
    end_ms: typeof r.capture_end_sec === "number" ? r.capture_end_sec * 1000 : null,
    audio_url: r.delivered_url_or_path,
    mp3_url: r.delivered_url_or_path,
    clip_url: r.delivered_url_or_path,
    feel_score: 1,
  }));

  return NextResponse.json({
    query: q,
    source: "public.k_kuts_active_mks_delivered_url_or_path",
    expanded_terms: expanded,
    count: moments.length,
    moments,
    error: moments.length ? null : "No matching active playable mKs found.",
  });
}
