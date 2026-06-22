import fs from "fs";
import path from "path";

const repo = process.cwd();
const manifestPath = path.join(repo, "data/kk-sets/fathers-day-approval-display-kks.json");

if (!fs.existsSync(manifestPath)) {
  throw new Error("Missing data/kk-sets/fathers-day-approval-display-kks.json");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const kks = manifest.kks || [];

if (kks.length < 8) {
  throw new Error(`STOP: only ${kks.length} KKs. Public Father’s Day requires at least 8 approved KKs.`);
}

const page = `"use client";

import { useRef, useState } from "react";

const kks = ${JSON.stringify(kks, null, 2)};

export default function FathersDayPublicPage() {
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
    <main className="min-h-screen bg-[#130b06] text-[#fff7eb]">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <p className="mb-3 text-sm font-bold tracking-[0.35em] text-[#f3cf91]">
            GPM / K-KUT
          </p>

          <h1 className="mb-4 text-4xl font-black md:text-6xl">
            Father’s Day HUGs
          </h1>

          <p className="max-w-4xl text-xl font-bold leading-8 text-[#f3cf91]">
            Click a KK title to hear the music moment.
          </p>

          <p className="mt-3 max-w-4xl leading-8 text-[#f7ead7]">
            Approved Father’s Day KKs. Holiday is its own separate lane. Theme match only.
            No holiday ownership. No junk duplicates.
          </p>
        </header>

        <section className="mb-8 rounded-3xl border border-[#8b633a] bg-[#2b1a10] p-5">
          <h2 className="mb-2 text-2xl font-black text-[#f3cf91]">
            Choose the feeling
          </h2>

          <p className="leading-7 text-[#f7ead7]">
            Respect. Strength. Steadiness. Legacy. Hope. Gratitude. Remembrance.
            Keep-going love.
          </p>
        </section>

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
                onClick={() => playKK(index)}
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
              >
                <source src={kk.audioUrl} type="audio/mpeg" />
              </audio>

              {kk.note ? (
                <p className="mb-4 leading-7 text-[#f7ead7]">{kk.note}</p>
              ) : null}

              <a
                href={"/checkout?kk=" + encodeURIComponent(kk.kkId)}
                className="inline-flex rounded-full bg-[#f3cf91] px-5 py-3 font-bold text-[#130b06] hover:bg-[#ffe2a8]"
              >
                Choose this KK
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
`;

const targets = [
  "app/fathers-day/page.tsx",
  "app/HUGs/page.tsx",
  "app/holiday/page.tsx",
  "app/admin/fathers-day-kk-review/page.tsx",
];

for (const target of targets) {
  const full = path.join(repo, target);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, page);
  console.log("WROTE", target);
}

console.log("PUBLISHED APPROVED FATHER'S DAY KK COUNT:", kks.length);
