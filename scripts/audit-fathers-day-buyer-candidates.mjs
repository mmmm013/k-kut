import fs from "node:fs";
import path from "node:path";

const OUT_JSON = "reports/fathers-day/fathers-day-buyer-candidates.json";
const OUT_MD = "reports/fathers-day/fathers-day-buyer-candidates.md";

const candidateSourceHints = [
  "Life's a Test",
  "Lifes a Test",
  "Life’s a Test",
  "That's a Have To",
  "Thats a Have To",
  "That’s a Have To",
  "Have-To",
  "Have To",
  "That Empty Chair",
  "No Mystery"
];

const buyerUseCases = [
  {
    id: "dad-gratitude",
    label: "Thanks, Dad",
    terms: ["dad", "father", "thank", "thanks", "grateful", "appreciate", "showing me", "taught me"]
  },
  {
    id: "dad-strength",
    label: "Strength / Life Lessons",
    terms: ["strong", "strength", "life", "test", "lesson", "carry", "stand", "fight", "keep going"]
  },
  {
    id: "dad-memory",
    label: "Missing Dad / Empty Chair",
    terms: ["empty chair", "missing", "miss", "memory", "gone", "remember", "still here", "chair"]
  },
  {
    id: "dad-repair",
    label: "Repair / Hard to Say",
    terms: ["sorry", "forgive", "repair", "hard to say", "not enough", "wish", "call"]
  },
  {
    id: "dad-pride",
    label: "Proud / Role Model",
    terms: ["proud", "look up", "guide", "hero", "example", "best", "man"]
  },
  {
    id: "dad-support",
    label: "Support / I’m Here",
    terms: ["here", "support", "not alone", "hold", "help", "care", "love remains"]
  }
];

const forbiddenPathTerms = [
  "instro",
  "instrumental",
  "music maykers",
  "christmas",
  "xmas",
  "valentine",
  "mothers-day",
  "mother's day",
  "mother",
  "mom"
];

const publicForbiddenTerms = [
  "Music Maykers",
  "LT-PIX",
  "mK",
  "mini-KUT",
  "instro",
  "instrumental"
];

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function isAudio(p) {
  return /\.(mp3|wav|m4a|aiff|aif)$/i.test(p);
}

function isJsonOrMd(p) {
  return /\.(json|md|txt|ts|tsx|js|mjs)$/i.test(p);
}

function includesAny(text, terms) {
  const low = text.toLowerCase();
  return terms.some((t) => low.includes(t.toLowerCase()));
}

function scoreUseCases(text) {
  const low = text.toLowerCase();
  return buyerUseCases
    .map((uc) => {
      const hits = uc.terms.filter((t) => low.includes(t.toLowerCase()));
      return { ...uc, hits, score: hits.length };
    })
    .filter((uc) => uc.score > 0)
    .sort((a, b) => b.score - a.score);
}

const files = [
  ...walk("public"),
  ...walk("data"),
  ...walk("reports"),
  ...walk("manifests"),
  ...walk("lib"),
  ...walk("app")
];

const audioCandidates = [];
const textCandidates = [];

for (const file of files) {
  const normalized = file.replaceAll("\\", "/");
  const lowPath = normalized.toLowerCase();

  if (isAudio(file)) {
    const pathHit = includesAny(normalized, candidateSourceHints) || includesAny(normalized, buyerUseCases.flatMap((x) => x.terms));
    const forbidden = includesAny(normalized, forbiddenPathTerms);

    if (pathHit || lowPath.includes("father") || lowPath.includes("dad")) {
      audioCandidates.push({
        file: normalized,
        status: forbidden ? "REJECT_PATH_FORBIDDEN_OR_NEEDS_ADMIN_REVIEW" : "NEEDS_ADMIN_AUDIO_REVIEW",
        reason: forbidden ? "path contains forbidden/direct-holiday/instro signal" : "path/name matched Father buyer terms or known source hints",
        useCases: scoreUseCases(normalized).map((x) => ({
          id: x.id,
          label: x.label,
          hits: x.hits
        }))
      });
    }
  }

  if (isJsonOrMd(file)) {
    let text = "";
    try {
      text = fs.readFileSync(file, "utf8").slice(0, 250000);
    } catch {
      continue;
    }

    const hitKnownSource = includesAny(text, candidateSourceHints) || includesAny(normalized, candidateSourceHints);
    const hitBuyer = includesAny(text, ["father", "dad", "Father's Day", "Fathers Day", "Father’s Day"]);
    const hitTerms = includesAny(text, buyerUseCases.flatMap((x) => x.terms));

    if (hitKnownSource || hitBuyer || hitTerms) {
      textCandidates.push({
        file: normalized,
        hitKnownSource,
        hitBuyer,
        hitTerms,
        useCases: scoreUseCases(text + " " + normalized).map((x) => ({
          id: x.id,
          label: x.label,
          hits: x.hits.slice(0, 12)
        }))
      });
    }
  }
}

const report = {
  date: "2026-05-30",
  status: "fathers_day_buyer_candidate_audit",
  purpose: "Find pre-made KK/II candidate pools for Father’s Day buyer use cases before changing public UI.",
  laws: [
    "KK / customer-ready II first.",
    "No INSTRO or instrumental-only K-KUT buyer candidates.",
    "No direct same-holiday LT-PIX.",
    "No Music Maykers in public UI.",
    "No mKs / mini-KUTs in public buyer flow unless ADMIN override is active.",
    "Public labels must be buyer-safe; internal source names stay admin-only."
  ],
  candidateSourceHints,
  buyerUseCases: buyerUseCases.map(({ id, label, terms }) => ({ id, label, terms })),
  audioCandidates,
  textCandidates,
  publicForbiddenTerms,
  nextActions: [
    "Review text candidates to identify actual pre-made KKs/IIs.",
    "Reject INSTRO/instrumental/direct forbidden paths.",
    "Select 3-5 Father’s Day buyer-safe options.",
    "Materialize selected KKs with padding + Twinkle.",
    "Add /holiday/fathers-day or Father’s Day section to BIC route config only after delivery audio exists.",
    "Run production BIC audit before treating Father’s Day as released."
  ]
};

fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + "\n");

let md = "# Father’s Day Buyer Candidate Audit\n\n";
md += "Status: fathers_day_buyer_candidate_audit\n\n";
md += "Purpose: find pre-made KK/II candidate pools for Father’s Day buyer use cases before changing public UI.\n\n";

md += "## Laws\n\n";
for (const law of report.laws) md += `- ${law}\n`;

md += "\n## Buyer Use Cases\n\n";
for (const uc of report.buyerUseCases) {
  md += `### ${uc.label}\n`;
  md += `- ID: ${uc.id}\n`;
  md += `- Terms: ${uc.terms.join(", ")}\n\n`;
}

md += "## Known Candidate Source Hints\n\n";
for (const hint of candidateSourceHints) md += `- ${hint}\n`;

md += "\n## Audio Candidates Found\n\n";
if (!audioCandidates.length) {
  md += "No direct audio candidates found by path/name. Search text/registries next.\n\n";
} else {
  for (const c of audioCandidates.slice(0, 120)) {
    md += `- ${c.status}: ${c.file}\n`;
    if (c.useCases.length) md += `  - Use cases: ${c.useCases.map((x) => x.label).join(", ")}\n`;
  }
}

md += "\n## Text / Registry Candidates Found\n\n";
if (!textCandidates.length) {
  md += "No text/registry candidates found.\n\n";
} else {
  for (const c of textCandidates.slice(0, 160)) {
    md += `- ${c.file}\n`;
    md += `  - Known source: ${c.hitKnownSource ? "yes" : "no"} | Father/Dad: ${c.hitBuyer ? "yes" : "no"} | Buyer terms: ${c.hitTerms ? "yes" : "no"}\n`;
    if (c.useCases.length) md += `  - Use cases: ${c.useCases.map((x) => x.label).join(", ")}\n`;
  }
}

md += "\n## Next Actions\n\n";
for (const action of report.nextActions) md += `- ${action}\n`;

fs.writeFileSync(OUT_MD, md);

console.log("Father’s Day buyer candidate audit written.");
console.log("Audio candidates:", audioCandidates.length);
console.log("Text candidates:", textCandidates.length);
console.log("JSON:", OUT_JSON);
console.log("MD:", OUT_MD);
