import fs from "fs";
import path from "path";

const repo = process.cwd();

const AUDIO_EXT = /\.(mp3|wav|m4a|aif|aiff|flac)$/i;

const wantedRoots = [
  "public/kks/fathers-day",
  "public/kks/thank-you",
  "public/kks/ring-the-bell",
  "public/kks/ring",
  "public/kks",
];

function exists(p) {
  return fs.existsSync(path.join(repo, p));
}

function walk(abs, acc = []) {
  if (!fs.existsSync(abs)) return acc;

  for (const item of fs.readdirSync(abs)) {
    const p = path.join(abs, item);
    const st = fs.statSync(p);

    if (st.isDirectory()) {
      if ([".next", "node_modules", ".git"].includes(item)) continue;
      walk(p, acc);
    } else if (AUDIO_EXT.test(item)) {
      acc.push(p);
    }
  }

  return acc;
}

function relPublic(abs) {
  const rel = path.relative(path.join(repo, "public"), abs);
  return "/" + rel.split(path.sep).join("/");
}

function pixGroupFromPath(s) {
  const x = s.toLowerCase();

  if (x.includes("ring") && x.includes("bell")) return "Ring the Bell";
  if (x.includes("thank-you") || x.includes("thank_you")) return "Thank You";
  if (x.includes("til-im-dyin") || x.includes("dyin") || x.includes("tryin")) return "Til I'm Dyin' I'm Tryin'";
  if (x.includes("empty-chair") || x.includes("chair")) return "That Empty Chair";
  if (x.includes("have-to") || x.includes("have_to")) return "Have-To Duet";
  if (x.includes("believe")) return "Believe in Me";
  if (x.includes("those-days") || x.includes("these-days")) return "Those Days These Days";
  if (x.includes("no-mystery") || x.includes("mystery")) return "No Mystery";

  return "Other / Needs Review";
}

function titleFromPath(audioUrl) {
  return audioUrl
    .split("/")
    .pop()
    .replace(/\.(mp3|wav|m4a|aif|aiff|flac)$/i, "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.length ? w[0].toUpperCase() + w.slice(1) : w)
    .join(" ");
}

const found = new Map();

for (const root of wantedRoots) {
  const absRoot = path.join(repo, root);
  if (!fs.existsSync(absRoot)) continue;

  for (const abs of walk(absRoot)) {
    const audioUrl = relPublic(abs);

    const lower = audioUrl.toLowerCase();

    const isRelevant =
      lower.includes("/fathers-day/") ||
      lower.includes("/thank-you/") ||
      lower.includes("ring") ||
      lower.includes("bell") ||
      lower.includes("dyin") ||
      lower.includes("tryin") ||
      lower.includes("empty-chair") ||
      lower.includes("have-to") ||
      lower.includes("believe") ||
      lower.includes("those-days") ||
      lower.includes("these-days") ||
      lower.includes("mystery");

    if (!isRelevant) continue;

    found.set(audioUrl, {
      kkId: audioUrl.split("/").pop().replace(AUDIO_EXT, ""),
      title: titleFromPath(audioUrl),
      audioUrl,
      pixGroup: pixGroupFromPath(audioUrl),
      sourceBucket: root,
      status: "CURRENT_CANDIDATE_NEEDS_USER_APPROVAL",
    });
  }
}

const kks = [...found.values()].sort((a, b) => {
  const ga = a.pixGroup.localeCompare(b.pixGroup);
  if (ga !== 0) return ga;
  return a.kkId.localeCompare(b.kkId);
});

const byGroup = {};

for (const kk of kks) {
  byGroup[kk.pixGroup] ||= [];
  byGroup[kk.pixGroup].push(kk);
}

const manifest = {
  setId: "fathers-day-current-all-candidates",
  lane: "holiday_fathers_day_candidate_pool",
  holiday: "Father’s Day",
  status: "GATHERED_NOT_PUBLIC_APPROVED",
  rule: "Must include all current KKs from all described PIXs. Public display requires user approval of at least 8 KKs.",
  count: kks.length,
  groups: Object.fromEntries(Object.entries(byGroup).map(([k, v]) => [k, v.length])),
  kks,
};

fs.writeFileSync(
  path.join(repo, "data/kk-sets/fathers-day-current-all-candidates.json"),
  JSON.stringify(manifest, null, 2)
);

let md = `# Father’s Day Current KK Candidate Pool\n\n`;
md += `Total gathered: ${kks.length}\n\n`;

for (const [group, arr] of Object.entries(byGroup)) {
  md += `## ${group} — ${arr.length}\n\n`;
  for (const kk of arr) {
    md += `- ${kk.title}\n  - ${kk.audioUrl}\n`;
  }
  md += `\n`;
}

fs.writeFileSync(
  path.join(repo, "reports/fathers-day-current-all-candidates.md"),
  md
);

console.log("TOTAL CURRENT FATHER'S DAY CANDIDATE KKS:", kks.length);
console.log("GROUP COUNTS:");
for (const [group, arr] of Object.entries(byGroup)) {
  console.log(`${group}: ${arr.length}`);
}
console.log("");
console.log("WROTE data/kk-sets/fathers-day-current-all-candidates.json");
console.log("WROTE reports/fathers-day-current-all-candidates.md");
