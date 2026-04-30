import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase().trim();

    const { data, error } = await supabase
      .from("k_kuts")
      .select("*")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // normalize to "moment" shape
    const moments = (data || []).map((k: any) => ({
      id: k.id,
      phrase: k.title,
      source_title: k.title,
      keenness_score: k.keenness_score || 0,
      emotion_level: k.emotion_level || "",
      audio_url: k.audio_url || ""
    }));

    return NextResponse.json({
      query: q,
      count: moments.length,
      moments
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
