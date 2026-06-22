import fs from "fs";
import path from "path";

const repo = process.cwd();

const manifestPaths = [
  "data/kk-sets/fathers-day-approval-display-kks.json",
  "data/kk-sets/fathers-day-display-kks.json",
  "data/kk-sets/fathers-day-review-kks.json",
  "data/kk-sets/fathers-day-current-all-candidates.json",
  "data/kk-sets/believe-in-me-review-kks.json"
];

function isBelieve(x) {
  return JSON.stringify(x || {}).toLowerCase().includes("believe");
}

let sourceKks = [];

for (const rel of manifestPaths) {
  if (!fs.existsSync(rel)) continue;

  const json = JSON.parse(fs.readFileSync(rel, "utf8"));
  const before = Array.isArray(json.kks) ? json.kks : [];
  const after = before.filter((kk) => !isBelieve(kk));

  if (rel === "data/kk-sets/fathers-day-approval-display-kks.json") {
    sourceKks = after;
  }

  fs.writeFileSync(rel, JSON.stringify({
    ...json,
    status: "FATHERS_DAY_LIVE_BELIEVE_SKIPPED",
    rule: "Believe in Me skipped for now. No Believe / I Believe material displayed.",
    count: after.length,
    kks: after.map((kk, i) => ({ ...kk, displayOrder: i + 1 }))
  }, null, 2));

  console.log(`PATCHED ${rel}: removed ${before.length - after.length}, kept ${after.length}`);
}

const kks = sourceKks
  .filter((kk) => kk.audioUrl && !isBelieve(kk))
  .map((kk, i) => ({ ...kk, displayOrder: i + 1 }));

if (!kks.length) {
  throw new Error("STOP: No non-Believe Father’s Day KKs found.");
}

const page = `"use client";

import { useRef, useState } from "react";

const kks = ${JSON.stringify(kks, null, 2)};

export default function FathersDayPage() {
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
        <div style={{ color: "#f3cf91", fontWeight: 900, letterSpacing: "0.28em", fontSize: 13, marginBottom: 14 }}>GPM / K-KUT</div>

        <h1 style={{ fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1, margin: "0 0 16px", fontWeight: 900 }}>
          Father’s Day HUGs
        </h1>

        <p style={{ fontSize: 22, lineHeight: 1.45, color: "#f3cf91", fontWeight: 900, marginBottom: 10 }}>
          Click any KK title to play it.
        </p>

        <p style={{ fontSize: 18, lineHeight: 1.55, color: "#f7ead7", marginBottom: 24 }}>
          {kks.length} Father’s Day KKs live. Believe in Me is skipped for now.
        </p>

        {kks.map((kk, index) => (
          <article key={kk.audioUrl} style={{ border: playingIndex === index ? "2px solid #f3cf91" : "1px solid #8b633a", background: playingIndex === index ? "#3a2415" : "#2b1a10", borderRadius: 24, padding: 22, marginBottom: 18 }}>
            <div style={{ color: "#f3cf91", fontWeight: 900, fontSize: 14, marginBottom: 10 }}>
              KK {kk.displayOrder} · {kk.pixGroup || "Father’s Day"}
            </div>

            <button type="button" onClick={() => playKK(index)} style={{ width: "100%", cursor: "pointer", textAlign: "left", border: "1px solid #d6a55f", background: "#1d1008", color: "#fff7eb", borderRadius: 18, padding: 18, fontSize: 26, lineHeight: 1.25, fontWeight: 900, marginBottom: 14 }}>
              {playingIndex === index ? "▶ Playing: " : "▶ Play: "}
              {kk.title}
            </button>

            <audio ref={(el) => { audioRefs.current[index] = el; }} controls preload="metadata" style={{ width: "100%", marginBottom: 14 }} onEnded={() => setPlayingIndex(null)}>
              <source src={kk.audioUrl} type="audio/mpeg" />
            </audio>

            <a href={"/checkout?kk=" + encodeURIComponent(kk.kkId || kk.audioUrl)} style={{ display: "inline-block", background: "#f3cf91", color: "#130b06", fontWeight: 900, textDecoration: "none", borderRadius: 999, padding: "12px 18px" }}>
              Choose this KK
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
`;

for (const rel of [
  "app/fathers-day/page.tsx",
  "app/HUGs/page.tsx",
  "app/holiday/page.tsx",
  "app/admin/fathers-day-kk-review/page.tsx"
]) {
  fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true });
  fs.writeFileSync(path.join(repo, rel), page);
  console.log("WROTE", rel);
}

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/fathers-day-deployed-skip-believe.md",
  `# Father’s Day Deployed — Believe in Me Skipped\\n\\nLive KK count: ${kks.length}\\n\\n` +
  kks.map((kk) => `${kk.displayOrder}. [${kk.pixGroup || "Father’s Day"}] ${kk.title}\\n   - ${kk.audioUrl}`).join("\\n")
);

console.log("FATHER'S DAY LIVE KK COUNT:", kks.length);
