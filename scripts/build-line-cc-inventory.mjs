import fs from "node:fs";
import path from "node:path";

const SCAN_ROOTS = [
  "data",
  "manifests",
  "docs",
  "incoming",
  "public",
];

const OUT_DIR = "manifests/kkr/line-cc";
const OUT_JSON = `${OUT_DIR}/lnduo-lntrio-rmst-cc-inventory.json`;
const OUT_MD = `reports/lnduo-lntrio-rmst-cc-inventory.md`;
const MIN_SK_SECONDS = 1.001;
const MK_TYPICAL_MAX_SECONDS = 1.100;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync("reports", { recursive: true });

function readJsonSafe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);

    // Never scan generated inventory/report outputs as source input.
    if (
      p.includes("manifests/kkr/line-cc") ||
      p.includes("reports/lnduo-lntrio-rmst-cc-inventory") ||
      p.includes("reports/ii-inventory-rounded-totals")
    ) {
      continue;
    }

    if (ent.isDirectory()) {
      if ([".git", ".next", "node_modules"].includes(ent.name)) continue;
      walkFiles(p, acc);
    } else if (/\.(json|md|txt)$/i.test(ent.name)) {
      acc.push(p);
    }
  }
  return acc;
}

function looksLikeAudioUrl(v) {
  return typeof v === "string" && /\.(mp3|wav|m4a)(\?|$)/i.test(v);
}

function isBadAudioUrl(v) {
  const s = String(v || "").toLowerCase();
  return s.includes("instro") || s.includes("instrumental");
}

function findAudioRefs(obj, refs = []) {
  if (!obj || typeof obj !== "object") return refs;
  if (Array.isArray(obj)) {
    for (const x of obj) findAudioRefs(x, refs);
    return refs;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (looksLikeAudioUrl(v)) refs.push({ key: k, value: v });
    else if (v && typeof v === "object") findAudioRefs(v, refs);
  }
  return refs;
}

function findTimedLines(obj, acc = []) {
  if (!obj || typeof obj !== "object") return acc;

  if (Array.isArray(obj)) {
    for (const x of obj) findTimedLines(x, acc);
    return acc;
  }

  const text =
    obj.text ??
    obj.line ??
    obj.lyric ??
    obj.lyric_line ??
    obj.label ??
    obj.title ??
    null;

  const start =
    obj.start ??
    obj.start_sec ??
    obj.start_seconds ??
    obj.start_time ??
    obj.from ??
    null;

  const end =
    obj.end ??
    obj.end_sec ??
    obj.end_seconds ??
    obj.end_time ??
    obj.to ??
    null;

  if (
    typeof text === "string" &&
    text.trim().length > 0 &&
    Number.isFinite(Number(start)) &&
    Number.isFinite(Number(end)) &&
    Number(end) > Number(start)
  ) {
    acc.push({
      text: text.trim(),
      start: Number(start),
      end: Number(end),
      raw: obj,
    });
  }

  for (const v of Object.values(obj)) {
    if (v && typeof v === "object") findTimedLines(v, acc);
  }

  return acc;
}

function normalizeLine(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lastWord(s) {
  const words = normalizeLine(s).split(" ").filter(Boolean);
  return words.at(-1) || "";
}

function rhymeKey(word) {
  const w = String(word || "").toLowerCase();
  return w.slice(Math.max(0, w.length - 3));
}

function duration(a, b) {
  return Math.round((b - a) * 1000) / 1000;
}

function suitableDuration(_seconds) {
  // GPEx LAW:
  // Time is not a CC creation eligibility factor for LT-PIX or KKs.
  // Exact start/end remains required metadata.
  // Only SWSP has a 13-second floor, handled separately.
  return true;
}

function makeCandidate({ type, lines, sourceFile, audioUrl }) {
  const start = lines[0].start;
  const end = lines.at(-1).end;
  const dur = duration(start, end);

  const text = lines.map((l) => l.text).join(" / ");
  const lowerText = text.toLowerCase();
  const words = normalizeLine(text).split(" ").filter(Boolean).length;

  const goodAudio =
    audioUrl &&
    !isBadAudioUrl(audioUrl) &&
    !lowerText.includes("instro") &&
    !lowerText.includes("instrumental") &&
    suitableDuration(dur);

  const skReady =
    goodAudio &&
    words >= 4 &&
    dur >= MIN_SK_SECONDS;

  const mkReadyTypical =
    goodAudio &&
    !skReady &&
    words >= 1 &&
    words <= 3 &&
    dur > 0 &&
    dur <= MK_TYPICAL_MAX_SECONDS;

  const mkReadyHeldOneTerm =
    goodAudio &&
    !skReady &&
    words === 1 &&
    dur > MK_TYPICAL_MAX_SECONDS;

  const ready = skReady || mkReadyTypical || mkReadyHeldOneTerm;
  const ccStatus = skReady
    ? "READY_FOR_SK_CC"
    : mkReadyHeldOneTerm
      ? "READY_FOR_MK_CC_HELD_ONE_TERM_REVIEW"
      : mkReadyTypical
        ? "READY_FOR_MK_CC"
        : "HOLD_REVIEW";
  const iiLane = skReady ? "sK_II" : ready ? "mK_II" : "HOLD";

  return {
    id: `${type}-${Buffer.from(`${sourceFile}:${start}:${end}:${text}`).toString("hex").slice(0, 16)}`,
    type,
    status: ccStatus,
    ii_lane: iiLane,
    source_file: sourceFile,
    ssot_audio_url: audioUrl || null,
    start,
    end,
    duration_sec: dur,
    line_count: lines.length,
    text,
    lines: lines.map((l) => ({
      text: l.text,
      start: l.start,
      end: l.end,
    })),
    suitability: {
      has_audio_url: Boolean(audioUrl),
      non_instrumental: Boolean(goodAudio),
      minimum_sk_terms: 4,
      minimum_sk_seconds: MIN_SK_SECONDS,
      mk_typical_max_seconds: MK_TYPICAL_MAX_SECONDS,
      mk_can_be_under_1000ms: true,
      mk_held_one_term_longer_allowed: true,
      word_count: words,
      sk_ready: skReady,
      mk_ready_typical: mkReadyTypical,
      mk_ready_held_one_term: mkReadyHeldOneTerm,
    },
  };
}

const files = SCAN_ROOTS.flatMap((root) => walkFiles(root));
const candidates = [];

for (const file of files) {
  const json = file.endsWith(".json") ? readJsonSafe(file) : null;
  if (!json) continue;

  const audioRefs = findAudioRefs(json).filter((r) => !isBadAudioUrl(r.value));
  const audioUrl = audioRefs[0]?.value || null;

  const lines = findTimedLines(json)
    .sort((a, b) => a.start - b.start)
    .filter((l) => normalizeLine(l.text).length > 0);

  if (lines.length < 2) continue;

  for (let i = 0; i < lines.length - 1; i++) {
    candidates.push(makeCandidate({
      type: "LNDUO_CC",
      lines: [lines[i], lines[i + 1]],
      sourceFile: file,
      audioUrl,
    }));
  }

  for (let i = 0; i < lines.length - 2; i++) {
    candidates.push(makeCandidate({
      type: "LNTRIO_CC",
      lines: [lines[i], lines[i + 1], lines[i + 2]],
      sourceFile: file,
      audioUrl,
    }));
  }

  for (let i = 0; i < lines.length - 1; i++) {
    const a = lastWord(lines[i].text);
    const b = lastWord(lines[i + 1].text);
    if (a && b && rhymeKey(a) && rhymeKey(a) === rhymeKey(b)) {
      candidates.push(makeCandidate({
        type: "RMST_CC",
        lines: [lines[i], lines[i + 1]],
        sourceFile: file,
        audioUrl,
      }));
    }
  }
}

const dedup = new Map();
for (const c of candidates) {
  const key = `${c.type}|${c.ssot_audio_url}|${c.start}|${c.end}|${c.text}`;
  if (!dedup.has(key)) dedup.set(key, c);
}

const rows = [...dedup.values()].sort((a, b) => {
  if (a.status !== b.status) return a.status.localeCompare(b.status);
  if (a.type !== b.type) return a.type.localeCompare(b.type);
  return a.start - b.start;
});

const totals = rows.reduce((acc, r) => {
  acc.total++;
  acc.by_status[r.status] = (acc.by_status[r.status] || 0) + 1;
  acc.by_type[r.type] = (acc.by_type[r.type] || 0) + 1;
  return acc;
}, { total: 0, by_status: {}, by_type: {} });

const payload = {
  generated_at: new Date().toISOString(),
  doctrine: {
    no_placeholders: true,
    no_guessed_timing: true,
    cc_requires_ssot_audio_url: true,
    cc_requires_exact_start_end: true,
    kk_time_not_creation_eligibility_but_sk_mk_ii_has_timing_gates: true,
    instrumental_rejected: true,
    ready_for_cc_is_not_auto_release: true,
    sk_requires_minimum_4_terms_and_1001_seconds: true,
    mk_micro_meaning_can_be_under_1000ms: true,
    mk_typical_up_to_1100ms: true,
    mk_held_one_term_longer_allowed: true,
  },
  totals,
  candidates: rows,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));

const ready = rows.filter((r) => r.status === "READY_FOR_CC");
const hold = rows.filter((r) => r.status !== "READY_FOR_CC");

let md = `# LineDuo / LineTrio / RhymeSet CC Inventory\n\n`;
md += `Generated: ${payload.generated_at}\n\n`;
md += `## Totals\n\n`;
md += `- Total candidates: ${totals.total}\n`;
for (const [k, v] of Object.entries(totals.by_status)) md += `- ${k}: ${v}\n`;
md += `\n## Ready for CC\n\n`;
for (const r of ready.slice(0, 200)) {
  md += `### ${r.type} — ${r.duration_sec}s\n`;
  md += `- source: ${r.source_file}\n`;
  md += `- audio: ${r.ssot_audio_url}\n`;
  md += `- time: ${r.start} → ${r.end}\n`;
  md += `- text: ${r.text}\n\n`;
}
md += `\n## Hold / Review\n\n`;
md += `Hold count: ${hold.length}\n`;

fs.writeFileSync(OUT_MD, md);

console.log(`WROTE ${OUT_JSON}`);
console.log(`WROTE ${OUT_MD}`);
console.log(JSON.stringify(totals, null, 2));
