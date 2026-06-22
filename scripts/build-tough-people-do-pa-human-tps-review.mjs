import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const source = "public/pix/tough-people-do/source-audio/tough-people-do-zack-jackson-source.mp3";

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
  const outPath = path.join(outDir, `${item.fileStem}-pa-human-tp-loud-twinkle.mp3`);

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
    displayPix: "Tough People Do — Pa",
    publicArtistAlias: "Pa",
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

const tp = {
  songStart: 2.371,
  v1End_ch1Start: 50.669,
  ch1End_v2Start: 82.602,
  v2End_ch2Start: 129.274,
  ch2End_bridgeStart: 159.342,
  bridgeEnd_ch3Start: 182.199,
  songEnd: 229.335
};

const outDir = "public/kks/tough-people-do/pa-human-tps-review-v1";

const items = [
  {
    id: "tpd-pa-blk1-v1-human",
    fileStem: "pa-blk1-v1",
    publicTitle: "Still Standing",
    publicType: "Full KK Statement",
    price: "$7.99",
    internalStructure: "BLK1 / V1 only",
    lyricBlock: "V1",
    startSec: tp.songStart,
    endSec: tp.v1End_ch1Start
  },
  {
    id: "tpd-pa-blk2-ch1-human",
    fileStem: "pa-blk2-ch1",
    publicTitle: "Tough People Do",
    publicType: "Full KK Statement",
    price: "$7.99",
    internalStructure: "BLK2 / Ch1",
    lyricBlock: "Ch1",
    startSec: tp.v1End_ch1Start,
    endSec: tp.ch1End_v2Start
  },
  {
    id: "tpd-pa-blk3-v2-human",
    fileStem: "pa-blk3-v2",
    publicTitle: "Keep Going",
    publicType: "Full KK Statement",
    price: "$7.99",
    internalStructure: "BLK3 / V2 only",
    lyricBlock: "V2",
    startSec: tp.ch1End_v2Start,
    endSec: tp.v2End_ch2Start
  },
  {
    id: "tpd-pa-blk4-ch2-human",
    fileStem: "pa-blk4-ch2",
    publicTitle: "Strong and Steady",
    publicType: "Full KK Statement",
    price: "$7.99",
    internalStructure: "BLK4 / Ch2",
    lyricBlock: "Ch2",
    startSec: tp.v2End_ch2Start,
    endSec: tp.ch2End_bridgeStart
  },
  {
    id: "tpd-pa-blk5-bridge-human",
    fileStem: "pa-blk5-bridge",
    publicTitle: "A Little Laugh",
    publicType: "Bridge KK Statement",
    price: "$7.99",
    internalStructure: "BLK5 / Bridge",
    lyricBlock: "Bridge",
    startSec: tp.ch2End_bridgeStart,
    endSec: tp.bridgeEnd_ch3Start
  },
  {
    id: "tpd-pa-blk6-ch3-final-human",
    fileStem: "pa-blk6-ch3-final",
    publicTitle: "Tough People Do",
    publicType: "Final KK Statement",
    price: "$7.99",
    internalStructure: "BLK6 / Ch3 final chorus outro",
    lyricBlock: "Ch3",
    startSec: tp.bridgeEnd_ch3Start,
    endSec: tp.songEnd
  }
];

ensureDir("data/kk-sets");

const records = items.map((item) => build({ item, outDir }));

fs.writeFileSync("data/kk-sets/tough-people-do-pa-human-tps-review-v1.json", JSON.stringify({
  title: "Tough People Do — Pa Human TP Review V1",
  displayPix: "Tough People Do — Pa",
  source,
  humanTransitionPoints: tp,
  namingLaw: {
    removeArtistNamesAfterHyphen: true,
    zackDisplayAlias: "Pa",
    kleighDisplayAlias: "Ma"
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
  structureRule: {
    blk1: "V1 only",
    blk2: "Ch1",
    blk3: "V2 only",
    blk4: "Ch2",
    blk5: "Bridge",
    blk6: "Ch3 final chorus outro",
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
  <p class="meta">PIX display: Tough People Do — Pa</p>
  <p class="meta">Lyric block: ${r.lyricBlock}</p>
  <p class="meta">Human TP range: ${r.startSec}s → ${r.endSec}s</p>
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
  <title>Tough People Do — Pa Human TP Review V1</title>
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
  <h1>Tough People Do — Pa Human TP Review V1</h1>
  <p class="subtitle">Human TPs locked. No fake sBLKs. Louder Twinkle. Zero delay before Twinkle.</p>

  <section class="study">
    <h2>Full Source Audio</h2>
    <p class="meta">Authority marks: 2.371 / 50.669 / 82.602 / 129.274 / 159.342 / 182.199 / 229.335</p>
    <audio controls preload="metadata" src="${fullSourceFileUrl}"></audio>
  </section>

  ${cards}
</body>
</html>
`;

fs.writeFileSync("/tmp/tough-people-do-pa-human-tps-review-v1.html", html);

console.log("WROTE JSON: data/kk-sets/tough-people-do-pa-human-tps-review-v1.json");
console.log("WROTE HTML: /tmp/tough-people-do-pa-human-tps-review-v1.html");
