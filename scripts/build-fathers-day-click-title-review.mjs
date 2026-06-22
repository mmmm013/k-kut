import fs from "fs";
import path from "path";

const repo = process.cwd();
const manifestPath = path.join(repo, "data/kk-sets/fathers-day-approval-display-kks.json");
const pagePath = path.join(repo, "app/admin/fathers-day-kk-review/page.tsx");

if (!fs.existsSync(manifestPath)) {
  throw new Error("Missing data/kk-sets/fathers-day-approval-display-kks.json");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const kks = manifest.kks || [];

if (!kks.length) {
  throw new Error("No KKs found in approval display manifest");
}

const page = `"use client";

import { useRef, useState } from "react";

const kks = ${JSON.stringify(kks, null, 2)};

export default function FathersDayKKReviewPage() {
  const audioRefs = useRef([]);
  const [playingIndex, setPlayingIndex] = useState(null);

  function playFromTitle(index) {
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
    <main className="min-h-screen bg-[#130b06] text-[#fff7eb]">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <p className="mb-3 text-sm font-bold tracking-[0.35em] text-[#f3cf91]">
          GPM / K-KUT / FATHER’S DAY APPROVAL
        </p>

        <h1 className="mb-4 text-4xl font-black md:text-6xl">
          Father’s Day KK Approval
        </h1>

        <p className="mb-3 max-w-4xl text-xl font-bold leading-8 text-[#f3cf91]">
          Click any KK title to play it from the start.
        </p>

        <p className="mb-8 max-w-4xl leading-8 text-[#f7ead7]">
          {kks.length} playable approval KKs. Review only. Public display requires explicit approval.
          Thank You is capped to clean structure KKs only. Junk, duplicates, and CC over-captures are excluded.
        </p>

        <div className="grid gap-5">
          {kks.map((kk, index) => (
            <article
              key={kk.audioUrl}
              className={
                "rounded-3xl border p-5 shadow-2xl " +
                (playingIndex === index
                  ? "border-[#f3cf91] bg-[#3a2415]"
                  : "border-[#8b633a] bg-[#2b1a10]")
              }
            >
              <p className="mb-2 text-sm font-bold text-[#f3cf91]">
                KK {kk.displayOrder} · {kk.pixGroup}
              </p>

              <button
                type="button"
                onClick={() => playFromTitle(index)}
                className="mb-4 block w-full rounded-2xl border border-[#d6a55f] bg-[#1d1008] p-4 text-left text-2xl font-black text-[#fff7eb] hover:bg-[#4a2c17]"
              >
                {playingIndex === index ? "▶ Playing: " : "▶ Play: "}
                {kk.title}
              </button>

              <audio
                ref={(el) => {
                  audioRefs.current[index] = el;
                }}
                controls
                preload="metadata"
                className="mb-4 w-full"
                onEnded={() => setPlayingIndex(null)}
                onPause={() => {
                  const audio = audioRefs.current[index];
                  if (audio && audio.currentTime > 0 && audio.currentTime < audio.duration) return;
                  if (playingIndex === index) setPlayingIndex(null);
                }}
              >
                <source src={kk.audioUrl} type="audio/mpeg" />
              </audio>

              {kk.note ? (
                <p className="mb-2 leading-7 text-[#f7ead7]">{kk.note}</p>
              ) : null}

              <p className="text-sm text-[#d6a55f]">{kk.audioUrl}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
`;

fs.writeFileSync(pagePath, page);

console.log("WROTE click-title approval page");
console.log("KK COUNT:", kks.length);
console.log("PAGE:", "app/admin/fathers-day-kk-review/page.tsx");
