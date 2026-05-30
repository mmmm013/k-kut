import fs from "node:fs";

const inPath = "reports/fathers-day/fathers-day-buyer-candidates.json";
const outJson = "reports/fathers-day/fathers-day-strict-shortlist.json";
const outMd = "reports/fathers-day/fathers-day-strict-shortlist.md";

if (!fs.existsSync(inPath)) {
  console.error("Missing input:", inPath);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(inPath, "utf8"));

const rejectPathParts = [
  "/audio/kleigh/guide-final/",
  "/audio/kleigh/hug-guide/",
  "/mothers-day/",
  "/signatures/",
  "instro",
  "instrumental",
  "music maykers",
  "valentine",
  "christmas",
  "xmas"
];

const knownSourceHints = [
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

const strongBuyerTerms = [
  "father",
  "fathers day",
  "father’s day",
  "dad",
  "empty chair",
  "life's a test",
  "lifes a test",
  "life’s a test",
  "that's a have to",
  "thats a have to",
  "that’s a have to",
  "that empty chair",
  "no mystery"
];

function hasAny(text, terms) {
  const low = String(text || "").toLowerCase();
  return terms.some((t) => low.includes(t.toLowerCase()));
}

function rejectedPath(file) {
  return hasAny(file, rejectPathParts);
}

const audioStrict = (report.audioCandidates || []).filter((c) => {
  if (rejectedPath(c.file)) return false;
  if (String(c.status || "").startsWith("REJECT")) return false;

  return hasAny(c.file, knownSourceHints) || hasAny(c.file, strongBuyerTerms);
});

const textStrict = (report.textCandidates || []).filter((c) => {
  if (rejectedPath(c.file)) return false;

  return c.hitKnownSource === true || c.hitBuyer === true || hasAny(c.file, strongBuyerTerms);
});

const byUseCase = {};

for (const c of [...audioStrict, ...textStrict]) {
  for (const uc of c.useCases || []) {
    if (!byUseCase[uc.label]) byUseCase[uc.label] = [];
    byUseCase[uc.label].push(c.file);
  }
}

const shortlist = {
  date: "2026-05-30",
  status: "strict_admin_review_shortlist",
  sourceReport: inPath,
  rule: "Strict shortlist excludes guide audio, Mother’s Day paths, INSTRO/instrumental, direct forbidden holiday paths, and weak term matches.",
  audioStrict,
  textStrict,
  byUseCase,
  nextActions: [
    "Manually inspect strict text candidates for actual KK / II records.",
    "Find local or registry audio for known Father’s Day source hints.",
    "Choose 3-5 buyer-safe Father’s Day options.",
    "Materialize selected KKs with padding + Twinkle.",
    "Only then add Father’s Day public UI / BIC config."
  ]
};

fs.writeFileSync(outJson, JSON.stringify(shortlist, null, 2) + "\n");

let md = "# Father’s Day Strict Shortlist\n\n";
md += "Status: strict_admin_review_shortlist\n\n";
md += "Rule: excludes guide audio, Mother’s Day paths, INSTRO/instrumental, direct forbidden holiday paths, and weak term matches.\n\n";

md += "## Counts\n\n";
md += `- Strict audio candidates: ${audioStrict.length}\n`;
md += `- Strict text candidates: ${textStrict.length}\n\n`;

md += "## Strict Audio Candidates\n\n";
if (!audioStrict.length) md += "No strict audio candidates found by path/name.\n\n";
for (const c of audioStrict.slice(0, 120)) {
  md += `- ${c.file}\n`;
  if (c.useCases?.length) md += `  - Use cases: ${c.useCases.map((x) => x.label).join(", ")}\n`;
}

md += "\n## Strict Text / Registry Candidates\n\n";
if (!textStrict.length) md += "No strict text candidates found.\n\n";
for (const c of textStrict.slice(0, 160)) {
  md += `- ${c.file}\n`;
  md += `  - Known source: ${c.hitKnownSource ? "yes" : "no"} | Father/Dad: ${c.hitBuyer ? "yes" : "no"} | Buyer terms: ${c.hitTerms ? "yes" : "no"}\n`;
  if (c.useCases?.length) md += `  - Use cases: ${c.useCases.map((x) => x.label).join(", ")}\n`;
}

md += "\n## By Use Case\n\n";
for (const [label, files] of Object.entries(byUseCase)) {
  md += `### ${label}\n`;
  for (const file of [...new Set(files)].slice(0, 40)) md += `- ${file}\n`;
  md += "\n";
}

md += "## Next Actions\n\n";
for (const action of shortlist.nextActions) md += `- ${action}\n`;

fs.writeFileSync(outMd, md);

console.log("Father’s Day strict shortlist written.");
console.log("Strict audio:", audioStrict.length);
console.log("Strict text:", textStrict.length);
console.log("JSON:", outJson);
console.log("MD:", outMd);
