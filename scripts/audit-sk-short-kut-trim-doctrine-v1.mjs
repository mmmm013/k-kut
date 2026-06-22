import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const jsonPath = "data/kut-inventory/doctrine/sk-short-kut-trim-doctrine-v1.json";
const mdPath = "records/doctrine/sk-short-kut-trim-doctrine-v1.md";
const htmlPath = "review-sessions/formal-kut-review-set-001/FORMAL_KUT_REVIEW_SET_001.html";

for (const p of [jsonPath, mdPath, htmlPath]) {
  if (!fs.existsSync(p)) fail(`Missing ${p}`);
}

if (fs.existsSync(jsonPath)) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const all = JSON.stringify(data);

  for (const marker of [
    "NO_MUSIC_ONLY_INTRO",
    "NO_MUSIC_ONLY_TAIL",
    "SK_START_IMMEDIATE_MEANING",
    "NO_AUDIO_WITHOUT_PREFLIGHT",
    "trim music-only intro",
    "trim music-only tail",
    "duration greater than zero"
  ]) {
    if (!all.includes(marker)) fail(`Doctrine missing marker: ${marker}`);
  }

  if (data.releaseReadyNow !== false) fail("Doctrine must not create release-ready state.");
  if (data.publicReadyNow !== false) fail("Doctrine must not create public-ready state.");
}

if (fs.existsSync(mdPath)) {
  const md = fs.readFileSync(mdPath, "utf8");
  for (const marker of ["sK approval law", "music-only intro", "music-only tail", "Audio preflight law"]) {
    if (!md.includes(marker)) fail(`Markdown doctrine missing marker: ${marker}`);
  }
}

if (fs.existsSync(htmlPath)) {
  const html = fs.readFileSync(htmlPath, "utf8");
  for (const marker of ["sK TRIM LAW", "no music-only intro", "no music-only tail", "duration greater than zero"]) {
    if (!html.includes(marker)) fail(`Formal review room missing visible marker: ${marker}`);
  }
}

if (failures.length) {
  console.error("sK short-KUT TRIM DOCTRINE AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("sK short-KUT TRIM DOCTRINE AUDIT: PASS");
console.log("sK trim law is locked: no music-only intro, no music-only tail, no player without audio duration.");
