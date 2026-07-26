"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const SLIDES = [
  { slug: "bad-day", image: "/cute-hugs/bad-day.webp", headline: "Bad day? Send a HUG.", text: "A warm musical lift when someone needs care." },
  { slug: "big-win", image: "/cute-hugs/big-win.webp", headline: "Big win? Send a HUG.", text: "Celebrate the moment with music they can keep." },
  { slug: "make-it-right", image: "/cute-hugs/make-it-right.webp", headline: "Need to make it right? Send a HUG.", text: "A gentle way to say I care and I am sorry." },
  { slug: "just-because-care", image: "/cute-hugs/just-because-care.webp", headline: "Just because? Send a HUG.", text: "No occasion needed—just warmth, love, and a smile." },
  { slug: "miss-them", image: "/cute-hugs/miss-them.webp", headline: "Miss them? Send a HUG.", text: "A little closeness for hearts that are far apart." },
  { slug: "first-day-nerves", image: "/cute-hugs/first-day-nerves.webp", headline: "First-day nerves? Send a HUG.", text: "Send courage before school, work, or something new." },
  { slug: "proud-of-them", image: "/cute-hugs/proud-of-them.webp", headline: "Proud of them? Send a HUG.", text: "Make a brave step or quiet victory feel seen." },
  { slug: "thinking-of-you", image: "/cute-hugs/thinking-of-you.webp", headline: "Thinking of you? Send a HUG.", text: "A gentle lift for rest, recovery, and hard days." },
  { slug: "long-week", image: "/cute-hugs/long-week.webp", headline: "Long week? Send a HUG.", text: "A little relief for someone running on empty." },
  { slug: "breakup-blues", image: "/cute-hugs/breakup-blues.webp", headline: "Breakup blues? Send a HUG.", text: "A soft musical landing for a tender heart." },
  { slug: "new-baby", image: "/cute-hugs/new-baby.webp", headline: "New baby? Send a HUG.", text: "A warm hello for sleepy, joyful new parents." },
  { slug: "just-because-smile", image: "/cute-hugs/just-because-smile.webp", headline: "Make them smile. Send a HUG.", text: "A playful surprise for an ordinary day." },
  { slug: "friends", image: "/cute-hugs/friends.webp", headline: "Friend needs you? Send a HUG.", text: "Comfort, laughter, and love from one friend to another." },
] as const;

const ROTATION_MS = 8000;

export default function CuteHugCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<number | null>(null);

  const move = useCallback((direction: number) => {
    setIndex((current) => (current + direction + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || document.hidden) return;
    const timer = window.setTimeout(() => move(1), ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [index, move, paused, reducedMotion]);

  const slide = SLIDES[index];

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-[#8D6E63]/45 bg-[#160c08] shadow-2xl"
      aria-roledescription="carousel"
      aria-label="Thirteen ways to send a musical HUG"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") move(-1);
        if (event.key === "ArrowRight") move(1);
        if (event.key === " ") {
          event.preventDefault();
          setPaused((value) => !value);
        }
      }}
      onTouchStart={(event) => {
        touchStart.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const finish = event.changedTouches[0]?.clientX ?? touchStart.current;
        const distance = finish - touchStart.current;
        if (Math.abs(distance) > 45) move(distance > 0 ? -1 : 1);
        touchStart.current = null;
      }}
    >
      <p className="sr-only" aria-live="polite">
        Story {index + 1} of {SLIDES.length}: {slide.headline}
      </p>

      <div className="relative aspect-[16/9] w-full bg-[#f7e8d1]">
        <Image
          key={slide.image}
          src={slide.image}
          alt="Warm illustrated example of a person sending a musical HUG to someone they care about."
          fill
          priority={index === 0}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/65 to-transparent px-5 pb-6 pt-24 sm:px-8 sm:pb-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FFD54F]">
            13 musical HUG moments
          </p>
          <h2 className="mt-2 max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">
            {slide.headline}
          </h2>
          <p className="mt-3 max-w-2xl text-base font-bold leading-7 text-[#EFEBE9] sm:text-lg">
            {slide.text}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/find?moment=${slide.slug}`}
              className="rounded-2xl bg-[#FFD54F] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#160A05] transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#FFD54F]/50"
            >
              Start this HUG
            </Link>
            <Link
              href="/browse"
              className="rounded-2xl border border-white/70 bg-black/25 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black focus:outline-none focus:ring-4 focus:ring-white/40"
            >
              Browse 2,611 HUGs
            </Link>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => move(-1)}
        aria-label="Previous HUG story"
        className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-black/60 text-3xl font-black text-white shadow-lg transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-[#FFD54F]/50"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        aria-label="Next HUG story"
        className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-black/60 text-3xl font-black text-white shadow-lg transition hover:bg-black focus:outline-none focus:ring-4 focus:ring-[#FFD54F]/50"
      >
        ›
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#8D6E63]/35 bg-[#0d0806] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap gap-2" aria-label="Choose a HUG story">
          {SLIDES.map((item, itemIndex) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setIndex(itemIndex)}
              aria-label={`Show story ${itemIndex + 1}: ${item.headline}`}
              aria-current={itemIndex === index ? "true" : undefined}
              className={`h-3 w-3 rounded-full border border-[#FFD54F] ${itemIndex === index ? "bg-[#FFD54F]" : "bg-transparent"}`}
            />
          ))}
        </div>
        {!reducedMotion ? (
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            className="rounded-xl border border-[#FFD54F]/70 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#FFD54F]"
          >
            {paused ? "Resume rotation" : "Pause rotation"}
          </button>
        ) : (
          <span className="text-xs font-bold text-[#BCAAA4]">Reduced motion active</span>
        )}
      </div>
    </section>
  );
}
