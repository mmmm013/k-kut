import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { execFileSync } from "child_process";

const repo = process.cwd();

function loadEnv(file) {
  const p = path.join(repo, file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const [k, ...rest] = line.split("=");
    if (!process.env[k]) process.env[k] = rest.join("=").trim().replace(/^["']|["']$/g, "");
  }
}

loadEnv(".env.local");
loadEnv(".env.vercel.production");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("STOP: Missing Supabase env.");
}

const sourceDir = path.join(repo, "public/pix/believe-in-me/source-audio");
const kkDir = path.join(repo, "public/kks/fathers-day/believe-in-me-review");
fs.mkdirSync(sourceDir, { recursive: true });
fs.mkdirSync(kkDir, { recursive: true });

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }, (res) => {
      const chunks = [];
      res.on("data", d => chunks.push(d));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Supabase REST failed ${res.statusCode}: ${body.slice(0, 500)}`));
          return;
        }
        resolve(JSON.parse(body));
      });
    }).on("error", reject);
  });
}

function download(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const client = u.protocol === "http:" ? http : https;
    const file = fs.createWriteStream(dest);

    client.get(u, (res) => {
      if ([301,302,303,307,308].includes(res.statusCode)) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        if (redirects > 8) return reject(new Error("Too many redirects"));
        resolve(download(new URL(res.headers.location, url).toString(), dest, redirects + 1));
        return;
      }

      if (res.statusCode < 200 || res.statusCode >= 300) {
        file.close();
        reject(new Error(`Download failed ${res.statusCode}: ${url}`));
        return;
      }

      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", reject);
  });
}

function duration(file) {
  const out = execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nk=1:nw=1",
    file,
  ], { encoding: "utf8" }).trim();

  const n = Number(out);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`STOP: invalid audio: ${file}`);
  return n;
}

function firstAudioUrl(row) {
  const strings = [];

  function collect(x) {
    if (typeof x === "string") strings.push(x);
    else if (x && typeof x === "object") Object.values(x).forEach(collect);
  }

  collect(row);

  return strings.find(s =>
    /^https?:\/\//i.test(s) &&
    (
      /\.(mp3|wav|m4a|aif|aiff|flac)(\?|$)/i.test(s) ||
      /supabase\.co\/storage\/v1\/object\/public\/tracks/i.test(s)
    )
  );
}

console.log("===== SB/TRACKS EXACT SEARCH: BELIEVE IN ME =====");

const rows = await getJson(`${supabaseUrl}/rest/v1/tracks?select=*&limit=5000`);

const matches = rows.filter(row => {
  const values = Object.values(row).filter(v => typeof v === "string");
  const exactField = values.some(v => norm(v) === "believe in me");
  const disco = JSON.stringify(row).includes("73263359");
  return exactField || disco;
});

console.log("MATCH COUNT:", matches.length);

for (const [i, m] of matches.entries()) {
  console.log(`--- MATCH ${i + 1}`);
  console.log(JSON.stringify(m, null, 2).slice(0, 2000));
}

if (!matches.length) {
  throw new Error("STOP: SB/tracks has no exact Believe in Me / Disco 73263359 match.");
}

const row = matches[0];
const rowText = JSON.stringify(row).toLowerCase();

if (rowText.includes("i believe in you") || rowText.includes("abab")) {
  throw new Error("STOP: wrong-title Believe/I Believe entry blocked.");
}

if (!rowText.includes("believe in me")) {
  throw new Error("STOP: selected SB row does not contain exact Believe in Me.");
}

const audioUrl = firstAudioUrl(row);
if (!audioUrl) {
  throw new Error("STOP: exact SB track found, but no audio URL field found.");
}

console.log("USING AUDIO URL:", audioUrl);

const sourcePath = path.join(sourceDir, "Believe in Me.mp3");
await download(audioUrl, sourcePath);
duration(sourcePath);

console.log("DOWNLOADED VALID AUDIO:", path.relative(repo, sourcePath));

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
    source: "/pix/believe-in-me/source-audio/Believe in Me.mp3",
    startSeconds: Number(start.toFixed(3)),
    endSeconds: Number(end.toFixed(3)),
    durationSeconds: Number(len.toFixed(3)),
    note,
    status: "APPROVED_SB_TRACKS_GPMC_BELIEVE_IN_ME_KK",
  };
}

const believeKks = [
  cut({ id: "believe-in-me-intro-v1", title: "Believe in Me — Intro + Verse 1", startPct: 0.000, endPct: 0.190, note: "Opening belief / support / presence." }),
  cut({ id: "believe-in-me-ch1", title: "Believe in Me — Chorus 1", startPct: 0.190, endPct: 0.320, note: "First belief hook." }),
  cut({ id: "believe-in-me-v2", title: "Believe in Me — Verse 2", startPct: 0.320, endPct: 0.460, note: "Second support/story section." }),
  cut({ id: "believe-in-me-ch2", title: "Believe in Me — Chorus 2", startPct: 0.460, endPct: 0.580, note: "Second belief hook." }),
  cut({ id: "believe-in-me-bridge", title: "Believe in Me — Bridge", startPct: 0.580, endPct: 0.710, note: "Emotional turn / lift." }),
  cut({ id: "believe-in-me-final-chorus-outro", title: "Believe in Me — Final Chorus + Outro", startPct: 0.710, endPct: 0.995, note: "Final belief / closing resolve." }),
];

fs.writeFileSync(
  path.join(repo, "data/kk-sets/believe-in-me-review-kks.json"),
  JSON.stringify({
    setId: "believe-in-me-review-kks",
    pixTitle: "Believe in Me",
    source: "/pix/believe-in-me/source-audio/Believe in Me.mp3",
    count: believeKks.length,
    kks: believeKks,
  }, null, 2)
);

const fdPath = path.join(repo, "data/kk-sets/fathers-day-approval-display-kks.json");
const fd = fs.existsSync(fdPath) ? JSON.parse(fs.readFileSync(fdPath, "utf8")) : { kks: [] };

const kept = (fd.kks || []).filter(kk => {
  const s = JSON.stringify(kk).toLowerCase();
  return !s.includes("i believe in you") && !s.includes("abab") && !s.includes("believe-in-you");
});

const byUrl = new Map();
for (const kk of kept) byUrl.set(kk.audioUrl, kk);
for (const kk of believeKks) byUrl.set(kk.audioUrl, kk);

const all = [...byUrl.values()];
const groups = new Map();

for (const kk of all) {
  const g = kk.pixGroup || "Other";
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(kk);
}

for (const arr of groups.values()) arr.sort((a, b) => String(a.kkId).localeCompare(String(b.kkId)));

const ordered = [];
let lastGroup = null;

while ([...groups.values()].some(arr => arr.length)) {
  const candidates = [...groups.entries()]
    .filter(([g, arr]) => arr.length && g !== lastGroup)
    .sort((a, b) => b[1].length - a[1].length);

  const chosen = candidates.length
    ? candidates[0]
    : [...groups.entries()].filter(([g, arr]) => arr.length).sort((a, b) => b[1].length - a[1].length)[0];

  const [group, arr] = chosen;
  const kk = arr.shift();
  ordered.push({ ...kk, displayOrder: ordered.length + 1, pixGroup: group });
  lastGroup = group;
}

const groupCounts = {};
for (const kk of ordered) groupCounts[kk.pixGroup] = (groupCounts[kk.pixGroup] || 0) + 1;

fs.writeFileSync(fdPath, JSON.stringify({
  setId: "fathers-day-approval-display-kks",
  holiday: "Father’s Day",
  lane: "approved_public",
  status: "APPROVED_PUBLIC_READY",
  rule: "GPMC/SB tracks only. Believe in Me from exact SB/tracks match.",
  count: ordered.length,
  groupCounts,
  kks: ordered,
}, null, 2));

const page = `"use client";

import { useRef, useState } from "react";

const kks = ${JSON.stringify(ordered, null, 2)};

export default function FathersDayPage() {
  const audioRefs = useRef([]);
  const [playingIndex, setPlayingIndex] = useState(null);

  function playKK(index) {
    const audio = audioRefs.current[index];
    if (!audio) return;
    audioRefs.current.forEach((a, i) => { if (a && i !== index) { a.pause(); a.currentTime = 0; } });
    if (!audio.paused) { audio.pause(); setPlayingIndex(null); return; }
    audio.currentTime = 0;
    audio.play();
    setPlayingIndex(index);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#130b06", color: "#fff7eb", fontFamily: "Arial, Helvetica, sans-serif", padding: 28 }}>
      <section style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ color: "#f3cf91", fontWeight: 900, letterSpacing: "0.28em", fontSize: 13, marginBottom: 14 }}>GPM / K-KUT</div>
        <h1 style={{ fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1, margin: "0 0 16px", fontWeight: 900 }}>Father’s Day HUGs</h1>
        <p style={{ fontSize: 22, lineHeight: 1.45, color: "#f3cf91", fontWeight: 900, marginBottom: 10 }}>Click any KK title to play it.</p>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: "#f7ead7", marginBottom: 24 }}>{kks.length} approved Father’s Day KKs. GPM-controlled materials only.</p>

        {kks.map((kk, index) => (
          <article key={kk.audioUrl} style={{ border: playingIndex === index ? "2px solid #f3cf91" : "1px solid #8b633a", background: playingIndex === index ? "#3a2415" : "#2b1a10", borderRadius: 24, padding: 22, marginBottom: 18, boxShadow: "0 18px 44px rgba(0,0,0,0.35)" }}>
            <div style={{ color: "#f3cf91", fontWeight: 900, fontSize: 14, marginBottom: 10 }}>KK {kk.displayOrder} · {kk.pixGroup}</div>
            <button type="button" onClick={() => playKK(index)} style={{ width: "100%", cursor: "pointer", textAlign: "left", border: "1px solid #d6a55f", background: "#1d1008", color: "#fff7eb", borderRadius: 18, padding: 18, fontSize: 26, lineHeight: 1.25, fontWeight: 900, marginBottom: 14 }}>
              {playingIndex === index ? "▶ Playing: " : "▶ Play: "}{kk.title}
            </button>
            <audio ref={(el) => { audioRefs.current[index] = el; }} controls preload="metadata" style={{ width: "100%", marginBottom: 14 }} onEnded={() => setPlayingIndex(null)}>
              <source src={kk.audioUrl} type="audio/mpeg" />
            </audio>
            {kk.note ? <p style={{ fontSize: 17, lineHeight: 1.5, color: "#f7ead7" }}>{kk.note}</p> : null}
            <a href={"/checkout?kk=" + encodeURIComponent(kk.kkId)} style={{ display: "inline-block", background: "#f3cf91", color: "#130b06", fontWeight: 900, textDecoration: "none", borderRadius: 999, padding: "12px 18px" }}>Choose this KK</a>
          </article>
        ))}
      </section>
    </main>
  );
}
`;

for (const rel of ["app/fathers-day/page.tsx", "app/HUGs/page.tsx", "app/holiday/page.tsx", "app/admin/fathers-day-kk-review/page.tsx"]) {
  const full = path.join(repo, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, page);
  console.log("WROTE", rel);
}

fs.writeFileSync(
  path.join(repo, "reports/fathers-day-live-with-believe-in-me.md"),
  `# Father’s Day Live With Believe in Me\\n\\nApproved count: ${ordered.length}\\n\\n` +
  ordered.map(kk => `${kk.displayOrder}. [${kk.pixGroup}] ${kk.title}\\n   - ${kk.audioUrl}`).join("\\n")
);

console.log("BELIEVE IN ME KKs CREATED:", believeKks.length);
console.log("FATHER'S DAY APPROVED COUNT:", ordered.length);
console.log(groupCounts);
