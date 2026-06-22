import fs from "fs";
import path from "path";
import https from "https";
import { execFileSync } from "child_process";

const repo = process.cwd();

const discoUrl = "https://musicmaykers.disco.ac/e/t/73263359?download=true&s=X-S57KeUWlqEqmT2sHFWPxp9wIE%3AR8hySYoj&artwork=true&color=%234E98FF&theme=white";

const sourceDir = path.join(repo, "public/pix/believe-in-me/source-audio");
const kkDir = path.join(repo, "public/kks/fathers-day/believe-in-me-review");

fs.mkdirSync(sourceDir, { recursive: true });
fs.mkdirSync(kkDir, { recursive: true });

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        resolve(get(res.headers.location));
        return;
      }

      const chunks = [];
      res.on("data", (d) => chunks.push(d));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks),
        });
      });
    }).on("error", reject);
  });
}

function download(url, outPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outPath);
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        file.close();
        fs.unlinkSync(outPath);
        resolve(download(res.headers.location, outPath));
        return;
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        file.close();
        reject(new Error(`Download failed ${res.statusCode} for ${url}`));
        return;
      }

      res.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", reject);
  });
}

function htmlUnescape(s) {
  return s
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/\\"/g, '"')
    .replace(/\\\//g, "/");
}

const page = await get(discoUrl);
const html = page.body.toString("utf8");

fs.writeFileSync(path.join(sourceDir, "disco-track-73263359-page.html"), html);

const normalized = html.toLowerCase();

if (!normalized.includes("believe in me")) {
  throw new Error("STOP: Disco page does not verify exact title BELIEVE IN ME.");
}

if (!normalized.includes("g putnam music, llc") && !normalized.includes("g putnam music llc")) {
  throw new Error("STOP: Disco page does not verify publisher G Putnam Music, LLC.");
}

const candidates = [...html.matchAll(/https?:\/\/[^"'<>\\\s]+/g)]
  .map((m) => htmlUnescape(m[0]))
  .filter((u) => /\.(mp3|wav|m4a|aif|aiff|flac)(\?|$)/i.test(u));

if (!candidates.length) {
  throw new Error("STOP: Verified title/publisher, but no downloadable audio URL found in Disco HTML. Open the Disco page and download the audio into public/pix/believe-in-me/source-audio/Believe in Me.mp3, then rerun the cut step.");
}

const audioUrl = candidates[0];
const extMatch = audioUrl.match(/\.(mp3|wav|m4a|aif|aiff|flac)(\?|$)/i);
const ext = extMatch ? extMatch[1].toLowerCase() : "mp3";
const sourcePath = path.join(sourceDir, `Believe in Me.${ext}`);

console.log("VERIFIED TITLE: BELIEVE IN ME");
console.log("VERIFIED PUBLISHER: G Putnam Music, LLC");
console.log("AUDIO URL FOUND:", audioUrl);
console.log("DOWNLOADING TO:", path.relative(repo, sourcePath));

await download(audioUrl, sourcePath);

function duration(file) {
  return Number(execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nk=1:nw=1",
    file,
  ], { encoding: "utf8" }).trim());
}

function cut({ id, title, startPct, endPct, note }) {
  const d = duration(sourcePath);
  const start = Math.max(0, d * startPct);
  const end = Math.min(d - 0.25, d * endPct);
  const len = end - start;
  const out = path.join(kkDir, `${id}.mp3`);

  execFileSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel", "error",
    "-ss", start.toFixed(3),
    "-to", end.toFixed(3),
    "-i", sourcePath,
    "-vn",
    "-af", `afade=t=in:st=0:d=0.08,afade=t=out:st=${Math.max(0.1, len - 0.35).toFixed(3)}:d=0.35`,
    "-ar", "44100",
    "-ac", "2",
    "-b:a", "192k",
    out,
  ]);

  return {
    kkId: id,
    title,
    pixTitle: "Believe in Me",
    pixGroup: "Believe in Me",
    audioUrl: `/kks/fathers-day/believe-in-me-review/${id}.mp3`,
    source: `/pix/believe-in-me/source-audio/Believe in Me.${ext}`,
    startSeconds: Number(start.toFixed(3)),
    endSeconds: Number(end.toFixed(3)),
    durationSeconds: Number(len.toFixed(3)),
    note,
    status: "BELIEVE_IN_ME_REVIEW_KK",
  };
}

const kks = [
  cut({
    id: "believe-in-me-intro-v1",
    title: "Believe in Me — Intro + Verse 1",
    startPct: 0.000,
    endPct: 0.190,
    note: "Opening belief / support / presence.",
  }),
  cut({
    id: "believe-in-me-ch1",
    title: "Believe in Me — Chorus 1",
    startPct: 0.190,
    endPct: 0.320,
    note: "First belief hook.",
  }),
  cut({
    id: "believe-in-me-v2",
    title: "Believe in Me — Verse 2",
    startPct: 0.320,
    endPct: 0.460,
    note: "Second support/story section.",
  }),
  cut({
    id: "believe-in-me-ch2",
    title: "Believe in Me — Chorus 2",
    startPct: 0.460,
    endPct: 0.580,
    note: "Second belief hook.",
  }),
  cut({
    id: "believe-in-me-bridge",
    title: "Believe in Me — Bridge",
    startPct: 0.580,
    endPct: 0.710,
    note: "Emotional turn / lift.",
  }),
  cut({
    id: "believe-in-me-final-chorus-outro",
    title: "Believe in Me — Final Chorus + Outro",
    startPct: 0.710,
    endPct: 0.995,
    note: "Final belief / closing resolve.",
  }),
];

const manifest = {
  setId: "believe-in-me-review-kks",
  pixTitle: "Believe in Me",
  verifiedTitle: "BELIEVE IN ME",
  verifiedPublisher: "G Putnam Music, LLC",
  discoTrackId: "73263359",
  status: "READY_FOR_ONE_AT_A_TIME_REVIEW",
  count: kks.length,
  kks,
};

fs.writeFileSync(
  path.join(repo, "data/kk-sets/believe-in-me-review-kks.json"),
  JSON.stringify(manifest, null, 2)
);

const reviewPage = `"use client";

import { useRef, useState } from "react";

const kks = ${JSON.stringify(kks, null, 2)};

export default function BelieveInMeKKReviewPage() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const kk = kks[index];

  function play() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setPlaying(true);
  }

  function stop() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
  }

  function next() {
    stop();
    setIndex((i) => Math.min(kks.length - 1, i + 1));
  }

  function prev() {
    stop();
    setIndex((i) => Math.max(0, i - 1));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#130b06", color: "#fff7eb", fontFamily: "Arial, Helvetica, sans-serif", padding: 28 }}>
      <section style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ color: "#f3cf91", fontWeight: 900, letterSpacing: "0.28em", fontSize: 13, marginBottom: 14 }}>
          GPM / K-KUT / BELIEVE IN ME REVIEW
        </div>

        <h1 style={{ fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1, margin: "0 0 16px", fontWeight: 900 }}>
          Believe in Me KKs
        </h1>

        <p style={{ fontSize: 22, lineHeight: 1.45, color: "#f3cf91", fontWeight: 900, marginBottom: 20 }}>
          One KK at a time. Click the title to play.
        </p>

        <article style={{ border: "2px solid #f3cf91", background: "#2b1a10", borderRadius: 24, padding: 24, marginBottom: 18 }}>
          <div style={{ color: "#f3cf91", fontWeight: 900, fontSize: 16, marginBottom: 12 }}>
            KK {index + 1} of {kks.length}
          </div>

          <button type="button" onClick={play} style={{ width: "100%", cursor: "pointer", textAlign: "left", border: "1px solid #d6a55f", background: "#1d1008", color: "#fff7eb", borderRadius: 18, padding: 20, fontSize: 30, lineHeight: 1.2, fontWeight: 900, marginBottom: 16 }}>
            {playing ? "▶ Playing: " : "▶ Play: "}
            {kk.title}
          </button>

          <audio ref={audioRef} controls preload="metadata" style={{ width: "100%", marginBottom: 16 }} onEnded={() => setPlaying(false)}>
            <source src={kk.audioUrl} type="audio/mpeg" />
          </audio>

          <p style={{ fontSize: 18, lineHeight: 1.5 }}>{kk.note}</p>

          <p style={{ color: "#d6a55f", fontSize: 14 }}>{kk.audioUrl}</p>
        </article>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={prev} disabled={index === 0} style={{ padding: "12px 18px", borderRadius: 999, fontWeight: 900 }}>
            Previous KK
          </button>

          <button onClick={next} disabled={index === kks.length - 1} style={{ padding: "12px 18px", borderRadius: 999, fontWeight: 900 }}>
            Next KK
          </button>
        </div>

        <p style={{ marginTop: 24, color: "#f3cf91", fontWeight: 900 }}>
          Approve/reject by telling ChatGPT: APPROVE BIM: 1,2,3...
        </p>
      </section>
    </main>
  );
}
`;

fs.writeFileSync(
  path.join(repo, "app/admin/believe-in-me-kk-review/page.tsx"),
  reviewPage
);

console.log("BELIEVE IN ME KKs CREATED:", kks.length);
for (const kk of kks) console.log(`${kk.kkId}: ${kk.audioUrl}`);
console.log("OPEN: http://localhost:3000/admin/believe-in-me-kk-review");
