import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function words(input: string) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function expandTerms(q: string) {
  const base = words(q);
  const extra: Record<string, string[]> = {
    mother: ["mom", "mama", "love", "care", "home", "heart", "family", "gentle"],
    mom: ["mother", "mama", "love", "care", "home", "heart", "family"],
    blue: ["sad", "heartbreak", "lonely", "miss", "loss", "pain", "soft", "comfort"],
    love: ["heart", "hold", "care", "miss", "together", "forever"],
    hospital: ["sick", "support", "healing", "care", "comfort", "hope", "family"],
    birthday: ["celebrate", "happy", "party", "wish", "joy"],
  };

  const set = new Set<string>(base);
  for (const b of base) for (const e of extra[b] || []) set.add(e);
  return [...set].slice(0, 20);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const terms = expandTerms(q);

    let query = supabase
      .from("k_kuts")
      .select("kut_id,kut_title,product_or_offer,status_ok_or_broken,delivered_url_or_path,capture_start_sec,capture_end_sec")
      .eq("product_or_offer", "mK")
      .in("status_ok_or_broken", ["active", "approved", "ready", "published"])
      .not("delivered_url_or_path", "is", null)
      .neq("delivered_url_or_path", "")
      .limit(8);

    if (terms.length > 0) {
      const ors = terms
        .map((t) => `kut_title.ilike.%${t.replace(/[%_,]/g, "")}%`)
        .join(",");
      query = query.or(ors);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Supabase query error", detail: error.message },
        { status: 500 }
      );
    }

    const rows = data || [];

    const moments = rows.map((r: any) => ({
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
      expanded_terms: terms,
      count: moments.length,
      moments,
      error: moments.length ? null : "No matching active playable mKs found.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", detail: String(err) },
      { status: 500 }
    );
  }
}
