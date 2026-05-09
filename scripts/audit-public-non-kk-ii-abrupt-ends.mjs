import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const outDir = "reports/cc-softening";
fs.mkdirSync(outDir, { recursive: true });

const roots = [
  "public/mothers-day/thank-you",
];

function listAudio(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return listAudio(p);
    if (!/\.(mp3|wav|m4a|aiff|aif)$/i.test(entry.name)) return [];
    return [p];
  });
}

function isTargetNonKkII(file) {
  const f = file.replaceAll("\\", "/");

  // Exclude full song and approved KK masters / natural long KKs.
  if (f.includes("/song/")) return false;
  if (f.includes("/kks/")) return false;
  if (f.includes("/kks-long/")) return false;

  // Exclude generated tests / prior softeners.
  if (f.includes("/magic-tails/")) return false;
  if (f.includes("/magic-tests/")) return false;
  if (f.includes("/ii-softened/")) return false;

  // Keep public Thank You non-KK II-ish assets:
  // samples, kks-expanded, public non-master candidate snippets.
  return f.startsWith("public/mothers-day/thank-you/");
}

function duration(file) {
  return Number(
    execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      file,
    ], { encoding: "utf8" }).trim()
  );
}

function astats(file, start, len) {
  const res = spawnSync("ffmpeg", [
    "-hide_banner",
    "-nostats",
    "-ss", String(Math.max(0, start)),
    "-t", String(len),
    "-i", file,
    "-vn",
    "-af", "astats=metadata=1:reset=1",
    "-f", "null",
    "-"
  ], { encoding: "utf8" });

  return `${res.stdout || ""}\n${res.stderr || ""}`;
}

function grabAll(text, label) {
  const re = new RegExp(`${label}:\\s*(-?\\d+(?:\\.\\d+)?)`, "gi");
  const vals = [];
  let m;
  while ((m = re.exec(text)) !== null) vals.push(Number(m[1]));
  return vals;
}

function pickPeak(vals) {
  if (!vals.length) return null;
  return Math.max(...vals);
}

function pickRms(vals) {
  if (!vals.length) return null;
  return Math.max(...vals);
}

function classify({ dur, endPeak, endRms, end025Peak, end025Rms }) {
  if (dur < 2.0) return "REVIEW_TOO_SHORT";
  if ([endPeak, endRms, end025Peak, end025Rms].some(v => v === null)) return "REVIEW_NO_STATS";

  // If final quarter-second is still loud, it likely stops mid-motion.
  if (end025Peak > -8 || end025Rms > -20) return "LIKELY_ABRUPT_CC_END";

  // If final second is still medium/hot, likely cold ending.
  if (endPeak > -12 || endRms > -26) return "POSSIBLE_COLD_END";

  return "LIKELY_SOFT_OR_NATURAL";
}

const files = roots.flatMap(listAudio).filter(isTargetNonKkII).sort();

const rows = [];

for (const file of files) {
  const dur = duration(file);
  const final1 = astats(file, Math.max(0, dur - 1.0), 1.0);
  const final025 = astats(file, Math.max(0, dur - 0.25), 0.25);

  const endPeak = pickPeak(grabAll(final1, "Peak level dB"));
  const endRms = pickRms(grabAll(final1, "RMS level dB"));
  const end025Peak = pickPeak(grabAll(final025, "Peak level dB"));
  const end025Rms = pickRms(grabAll(final025, "RMS level dB"));

  const status = classify({ dur, endPeak, endRms, end025Peak, end025Rms });

  rows.push({
    file,
    public_url: "/" + file.replace(/^public\//, ""),
    duration_seconds: Number(dur.toFixed(3)),
    final_1s_peak_db: endPeak,
    final_1s_rms_db: endRms,
    final_025s_peak_db: end025Peak,
    final_025s_rms_db: end025Rms,
    status,
    rule: "KK masters and natural KKs remain immutable. Abrupt non-KK IIs may receive copied-note sustain fade delivery render.",
  });
}

fs.writeFileSync(
  `${outDir}/public-non-kk-ii-abrupt-end-audit.json`,
  JSON.stringify({
    generated_at: new Date().toISOString(),
    scope: "public/mothers-day/thank-you non-KK II candidates only; excludes full song, KK masters, kks-long, magic tests, and softened renders",
    count: rows.length,
    rows,
  }, null, 2)
);

const md = [
  "# Public Non-KK II Abrupt-End Audit",
  "",
  "Scope: public/mothers-day/thank-you non-KK II candidates only.",
  "",
  "Rule: KK masters and natural KKs remain immutable. Abrupt non-KK IIs may receive copied-note sustain fade delivery render.",
  "",
  "| Status | Duration | File | Public URL | Final 1s Peak | Final 1s RMS | Final .25s Peak | Final .25s RMS |",
  "|---|---:|---|---|---:|---:|---:|---:|",
  ...rows.map((r) =>
    `| ${r.status} | ${r.duration_seconds} | ${r.file} | ${r.public_url} | ${r.final_1s_peak_db ?? ""} | ${r.final_1s_rms_db ?? ""} | ${r.final_025s_peak_db ?? ""} | ${r.final_025s_rms_db ?? ""} |`
  ),
].join("\n");

fs.writeFileSync(`${outDir}/public-non-kk-ii-abrupt-end-audit.md`, md);

console.log("PUBLIC NON-KK II ABRUPT-END AUDIT");
console.log("==================================");
console.log(`Audited target public non-KK IIs: ${rows.length}`);
console.log(`WROTE ${outDir}/public-non-kk-ii-abrupt-end-audit.json`);
console.log(`WROTE ${outDir}/public-non-kk-ii-abrupt-end-audit.md`);
console.log("");

for (const status of [
  "LIKELY_ABRUPT_CC_END",
  "POSSIBLE_COLD_END",
  "REVIEW_TOO_SHORT",
  "REVIEW_NO_STATS",
  "LIKELY_SOFT_OR_NATURAL",
]) {
  const group = rows.filter((r) => r.status === status);
  console.log(`${status}: ${group.length}`);
  for (const r of group.slice(0, 40)) {
    console.log(`- ${r.file}`);
  }
  if (group.length > 40) console.log(`... ${group.length - 40} more`);
  console.log("");
}
