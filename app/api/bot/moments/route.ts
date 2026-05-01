import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const brain: Record<string, string[]> = {
  encourage: ["support", "strong", "strength", "hope", "believe", "keep going", "you got this", "proud", "steady", "rise"],
  sick: ["support", "healing", "get well", "hospital", "care", "comfort", "gentle", "hope", "presence", "family"],
  grief: ["loss", "sorry", "condolence", "comfort", "gentle", "mourning", "presence", "support", "peace", "memory"],
  sad: ["heartbreak", "lonely", "miss", "loss", "blue", "pain", "soft", "comfort", "gentle", "presence"],
  miss: ["missing", "distance", "wish i was there", "longing", "together", "memory", "heart", "presence", "connection"],
  love: ["romantic", "heart", "warm", "care", "tender", "intimate", "together", "forever", "devotion"],
  apology: ["sorry", "forgive", "regret", "repair", "honest", "soft", "peace", "hurt", "reconcile"],
  birthday: ["happy", "celebrate", "joy", "bright", "party", "gift", "special", "smile"],
  anniversary: ["love", "memory", "together", "forever", "romantic", "gratitude", "heart"],
  thanks: ["thank you", "gratitude", "appreciation", "honor", "kindness", "warm"],
  proud: ["congratulations", "proud", "achievement", "win", "strong", "rise", "big moment"],
  hustle: ["drive", "energy", "work", "grind", "power", "win", "move", "fire", "focus"],
  card: ["message", "send", "feeling", "presence", "care", "personal", "thinking of you"],
  text: ["message", "quick", "send", "feeling", "presence", "personal", "care"],
  song: ["vocal", "hook", "phrase", "section", "chorus", "voice", "melody"],
};

function expand(raw: string): string[] {
  const q = raw.toLowerCase().trim();
  const words = q.split(/[^a-z0-9']+/).filter(Boolean);
  const out = new Set<string>();

  for (const word of words) out.add(word);

  for (const [key, values] of Object.entries(brain)) {
    if (q.includes(key) || values.some((v) => q.includes(v))) {
      out.add(key);
      values.forEach((v) => out.add(v));
    }
  }

  if (q.includes("friend")) ["support", "care", "presence", "thinking of you"].forEach((v) => out.add(v));
  if (q.includes("wife") || q.includes("husband")) ["love", "support", "family", "devotion"].forEach((v) => out.add(v));
  if (q.includes("daughter") || q.includes("girls") || q.includes("kids")) ["family", "care", "protect", "hope"].forEach((v) => out.add(v));
  if (q.includes("can't be there") || q.includes("wish i was there")) ["presence", "distance", "support", "connection"].forEach((v) => out.add(v));

  return Array.from(out).slice(0, 50);
}

function clean(term: string) {
  return term.replace(/[%_,]/g, " ").trim();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({ query: q, expanded_terms: [], count: 0, moments: [] });
    }

    const terms = expand(q).map(clean).filter(Boolean);

    const filters = terms
      .flatMap((t) => [
        `title.ilike.%${t}%`,
        `description.ilike.%${t}%`,
        `kut_title.ilike.%${t}%`,
        `product_or_offer.ilike.%${t}%`
      ])
      .join(",");

    let { data, error } = await supabase
      .from("k_kuts")
      .select("*")
      .or(filters)
      .limit(20);

    if (!error && (!data || data.length === 0)) {
      const fallback = await supabase
        .from("k_kuts")
        .select("*")
        .limit(20);

      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const moments = (data || []).map((k: any) => ({
      id: k.kut_id || k.id,
      phrase: k.title || k.kut_title || "K-KUT Moment",
      title: k.title || k.kut_title || "K-KUT Moment",
      source_title: k.kut_title || k.title || "GPM source audio",
      description: k.description || k.product_or_offer || "A real song moment BB selected for this feeling.",
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
  } catch (err) {
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}
