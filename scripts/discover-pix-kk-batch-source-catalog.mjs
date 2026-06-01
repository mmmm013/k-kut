import fs from "node:fs";
import path from "node:path";

const outputPath = "data/gpmc-sensory/batch-scale/pix-kk-batch-source-catalog.json";

const scanRoots = ["data", "lib", "public"].filter((p) => fs.existsSync(p));
const allowedExtensions = new Set([".json", ".jsonl", ".ts", ".tsx", ".js", ".mjs", ".md", ".txt"]);

const themeKeywords = {
  birthday: ["birthday", "celebrate", "celebration", "party", "another year"],
  encouragement_support: ["encourage", "support", "strength", "hope", "carry", "keep going", "resilience"],
  friendship: ["friend", "friendship", "best friend", "together", "always listening"],
  gratitude_thank_you: ["thank you", "thanks", "grateful", "gratitude"],
  romance_love: ["love", "romance", "heart", "forever"],
  anniversary: ["anniversary"],
  wedding_forever: ["wedding", "bride", "first dance", "forever"],
  apology_repair: ["apology", "sorry", "repair", "forgive"],
  family_parent: ["mom", "mum", "mother", "father", "dad", "parent", "family"],
  mentor_recognition: ["mentor", "teacher", "guide", "showing me the way"],
  missing_you: ["missing you", "miss you", "distance", "away"],
  kupid_spark: ["kupid", "spark", "crush"]
};

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (allowedExtensions.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

function scoreThemes(text) {
  const lower = text.toLowerCase();
  const hits = [];

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    const themeHits = keywords.filter((k) => lower.includes(k.toLowerCase()));
    if (themeHits.length) {
      hits.push({
        theme,
        score: themeHits.length,
        keyword_hits: themeHits
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score);
}

function audioHints(text) {
  const matches = text.match(/\/?[^"'\s)]+?\.(mp3|wav|m4a|aiff|aif)/gi) || [];
  return [...new Set(matches)].slice(0, 25);
}

const files = scanRoots.flatMap(walk);
const records = [];

for (const file of files) {
  let text = "";
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  if (!text.trim()) continue;

  const themeScores = scoreThemes(text);
  if (!themeScores.length) continue;

  records.push({
    batch_source_id: `batch-source-${String(records.length + 1).padStart(5, "0")}`,
    source_file: file,
    source_type: "repo_text_or_config",
    detected_themes: themeScores.slice(0, 5),
    primary_theme: themeScores[0].theme,
    primary_theme_score: themeScores[0].score,
    audio_hints: audioHints(text),
    audio_hint_count: audioHints(text).length,
    candidate_generation_status: "ready_for_batch_candidate_generation",
    review_status: "not_reviewed",
    public_status: "not_public",
    public_route: null,
    stripe_url_if_payment_allowed: null,
    buyer_exposure: "none"
  });
}

records.sort((a, b) => b.primary_theme_score - a.primary_theme_score || a.source_file.localeCompare(b.source_file));

const themeCounts = {};
for (const r of records) {
  themeCounts[r.primary_theme] = (themeCounts[r.primary_theme] || 0) + 1;
}

const output = {
  status: "pix_kk_batch_source_catalog",
  name: "PIX/KK Batch Source Catalog",
  public_status: "not_public",
  buyer_exposure: "none",
  routes_created: false,
  stripe_created: false,
  scan_roots: scanRoots,
  files_scanned: files.length,
  source_records_found: records.length,
  preferred_batch_size: 100,
  minimum_batch_size: 25,
  theme_counts: themeCounts,
  critical_warning:
    "This is batch source discovery only. It does not approve candidates, publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  batch_rule:
    "Use this catalog to generate internal candidates in batches. Deep manual review is required only for exceptions, high-risk lanes, internal approval, or public promotion.",
  records
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("PIX/KK BATCH SOURCE CATALOG");
console.log(`files_scanned: ${files.length}`);
console.log(`source_records_found: ${records.length}`);
console.log("theme_counts:");
for (const [theme, count] of Object.entries(themeCounts).sort((a,b) => b[1] - a[1])) {
  console.log(`${theme}: ${count}`);
}
console.log(`WROTE ${outputPath}`);
