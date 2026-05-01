import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACTIVE_STATUSES = new Set([
  "active",
  "approved",
  "published",
  "ready",
]);

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
  child: ["family", "care", "protect", "hope", "gentle", "support"],
  friend: ["support", "care", "presence", "thinking of you", "steady"],
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

  return Array.from(out).map((t) => t.trim()).filter(Boolean).slice(0, 60);
}

function pickAudioUrl(mk: any): string {
  return (
    mk.audio_url ||
    mk.mp3_url ||
    mk.clip_url ||
    mk.public_url ||
    mk.playback_url ||
    mk.url ||
    ""
  );
}

function isPlayable(url: string): boolean {
  return typeof url === "string" &&
    /^https?:\/\//i.test(url) &&
    /\.(mp3|wav|aiff|aif|m4a)(\?|$)/i.test(url);
}

function isRealActiveMk(mk: any): boolean {
  const status = String(mk.status || "").toLowerCase().trim();

  if (status && !ACTIVE_STATUSES.has(status)) return false;

  const title = String(mk.title || mk.phrase || mk.display_text || "").toLowerCase();

  if (title.includes("test example")) return false;
  if (title.includes("placeholder")) return false;
  if (title.includes("dummy")) return false;
  if (title.includes("sample only")) return false;

  const audioUrl = pickAudioUrl(mk);
  return isPlayable(audioUrl);
}

function searchableText(mk: any): string {
  return [
    mk.title,
    mk.phrase,
    mk.display_text,
    mk.description,
    mk.emotion_level,
    mk.feeling,
    mk.feeling_tag,
    mk.theme,
    mk.source_title,
    mk.source_track_title,
    mk.product_or_offer,
    mk.phrase_type,
    mk.tags,
  ]
    .filter(Boolean)
    .map((v) => typeof v === "string" ? v : JSON.stringify(v))
    .join(" ")
    .toLowerCase();
}

function scoreMk(mk: any, terms: string[]): number {
  const text = searchableText(mk);
  let score = Number(mk.keenness_score || 0);

  for (const term of terms) {
    const t = term.toLowerCase();
    if (!t) continue;

    if (text.includes(t)) score += 10;
  }

  if (text.includes("vocal")) score += 2;
  if (text.includes("hook")) score += 2;
  if (text.includes("support")) score += 2;
  if (text.includes("care")) score += 2;

  return score;
}

function toMoment(mk: any, terms: string[]) {
  const audioUrl = pickAudioUrl(mk);

  return {
    id: mk.id || mk.mk_id || mk.kut_id,
    phrase: mk.display_text || mk.phrase || mk.title || "mini-KUT Moment",
    title: mk.title || mk.display_text || mk.phrase || "mini-KUT Moment",
    source_title: mk.source_title || mk.source_track_title || mk.pix_title || "GPMx active mK",
    description: mk.description || "Active real-audio mini-KUT sample.",
    keenness_score: scoreMk(mk, terms),
    emotion_level: mk.emotion_level || mk.feeling || "",
    phrase_type: mk.phrase_type || "mK",
    audio_url: audioUrl,
    object_type: "mK",
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({
        query: q,
        source: "active_mks_only",
        expanded_terms: [],
        count: 0,
        moments: [],
      });
    }

    const terms = expand(q);

    const { data, error } = await supabase
      .from("mks")
      .select("*")
      .limit(500);

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          detail: "BB requires a public mks table/view with active real mKs and playable audio_url/mp3_url/clip_url.",
        },
        { status: 500 }
      );
    }

    const activePlayableMks = (data || []).filter(isRealActiveMk);

    if (activePlayableMks.length === 0) {
      return NextResponse.json({
        query: q,
        source: "active_mks_only",
        expanded_terms: terms,
        count: 0,
        moments: [],
        error: "No active playable mKs found. Add real active mKs with audio_url/mp3_url/clip_url before showing samples.",
      });
    }

    const scored = activePlayableMks
      .map((mk: any) => ({ mk, score: scoreMk(mk, terms) }))
      .sort((a: any, b: any) => b.score - a.score);

    const bestMatches = scored.filter((x: any) => x.score > Number(x.mk.keenness_score || 0));
    const selected = (bestMatches.length > 0 ? bestMatches : scored).slice(0, 5);

    const moments = selected.map((x: any) => toMoment(x.mk, terms));

    return NextResponse.json({
      query: q,
      source: "active_mks_only",
      expanded_terms: terms,
      count: moments.length,
      moments,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}
