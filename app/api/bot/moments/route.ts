import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import mothersDayPromo from "@/promos/mothers-day.json";

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

type PromoConfig = {
  promo_id: string;
  holiday_name: string;
  default_source_title: string;
  fallback_policy: string;
  customer_rule: string;
  allowed_units: string[];
  display_titles: Record<string, string>;
};

const promo = mothersDayPromo as PromoConfig;

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
    return ["mother", "mom", "mama", promo.default_source_title.toLowerCase()];
  }

  if (!n) {
    return ["love", "heart", "family", "home"];
  }

  return Array.from(
    new Set([q, n, "love", "heart", "feeling", "home", "care"])
  );
}

async function fetchHolidaySourceOnly(limit: number) {
  const sourceTitle = promo.default_source_title.toUpperCase();

  const { data, error } = await supabase
    .from("k_kuts")
    .select(
      "kut_id,kut_title,product_or_offer,status_ok_or_broken,capture_start_sec,capture_end_sec,delivered_url_or_path"
    )
    .eq("status_ok_or_broken", "active")
    .not("delivered_url_or_path", "is", null)
    .ilike("kut_title", `%${promo.default_source_title}%`)
    .order("capture_start_sec", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return ((data || []) as KutRow[]).filter((row) => {
    const title = (row.kut_title || "").toUpperCase();

    const isDefaultSource =
      title.includes(sourceTitle) ||
      title.includes(sourceTitle.replace(/\s+/g, "")) ||
      title.includes(sourceTitle.replace(/\s+/g, "-"));

    const isAllowedScriptedUnit =
      title.includes("MVERSE") ||
      title.includes("VERSE") ||
      title.includes("CONTIGUOUS CHORUS") ||
      title.includes("CHORUS") ||
      title.includes("OUTRO") ||
      title.includes("BITE") ||
      title.includes("SCRIPT");

    const isAllowedHolidayProduct =
      row.product_or_offer !== "mK" || isAllowedScriptedUnit;

    return isDefaultSource && isAllowedHolidayProduct;
  });
}

async function fetchStandardSearch(term: string, limit: number) {
  const { data, error } = await supabase
    .from("k_kuts")
    .select(
      "kut_id,kut_title,product_or_offer,status_ok_or_broken,capture_start_sec,capture_end_sec,delivered_url_or_path"
    )
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

function scriptedHolidayDisplayTitle(row: KutRow) {
  const title = cleanDisplayTitle(row.kut_title);
  const upper = title.toUpperCase();

  if (upper.includes("MVERSE")) return promo.display_titles.mVerse;
  if (upper.includes("CONTIGUOUS CHORUS")) {
    return promo.display_titles.contiguous_chorus;
  }
  if (upper.includes("CHORUS 3")) return promo.display_titles.chorus_3;
  if (upper.includes("OUTRO")) return promo.display_titles.outro;
  if (upper.includes("VERSE 1")) return promo.display_titles.verse_1;
  if (upper.includes("VERSE 2")) return promo.display_titles.verse_2;
  if (upper.includes("BITE")) return promo.display_titles.bite_size_hug;

  return title
    .replace(/THANKS/gi, promo.default_source_title)
    .replace(/THANKYOU/gi, promo.default_source_title)
    .replace(/THANK-YOU/gi, promo.default_source_title);
}

function toMoment(r: KutRow, holidayMode = false) {
  const displayTitle = holidayMode
    ? scriptedHolidayDisplayTitle(r)
    : cleanDisplayTitle(r.kut_title);

  return {
    id: r.kut_id,
    title: displayTitle,
    mk_title: displayTitle,
    display_text: displayTitle || "A real-audio moment.",
    role: r.product_or_offer || "K-KUT",
    type: r.product_or_offer || "K-KUT",
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
        source: "public.k_kuts_active_delivered_url_or_path",
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
  const holidayMode = isMotherSearch(q);

  try {
    const rows: KutRow[] = [];

    if (holidayMode) {
      rows.push(...(await fetchHolidaySourceOnly(40)));
    } else {
      for (const term of expanded) {
        rows.push(...(await fetchStandardSearch(term, 8)));
      }
    }

    const moments = dedupeRows(rows)
      .slice(0, 8)
      .map((row) => toMoment(row, holidayMode));

    return NextResponse.json({
      query: q,
      source: "public.k_kuts_active_delivered_url_or_path",
      promo_id: holidayMode ? promo.promo_id : null,
      promo_config_source: holidayMode ? "promos/mothers-day.json" : null,
      display_cleanup: "artist-prefix-v4-config",
      holiday_product_rule: holidayMode
        ? promo.customer_rule
        : "Standard search may include available products.",
      fallback_policy: holidayMode ? promo.fallback_policy : "standard_search",
      expanded_terms: expanded,
      priority: holidayMode
        ? [
            `${promo.default_source_title} scripted inventory only`,
            ...promo.allowed_units,
          ]
        : ["query terms", "fallback emotional terms"],
      count: moments.length,
      moments,
      error: moments.length
        ? null
        : holidayMode
          ? `${promo.holiday_name} ${promo.default_source_title} scripted inventory is not loaded yet.`
          : "No matching active playable K-KUT products found.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        query: q,
        source: "public.k_kuts_active_delivered_url_or_path",
        promo_id: holidayMode ? promo.promo_id : null,
        promo_config_source: holidayMode ? "promos/mothers-day.json" : null,
        display_cleanup: "artist-prefix-v4-config",
        expanded_terms: expanded,
        count: 0,
        moments: [],
        error: error?.message || "Unknown API error.",
      },
      { status: 500 }
    );
  }
}
