import fs from "node:fs";
import path from "node:path";

const repairPath = "data/gpmc-sensory/income-fill/audio-repair/income-fill-sprint-01-audio-repair-plan.json";
const outputPath = "data/gpmc-sensory/income-fill/audio-discovery/income-fill-sprint-01-theme-audio-discovery.json";

const repair = JSON.parse(fs.readFileSync(repairPath, "utf8"));

const themes = {
  birthday: [
    "birthday",
    "birth-day",
    "best-birthday",
    "celebrate",
    "celebration",
    "party",
    "candles"
  ],
  encouragement_support: [
    "encourage",
    "encouragement",
    "support",
    "strong",
    "strength",
    "hope",
    "carry",
    "resilience",
    "keep-going",
    "better-days"
  ],
  friendship: [
    "friend",
    "friendship",
    "best-friend",
    "always-listening",
    "together",
    "laugh",
    "fun-along-the-way"
  ]
};

const audioExtensions = new Set([".mp3", ".wav", ".m4a", ".aiff", ".aif"]);

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (audioExtensions.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }

  return out;
}

function scoreAudio(file, keywords) {
  const lower = file.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k.toLowerCase()));
  return { hits, score: hits.length };
}

function publicUrlFor(file) {
  if (file.startsWith("public/")) return "/" + file.replace(/^public\//, "");
  return null;
}

const audioFiles = walk("public");

const themeAudio = {};

for (const [theme, keywords] of Object.entries(themes)) {
  const matches = audioFiles
    .map((file) => {
      const scored = scoreAudio(file, keywords);
      return {
        theme,
        source_audio_file: file,
        public_audio_url: publicUrlFor(file),
        keyword_hits: scored.hits,
        score: scored.score,
        audio_discovery_status: scored.score > 0 ? "POSSIBLE_THEME_AUDIO" : "LOW_CONFIDENCE_AUDIO",
        public_status: "not_public",
        route_created: false,
        stripe_created: false,
        buyer_exposure: "none"
      };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.source_audio_file.localeCompare(b.source_audio_file))
    .slice(0, 30);

  themeAudio[theme] = {
    theme,
    candidate_audio_count: matches.length,
    discovery_status:
      matches.length >= 8
        ? "ENOUGH_AUDIO_FOR_REVIEW"
        : matches.length > 0
          ? "PARTIAL_AUDIO_FOR_REVIEW"
          : "NO_THEME_AUDIO_FOUND",
    candidates: matches
  };
}

const output = {
  status: "income_fill_sprint_01_theme_audio_discovery",
  name: "Income Fill Sprint 01 Theme Audio Discovery",
  source_repair_plan: repairPath,
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  scanned_root: "public",
  audio_file_count_scanned: audioFiles.length,
  themes: themeAudio,
  critical_warning:
    "This is audio discovery only. It does not approve candidates, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_rule:
    "Only human-reviewed theme-matched audio may repair an internal candidate before approve_internal."
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("INCOME FILL SPRINT 01 THEME AUDIO DISCOVERY");
console.log(`audio_file_count_scanned: ${audioFiles.length}`);
for (const [theme, block] of Object.entries(themeAudio)) {
  console.log(`${theme}: audio_candidates=${block.candidate_audio_count} status=${block.discovery_status}`);
}
console.log(`WROTE ${outputPath}`);
