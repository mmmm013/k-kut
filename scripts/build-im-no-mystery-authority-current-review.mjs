import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const source = "public/pix/no-mystery/source-audio/no-mystery-billy-harper-vocal-source.mp3";

const twinkleCandidates = [
  "public/audio-system/twinkle-half-volume/get-so-down-4m11-4m19-soft-signature-twinkle-50.mp3",
  "public/audio-system/twinkle-half-volume/get-so-down-cc-4m13-4m20-magic-signature-twinkle-50.mp3",
  "public/audio-system/twinkle-half-volume/openkut-opening-twinkle-twinkle-50.mp3",
  "public/audio-system/twinkle-half-volume/openkut-twinkle-reverse-raw-1p25s-twinkle-50.mp3"
];

const twinkle = twinkleCandidates.find((p) => fs.existsSync(p));

if (!fs.existsSync(source)) {
  console.error("SOURCE NOT FOUND:", source);
  process.exit(1);
}

if (!twinkle) {
  console.error("TWINKLE NOT FOUND.");
  process.exit(1);
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function dur(file) {
  return Number(execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nk=1:nw=1",
    file
  ]).toString().trim());
}

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: "inherit" });
}

function build({ item, outDir }) {
  ensureDir(outDir);
  const workDir = path.join(outDir, "_work");
  ensureDir(workDir);

  const musicDurationSec = +(item.endSec - item.startSec).toFixed(3);

  const kkWav = path.join(workDir, `${item.fileStem}-kk.wav`);
  const twinkleWav = path.join(workDir, `${item.fileStem}-twinkle-louder.wav`);
  const concatList = path.join(workDir, `${item.fileStem}-concat.txt`);
  const outPath = path.join(outDir, `${item.fileStem}-current-law-loud-twinkle.mp3`);

  console.log(`\nBUILD ${item.publicTitle}`);
  console.log(`${item.internalStructure}: ${item.startSec} → ${item.endSec}`);
  console.log(`Music duration: ${musicDurationSec}s`);
  console.log("LAW: music/fade ends → louder GPM Twinkle immediately → file ends immediately.");

  run("ffmpeg", [
    "-y",
    "-ss", String(item.startSec),
    "-i", source,
    "-t", String(musicDurationSec),
    "-vn",
    "-ar", "44100",
    "-ac", "2",
    "-af", "afade=t=out:st=" + Math.max(0, musicDurationSec - 0.20).toFixed(3) + ":d=0.20",
    "-c:a", "pcm_s16le",
    kkWav
  ]);

  run("ffmpeg", [
    "-y",
    "-i", twinkle,
    "-vn",
    "-ar", "44100",
    "-ac", "2",
    "-af", "volume=2.0",
    "-c:a", "pcm_s16le",
    twinkleWav
  ]);

  fs.writeFileSync(concatList, `file '${path.resolve(kkWav)}'\nfile '${path.resolve(twinkleWav)}'\n`);

  run("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatList,
    "-codec:a", "libmp3lame",
    "-q:a", "2",
    outPath
  ]);

  return {
    ...item,
    displayPix: "I'm No Mystery",
    musicDurationSec,
    twinklePlacement: "IMMEDIATE_AFTER_FINAL_NOTE_FADE",
    twinkleVolumeBoost: "2.0x",
    noDelayBeforeTwinkle: true,
    noOverlap: true,
    noTailAfterTwinkle: true,
    finalRenderLaw: "Music/fade ends, louder GPM Twinkle starts immediately, Twinkle plays alone, file ends immediately.",
    source,
    twinkleSource: twinkle,
    audioUrl: "/" + outPath.replace(/^public\//, ""),
    fileAudioUrl: "file://" + path.resolve(outPath),
    totalDurationSec: dur(outPath)
  };
}

const outDir = "public/kks/no-mystery/im-no-mystery-authority-current-review-v1";

const items = [
  {
    id: "imnm-blk1-current",
    fileStem: "im-no-mystery-blk1",
    publicTitle: "Making a Statement",
    publicType: "Full KK Statement",
    price: "$7.99",
    internalStructure: "BLK1 / Opening verse-family BLK",
    lyricBlock: "BLK1",
    startSec: 0.000,
    endSec: 46.817
  },
  {
    id: "imnm-blk2-current",
    fileStem: "im-no-mystery-blk2",
    publicTitle: "Honoring Him",
    publicType: "Full KK Statement",
    price: "$7.99",
    internalStructure: "BLK2 / First hook-family BLK",
    lyricBlock: "BLK2",
    startSec: 46.817,
    endSec: 73.968
  },
  {
    id: "imnm-blk3-current",
    fileStem: "im-no-mystery-blk3",
    publicTitle: "Strong and Steady",
    publicType: "Full KK Statement",
    price: "$7.99",
    internalStructure: "BLK3 / New lyric verse-family BLK",
    lyricBlock: "BLK3",
    startSec: 73.968,
    endSec: 92.911
  },
  {
    id: "imnm-blk4-current",
    fileStem: "im-no-mystery-blk4",
    publicTitle: "Proud of Him",
    publicType: "Full KK Statement",
    price: "$7.99",
    internalStructure: "BLK4 / Hook-family repeat BLK",
    lyricBlock: "BLK4",
    startSec: 92.911,
    endSec: 113.957
  },
  {
    id: "imnm-blk5-current",
    fileStem: "im-no-mystery-blk5",
    publicTitle: "Missing Him",
    publicType: "Bridge KK Statement",
    price: "$7.99",
    internalStructure: "BLK5 / Bridge / singular contrast candidate BLK",
    lyricBlock: "BLK5",
    startSec: 113.957,
    endSec: 135.539
  },
  {
    id: "imnm-blk6-current",
    fileStem: "im-no-mystery-blk6",
    publicTitle: "Legacy Dad",
    publicType: "Final KK Statement",
    price: "$7.99",
    internalStructure: "BLK6 / Final hook outro close BLK",
    lyricBlock: "BLK6",
    startSec: 135.539,
    endSec: 175.029
  }
];

ensureDir("data/kk-sets");

const records = items.map((item) => build({ item, outDir }));

fs.writeFileSync("data/kk-sets/im-no-mystery-authority-current-review-v1.json", JSON.stringify({
  title: "I'm No Mystery — Authority Current-Law Review V1",
  displayPix: "I'm No Mystery",
  source,
  boundaryAuthority: "KKr BLK Lab Copy-Capture — I'm No Mystery",
  sourceAuthoritySet: "data/kk-sets/im-no-mystery-authority-blk-recut.json",
  humanAuthorityRanges: {
    BLK1: [0.000, 46.817],
    BLK2: [46.817, 73.968],
    BLK3: [73.968, 92.911],
    BLK4: [92.911, 113.957],
    BLK5: [113.957, 135.539],
    BLK6: [135.539, 175.029]
  },
  renderLaw: {
    twinkleRequired: true,
    placement: "IMMEDIATE_AFTER_FINAL_NOTE_FADE",
    rule: "Music/fade ends, louder GPM Twinkle starts immediately, Twinkle plays alone, file ends immediately.",
    twinkleVolumeBoost: "2.0x",
    noDelayBeforeTwinkle: true,
    noOverlap: true,
    noTailAfterTwinkle: true
  },
  reviewLaw: {
    brownPage: true,
    singleAudioPlayerOnly: true,
    noNewTimingGuesses: true,
    noFakeSBLKs: true
  },
  items: records
}, null, 2));

const fullSourceFileUrl = "file://" + path.resolve(source);

const cards = records.map((r) => `
<section class="card">
  <div class="topline">
    <div>
      <h2>${r.publicTitle}</h2>
      <p class="type">${r.publicType} — ${r.price}</p>
    </div>
    <div class="badge">${r.internalStructure}</div>
  </div>
  <p class="meta">PIX display: I'm No Mystery</p>
  <p class="meta">Authority TP range: ${r.startSec}s → ${r.endSec}s</p>
  <p class="meta">Music duration: ${r.musicDurationSec}s</p>
  <p class="meta">Twinkle: louder, starts immediately after music/fade, no gap, no overlap, no tail.</p>
  <audio controls preload="metadata" src="${r.fileAudioUrl}"></audio>
  <p class="decision">Decision: PASS / HOLD / RECUT / REJECT</p>
</section>
`).join("\n");

const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>I'm No Mystery — Authority Current-Law Review V1</title>
  <style>
    body { margin:0; font-family:Arial,sans-serif; background:#2b1b12; color:#fff4dc; padding:32px; }
    h1 { color:#ffd37a; font-size:42px; margin:0 0 8px; }
    .subtitle { color:#e9c893; font-size:20px; margin-bottom:24px; }
    .study { background:#24150e; border:1px solid #6e431f; border-radius:18px; padding:20px; margin:20px 0 30px; }
    .card { background:#3a2417; border:1px solid #8b5a2b; border-radius:18px; padding:24px; margin:22px 0; }
    .topline { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; }
    h2 { color:#fff6df; font-size:32px; margin:0 0 8px; }
    .type { color:#ffd37a; font-size:18px; margin:0; }
    .badge { border:1px solid #d1994e; color:#ffd37a; border-radius:999px; padding:8px 12px; font-size:12px; max-width:440px; }
    .meta { color:#e4c7a0; font-size:15px; margin:7px 0; }
    audio { width:100%; margin-top:16px; }
    .decision { font-size:22px; color:#fff1c6; margin-top:18px; font-weight:bold; }
  </style>
</head>
<body>
  <h1>I'm No Mystery — Authority Current-Law Review V1</h1>
  <p class="subtitle">Authority BLK ranges only. Louder Twinkle. Zero delay. Single-player enforced.</p>

  <section class="study">
    <h2>Full Source Audio</h2>
    <p class="meta">Authority ranges: 0.000 / 46.817 / 73.968 / 92.911 / 113.957 / 135.539 / 175.029</p>
    <audio controls preload="metadata" src="${fullSourceFileUrl}"></audio>
  </section>

  ${cards}

<script>
function enforceSingleAudioPlayer(){
  const players = Array.from(document.querySelectorAll("audio"));
  players.forEach((player) => {
    player.addEventListener("play", () => {
      players.forEach((other) => {
        if (other !== player) other.pause();
      });
    });
  });
}
enforceSingleAudioPlayer();
</script>
</body>
</html>
`;

fs.writeFileSync("/tmp/im-no-mystery-authority-current-review-v1.html", html);

console.log("WROTE JSON: data/kk-sets/im-no-mystery-authority-current-review-v1.json");
console.log("WROTE HTML: /tmp/im-no-mystery-authority-current-review-v1.html");
