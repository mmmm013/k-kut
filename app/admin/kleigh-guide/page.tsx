"use client";

import manifest from "@/public/audio/kleigh/guide-final/manifest.json";

type GuideItem = {
  id: string;
  title: string;
  file: string;
  source: string;
  status: string;
};

export default function KleighGuidePreviewPage() {
  const items = manifest.items as GuideItem[];

  function stopOtherAudio(current: HTMLAudioElement) {
    const all = Array.from(document.querySelectorAll("audio"));
    for (const audio of all) {
      if (audio !== current) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100">
      <section className="mx-auto max-w-5xl">
        <a href="/" className="text-sm font-bold text-amber-300">
          ← Back to K-KUT
        </a>

        <header className="mt-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-300">
            Admin Preview
          </p>
          <h1 className="mt-3 text-4xl font-black text-white">
            KLEIGH Guide Audio
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-neutral-300">
            Safe preview page for the captured KLEIGH / Michael guide vocals.
            These assets are live, but this page does not wire them into the
            main HUG sales flow.
          </p>
        </header>

        <div className="mt-8 rounded-2xl border border-amber-300/25 bg-black/30 p-5">
          <p className="font-black text-amber-200">
            Captured: {manifest.total_captured} · Unique:{" "}
            {manifest.unique_recordings} · Removed duplicates:{" "}
            {manifest.duplicate_copies_removed}
          </p>
          <p className="mt-2 text-sm font-bold text-amber-50/70">
            BIC rule: starting one clip stops all others.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {items.map((item, index) => (
            <article
              key={item.id}
              className="rounded-2xl border border-amber-300/20 bg-[#2a180d] p-5"
            >
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                Clip {index + 1}
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                {item.title}
              </h2>
              <p className="mt-2 break-all text-sm font-bold text-amber-50/70">
                {item.file}
              </p>
              <audio
                className="mt-4 w-full"
                controls
                preload="none"
                onPlay={(event) => stopOtherAudio(event.currentTarget)}
              >
                <source src={item.file} type="audio/mp4" />
              </audio>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
