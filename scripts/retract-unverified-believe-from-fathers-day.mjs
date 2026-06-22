import fs from "fs";
import path from "path";

const repo = process.cwd();

const manifestPaths = [
  "data/kk-sets/fathers-day-approval-display-kks.json",
  "data/kk-sets/fathers-day-display-kks.json",
  "data/kk-sets/fathers-day-review-kks.json",
  "data/kk-sets/fathers-day-current-all-candidates.json",
];

function isBelieveEntry(kk) {
  const s = [
    kk.kkId || "",
    kk.title || "",
    kk.audioUrl || "",
    kk.source || "",
    kk.pixGroup || "",
  ].join(" ").toLowerCase();

  return s.includes("believe");
}

for (const rel of manifestPaths) {
  const full = path.join(repo, rel);
  if (!fs.existsSync(full)) continue;

  const m = JSON.parse(fs.readFileSync(full, "utf8"));
  const before = Array.isArray(m.kks) ? m.kks : [];
  const removed = before.filter(isBelieveEntry);
  const kept = before.filter((kk) => !isBelieveEntry(kk));

  const groupCounts = {};
  for (const kk of kept) {
    const g = kk.pixGroup || "Unknown";
    groupCounts[g] = (groupCounts[g] || 0) + 1;
  }

  const next = {
    ...m,
    status: "BELIEVE_RETRACTED_UNVERIFIED_SOURCE_REMOVED",
    rule: "No outside audio. No unverified Believe/I Believe material. Only confirmed GPM-controlled inventory may display.",
    count: kept.length,
    groupCounts,
    removedUnverifiedBelieveCount: removed.length,
    removedUnverifiedBelieve: removed,
    kks: kept.map((kk, i) => ({ ...kk, displayOrder: i + 1 })),
  };

  fs.writeFileSync(full, JSON.stringify(next, null, 2));
  console.log(`PATCHED ${rel}: removed ${removed.length}, kept ${kept.length}`);
}

const filesToDelete = [
  "public/pix/fathers-day/source-audio/i-believe-in-you-abab-cab-out.mp3",
  "public/kks/fathers-day/review/believe-in-me-intro-v1.mp3",
  "public/kks/fathers-day/review/believe-in-me-ch1.mp3",
  "public/kks/fathers-day/review/believe-in-me-v2.mp3",
  "public/kks/fathers-day/review/believe-in-me-ch2.mp3",
  "public/kks/fathers-day/review/believe-in-me-bridge.mp3",
  "public/kks/fathers-day/review/believe-in-me-final-chorus-outro.mp3",
];

for (const rel of filesToDelete) {
  const full = path.join(repo, rel);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    console.log("DELETED", rel);
  }
}

const approvedPath = path.join(repo, "data/kk-sets/fathers-day-approval-display-kks.json");
const approved = fs.existsSync(approvedPath)
  ? JSON.parse(fs.readFileSync(approvedPath, "utf8"))
  : { kks: [] };

const kks = approved.kks || [];

const page = `"use client";

import { useRef, useState } from "react";

const kks = ${JSON.stringify(kks, null, 2)};

export default function FathersDayRetractedPage() {
  const audioRefs = useRef([]);
  const [playingIndex, setPlayingIndex] = useState(null);

  function playKK(index) {
    const audio = audioRefs.current[index];
    if (!audio) return;

    audioRefs.current.forEach((a, i) => {
      if (a && i !== index) {
        a.pause();
        a.currentTime = 0;
      }
    });

    if (!audio.paused) {
      audio.pause();
      setPlayingIndex(null);
      return;
    }

    audio.currentTime = 0;
    audio.play();
    setPlayingIndex(index);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#130b06", color: "#fff7eb", fontFamily: "Arial, Helvetica, sans-serif", padding: 28 }}>
      <section style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ color: "#f3cf91", fontWeight: 900, letterSpacing: "0.28em", fontSize: 13, marginBottom: 14 }}>
          GPM / K-KUT / FATHER’S DAY
        </div>

        <h1 style={{ fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1, margin: "0 0 16px", fontWeight: 900 }}>
          Father’s Day KKs
        </h1>

        <p style={{ fontSize: 22, lineHeight: 1.45, color: "#f3cf91", fontWeight: 900 }}>
          Believe / I Believe material has been retracted. Only remaining confirmed candidate KKs display here.
        </p>

        <p style={{ fontSize: 18, lineHeight: 1.55, color: "#f7ead7", marginBottom: 24 }}>
          {kks.length} KKs remain after retraction. Click a title to play.
        </p>

        {kks.map((kk, index) => (
          <article key={kk.audioUrl} style={{ border: playingIndex === index ? "2px solid #f3cf91" : "1px solid #8b633a", background: playingIndex === index ? "#3a2415" : "#2b1a10", borderRadius: 24, padding: 22, marginBottom: 18 }}>
            <div style={{ color: "#f3cf91", fontWeight: 900, fontSize: 14, marginBottom: 10 }}>
              KK {kk.displayOrder} · {kk.pixGroup}
            </div>

            <button type="button" onClick={() => playKK(index)} style={{ width: "100%", cursor: "pointer", textAlign: "left", border: "1px solid #d6a55f", background: "#1d1008", color: "#fff7eb", borderRadius: 18, padding: 18, fontSize: 26, lineHeight: 1.25, fontWeight: 900, marginBottom: 14 }}>
              {playingIndex === index ? "▶ Playing: " : "▶ Play: "}
              {kk.title}
            </button>

            <audio ref={(el) => { audioRefs.current[index] = el; }} controls preload="metadata" style={{ width: "100%", marginBottom: 14 }} onEnded={() => setPlayingIndex(null)}>
              <source src={kk.audioUrl} type="audio/mpeg" />
            </audio>

            {kk.note ? <p style={{ fontSize: 17, lineHeight: 1.5, color: "#f7ead7" }}>{kk.note}</p> : null}
          </article>
        ))}
      </section>
    </main>
  );
}
`;

const pageTargets = [
  "app/fathers-day/page.tsx",
  "app/HUGs/page.tsx",
  "app/holiday/page.tsx",
  "app/admin/fathers-day-kk-review/page.tsx",
];

for (const rel of pageTargets) {
  const full = path.join(repo, rel);
  fs.writeFileSync(full, page);
  console.log("REWROTE", rel);
}

fs.mkdirSync(path.join(repo, "reports"), { recursive: true });
fs.writeFileSync(
  path.join(repo, "reports/fathers-day-believe-retraction.md"),
  `# Father’s Day Believe Retraction

Unverified Believe/I Believe material removed.

Remaining KK count: ${kks.length}

No deploy performed by this script.
`
);

console.log("RETRACTION COMPLETE. REMAINING KK COUNT:", kks.length);
