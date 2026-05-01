import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const brain: Record<string, string[]> = {
  encourage: ["support", "strong", "strength", "hope", "believe", "keep going", "you got this", "proud", "steady", "rise"],
  sick: ["support", "healing", "hospital", "care", "comfort", "gentle", "hope", "presence", "family"],
  hospital: ["support", "healing", "sick", "care", "comfort", "gentle", "hope", "family"],
  grief: ["loss", "sorry", "condolence", "comfort", "gentle", "mourning", "presence", "support", "peace", "memory"],
  sad: ["heartbreak", "lonely", "miss", "loss", "blue", "pain", "soft", "comfort", "gentle", "presence"],
  miss: ["missing", "distance", "wish i was there", "longing", "together", "memory", "heart", "presence", "connection"],
  love: ["romantic", "heart", "warm", "care", "tender", "intimate", "together", "forever", "devotion"],
  apology: ["sorry", "forgive", "regret", "repair", "honest", "soft", "peace", "hurt", "reconcile"],
  birthday: ["happy", "celebrate", "joy", "bright", "party", "gift", "special", "smile"],
  anniversary: ["love", "memory", "together", "forever", "romantic", "gratitude", "heart"],
  thanks: ["thank you", "gratitude", "appreciation", "honor", "kindness", "warm"],
  proud: ["congratulations", "proud", "achievement", "win", "strong", "rise", "big moment"],
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
  if (q.includes("child") || q.includes("daughter") || q.includes("son") || q.includes("kids")) ["family", "care", "protect", "hope"].forEach((v) => out.add(v));
  if (q.includes("wife") || q.includes("husband")) ["love", "support", "family", "devotion"].forEach((v) => out.add(v));
  if (q.includes("can't be there") || q.includes("wish i was there")) ["presence", "distance", "support", "connection"].forEach((v) => out.add(v));

  return Array.from(out).slice(0, 50);
}

function clean(term: string) {
  return term.replace(/[%_,]/g, " ").trim();
}

function pickTrackUrl(track: any): string {
  return (
    track?.mp3_url ||
    track?.audio_url ||
    track?.public_url ||
    track?.url ||
    track?.source_path ||
    ""
  );
}

function isPlayable(url: string): boolean {
  return typeof url === "string" && /^https?:\/\//i.test(url) && /\.(mp3|wav|aiff|aif)(\?|$)/i.test(url);
}

function scoreText(text: string, terms: string[]) {
  const hay = text.toLowerCase();
  let score = 0;

  for (const term of terms) {
    const t = term.toLowerCase();
    if (!t) continue;
    if (hay.includes(t)) score += 10;
  }

  return score;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({ query: q, expanded_terms: [], count: 0, moments: [] });
    }

    const terms = expand(q).map(clean).filter(Boolean);

    const { data: tracks, error: trackError } = await supabase
      .from("tracks")
      .select("*")
      .limit(500);

    if (trackError) {
      return NextResponse.json({ error: trackError.message }, { status: 500 });
    }

    const playableTracks = (tracks || [])
      .map((t: any) => ({ ...t, playback_url: pickTrackUrl(t) }))
      .filter((t: any) => isPlayable(t.playback_url));

    if (playableTracks.length === 0) {
      return NextResponse.json({
        query: q,
        expanded_terms: terms,
        count: 0,
        moments: [],
        error: "No playable audio found in public.tracks. Add mp3_url or audio_url values from Supabase Storage / tracks.",
      });
    }

    const filters = terms
      .flatMap((t) => [
        `title.ilike.%${t}%`,
        `description.ilike.%${t}%`,
        `kut_title.ilike.%${t}%`,
        `product_or_offer.ilike.%${t}%`
      ])
      .join(",");

    let { data: kcuts, error: kError } = await supabase
      .from("k_kuts")
      .select("*")
      .or(filters)
      .limit(20);

    if (kError) {
      return NextResponse.json({ error: kError.message }, { status: 500 });
    }

    if (!kcuts || kcuts.length === 0) {
      const fallback = await supabase.from("k_kuts").select("*").limit(20);
      kcuts = fallback.data || [];
    }

    const trackById = new Map<string, any>();
    for (const t of playableTracks) {
      if (t.id) trackById.set(String(t.id), t);
    }

    const linkedMoments = (kcuts || [])
      .map((k: any) => {
        const track = k.track_id ? trackById.get(String(k.track_id)) : null;
        const audioUrl = track ? track.playback_url : "";

        if (!audioUrl) return null;

        return {
          id: k.kut_id || k.id,
          phrase: k.title || k.kut_title || "K-KUT Moment",
          title: k.title || k.kut_title || "K-KUT Moment",
          source_title: track?.title || k.kut_title || k.title || "GPM source audio",
          description: k.description || k.product_or_offer || "A real song moment BB selected for this feeling.",
          keenness_score: k.keenness_score || 0,
          emotion_level: k.emotion_level || "",
          audio_url: audioUrl,
        };
      })
      .filter(Boolean);

    let moments = linkedMoments;

    if (moments.length === 0) {
      moments = playableTracks
        .map((t: any) => {
          const text = [t.title, t.description, t.source_path, t.mp3_url, t.audio_url].filter(Boolean).join(" ");
          return {
            score: scoreText(text, terms),
            id: t.id,
            phrase: t.title || "GPM PIX Audio Sample",
            title: t.title || "GPM PIX Audio Sample",
            source_title: "PIX source audio from SB/tracks",
            description: "Playable source-audio sample. K-KUT lineage link still needs track_id assignment.",
            keenness_score: scoreText(text, terms),
            emotion_level: "",
            audio_url: t.playback_url,
          };
        })
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 5)
        .map(({ score, ...m }: any) => m);
    }

    return NextResponse.json({
      query: q,
      expanded_terms: terms,
      count: moments.length,
      moments,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}
