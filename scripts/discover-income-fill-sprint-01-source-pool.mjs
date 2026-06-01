import fs from "node:fs";
import path from "node:path";

const outputPath = "data/gpmc-sensory/income-fill/source-discovery/income-fill-sprint-01-source-pool.json";

const themes = {
  birthday: [
    "birthday",
    "birth day",
    "another year",
    "celebrate",
    "celebration",
    "party",
    "candles",
    "best birthday"
  ],
  encouragement_support: [
    "encourage",
    "encouragement",
    "support",
    "carry",
    "through",
    "strong",
    "strength",
    "keep going",
    "you can",
    "dark days",
    "better days",
    "hope",
    "believe",
    "resilience"
  ],
  friendship: [
    "friend",
    "friendship",
    "best friend",
    "there for me",
    "there for you",
    "always listening",
    "beside you",
    "together",
    "laugh",
    "fun along the way"
  ]
};

const scanRoots = [
  "data",
  "lib",
  "public"
].filter((p) => fs.existsSync(p));

const allowedExtensions = new Set([
  ".json",
  ".jsonl",
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".md",
  ".txt"
]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (allowedExtensions.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

function scoreText(text, keywords) {
  const lower = text.toLowerCase();
  const hits = keywords.filter((k) => lower.includes(k.toLowerCase()));
  return { hits, score: hits.length };
}

function audioHints(text) {
  const matches = text.match(/\/[^"'\s)]+?\.(mp3|wav|m4a|aiff|aif)/gi) || [];
  return [...new Set(matches)].slice(0, 20);
}

const files = scanRoots.flatMap(walk);

const candidates = [];

for (const file of files) {
  let text = "";
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  if (!text.trim()) continue;

  for (const [theme, keywords] of Object.entries(themes)) {
    const scored = scoreText(text, keywords);
    if (scored.score < 1) continue;

    const lines = text.split(/\r?\n/);
    const snippets = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      if (scored.hits.some((h) => lower.includes(h.toLowerCase()))) {
        snippets.push({
          line_number: i + 1,
          text: line.trim().slice(0, 280)
        });
      }
      if (snippets.length >= 5) break;
    }

    candidates.push({
      theme,
      source_file: file,
      keyword_hits: scored.hits,
      keyword_hit_count: scored.score,
      audio_hints: audioHints(text),
      snippets,
      source_status: "source_pool_candidate",
      public_status: "not_public",
      route_created: false,
      stripe_created: false
    });
  }
}

const grouped = {};
for (const theme of Object.keys(themes)) {
  grouped[theme] = candidates
    .filter((c) => c.theme === theme)
    .sort((a, b) => b.keyword_hit_count - a.keyword_hit_count)
    .slice(0, 50);
}

const output = {
  status: "income_fill_sprint_01_source_pool",
  name: "Income Fill Sprint 01 Source Pool Discovery",
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  scan_roots: scanRoots,
  themes: Object.fromEntries(
    Object.entries(grouped).map(([theme, rows]) => [
      theme,
      {
        source_pool_candidate_count: rows.length,
        target_internal_admin_candidates: 8,
        discovery_status: rows.length >= 8 ? "ENOUGH_SOURCE_POOL_FOR_REVIEW" : rows.length > 0 ? "PARTIAL_SOURCE_POOL" : "NO_SOURCE_POOL_FOUND",
        candidates: rows
      }
    ])
  ),
  locked_summary:
    "This is source discovery only. It does not create approved candidates, routes, Stripe links, or buyer-facing records."
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("INCOME FILL SPRINT 01 SOURCE POOL DISCOVERY");
for (const [theme, block] of Object.entries(output.themes)) {
  console.log(`${theme}: source_pool=${block.source_pool_candidate_count} status=${block.discovery_status}`);
}
console.log(`WROTE ${outputPath}`);
