import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PIX_QUERY = process.argv.slice(2).join(" ").trim();
if (!PIX_QUERY) {
  console.error('Usage: node scripts/one-pix-combo-kk-process.mjs "Sandman"');
  process.exit(1);
}

const MIN_SWSP_SEC = 13;
const MIN_COMBOS_REQUIRED = 3;

function norm(v) {
  return String(v ?? "")
    .toLowerCase()
    .replace(/[_/.-]+/g, " ")
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function durationOf(row) {
  for (const k of [
    "duration_sec",
    "delivered_duration_sec",
    "processed_duration_sec",
    "capture_duration_sec",
    "audio_duration_sec"
  ]) {
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

function sourceText(row) {
  return [
    row.source_master_filename,
    row.resolved_source_object_name,
    row.source_pix,
    row.source_filename,
    row.track_id,
    row.track_title,
    row.delivered_url_or_path
  ].filter(Boolean).join(" ");
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

function titleOf(row) {
  return row.kut_title ?? row.title ?? row.section_title ?? row.name ?? "untitled";
}

function comboTitle(parts) {
  return parts.map(titleOf).join(" + ");
}

function isUsable(row) {
  const status = norm([
    row.audio_status,
    row.status,
    row.quality_status,
    row.boundary_status,
    row.approval_status
  ].join(" "));

  if (!status) return true;
  if (status.includes("reject") || status.includes("broken") || status.includes("invalid")) return false;
  return true;
}

function isContiguous(prev, next) {
  const prevEnd = endOf(prev);
  const nextStart = startOf(next);

  if (!Number.isFinite(prevEnd) || !Number.isFinite(nextStart)) return true;

  const gap = nextStart - prevEnd;

  // allow tiny overlap / tiny silence, but block structural jumps
  return gap >= -2 && gap <= 8;
}

function buildCandidateCombos(ordered) {
  const all = [];

  for (let i = 0; i < ordered.length; i++) {
    const parts = [];
    let total = 0;

    for (let j = i; j < ordered.length; j++) {
      const row = ordered[j];
      const d = durationOf(row);
      if (!Number.isFinite(d)) break;

      if (parts.length && !isContiguous(parts[parts.length - 1], row)) break;

      parts.push(row);
      total += d;

      if (total >= MIN_SWSP_SEC && parts.length >= 2) {
        all.push({
          start_index: i,
          end_index: j,
          section_count: parts.length,
          total_duration_sec: Number(total.toFixed(3)),
          start_sec: startOf(parts[0]),
          end_sec: endOf(parts[parts.length - 1]),
          combo_title: comboTitle(parts),
          parts
        });
      }

      // do not make giant whole-song blobs in first pass
      if (parts.length >= 10) break;
    }
  }

  return all;
}

function pickThree(combos) {
  if (!combos.length) return [];

  const sorted = combos
    .filter(c => c.total_duration_sec >= MIN_SWSP_SEC)
    .sort((a, b) => a.start_sec - b.start_sec || b.total_duration_sec - a.total_duration_sec);

  const early = sorted.find(c => c.start_sec <= 60) ?? sorted[0];

  const middle = sorted.find(c =>
    c.start_sec > 60 &&
    c.start_sec < 180 &&
    c.start_sec !== early?.start_sec
  );

  const late = sorted.find(c =>
    c.start_sec >= 180 &&
    c.start_sec !== early?.start_sec &&
    c.start_sec !== middle?.start_sec
  );

  const picked = [early, middle, late].filter(Boolean);

  // Fill gaps with the strongest remaining non-duplicate starts.
  for (const c of sorted.sort((a, b) => b.total_duration_sec - a.total_duration_sec)) {
    if (picked.length >= MIN_COMBOS_REQUIRED) break;
    if (!picked.some(p => p.start_sec === c.start_sec && p.end_sec === c.end_sec)) {
      picked.push(c);
    }
  }

  return picked.slice(0, MIN_COMBOS_REQUIRED);
}

async function fetchAllKuts() {
  const all = [];
  const page = 1000;

  for (let from = 0; ; from += page) {
    const { data, error } = await supabase
      .from("k_kuts")
      .select("*")
      .range(from, from + page - 1);

    if (error) throw error;
    if (!data?.length) break;

    all.push(...data);
    if (data.length < page) break;
  }

  return all;
}

async function main() {
  const rows = await fetchAllKuts();
  const q = norm(PIX_QUERY);

  const matched = rows
    .filter(r => norm(sourceText(r)).includes(q) || q.split(" ").every(tok => norm(sourceText(r)).includes(tok)))
    .filter(r => Number.isFinite(durationOf(r)))
    .filter(isUsable);

  const groups = new Map();
  for (const row of matched) {
    const key = sourceKey(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const groupSummaries = [...groups.entries()].map(([source, group]) => {
    const ordered = group.sort((a, b) => startOf(a) - startOf(b));
    const combos = buildCandidateCombos(ordered);
    const picked = pickThree(combos);

    return {
      source,
      row_count: ordered.length,
      first_start: ordered.length ? startOf(ordered[0]) : null,
      last_end: ordered.length ? endOf(ordered[ordered.length - 1]) : null,
      total_section_duration_sec: Number(ordered.reduce((s, r) => s + durationOf(r), 0).toFixed(3)),
      combo_candidates_13_sec_plus: combos.length,
      picked_combo_count: picked.length,
      picked_combos: picked.map((c, idx) => ({
        combo_slot: idx + 1,
        candidate_role: idx === 0 ? "early_opening_combo" : idx === 1 ? "middle_body_combo" : "late_resolution_combo",
        total_duration_sec: c.total_duration_sec,
        start_sec: c.start_sec,
        end_sec: c.end_sec,
        section_count: c.section_count,
        combo_title: c.combo_title,
        parts: c.parts.map((r, partIdx) => ({
          order: partIdx + 1,
          kut_id: r.kut_id ?? r.id ?? r.kk_id ?? null,
          title: titleOf(r),
          start_sec: startOf(r),
          end_sec: endOf(r),
          duration_sec: durationOf(r),
          delivered_url_or_path: r.delivered_url_or_path ?? r.delivery_url ?? r.audio_url ?? null,
          status: r.status ?? r.audio_status ?? r.quality_status ?? r.boundary_status ?? null
        }))
      }))
    };
  }).sort((a, b) => b.picked_combo_count - a.picked_combo_count || b.row_count - a.row_count);

  const best = groupSummaries[0] ?? null;

  const out = {
    created_at: new Date().toISOString(),
    pix_query: PIX_QUERY,
    doctrine: {
      one_pix_at_a_time: true,
      pix_must_squire_at_least_3_combo_kks: true,
      min_required_combo_kks: MIN_COMBOS_REQUIRED,
      combo_rule: "contiguous source sections only; original order preserved; no skipped/out-of-place section",
      swsp_min_sec: MIN_SWSP_SEC,
      no_arbitrary_max_time: true,
      bot_dialog_excluded_forever: true
    },
    audit: {
      total_k_kuts_rows_read: rows.length,
      matched_rows_for_pix_query: matched.length,
      matched_source_groups: groupSummaries.length,
      best_group_has_required_3_combos: Boolean(best && best.picked_combo_count >= MIN_COMBOS_REQUIRED)
    },
    best_source_group: best,
    alternate_source_groups: groupSummaries.slice(1, 5)
  };

  fs.mkdirSync("manifests", { recursive: true });
  const safe = norm(PIX_QUERY).replace(/\s+/g, "-").slice(0, 80);
  const path = `manifests/one-pix-combo-kk-${safe}.json`;
  fs.writeFileSync(path, JSON.stringify(out, null, 2));

  console.log("\n=== ONE PIX COMBO KK PROCESS ===");
  console.log(JSON.stringify(out.audit, null, 2));

  console.log("\n=== BEST SOURCE GROUP ===");
  console.log(JSON.stringify(out.best_source_group, null, 2));

  console.log(`\nWROTE ${path}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
