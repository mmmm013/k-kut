import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const MIN_COMBO_SEC = 80;

const positiveTerms = [
  "always", "around", "hope", "know", "by your side", "side",
  "remember", "time", "feeling", "feel", "heart", "message",
  "words", "talk", "talking", "listen", "hear", "with you",
  "for you", "to you", "right here", "home", "believe", "trust"
];

const badTerms = [
  "bot", "prompt", "dialog", "checkout", "demo",
  "cover", "instro", "instrumental", "test", "snippet"
];

function norm(v) {
  return String(v ?? "").toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function durationOf(row) {
  for (const k of ["duration_sec", "delivered_duration_sec", "processed_duration_sec", "capture_duration_sec", "audio_duration_sec"]) {
    const n = Number(row?.[k]);
    if (Number.isFinite(n) && n > 0) return n;
  }

  const s = Number(row?.capture_start_sec ?? row?.start_sec ?? row?.start_time_sec);
  const e = Number(row?.capture_end_sec ?? row?.end_sec ?? row?.end_time_sec);
  if (Number.isFinite(s) && Number.isFinite(e) && e > s) return e - s;

  return null;
}

function startOf(row) {
  const n = Number(row?.capture_start_sec ?? row?.start_sec ?? row?.start_time_sec ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function endOf(row) {
  const n = Number(row?.capture_end_sec ?? row?.end_sec ?? row?.end_time_sec);
  if (Number.isFinite(n)) return n;
  const d = durationOf(row);
  return Number.isFinite(d) ? startOf(row) + d : null;
}

function sourceKey(row) {
  return norm(
    row.source_master_filename ??
    row.resolved_source_object_name ??
    row.source_pix ??
    row.source_filename ??
    row.track_id ??
    row.track_title ??
    "unknown"
  );
}

function rowText(row) {
  return [
    row.kut_title,
    row.title,
    row.name,
    row.source_master_filename,
    row.resolved_source_object_name,
    row.source_pix,
    row.section_title,
    row.section_role,
    row.theme,
    row.intent,
    row.tags,
    row.meaning_summary,
    row.lyrics,
    row.lyric_text,
    row.notes,
    row.metadata
  ].map((x) => typeof x === "string" ? x : JSON.stringify(x ?? "")).join(" ");
}

function scoreText(text) {
  const t = norm(text);
  let score = 0;
  const hits = [];
  const blocks = [];

  for (const term of positiveTerms) {
    if (t.includes(norm(term))) {
      score += term.length > 7 ? 6 : 3;
      hits.push(term);
    }
  }

  for (const term of badTerms) {
    if (t.includes(norm(term))) {
      score -= 20;
      blocks.push(term);
    }
  }

  return { score, hits: [...new Set(hits)], blocks: [...new Set(blocks)] };
}

function isProbablyUsable(row) {
  const statusText = norm([
    row.audio_status,
    row.status,
    row.quality_status,
    row.boundary_status,
    row.approval_status
  ].join(" "));

  if (!statusText) return true;
  if (statusText.includes("broken") || statusText.includes("reject") || statusText.includes("invalid")) return false;

  return true;
}

function comboTitle(rows) {
  return rows.map((r) => r.kut_title ?? r.title ?? r.section_title ?? "untitled").join(" + ");
}

function comboId(rows) {
  return rows.map((r) => r.kut_id ?? r.id ?? r.kk_id ?? "no-id").join("__");
}

function buildCombos(rows) {
  const combos = [];
  const groups = new Map();

  for (const row of rows) {
    const key = sourceKey(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  for (const [source, groupRows] of groups.entries()) {
    const ordered = groupRows
      .filter((r) => Number.isFinite(durationOf(r)))
      .filter(isProbablyUsable)
      .sort((a, b) => startOf(a) - startOf(b));

    for (let i = 0; i < ordered.length; i++) {
      let total = 0;
      const parts = [];

      for (let j = i; j < ordered.length; j++) {
        const row = ordered[j];
        const d = durationOf(row);
        if (!Number.isFinite(d)) break;

        if (parts.length) {
          const prevEnd = endOf(parts[parts.length - 1]);
          const thisStart = startOf(row);

          if (Number.isFinite(prevEnd) && Number.isFinite(thisStart)) {
            const gap = thisStart - prevEnd;

            // Allows tiny overlap or small section-transition silence. Blocks non-contiguous skips.
            if (gap < -2 || gap > 8) break;
          }
        }

        parts.push(row);
        total += d;

        if (total >= MIN_COMBO_SEC) {
          const scored = scoreText(parts.map(rowText).join(" "));

          combos.push({
            combo_id: comboId(parts),
            source_pix: source,
            section_count: parts.length,
            total_duration_sec: Number(total.toFixed(3)),
            start_sec: startOf(parts[0]),
            end_sec: endOf(parts[parts.length - 1]),
            combo_title: comboTitle(parts),
            atvl_combo_score: scored.score,
            hits: scored.hits,
            blocks: scored.blocks,
            review_status: scored.score > 0 && !scored.blocks.length
              ? "combo_candidate_needs_whole_sequence_review"
              : "hold",
            parts: parts.map((r, idx) => ({
              order: idx + 1,
              kut_id: r.kut_id ?? r.id ?? r.kk_id ?? null,
              title: r.kut_title ?? r.title ?? r.section_title ?? null,
              start_sec: startOf(r),
              end_sec: endOf(r),
              duration_sec: durationOf(r),
              delivered_url_or_path: r.delivered_url_or_path ?? r.delivery_url ?? r.audio_url ?? null,
              audio_status: r.audio_status ?? null,
              status: r.status ?? r.quality_status ?? r.boundary_status ?? null
            }))
          });

          // avoid giant all-song bundles in this first pass
          if (parts.length >= 6) break;
        }
      }
    }
  }

  return combos;
}

async function main() {
  const { data, error } = await supabase
    .from("k_kuts")
    .select("*")
    .limit(20000);

  if (error) throw error;

  const rows = data ?? [];
  const withDuration = rows.filter((r) => Number.isFinite(durationOf(r)));
  const individualLong = withDuration.filter((r) => durationOf(r) >= MIN_COMBO_SEC);

  const combosAll = buildCombos(rows);
  const combos = combosAll
    .filter((c) => c.review_status !== "hold")
    .sort((a, b) =>
      b.atvl_combo_score - a.atvl_combo_score ||
      b.total_duration_sec - a.total_duration_sec ||
      a.source_pix.localeCompare(b.source_pix)
    );

  const out = {
    created_at: new Date().toISOString(),
    doctrine: {
      async_brief_only: true,
      bot_dialog_separate_forever: true,
      individual_kk_can_be_short: true,
      offer_can_be_contiguous_combo: true,
      combo_rule: "contiguous sections only; original source order preserved; no non-adjacent stitching",
      min_combo_sec: MIN_COMBO_SEC,
      only_hard_time_floor: "SWSPs must be 13+ seconds; KK/combo length follows structure, meaning, fullness, and beauty."
    },
    audit: {
      kk_rows_examined: rows.length,
      kk_rows_with_duration: withDuration.length,
      individual_kk_rows_80_sec_or_more: individualLong.length,
      all_contiguous_combo_spans_80_sec_or_more: combosAll.length,
      scored_contiguous_combo_candidates_80_sec_or_more: combos.length
    },
    top_contiguous_combos: combos.slice(0, 10),
    additional_combos: combos.slice(10, 25)
  };

  fs.mkdirSync("manifests", { recursive: true });
  fs.writeFileSync("manifests/async-placement-contiguous-kk-combos.json", JSON.stringify(out, null, 2));

  console.log("\n=== ASYNC PLACEMENT CONTIGUOUS KK COMBO AUDIT ===");
  console.log(JSON.stringify(out.audit, null, 2));

  console.log("\n=== TOP 10 CONTIGUOUS KK COMBOS >= 1:20 ===");
  console.log(JSON.stringify(out.top_contiguous_combos, null, 2));

  console.log("\nWROTE manifests/async-placement-contiguous-kk-combos.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
