import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BRIEF = {
  slug: "async-placement",
  description: "Asynchronous emotional placement: a sendable, later-received, human-feeling audio placement/message. Not bot dialog. Not live conversation.",
  required_separation: {
    pix_pool: "GPMC canonical PIX only: Supabase tracks bucket and source catalog rows",
    kk_pool: "KK inventory only",
    forbidden: ["bot dialog", "voice prompt", "UI prompt", "public/voices", "public/audio guide-final", "local Downloads prompts"]
  }
};

const SIGNALS = {
  strongMeaning: [
    "send", "sent", "message", "letter", "words", "talk", "talking", "listen", "hear",
    "remember", "memory", "time", "later", "wait", "phone", "call", "still", "always",
    "for you", "to you", "with you", "by your side", "hope you know", "i believe",
    "i do swear", "i'll always be around", "right here"
  ],
  emotion: [
    "feeling", "feel", "heart", "hope", "believe", "trust", "home", "side", "around",
    "friend", "together", "love", "missing", "miss", "alone", "inside"
  ],
  placementUse: [
    "card", "gift", "hug", "sendable", "recipient", "delivery", "link", "personal",
    "message delivery", "async", "asynchronous", "placed", "placement"
  ],
  hardBlocks: [
    "bot", "dialog", "prompt", "welcome", "checkout", "demo", "start hug",
    "go back", "question", "preview", "ui", "guide"
  ],
  likelyBadPixForThisBrief: [
    "cover", "instro", "instrumental", "test", "snippet", "demo", "christmas",
    "stomp", "war", "vengeance", "death", "devil", "pirates", "nascAR"
  ]
};

const ATVL_WEIGHTS = {
  title: 0.20,
  catalogMetadata: 0.20,
  lyricsMeaning: 0.25,
  audioStructure: 0.20,
  reviewEvidence: 0.15
};

function norm(v) {
  return String(v ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, terms) {
  const t = norm(text);
  return terms.filter((term) => t.includes(norm(term)));
}

function scoreBucket(text, terms, maxPoints) {
  const hits = includesAny(text, terms);
  if (!hits.length) return { points: 0, hits };
  const raw = hits.reduce((sum, h) => sum + Math.min(8, Math.max(2, h.length / 2)), 0);
  return { points: Math.min(maxPoints, raw), hits: [...new Set(hits)] };
}

function atvlScore({ titleText, metadataText, lyricsText, audioText, reviewText }) {
  const title = scoreBucket(titleText, [...SIGNALS.strongMeaning, ...SIGNALS.emotion], 20);
  const metadata = scoreBucket(metadataText, [...SIGNALS.strongMeaning, ...SIGNALS.emotion, ...SIGNALS.placementUse], 20);
  const lyrics = scoreBucket(lyricsText, [...SIGNALS.strongMeaning, ...SIGNALS.emotion], 25);
  const audio = scoreBucket(audioText, ["vocal", "lt-pix", "section", "phrase", "hook", "chorus", "verse", "complete", "resolved"], 20);
  const review = scoreBucket(reviewText, ["approved", "reviewed", "usable", "complete thought", "sincere", "human", "personal"], 15);

  const blockText = [titleText, metadataText, lyricsText, audioText, reviewText].join(" ");
  const blocks = [
    ...includesAny(blockText, SIGNALS.hardBlocks),
    ...includesAny(titleText, SIGNALS.likelyBadPixForThisBrief)
  ];

  let total = title.points + metadata.points + lyrics.points + audio.points + review.points;
  if (blocks.length) total -= Math.min(40, blocks.length * 10);

  const evidenceKinds = [
    title.points > 0 ? "title" : null,
    metadata.points > 0 ? "metadata" : null,
    lyrics.points > 0 ? "lyrics_meaning" : null,
    audio.points > 0 ? "audio_structure" : null,
    review.points > 0 ? "review" : null
  ].filter(Boolean);

  let status = "reject";
  if (total >= 55 && evidenceKinds.includes("lyrics_meaning")) status = "candidate_needs_listen";
  else if (total >= 35 && evidenceKinds.length >= 2) status = "weak_candidate_needs_review";
  else if (title.points > 0 && evidenceKinds.length === 1) status = "title_only_hold";

  return {
    total: Math.max(0, Math.round(total)),
    max_title_points: 20,
    buckets: { title, metadata, lyrics, audio, review },
    evidenceKinds,
    blocks: [...new Set(blocks)],
    status
  };
}

function durationOf(row) {
  for (const k of ["duration_sec", "delivered_duration_sec", "processed_duration_sec", "capture_duration_sec", "audio_duration_sec"]) {
    const n = Number(row?.[k]);
    if (Number.isFinite(n) && n > 0) return { value: n, source: k };
  }

  const s = Number(row?.capture_start_sec ?? row?.start_sec ?? row?.start_time_sec);
  const e = Number(row?.capture_end_sec ?? row?.end_sec ?? row?.end_time_sec);
  if (Number.isFinite(s) && Number.isFinite(e) && e > s) return { value: e - s, source: "end-start" };

  return { value: null, source: null };
}

async function listTracksPix() {
  const { data, error } = await supabase.storage
    .from("tracks")
    .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });

  if (error) throw error;

  return (data ?? [])
    .filter((x) => x?.name && /\.(mp3|wav|m4a|aiff?)$/i.test(x.name))
    .filter((x) => x.name !== "native-kut-apology")
    .map((x) => ({
      source_pool: "tracks_bucket",
      source_role: "PIX_ONLY",
      name: x.name,
      size: x.metadata?.size ?? null
    }));
}

async function fetchCatalogRows() {
  const possible = ["tracks", "gpmc_tracks", "gpmc_catalog", "audio_qc_results"];
  const found = [];

  for (const table of possible) {
    const res = await supabase.from(table).select("*").limit(5000);
    if (!res.error && Array.isArray(res.data)) {
      found.push({ table, rows: res.data });
    }
  }

  return found;
}

function mergeCatalogTextForPix(pix, catalogTables) {
  const key = norm(pix.name);
  const chunks = [];

  for (const { table, rows } of catalogTables) {
    for (const row of rows) {
      const rowBlob = norm(JSON.stringify(row));
      const candidateNames = [
        row.name,
        row.filename,
        row.storage_object_name,
        row.source_master_filename,
        row.delivered_url_or_path,
        row.title,
        row.track_title
      ].map(norm).filter(Boolean);

      if (candidateNames.some((n) => n && (n === key || n.includes(key) || key.includes(n)))) {
        chunks.push(`[${table}] ${JSON.stringify(row)}`);
      } else if (rowBlob.includes(key)) {
        chunks.push(`[${table}] ${JSON.stringify(row)}`);
      }
    }
  }

  return chunks.join("\n");
}

async function fetchKks() {
  const possible = ["k_kuts", "kk_inventory", "k_kut_inventory"];
  for (const table of possible) {
    const res = await supabase.from(table).select("*").limit(20000);
    if (!res.error && Array.isArray(res.data)) return { table, rows: res.data };
  }
  throw new Error("No KK inventory table found among k_kuts / kk_inventory / k_kut_inventory.");
}

function kkText(row) {
  return {
    titleText: [row.kut_title, row.title, row.name].join(" "),
    metadataText: [
      row.source_master_filename,
      row.source_pix,
      row.source_title,
      row.section_title,
      row.section_role,
      row.theme,
      row.intent,
      row.tags,
      row.metadata,
      row.notes
    ].map((x) => typeof x === "string" ? x : JSON.stringify(x ?? "")).join(" "),
    lyricsText: [
      row.lyrics,
      row.lyric_text,
      row.line_units,
      row.meaning_summary,
      row.whole_song_meaning_summary,
      row.transcript
    ].map((x) => typeof x === "string" ? x : JSON.stringify(x ?? "")).join(" "),
    audioText: [
      row.capture_start_sec,
      row.capture_end_sec,
      row.duration_sec,
      row.delivered_duration_sec,
      row.audio_content_type,
      row.audio_status,
      row.boundary_basis,
      row.boundary_status
    ].join(" "),
    reviewText: [
      row.review_notes,
      row.quality_status,
      row.approval_status,
      row.boundary_status,
      row.status
    ].map((x) => typeof x === "string" ? x : JSON.stringify(x ?? "")).join(" ")
  };
}

async function main() {
  const pix = await listTracksPix();
  const catalogTables = await fetchCatalogRows();

  const scoredPix = pix.map((p) => {
    const catalogText = mergeCatalogTextForPix(p, catalogTables);
    const score = atvlScore({
      titleText: p.name,
      metadataText: catalogText,
      lyricsText: catalogText,
      audioText: catalogText,
      reviewText: catalogText
    });

    return {
      ...p,
      atvl: score.total,
      status: score.status,
      evidence: score.evidenceKinds,
      title_points: score.buckets.title.points,
      metadata_points: score.buckets.metadata.points,
      lyrics_meaning_points: score.buckets.lyrics.points,
      audio_structure_points: score.buckets.audio.points,
      review_points: score.buckets.review.points,
      hits: {
        title: score.buckets.title.hits,
        metadata: score.buckets.metadata.hits,
        lyrics_meaning: score.buckets.lyrics.hits,
        audio_structure: score.buckets.audio.hits,
        review: score.buckets.review.hits
      },
      blocks: score.blocks
    };
  })
  .filter((x) => x.atvl > 0)
  .sort((a, b) => b.atvl - a.atvl || String(a.name).localeCompare(String(b.name)));

  const topPix = scoredPix.slice(0, 5);

  const { table, rows } = await fetchKks();

  const scoredKks = rows.map((row) => {
    const d = durationOf(row);
    const text = kkText(row);
    const score = atvlScore(text);

    return {
      source_table: table,
      kut_id: row.kut_id ?? row.id ?? row.kk_id ?? null,
      title: row.kut_title ?? row.title ?? row.name ?? null,
      source_pix: row.source_pix ?? row.source_master_filename ?? row.resolved_source_object_name ?? null,
      duration_sec: d.value,
      duration_source: d.source,
      delivered_url_or_path: row.delivered_url_or_path ?? row.delivery_url ?? row.audio_url ?? row.cc_url ?? null,
      atvl: score.total,
      status: score.status,
      evidence: score.evidenceKinds,
      title_points: score.buckets.title.points,
      metadata_points: score.buckets.metadata.points,
      lyrics_meaning_points: score.buckets.lyrics.points,
      audio_structure_points: score.buckets.audio.points,
      review_points: score.buckets.review.points,
      hits: {
        title: score.buckets.title.hits,
        metadata: score.buckets.metadata.hits,
        lyrics_meaning: score.buckets.lyrics.hits,
        audio_structure: score.buckets.audio.hits,
        review: score.buckets.review.hits
      },
      blocks: score.blocks
    };
  })
  .filter((x) => Number.isFinite(x.duration_sec) && x.duration_sec >= 80)
  .filter((x) => x.atvl > 0 && !x.blocks.length)
  .sort((a, b) => b.atvl - a.atvl || b.duration_sec - a.duration_sec);

  const topKks = scoredKks.slice(0, 10);

  const durationAudit = rows.map((row) => durationOf(row))
    .filter((d) => Number.isFinite(d.value));

  const out = {
    created_at: new Date().toISOString(),
    brief: BRIEF,
    atvl_weights: ATVL_WEIGHTS,
    doctrine: {
      title_gets_only_1_of_5: true,
      title_max_points: 20,
      bot_dialog_separate_forever: true,
      pix_only_source_pool: "canonical GPMC/tracks",
      kk_min_duration_sec: 80,
      title_only_is_hold_not_approval: true
    },
    audit: {
      pix_examined: pix.length,
      catalog_tables_read: catalogTables.map((t) => ({ table: t.table, rows: t.rows.length })),
      kk_table: table,
      kk_rows_examined: rows.length,
      kk_rows_with_duration: durationAudit.length,
      kk_rows_80_sec_or_more: durationAudit.filter((d) => d.value >= 80).length
    },
    top_pix: topPix,
    top_kks_min_80_sec: topKks
  };

  fs.mkdirSync("manifests", { recursive: true });
  fs.writeFileSync("manifests/async-placement-atvl-full.json", JSON.stringify(out, null, 2));

  console.log("\n=== ASYNC PLACEMENT FULL AtVl ===");
  console.log(JSON.stringify(out.audit, null, 2));

  console.log("\n=== TOP 5 PIX CANDIDATES ===");
  console.log(JSON.stringify(topPix, null, 2));

  console.log("\n=== TOP 10 KK CANDIDATES >= 1:20 ===");
  console.log(JSON.stringify(topKks, null, 2));

  console.log("\nWROTE manifests/async-placement-atvl-full.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
