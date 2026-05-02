import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type KutRow = {
  kut_id: string;
  kut_title: string | null;
  product_or_offer: string | null;
  status_ok_or_broken: string | null;
  capture_start_sec: number | null;
  capture_end_sec: number | null;
  delivered_url_or_path: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const supabase = createClient(supabaseUrl, supabaseKey);

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function isMotherSearch(q: string) {
  const n = normalize(q);
  return (
    n.includes("mother") ||
    n.includes("mom") ||
    n.includes("mama") ||
    n.includes("mum") ||
    n.includes("mommy") ||
    n.includes("mothers day") ||
    n.includes("mother's day") ||
    n.includes("thank you mom") ||
    n.includes("miss you mom") ||
    n.includes("just for you")
  );
}

function expandedTermsFor(q: string) {
  const n = normalize(q);

  if (isMotherSearch(n)) {
    return [
      "mother",
      "mom",
      "mama",
      "thank you",
      "BELIEVE IN LOVE",
      "LOVE RENEWS",
      "love",
      "care",
      "home",
      "heart",
      "family",
      "gentle",
    ];
  }

  if (!n) {
    return ["love", "heart", "family", "home"];
  }

  return Array.from(
    new Set([
      q,
      n,
      "love",
      "heart",
      "feeling",
      "home",
      "care",
    ])
  );
}

async function fetchByTitleTerm(term: string, limit: number) {
  const { data, error } = await supabase
    .from("k_kuts")
    .select(
      "kut_id,kut_title,product_or_offer,status_ok_or_broken,capture_start_sec,capture_end_sec,delivered_url_or_path"
    )
    .eq("product_or_offer", "mK")
    .eq("status_ok_or_broken", "active")
    .not("delivered_url_or_path", "is", null)
    .ilike("kut_title", `%${term}%`)
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data || []) as KutRow[];
}

function dedupeRows(rows: KutRow[]) {
  const seen = new Set<string>();
  const clean: KutRow[] = [];

  for (const row of rows) {
    const key = row.kut_id || row.delivered_url_or_path || row.kut_title || "";
    if (!key || seen.has(key)) continue;
    if (!row.delivered_url_or_path) continue;
    seen.add(key);
    clean.push(row);
  }

  return clean;
}

function cleanDisplayTitle(raw: string | null) {
  const original = raw || "K-KUT Moment";

  const withoutNumberArtistPrefix = original.replace(
    /^\s*\d+\s*-\s*[^-]+\s*-\s*/u,
    ""
  );

  return withoutNumberArtistPrefix
    .replace(/\s+/g, " ")
    .replace(/\s+—\s+/g, " — ")
    .trim();
}

function toMoment(r: KutRow) {
  const displayTitle = cleanDisplayTitle(r.kut_title);

  return {
    id: r.kut_id,
    title: displayTitle,
    mk_title: displayTitle,
    display_text: displayTitle || "A real-audio moment.",
    role: "mK",
    type: "mK",
    start_ms:
      typeof r.capture_start_sec === "number"
        ? r.capture_start_sec * 1000
        : null,
    end_ms:
      typeof r.capture_end_sec === "number"
        ? r.capture_end_sec * 1000
        : null,
    audio_url: r.delivered_url_or_path,
    mp3_url: r.delivered_url_or_path,
    clip_url: r.delivered_url_or_path,
    feel_score: 1,
  };
}

export async function GET(req: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        query: "",
        source: "public.k_kuts_active_mks_delivered_url_or_path",
        expanded_terms: [],
        count: 0,
        moments: [],
        error:
          "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const expanded = expandedTermsFor(q);

  try {
    const rows: KutRow[] = [];

    if (isMotherSearch(q)) {
      const priorityTerms = [
        "THANK YOU",
        "BELIEVE IN LOVE",
        "LOVE RENEWS",
      ];

      for (const term of priorityTerms) {
        rows.push(...(await fetchByTitleTerm(term, 12)));
      }

      const fallbackTerms = ["mother", "mom", "mama", "love", "family", "heart"];
      for (const term of fallbackTerms) {
        rows.push(...(await fetchByTitleTerm(term, 8)));
      }
    } else {
      for (const term of expanded) {
        rows.push(...(await fetchByTitleTerm(term, 8)));
      }
    }

    const moments = dedupeRows(rows).slice(0, 8).map(toMoment);

    return NextResponse.json({
      query: q,
      source: "public.k_kuts_active_mks_delivered_url_or_path",
      display_cleanup: "artist-prefix-v2",
      priority:
        isMotherSearch(q)
          ? [
              "THANK YOU",
              "BELIEVE IN LOVE",
              "LOVE RENEWS",
              "fallback mother/mom/love/family",
            ]
          : ["query terms", "fallback emotional terms"],
      expanded_terms: expanded,
      count: moments.length,
      moments,
      error: moments.length ? null : "No matching active playable mKs found.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        query: q,
        source: "public.k_kuts_active_mks_delivered_url_or_path",
        display_cleanup: "artist-prefix-v2",
        expanded_terms: expanded,
        count: 0,
        moments: [],
        error: error?.message || "Unknown API error.",
      },
      { status: 500 }
    );
  }
}
