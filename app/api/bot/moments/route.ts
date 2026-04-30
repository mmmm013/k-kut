import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🔥 Emotional expansion map (core of BB-BOT)
const emotionMap: Record<string, string[]> = {
  sad: ["sad", "heartbreak", "lonely", "loss", "miss", "pain"],
  love: ["love", "romantic", "heart", "warm", "affection"],
  happy: ["happy", "joy", "celebration", "smile", "bright"],
  angry: ["angry", "rage", "fire", "fight"],
  calm: ["calm", "soft", "peaceful", "gentle"],
  hype: ["hype", "energy", "drive", "intense"]
};

function expandQuery(q: string): string[] {
  const base = q.toLowerCase().split(/\s+/);
  let expanded = new Set<string>();

  base.forEach((word) => {
    expanded.add(word);

    if (emotionMap[word]) {
      emotionMap[word].forEach((e) => expanded.add(e));
    }
  });

  return Array.from(expanded);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase().trim();

    const terms = expandQuery(q);

    // 🔥 build OR query across ALL expanded terms
    const filters = terms
      .map((t) => `title.ilike.%${t}%,description.ilike.%${t}%`)
      .join(",");

    const { data, error } = await supabase
      .from("k_kuts")
      .select("*")
      .or(filters)
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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
      expanded_terms: terms,
      count: moments.length,
      moments
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}