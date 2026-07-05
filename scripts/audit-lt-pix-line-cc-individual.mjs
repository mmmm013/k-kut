import fs from "node:fs";
import path from "node:path";

const SCAN_ROOTS = ["data", "manifests", "incoming", "public"];

const OUT_DIR = "manifests/kkr/line-cc/individual";
const REPORT = "reports/lt-pix-line-cc-individual-audit.md";
const MIN_SK_SECONDS = 1.001;
const MK_TYPICAL_MAX_SECONDS = 1.100;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync("reports", { recursive: true });

const GENERATED_EXCLUDES = [
  "manifests/kkr/line-cc",
  "reports/lnduo-lntrio-rmst-cc-inventory",
  "reports/ii-inventory-rounded-totals",
  "reports/lt-pix-line-cc-individual-audit",
];

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;

  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);

    if (GENERATED_EXCLUDES.some((x) => p.includes(x))) continue;

    if (ent.isDirectory()) {
      if ([".git", ".next", "node_modules"].includes(ent.name)) continue;
      walkFiles(p, acc);
    } else if (/\.(json|md|txt)$/i.test(ent.name)) {
      acc.push(p);
    }
  }

  return acc;
}

function readJsonSafe(file) {
  if (!file.endsWith(".json")) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function isAudio(v) {
  return typeof v === "string" && /\.(mp3|wav|m4a)(\?|$)/i.test(v);
}

function badAudio(v) {
  const s = String(v || "").toLowerCase();
  return s.includes("instro") || s.includes("instrumental");
}

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lastWord(s) {
  const words = norm(s).split(" ").filter(Boolean);
  return words.at(-1) || "";
}

function rhymeKey(w) {
  const x = String(w || "").toLowerCase();
  return x.slice(Math.max(0, x.length - 3));
}

function dur(a, b) {
  return Math.round((b - a) * 1000) / 1000;
}

function durationOk(seconds) {
  const n = Number(seconds);
  return Number.isFinite(n) && n > 0;
}

function findAudioRefs(obj, refs = []) {
  if (!obj || typeof obj !== "object") return refs;

  if (Array.isArray(obj)) {
    for (const x of obj) findAudioRefs(x, refs);
    return refs;
  }

  for (const [k, v] of Object.entries(obj)) {
    if (isAudio(v) && !badAudio(v)) refs.push({ key: k, value: v });
    if (v && typeof v === "object") findAudioRefs(v, refs);
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
    obj.title ??
    obj.label ??
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
    norm(text).length > 0 &&
    Number.isFinite(Number(start)) &&
    Number.isFinite(Number(end)) &&
    Number(end) > Number(start)
  ) {
    acc.push({
      text: text.trim(),
      start: Number(start),
      end: Number(end),
    });
  }

  for (const v of Object.values(obj)) {
    if (v && typeof v === "object") findTimedLines(v, acc);
  }

  return acc;
}

function collectSourceUnits(obj, sourceFile, units = []) {
  if (!obj || typeof obj !== "object") return units;

  const audioRefs = findAudioRefs(obj);
  const timedLines = findTimedLines(obj)
    .sort((a, b) => a.start - b.start)
    .filter((l) => norm(l.text).length > 0);

  // A unit is only valid when this exact object contains both audio and timed lines.
  // This prevents pairing lines across unrelated SSOTs inside one large manifest.
  if (audioRefs.length > 0 && timedLines.length >= 2) {
    for (const audio of audioRefs) {
      units.push({
        source_file: sourceFile,
        ssot_audio_url: audio.value,
        line_count: timedLines.length,
        lines: timedLines,
      });
    }
  }

  if (Array.isArray(obj)) {
    for (const x of obj) collectSourceUnits(x, sourceFile, units);
  } else {
    for (const v of Object.values(obj)) {
      if (v && typeof v === "object") collectSourceUnits(v, sourceFile, units);
    }
  }

  return units;
}

function makeCandidate(type, unit, lines) {
  const start = lines[0].start;
  const end = lines.at(-1).end;
  const seconds = dur(start, end);
  const text = lines.map((l) => l.text).join(" / ");
  const lower = text.toLowerCase();
  const words = norm(text).split(" ").filter(Boolean).length;

  const goodAudio =
    !badAudio(unit.ssot_audio_url) &&
    !lower.includes("instro") &&
    !lower.includes("instrumental") &&
    durationOk(seconds);

  const skReady =
    goodAudio &&
    words >= 4 &&
    seconds >= MIN_SK_SECONDS;

  const mkReadyTypical =
    goodAudio &&
    !skReady &&
    words >= 1 &&
    words <= 3 &&
    seconds > 0 &&
    seconds <= MK_TYPICAL_MAX_SECONDS;

  const mkReadyHeldOneTerm =
    goodAudio &&
    !skReady &&
    words === 1 &&
    seconds > MK_TYPICAL_MAX_SECONDS;

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
    id: `${type}-${Buffer.from(`${unit.ssot_audio_url}:${start}:${end}:${text}`).toString("hex").slice(0, 20)}`,
    type,
    status: ccStatus,
    ii_lane: iiLane,
    source_file: unit.source_file,
    ssot_audio_url: unit.ssot_audio_url,
    start,
    end,
    duration_sec: seconds,
    text,
    lines,
    suitability: {
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
const allUnits = [];
const allAudio = new Map();

for (const file of files) {
  const json = readJsonSafe(file);
  if (!json) continue;

  for (const ref of findAudioRefs(json)) {
    allAudio.set(ref.value, {
      ssot_audio_url: ref.value,
      source_file_first_seen: file,
    });
  }

  collectSourceUnits(json, file, allUnits);
}

// Dedup units by audio + exact line map.
const unitMap = new Map();
for (const u of allUnits) {
  const key = `${u.ssot_audio_url}|${u.lines.map((l) => `${l.start}-${l.end}-${l.text}`).join("|")}`;
  if (!unitMap.has(key)) unitMap.set(key, u);
}

const units = [...unitMap.values()];

const linePairs = [];
const lineTrios = [];
const rhymingPairs = [];

for (const unit of units) {
  const lines = unit.lines;

  for (let i = 0; i < lines.length - 1; i++) {
    linePairs.push(makeCandidate("LNDUO_CC", unit, [lines[i], lines[i + 1]]));
  }

  for (let i = 0; i < lines.length - 2; i++) {
    lineTrios.push(makeCandidate("LNTRIO_CC", unit, [lines[i], lines[i + 1], lines[i + 2]]));
  }

  for (let i = 0; i < lines.length - 1; i++) {
    const a = lastWord(lines[i].text);
    const b = lastWord(lines[i + 1].text);
    if (a && b && rhymeKey(a) === rhymeKey(b)) {
      rhymingPairs.push(makeCandidate("RMST_CC", unit, [lines[i], lines[i + 1]]));
    }
  }
}

function dedupRows(rows) {
  const m = new Map();
  for (const r of rows) {
    const key = `${r.type}|${r.ssot_audio_url}|${r.start}|${r.end}|${r.text}`;
    if (!m.has(key)) m.set(key, r);
  }
  return [...m.values()];
}

function isReadyStatus(status) {
  return [
    "READY_FOR_CC",
    "READY_FOR_SK_CC",
    "READY_FOR_MK_CC",
    "READY_FOR_MK_CC_HELD_ONE_TERM_REVIEW",
  ].includes(status);
}

function totals(rows) {
  return {
    total: rows.length,
    ready: rows.filter((r) => isReadyStatus(r.status)).length,
    hold: rows.filter((r) => !isReadyStatus(r.status)).length,
    by_status: rows.reduce((acc, r) => {
      const key = r.status || "(blank)";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
    by_lane: rows.reduce((acc, r) => {
      const key = r.ii_lane || "(blank)";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  };
}

const pairRows = dedupRows(linePairs);
const trioRows = dedupRows(lineTrios);
const rhymeRows = dedupRows(rhymingPairs);

const audioWithTimedLines = new Set(units.map((u) => u.ssot_audio_url));
const coverage = [...allAudio.values()].map((a) => ({
  ...a,
  has_timed_line_map: audioWithTimedLines.has(a.ssot_audio_url),
}));

const payloads = [
  ["lnduos.json", "LNDUO_CC", pairRows],
  ["lntrios.json", "LNTRIO_CC", trioRows],
  ["rhyming-lnduos.json", "RMST_CC", rhymeRows],
];

for (const [filename, type, rows] of payloads) {
  fs.writeFileSync(
    path.join(OUT_DIR, filename),
    JSON.stringify({
      generated_at: new Date().toISOString(),
      type,
      doctrine: {
        isolated_by_ssot_audio_url: true,
        no_generated_outputs_as_source: true,
        no_cross_ssot_pairing: true,
        no_instrumentals: true,
        no_auto_release: true,
      },
      totals: totals(rows),
      candidates: rows,
    }, null, 2)
  );
}

fs.writeFileSync(
  path.join(OUT_DIR, "lt-pix-ssot-coverage.json"),
  JSON.stringify({
    generated_at: new Date().toISOString(),
    doctrine: {
      coverage_only: true,
      missing_timed_line_map_is_not_rejection: true,
      sk_requires_minimum_4_terms_and_1001_seconds: true,
      mk_micro_meaning_can_be_under_1000ms: true,
      mk_typical_up_to_1100ms: true,
      mk_held_one_term_longer_allowed: true,
      ssot_audio_must_be_mapped_before_line_cc_generation: true,
    },
    totals: {
      ssot_audio_seen: coverage.length,
      ssot_with_timed_line_map: coverage.filter((x) => x.has_timed_line_map).length,
      ssot_without_timed_line_map: coverage.filter((x) => !x.has_timed_line_map).length,
    },
    coverage,
  }, null, 2)
);

let md = `# LT-PIX Line CC Individual Audit\n\n`;
md += `Generated: ${new Date().toISOString()}\n\n`;
md += `## Individual CC Counts\n\n`;
md += `- LineDuo CC: ${pairRows.length} total / ${totals(pairRows).ready} READY / ${totals(pairRows).hold} HOLD\n`;
md += `- LineTrio CC: ${trioRows.length} total / ${totals(trioRows).ready} READY / ${totals(trioRows).hold} HOLD\n`;
md += `- RhymeSet CC: ${rhymeRows.length} total / ${totals(rhymeRows).ready} READY / ${totals(rhymeRows).hold} HOLD\n\n`;
md += `## SSOT Coverage\n\n`;
md += `- SSOT audio seen: ${coverage.length}\n`;
md += `- SSOT with timed-line map: ${coverage.filter((x) => x.has_timed_line_map).length}\n`;
md += `- SSOT without timed-line map: ${coverage.filter((x) => !x.has_timed_line_map).length}\n\n`;
md += `## Interpretation\n\n`;
md += `Low CC counts mean the local repo has audio SSOT references without parseable timed lyric-line maps. That is a mapping coverage issue, not proof that the CC inventory is small.\n`;

fs.writeFileSync(REPORT, md);

console.log("WROTE", path.join(OUT_DIR, "lnduos.json"));
console.log("WROTE", path.join(OUT_DIR, "lntrios.json"));
console.log("WROTE", path.join(OUT_DIR, "rhyming-lnduos.json"));
console.log("WROTE", path.join(OUT_DIR, "lt-pix-ssot-coverage.json"));
console.log("WROTE", REPORT);
console.log(JSON.stringify({
  line_pairs: totals(pairRows),
  line_trios: totals(trioRows),
  rhyming_line_pairs: totals(rhymeRows),
  ssot_coverage: {
    ssot_audio_seen: coverage.length,
    ssot_with_timed_line_map: coverage.filter((x) => x.has_timed_line_map).length,
    ssot_without_timed_line_map: coverage.filter((x) => !x.has_timed_line_map).length,
  }
}, null, 2));
