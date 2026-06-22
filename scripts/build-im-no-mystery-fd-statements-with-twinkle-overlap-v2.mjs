import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const source = "public/pix/no-mystery/source-audio/no-mystery-billy-harper-vocal-source.mp3";

const canonicalTwinkleId = "gpmx-canonical-twinkle";
const canonicalTwinkleSource = "public/audio-system/twinkle-half-volume/get-so-down-4m11-4m19-soft-signature-twinkle-50.mp3";
const twinkleApplicationGain = 2.0;
const twinkleAttachPoint = "artTailEnd";
const twinkleRole = "GPMx product inventory priming / art-tail adornment";
const twinkle = canonicalTwinkleSource;

if (!fs.existsSync(source)) {
  console.error("SOURCE AUDIO NOT FOUND:", source);
  process.exit(1);
}

if (!fs.existsSync(canonicalTwinkleSource)) {
  console.error("CANONICAL GPMx TWINKLE NOT FOUND:", canonicalTwinkleSource);
  process.exit(1);
}

const outDir = "public/kks/no-mystery/fathers-day-statements-twinkle-overlap-v2";
const workDir = path.join(outDir, "_work");
const jsonOut = "data/kk-sets/fathers-day-statements-twinkle-overlap-v2.json";
const reviewHtml = "/tmp/fathers-day-twinkle-overlap-v2-review.html";

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(workDir, { recursive: true });
fs.mkdirSync(path.dirname(jsonOut), { recursive: true });

const boundaryAuthority = "KKr BLK Lab Copy-Capture — I'm No Mystery + human review lock 2026-06-08";
const twinkleRule = "GPM Twinkle is a required staple component. Twinkle must BEGIN 2.000 seconds before the KK ends.";

const items = [
  {
    id: "fd-im-no-mystery-about-dad-short-twinkle-v2",
    publicTitle: "’Bout Dad",
    publicType: "Short KK Statement",
    price: "$4.99",
    internalStructure: "sBLK1 inside BLK1",
    startSec: 0.000,
    endSec: 27.891,
    humanDecisionBeforeTwinkle: "PASS"
  },
  {
    id: "fd-im-no-mystery-heres-my-dad-short-twinkle-v2",
    publicTitle: "Here’s My Dad",
    publicType: "Short KK Statement",
    price: "$4.99",
    internalStructure: "sBLK2 inside BLK1",
    startSec: 27.891,
    endSec: 46.317,
    humanDecisionBeforeTwinkle: "PASS"
  },
  {
    id: "fd-im-no-mystery-making-a-statement-full-twinkle-v2",
    publicTitle: "Making a Statement",
    publicType: "Full KK Statement",
    price: "$7.99",
    internalStructure: "BLK1 parent with human trim",
    startSec: 0.000,
    endSec: 46.067,
    humanDecisionBeforeTwinkle: "PASS",
    reason: "Human review: cut 0.25s sooner than 46.317."
  }
];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ffprobeDuration(file) {
  return Number(execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nk=1:nw=1",
    file
  ]).toString().trim());
}

const records = [];

for (const item of items) {
  const baseDurationSec = +(item.endSec - item.startSec).toFixed(3);
  const twinkleStartSec = +(baseDurationSec - 2.000).toFixed(3);
  const twinkleDelayMs = Math.max(0, Math.round(twinkleStartSec * 1000));

  const safeName = slugify(item.publicTitle);

  const kkWav = path.join(workDir, `${safeName}-kk.wav`);
  const twinkleWav = path.join(workDir, `${safeName}-twinkle.wav`);
  const mixedWav = path.join(workDir, `${safeName}-mixed.wav`);
  const outPath = path.join(outDir, `${safeName}-twinkle-2sec-sooner.mp3`);

  console.log(`\nBUILD ${item.publicTitle}`);
  console.log(`KK: ${item.startSec} → ${item.endSec} (${baseDurationSec}s)`);
  console.log(`TWINKLE begins at KK time: ${twinkleStartSec}s`);
  console.log(`TWINKLE delay: ${twinkleDelayMs}ms`);
  console.log(`TWINKLE source: ${twinkle}`);

  execFileSync("ffmpeg", [
    "-y",
    "-i", source,
    "-ss", String(item.startSec),
    "-t", String(baseDurationSec),
    "-vn",
    "-ar", "44100",
    "-ac", "2",
    "-c:a", "pcm_s16le",
    kkWav
  ], { stdio: "inherit" });

  execFileSync("ffmpeg", [
    "-y",
    "-i", twinkle,
    "-vn",
    "-ar", "44100",
    "-ac", "2",
    "-c:a", "pcm_s16le",
    twinkleWav
  ], { stdio: "inherit" });

  execFileSync("ffmpeg", [
    "-y",
    "-i", kkWav,
    "-i", twinkleWav,
    "-filter_complex",
    `[1:a]volume=${twinkleApplicationGain},adelay=${twinkleDelayMs}|${twinkleDelayMs}[tw];[0:a][tw]amix=inputs=2:duration=longest:dropout_transition=0[mix]`,
    "-map", "[mix]",
    "-ar", "44100",
    "-ac", "2",
    "-c:a", "pcm_s16le",
    mixedWav
  ], { stdio: "inherit" });

  execFileSync("ffmpeg", [
    "-y",
    "-i", mixedWav,
    "-codec:a", "libmp3lame",
    "-q:a", "2",
    outPath
  ], { stdio: "inherit" });

  const totalDurationSec = ffprobeDuration(outPath);

  records.push({
    ...item,
    baseDurationSec,
    boundaryAuthority,
    twinkleRule,
canonicalTwinkleId,
    canonicalTwinkleSource,
    twinkleSource: twinkle,
    twinkleApplicationGain,
    twinkleRequired: true,
    twinkleApplied: true,
    twinkleAttachPoint,
    twinkleRole,
    twinkleStartRelativeToKkSec: twinkleStartSec,
    twinkleStartsBeforeKkEndSec: 2.000,
    source,
    audioUrl: "/" + outPath.replace(/^public\//, ""),
    localReviewFile: outPath,
    totalDurationSec,
    twinkleRequired: true,
    twinkleApplied: true,
    twinkleRole,
    repeatReviewRequired: true,
    reviewDecisionAfterTwinkle: "PENDING_REPEAT_REVIEW"
  });
}

fs.writeFileSync(jsonOut, JSON.stringify({
  title: "Father's Day Statements — I'm No Mystery with GPM Twinkle 2 Seconds Sooner",
  source,
  boundaryAuthority,
  twinkleRule,
  gpmxTwinkleProductInventoryArtTailRule: {
    canonicalTwinkleId,
    canonicalTwinkleSource,
    twinkleApplicationGain,
    twinkleRequired: true,
    twinkleApplied: true,
    twinkleAttachPoint,
    twinkleRole,
    productBoundary: "Product-bound II/CI/KK/K-KOMBO/DP/Dispatch assets must receive the one canonical Twinkle at the art-tail end when inventoried. Raw/source/review lanes remain protected and unforced."
  },
  visualReviewTheme: "Warm brown / amber",
  humanReviewLock: {
    aboutDad: "PASS before Twinkle",
    heresMyDad: "PASS before Twinkle",
    makingStatement: "PASS before Twinkle; cut 0.25s sooner",
    repeatReview: "Required after Twinkle overlap render"
  },
  items: records
}, null, 2));

const cards = records.map((item) => {
  const fileName = path.basename(item.localReviewFile);
  return `
    <section class="card">
      <div class="topline">
        <div>
          <h2>${item.publicTitle}</h2>
          <p class="type">${item.publicType} — ${item.price}</p>
        </div>
        <div class="badge">PENDING RE-REVIEW</div>
      </div>

      <p class="meta">${fileName}</p>
      <p class="meta">KK: ${item.startSec}s → ${item.endSec}s | KK duration: ${item.baseDurationSec}s</p>
      <p class="meta">Twinkle begins at ${item.twinkleStartRelativeToKkSec}s, exactly 2.000s before KK end.</p>

      <audio controls src="http://localhost:3000${item.audioUrl}"></audio>

      <p class="decision">Decision: PASS / RECUT / HOLD</p>
    </section>
  `;
}).join("\n");

const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Father's Day Twinkle Overlap V2 Review</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #2b1b12;
      color: #fff4dc;
      padding: 32px;
    }
    h1 {
      color: #ffd37a;
      font-size: 42px;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #e9c893;
      font-size: 20px;
      margin-bottom: 28px;
    }
    .card {
      background: #3a2417;
      border: 1px solid #8b5a2b;
      border-radius: 18px;
      padding: 24px;
      margin: 22px 0;
      box-shadow: 0 0 0 1px rgba(255, 211, 122, 0.08);
    }
    .topline {
      display: flex;
      justify-content: space-between;
      gap: 18px;
      align-items: start;
    }
    h2 {
      color: #fff6df;
      font-size: 32px;
      margin: 0 0 8px;
    }
    .type {
      color: #ffd37a;
      font-size: 18px;
      margin: 0 0 18px;
    }
    .badge {
      border: 1px solid #d1994e;
      color: #ffd37a;
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 12px;
      white-space: nowrap;
    }
    .meta {
      color: #e4c7a0;
      font-size: 15px;
      margin: 7px 0;
    }
    audio {
      width: 100%;
      margin-top: 16px;
    }
    .decision {
      font-size: 20px;
      color: #fff1c6;
      margin-top: 18px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>Father's Day Twinkle KK Repeat Review</h1>
  <p class="subtitle">Warm brown review. Twinkle begins 2.000 seconds before each KK ends. Do not use /HUGs.</p>
  ${cards}
</body>
</html>
`;

fs.writeFileSync(reviewHtml, html);

console.log("\nWROTE:", jsonOut);
console.log("WROTE AUDIO DIR:", outDir);
console.log("WROTE REVIEW HTML:", reviewHtml);
