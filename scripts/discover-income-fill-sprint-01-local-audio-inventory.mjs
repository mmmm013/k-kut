import fs from "node:fs";
import path from "node:path";

const outputPath = "data/gpmc-sensory/income-fill/audio-discovery/income-fill-sprint-01-local-audio-inventory.json";

const themes = {
  birthday: ["birthday", "birth", "celebrate", "celebration", "party", "candles", "best-birthday"],
  encouragement_support: ["encourage", "encouragement", "support", "strong", "strength", "hope", "carry", "resilience", "keep-going", "better-days"],
  friendship: ["friend", "friendship", "best-friend", "always-listening", "together", "laugh", "fun-along-the-way"]
};

const audioExtensions = new Set([".mp3", ".wav", ".m4a", ".aiff", ".aif"]);

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name.startsWith(".") ||
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git"
    ) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (audioExtensions.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }

  return out;
}

function publicUrlFor(file) {
  if (file.startsWith("public/")) return "/" + file.replace(/^public\//, "");
  return null;
}

function score(file, keywords) {
  const lower = file.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k.toLowerCase()));
  return { hits, score: hits.length };
}

const audioFiles = walk(".");

const themesOut = {};
for (const [theme, keywords] of Object.entries(themes)) {
  const matches = audioFiles
    .map((file) => {
      const normalized = file.replace(/^\.\//, "");
      const s = score(normalized, keywords);

      return {
        theme,
        source_audio_file: normalized,
        public_audio_url: publicUrlFor(normalized),
        is_public_ready_file: normalized.startsWith("public/"),
        keyword_hits: s.hits,
        score: s.score,
        inventory_status: s.score > 0 ? "POSSIBLE_THEME_AUDIO" : "LOW_CONFIDENCE_AUDIO",
        public_status: "not_public",
        route_created: false,
        stripe_created: false,
        buyer_exposure: "none"
      };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.source_audio_file.localeCompare(b.source_audio_file))
    .slice(0, 50);

  themesOut[theme] = {
    theme,
    local_audio_candidate_count: matches.length,
    public_ready_count: matches.filter((m) => m.is_public_ready_file).length,
    private_or_unexported_count: matches.filter((m) => !m.is_public_ready_file).length,
    inventory_status:
      matches.length >= 8
        ? "ENOUGH_LOCAL_AUDIO_FOR_REVIEW"
        : matches.length > 0
          ? "PARTIAL_LOCAL_AUDIO_FOR_REVIEW"
          : "NO_LOCAL_THEME_AUDIO_FOUND",
    candidates: matches
  };
}

const output = {
  status: "income_fill_sprint_01_local_audio_inventory",
  name: "Income Fill Sprint 01 Local Audio Inventory",
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  audio_file_count_scanned: audioFiles.length,
  critical_warning:
    "This is local audio inventory only. It does not approve candidates, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  approval_rule:
    "Only human-reviewed, theme-matched audio may repair an internal candidate before approve_internal. Public promotion remains separate.",
  themes: themesOut
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("INCOME FILL SPRINT 01 LOCAL AUDIO INVENTORY");
console.log(`audio_file_count_scanned: ${audioFiles.length}`);
for (const [theme, block] of Object.entries(themesOut)) {
  console.log(`${theme}: local=${block.local_audio_candidate_count} public_ready=${block.public_ready_count} private_or_unexported=${block.private_or_unexported_count} status=${block.inventory_status}`);
}
console.log(`WROTE ${outputPath}`);
