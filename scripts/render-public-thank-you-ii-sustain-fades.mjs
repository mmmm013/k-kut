import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const auditPath = "reports/cc-softening/public-non-kk-ii-abrupt-end-audit.json";
const outDir = "public/mothers-day/thank-you/ii-softened";
const tmpDir = "/tmp/k-kut-ii-sustain";

if (!fs.existsSync(auditPath)) {
  console.error(`Missing audit file: ${auditPath}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(tmpDir, { recursive: true });

const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));

function isAllowedDeliveryTarget(r) {
  const f = r.file.replaceAll("\\", "/");
  const base = path.basename(f);

  if (!["LIKELY_ABRUPT_CC_END", "POSSIBLE_COLD_END"].includes(r.status)) return false;

  // Never render approved KK candidates or official KK-like files here.
  if (f.includes("/kk-approved-candidates/")) return false;
  if (base.startsWith("thank-you-kk")) return false;

  // Current target class: public Thank You CC/section IIs only.
  return base.startsWith("thank-you-cc-") || base.startsWith("thank-you-sec-");
}

function safeBase(file) {
  return path
    .basename(file)
    .replace(/\.(mp3|wav|m4a|aiff|aif)$/i, "")
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function run(args) {
  execFileSync("ffmpeg", args, { stdio: "inherit" });
}

const targets = audit.rows.filter(isAllowedDeliveryTarget);
const manifest = [];

console.log("PUBLIC THANK YOU II SUSTAIN-FADE RENDER");
console.log("========================================");
console.log(`Targets: ${targets.length}`);

for (const r of targets) {
  const input = r.file;
  const base = safeBase(input);
  const sustain = `${tmpDir}/${base}-sustain.mp3`;
  const list = `${tmpDir}/${base}-concat.txt`;
  const output = `${outDir}/${base}-sustain-fade.mp3`;

  const dur = Number(r.duration_seconds);
  const sustainStart = Math.max(0, dur - 0.45);

  run([
    "-y",
    "-ss", String(sustainStart),
    "-t", "0.55",
    "-i", input,
    "-vn",
    "-af", "afade=t=out:st=0.08:d=0.47,volume=0.72",
    "-ar", "44100",
    "-ac", "2",
    "-b:a", "192k",
    sustain,
  ]);

  fs.writeFileSync(
    list,
    [
      `file '${process.cwd()}/${input}'`,
      `file '${sustain}'`,
    ].join("\n")
  );

  run([
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", list,
    "-vn",
    "-af", "afade=t=out:st=" + Math.max(0.2, dur + 0.18).toFixed(2) + ":d=0.70",
    "-ar", "44100",
    "-ac", "2",
    "-b:a", "192k",
    output,
  ]);

  manifest.push({
    source_file: input,
    source_public_url: r.public_url,
    source_status: r.status,
    rendered_file: output,
    rendered_public_url: "/" + output.replace(/^public\//, ""),
    treatment: "copy own final 0.45s note/chord, append short sustain, fade out",
  });

  console.log(`WROTE ${output}`);
}

fs.writeFileSync(
  "reports/cc-softening/public-thank-you-ii-sustain-fade-renders.json",
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      rule: "Delivery-layer only. Official KK masters and natural outro KKs remain untouched.",
      count: manifest.length,
      renders: manifest,
    },
    null,
    2
  )
);

console.log("");
console.log(`Rendered: ${manifest.length}`);
console.log("WROTE reports/cc-softening/public-thank-you-ii-sustain-fade-renders.json");
