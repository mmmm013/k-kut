"use client";

import { useEffect, useRef } from "react";

const defaultVolume = 0.55;

const featured = [
  {
    title: "I Live Free · KK11 · Final Chorus",
    tag: "Featured #1 · Best / strongest",
    line: "Freedom finish. Accuracy A+ · GD approved and locked.",
    audio: "/i-live-free-july4/audio/ilf-kk11-final-chorus-dp-sti.mp3",
  },
  {
    title: "I Live Free · KK09 · Bridge Tight",
    tag: "Featured #2",
    line: "Bridge lift. Accuracy A+ · GD approved and locked.",
    audio: "/i-live-free-july4/audio/ilf-kk09-bridge-tight-dp-sti.mp3",
  },
  {
    title: "I Live Free · KK06 · Bridge",
    tag: "Featured #3",
    line: "BRAVE center. Accuracy A+ · GD approved and locked.",
    audio: "/i-live-free-july4/audio/ilf-kk06-bridge-dp-sti.mp3",
  },
];

const foundation = [
  {
    title: "The Foundation · V1",
    tag: "Foundation II 1",
    line: "Approved Foundation July 4 moment.",
    audio: "/foundation-july4/audio/foundation-july4-v1-full-dp-sti.mp3",
  },
  {
    title: "The Foundation · Bridge",
    tag: "Foundation II 2",
    line: "BRAVE lift.",
    audio: "/foundation-july4/audio/foundation-july4-bridge-dp-sti.mp3",
  },
  {
    title: "The Foundation · Final Chorus",
    tag: "Foundation II 3",
    line: "Heroes Eagle finish.",
    audio: "/foundation-july4/audio/foundation-july4-ch3-dp-sti.mp3",
  },
];

function ControlledAudio({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.volume = defaultVolume;
      ref.current.muted = false;
    }
  }, []);

  return (
    <audio
      ref={ref}
      className="mt-5 w-full"
      controls
      preload="metadata"
      src={src}
    />
  );
}

function Card({
  item,
  index,
}: {
  item: { title: string; tag: string; line: string; audio: string };
  index: number;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-white/45">
        {item.tag}
      </p>
      <h3 className="mt-2 text-3xl font-black text-[#FFD54F]">
        {item.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-white/70">{item.line}</p>
      <p className="mt-2 text-xs text-white/45">
        Player opens at 55% volume. Use controls to lower or raise.
      </p>
      <ControlledAudio src={item.audio} />
    </section>
  );
}

export default function July4Page() {
  return (
    <main className="min-h-screen bg-[#07070a] px-5 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-7 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            G Putnam Music · K-KUT · July 4
          </p>

          <div className="mt-5 flex items-center gap-4">
            <div className="text-6xl" aria-hidden="true">
              🦅
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight">BRAVE</h1>
              <p className="mt-2 text-lg font-bold text-white/75">
                Heroes Eagle · I Live Free · The Foundation
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">
            July 4 K-KUT display from two LT-PIX: freedom, foundation, courage,
            and forward motion.
          </p>
        </div>

        <h2 className="mt-10 text-3xl font-black text-[#FFD54F]">
          Featured I Live Free KKs
        </h2>
        <div className="mt-5 grid gap-5">
          {featured.map((item, index) => (
            <Card key={item.audio} item={item} index={index} />
          ))}
        </div>

        <h2 className="mt-10 text-3xl font-black text-[#FFD54F]">
          The Foundation
        </h2>
        <div className="mt-5 grid gap-5">
          {foundation.map((item, index) => (
            <Card key={item.audio} item={item} index={index} />
          ))}
        </div>

        <p className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white/60">
          © G Putnam Music. K-KUT promo audio prepared through GPM release gate.
          I Live Free approval locked by GD: Accuracy A+.
        </p>
      </section>
    </main>
  );
}
