import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const intentMap: Record<string, string[]> = {
  grief: [
    "grief", "loss", "lost", "passed", "died", "funeral", "mourning",
    "sorry", "condolence", "comfort", "gentle", "support", "presence"
  ],
  distance: [
    "miss", "missing", "far", "away", "distance", "wish i was there",
    "thinking of you", "longing", "connection", "together"
  ],
  love: [
    "love", "romantic", "heart", "warm", "tender", "care", "affection",
    "us", "together", "forever", "intimate"
  ],
  apology: [
    "sorry", "apology", "forgive", "wrong", "hurt", "repair",
    "peace", "soft", "honest", "regret"
  ],
  celebration: [
    "birthday", "anniversary", "celebrate", "party", "joy", "happy",
    "proud", "cheer", "bright", "big moment"
  ],
  support: [
    "support", "you got this", "believe", "strong", "encourage",
    "hold on", "hope", "courage", "steady"
  ],
  sad: [
    "sad", "heartbreak", "lonely", "alone", "cry", "pain",
    "miss", "loss", "blue", "down"
  ],
  hype: [
    "hype", "energy", "drive", "pump", "power", "win",
    "go", "move", "fire", "intense"
  ],
  calm: [
    "calm", "soft", "peaceful", "gentle", "quiet", "safe",
    "breathe", "still", "rest"
  ],
  visual: [
    "cinematic", "film", "scene", "visual", "trailer", "ad",
    "montage", "memory", "slow motion", "close up"
  ]
};

function expandQuery(raw: string): string[] {
  const q = raw.toLowerCase().trim();
  const words = q.split(/[^a-z0-9']+/).filter(Boolean);
  const expanded = new Set<string>();

  for (const word of words) expanded.add(word);

  for (const [intent, terms] of Object.entries(intentMap)) {
    if (
      q.includes(intent) ||
      terms.some((term) => q.includes(term))
    ) {
      expanded.add(intent);
      terms.forEach((term) => expanded.add(term));
    }
  }

  // Presence doctrine: people send moments because they cannot be there.
  if (
    q.includes("card") ||
    q.includes("emoji") ||
    q.includes("text") ||
    q.includes("bitmoji") ||
    q.includes("wish i was there") ||
    q.includes("thinking of you")
  ) {
    ["presence", "connection", "support", "warm", "personal", "felt"].forEach((t) =>
      expanded.add(t)
    );
  }

  return Array.from(expanded).slice(0, 40);
}

function safeIlike(term: string) {
  return term.replace(/[%_,]/g, " ");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({
        query: q,
        expanded_terms: [],
        count: 0,
        moments: []
      });
    }

    const terms = expandQuery(q).map(safeIlike);

    const filters = terms
      .flatMap((t) => [
        `title.ilike.%${t}%`,
        `description.ilike.%${t}%`,
        `kut_title.ilike.%${t}%`,
        `product_or_offer.ilike.%${t}%`
      ])
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
      phrase: k.title || k.kut_title || "Untitled Moment",
      title: k.title || k.kut_title || "Untitled Moment",
      source_title: k.kut_title || k.title || "GPM source audio",
      description: k.description || k.product_or_offer || "",
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
    return NextResponse.json(
      { error: "Server error", detail: String(err) },
      { status: 500 }
    );
  }
}