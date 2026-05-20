import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

async function fetchAllKuts() {
  const all = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("k_kuts")
      .select("*")
      .range(from, to);

    if (error) throw error;
    if (!data?.length) break;

    all.push(...data);
    if (data.length < pageSize) break;
  }

  return all;
}

const rows = await fetchAllKuts();

const groups = new Map();
for (const row of rows) {
  const d = durationOf(row);
  if (!Number.isFinite(d)) continue;

  const key = sourceKey(row);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(row);
}

const summaries = [];

for (const [source, group] of groups.entries()) {
  const ordered = group.sort((a, b) => startOf(a) - startOf(b));

  let longestChain = 0;
  let currentChain = 0;
  let currentCount = 0;
  let longestCount = 0;
  let maxGap = null;
  let gapBreaks = 0;

  for (let i = 0; i < ordered.length; i++) {
    const d = durationOf(ordered[i]);
    if (i === 0) {
      currentChain = d;
      currentCount = 1;
    } else {
      const prevEnd = endOf(ordered[i - 1]);
      const thisStart = startOf(ordered[i]);
      const gap = thisStart - prevEnd;

      if (maxGap === null || gap > maxGap) maxGap = gap;

      if (gap >= -2 && gap <= 8) {
        currentChain += d;
        currentCount += 1;
      } else {
        gapBreaks += 1;
        currentChain = d;
        currentCount = 1;
      }
    }

    if (currentChain > longestChain) {
      longestChain = currentChain;
      longestCount = currentCount;
    }
  }

  summaries.push({
    source,
    rows: ordered.length,
    total_duration_if_all_added: Number(ordered.reduce((s, r) => s + durationOf(r), 0).toFixed(2)),
    longest_contiguous_chain_sec: Number(longestChain.toFixed(2)),
    longest_contiguous_section_count: longestCount,
    gap_breaks: gapBreaks,
    max_gap_sec: maxGap,
    first_start: ordered.length ? startOf(ordered[0]) : null,
    last_end: ordered.length ? endOf(ordered[ordered.length - 1]) : null
  });
}

summaries.sort((a, b) =>
  b.longest_contiguous_chain_sec - a.longest_contiguous_chain_sec ||
  b.rows - a.rows
);

console.log("k_kuts rows fetched:", rows.length);
console.log("source groups:", summaries.length);
console.log("\nTop source groups by longest contiguous chain:");
console.log(JSON.stringify(summaries.slice(0, 30), null, 2));
