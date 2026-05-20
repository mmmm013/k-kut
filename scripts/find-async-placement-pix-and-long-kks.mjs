import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BRIEF = {
  name: "async-placement",
  meaning: [
    "asynchronous message",
    "not live conversation",
    "sendable emotional communication",
    "user sends feeling later",
    "guided placement",
    "digital audio card",
    "message delivery",
    "one selected emotional moment",
    "playable link",
    "recipient receives later",
    "personal communication",
    "human feeling through music"
  ],
  positive: [
    "message", "words", "talk", "talking", "phone", "hear", "listen",
    "send", "sent", "wait", "later", "time", "moment", "memory",
    "remember", "inside", "heart", "feeling", "feel", "friend",
    "together", "hope", "believe", "trust", "home", "side", "around",
    "with you", "for you", "to you", "know"
  ],
  negative: [
    "cover", "instro", "instrumental", "christmas", "birthday",
    "demo", "test", "snippet", "stomp", "war", "vengeance",
    "death", "devil", "fight", "pirates", "nascAR"
  ]
};

function norm(s) {
  return String(s || "").toLowerCase().replace(/[_-]+/g, " ");
}

function scoreText(text) {
  const t = norm(text);
  let score = 0;
  const hits = [];
  const blocks = [];

  for (const word of BRIEF.positive) {
    if (t.includes(word)) {
      score += word.length > 6 ? 4 : 2;
      hits.push(word);
    }
  }

  for (const phrase of BRIEF.meaning) {
    for (const token of phrase.split(/\s+/).filter(Boolean)) {
      if (token.length >= 5 && t.includes(token)) {
        score += 1;
      }
    }
  }

  for (const word of BRIEF.negative) {
    if (t.includes(word.toLowerCase())) {
      score -= 8;
      blocks.push(word);
    }
  }

  // Prefer vocal/title-like masters over utility/demo/audio prompts.
  if (/\.(mp3|wav|m4a|aiff?)$/i.test(text)) score += 1;
  if (t.includes("instro") || t.includes("instrumental")) score -= 10;
  if (t.includes("cover")) score -= 10;
  if (t.includes("demo") || t.includes("test") || t.includes("snippet")) score -= 6;

  return { score, hits: [...new Set(hits)], blocks: [...new Set(blocks)] };
}

function getDuration(row) {
  const keys = [
    "duration_sec", "duration_seconds", "duration",
    "audio_duration_sec", "capture_duration_sec"
  ];
  for (const k of keys) {
    const n = Number(row?.[k]);
    if (Number.isFinite(n) && n > 0) return n;
  }

  const startKeys = ["start_sec", "start_seconds", "capture_start_sec", "start_time_sec"];
  const endKeys = ["end_sec", "end_seconds", "capture_end_sec", "end_time_sec"];

  for (const sk of startKeys) {
    for (const ek of endKeys) {
      const s = Number(row?.[sk]);
      const e = Number(row?.[ek]);
      if (Number.isFinite(s) && Number.isFinite(e) && e > s) return e - s;
    }
  }

  return null;
}

function rowText(row) {
  return [
    row.kut_title,
    row.title,
    row.name,
    row.source_pix,
    row.source_title,
    row.source_filename,
    row.resolved_source_object_name,
    row.section_title,
    row.section_role,
    row.theme,
    row.intent,
    row.tags,
    row.metadata,
    row.notes
  ].map((x) => typeof x === "string" ? x : JSON.stringify(x ?? "")).join(" ");
}

async function listCanonicalPixFromTracks() {
  const out = [];
  let offset = 0;
  const limit = 1000;

  // Your bucket currently fits in one call, but keep structure explicit.
  const { data, error } = await supabase.storage
    .from("tracks")
    .list("", { limit, offset, sortBy: { column: "name", order: "asc" } });

  if (error) throw error;

  for (const obj of data ?? []) {
    if (!obj?.name) continue;
    if (obj.name === "native-kut-apology") continue; // folder, not a top-level LT-PIX title
    if (!/\.(mp3|wav|m4a|aiff?)$/i.test(obj.name)) continue;

    const s = scoreText(obj.name);
    out.push({
      source_pool: "canonical_tracks_bucket",
      source_role: "PIX_ONLY",
      name: obj.name,
      size: obj.metadata?.size ?? null,
      score: s.score,
      hits: s.hits,
      blocks: s.blocks
    });
  }

  return out.sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name)));
}

async function fetchKKRows() {
  const tables = ["k_kuts", "kk_inventory", "k_kut_inventory"];
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .limit(20000);

    if (!error && Array.isArray(data)) {
      return { table, rows: data };
    }
  }

  throw new Error("Could not read k_kuts / kk_inventory / k_kut_inventory");
}

async function main() {
  const pix = await listCanonicalPixFromTracks();

  const topPix = pix
    .filter((x) => x.score > 0)
    .slice(0, 5);

  console.log("\n=== TOP PIX CANDIDATES FOR ASYNC PLACEMENT BRIEF ===");
  console.log(JSON.stringify(topPix, null, 2));

  const { table, rows } = await fetchKKRows();

  const kkScored = rows.map((row) => {
    const duration = getDuration(row);
    const text = rowText(row);
    const s = scoreText(text);
    return {
      table,
      kut_id: row.kut_id ?? row.id ?? row.kk_id ?? null,
      title: row.kut_title ?? row.title ?? row.name ?? null,
      source_pix: row.source_pix ?? row.source_filename ?? row.resolved_source_object_name ?? null,
      duration_sec: duration,
      delivered_url_or_path: row.delivered_url_or_path ?? row.delivery_url ?? row.audio_url ?? row.cc_url ?? null,
      score: s.score,
      hits: s.hits,
      blocks: s.blocks,
      raw_status: row.status ?? row.boundary_status ?? row.quality_status ?? row.audio_status ?? null
    };
  })
  .filter((x) => Number.isFinite(x.duration_sec) && x.duration_sec >= 80)
  .filter((x) => x.score > 0)
  .sort((a, b) => b.score - a.score || b.duration_sec - a.duration_sec)
  .slice(0, 10);

  console.log("\n=== TOP 10 KK CANDIDATES >= 1:20 FOR ASYNC PLACEMENT BRIEF ===");
  console.log(JSON.stringify(kkScored, null, 2));

  fs.mkdirSync("manifests", { recursive: true });
  fs.writeFileSync("manifests/async-placement-pix-and-long-kk-candidates.json", JSON.stringify({
    created_at: new Date().toISOString(),
    brief: BRIEF,
    doctrine: {
      bot_dialog_separate_forever: true,
      pix_source_pool: "Supabase storage bucket tracks only / GPMC canonical PIX catalog",
      kk_source_pool: "KK inventory only",
      kk_min_duration_sec: 80,
      no_bot_prompt_assets: true,
      no_local_voice_prompt_assets: true
    },
    top_pix: topPix,
    top_kks_min_80_sec: kkScored
  }, null, 2));

  console.log("\nWROTE manifests/async-placement-pix-and-long-kk-candidates.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
