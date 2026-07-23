"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const SLIDES = [
  { slug: "bad-day", image: "/cute-hugs/bad-day.webp", eyebrow: "Comfort & care", headline: "Bad day? Send a HUG.", text: "A warm musical lift when someone needs care.", alt: "Two friends sharing a musical HUG after a difficult day." },
  { slug: "big-win", image: "/cute-hugs/big-win.webp", eyebrow: "Celebrate", headline: "Big win? Send a HUG.", text: "Celebrate the moment with music they can keep.", alt: "A friend celebrating a graduation with a musical HUG." },
  { slug: "make-it-right", image: "/cute-hugs/make-it-right.webp", eyebrow: "Sorry & repair", headline: "Need to make it right? Send a HUG.", text: "A gentle way to say I care and I am sorry.", alt: "Two people reconnecting through a thoughtful musical HUG." },
  { slug: "just-because-care", image: "/cute-hugs/just-because-care.webp", eyebrow: "Just because", headline: "Just because? Send a HUG.", text: "No occasion needed—just warmth, love, and a smile.", alt: "A cheerful musical HUG sent simply to brighten someone's day." },
  { slug: "miss-them", image: "/cute-hugs/miss-them.webp", eyebrow: "Love & connection", headline: "Miss them? Send a HUG.", text: "A little closeness for hearts that are far apart.", alt: "Two people staying close across distance with a musical HUG." },
  { slug: "first-day-nerves", image: "/cute-hugs/first-day-nerves.webp", eyebrow: "Encouragement", headline: "First-day nerves? Send a HUG.", text: "Send courage before school, work, or something new.", alt: "A supportive musical HUG before an important first day." },
  { slug: "proud-of-them", image: "/cute-hugs/proud-of-them.webp", eyebrow: "Proud of you", headline: "Proud of them? Send a HUG.", text: "Make a brave step or quiet victory feel seen.", alt: "A proud friend recognizing an achievement with a musical HUG." },
  { slug: "thinking-of-you", image: "/cute-hugs/thinking-of-you.webp", eyebrow: "Thinking of you", headline: "Thinking of you? Send a HUG.", text: "A gentle lift for rest, recovery, and hard days.", alt: "A caring musical HUG shared during rest and recovery." },
  { slug: "long-week", image: "/cute-hugs/long-week.webp", eyebrow: "A little relief", headline: "Long week? Send a HUG.", text: "A little relief for someone running on empty.", alt: "A comforting musical HUG after a long and tiring week." },
  { slug: "breakup-blues", image: "/cute-hugs/breakup-blues.webp", eyebrow: "Tender support", headline: "Breakup blues? Send a HUG.", text: "A soft musical landing for a tender heart.", alt: "A friend offering comfort after heartbreak with a musical HUG." },
  { slug: "new-baby", image: "/cute-hugs/new-baby.webp", eyebrow: "Welcome & celebrate", headline: "New baby? Send a HUG.", text: "A warm hello for sleepy, joyful new parents.", alt: "New parents receiving a warm musical HUG." },
  { slug: "just-because-smile", image: "/cute-hugs/just-because-smile.webp", eyebrow: "Friendship & joy", headline: "Make them smile. Send a HUG.", text: "A playful surprise for an ordinary day.", alt: "Friends laughing together after receiving a musical HUG." },
  { slug: "friends", image: "/cute-hugs/friends.webp", eyebrow: "Friendship", headline: "Friend needs you? Send a HUG.", text: "Comfort, laughter, and love from one friend to another.", alt: "Friends sharing comfort and laughter through a musical HUG." },
] as const;

const ROTATION_MS = 8000;

export default function CuteHugCarousel() {
  const [index, setIndex] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const didSwipe = useRef(false);

  const selectSlide = useCallback((next: number, announce = true) => {
    const normalized = (next + SLIDES.length) % SLIDES.length;
    setIndex(normalized);
    if (announce) setAnnouncement(`Story ${normalized + 1} of ${SLIDES.length}: ${SLIDES[normalized].headline}`);
  }, []);

  const move = useCallback((direction: number, announce = true) => {
    setIndex((current) => {
      const next = (current + direction + SLIDES.length) % SLIDES.length;
      if (announce) setAnnouncement(`Story ${next + 1} of ${SLIDES.length}: ${SLIDES[next].headline}`);
      return next;
    });
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(query.matches);
    const syncVisibility = () => setPageHidden(document.hidden);
    syncMotion();
    syncVisibility();
    query.addEventListener?.("change", syncMotion);
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      query.removeEventListener?.("change", syncMotion);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  const autoplayPaused = manualPaused || reducedMotion || hovered || focusWithin || pageHidden;

  useEffect(() => {
    if (autoplayPaused) return;
    const timer = window.setTimeout(() => move(1, false), ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [autoplayPaused, index, move]);

  useEffect(() => {
    const preload = new window.Image();
    preload.src = SLIDES[(index + 1) % SLIDES.length].image;
  }, [index]);

  const slide = SLIDES[index];

  return (
    <section
      data-cute-hug-carousel="functional-v4"
      className="overflow-hidden rounded-[2rem] border border-[#eabf92] bg-white shadow-xl"
      role="region"
      aria-roledescription="carousel"
      aria-label="Thirteen ways to send a musical HUG"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!nextTarget || !event.currentTarget.contains(nextTarget)) setFocusWithin(false);
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
        if (event.key === "Home") { event.preventDefault(); selectSlide(0); }
        if (event.key === "End") { event.preventDefault(); selectSlide(SLIDES.length - 1); }
        if (event.key === " ") { event.preventDefault(); setManualPaused((value) => !value); }
      }}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>

      <div className="grid items-stretch lg:grid-cols-[0.82fr_1.18fr]">
        <div className="flex min-h-[23rem] flex-col justify-center bg-[#fff3e8] px-6 py-8 sm:px-10 lg:px-12">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#d65c2f]">{slide.eyebrow}</p>
          <h2 className="mt-3 text-4xl font-black leading-[1.02] text-[#35180f] sm:text-5xl lg:text-6xl">{slide.headline}</h2>
          <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-[#6b493c] sm:text-lg">{slide.text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/find" data-carousel-action="start" className="rounded-2xl bg-[#ef6c3e] px-7 py-4 text-sm font-black uppercase tracking-[0.13em] text-white shadow-lg transition hover:bg-[#d95427] focus:outline-none focus:ring-4 focus:ring-[#ef6c3e]/35">Start this HUG</Link>
            <Link href="/browse" data-carousel-action="browse" className="rounded-2xl border-2 border-[#ef6c3e] bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.13em] text-[#c94d24] transition hover:bg-[#fff0e7] focus:outline-none focus:ring-4 focus:ring-[#ef6c3e]/25">Browse HUGs</Link>
          </div>
          <p className="mt-5 text-sm font-semibold text-[#765548]">Listen first. Choose the exact finished music. Every paid delivery is reviewed.</p>
        </div>

        <Link
          href="/find"
          data-carousel-action="image"
          aria-label={`Start a HUG for this moment: ${slide.headline}`}
          className="group relative min-h-[23rem] overflow-hidden bg-[#f8ead9] focus:outline-none focus:ring-4 focus:ring-inset focus:ring-[#ef6c3e] lg:min-h-[36rem]"
          style={{ touchAction: "pan-y" }}
          onPointerDown={(event) => { didSwipe.current = false; pointerStart.current = { x: event.clientX, y: event.clientY }; }}
          onPointerUp={(event) => {
            const start = pointerStart.current;
            pointerStart.current = null;
            if (!start) return;
            const dx = event.clientX - start.x;
            const dy = event.clientY - start.y;
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
              didSwipe.current = true;
              event.preventDefault();
              move(dx > 0 ? -1 : 1);
            }
          }}
          onClick={(event) => { if (didSwipe.current) { event.preventDefault(); didSwipe.current = false; } }}
          onPointerCancel={() => { pointerStart.current = null; didSwipe.current = false; }}
        >
          <Image key={slide.image} src={slide.image} alt={slide.alt} fill priority={index === 0} sizes="(max-width: 1023px) 100vw, 60vw" className="object-cover transition duration-500 group-hover:scale-[1.015]" />
          <span className="absolute bottom-4 right-4 rounded-full bg-[#35180f]/85 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg">Click the picture to start</span>
        </Link>
      </div>

      <div className="border-t border-[#eabf92] bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => move(-1)} aria-label="Previous HUG story" className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#ef6c3e] text-3xl font-black text-[#c94d24] transition hover:bg-[#ef6c3e] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#ef6c3e]/30">‹</button>
            <p className="min-w-20 text-center text-sm font-black text-[#35180f]" aria-live="off">{index + 1} / {SLIDES.length}</p>
            <button type="button" onClick={() => move(1)} aria-label="Next HUG story" className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#ef6c3e] text-3xl font-black text-[#c94d24] transition hover:bg-[#ef6c3e] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#ef6c3e]/30">›</button>
          </div>

          <div className="flex flex-wrap justify-center" aria-label="Choose a HUG story">
            {SLIDES.map((item, itemIndex) => (
              <button key={item.slug} type="button" onClick={() => selectSlide(itemIndex)} aria-label={`Show story ${itemIndex + 1}: ${item.headline}`} aria-current={itemIndex === index ? "true" : undefined} className="grid h-11 w-11 place-items-center rounded-full focus:outline-none focus:ring-4 focus:ring-[#ef6c3e]/30">
                <span aria-hidden="true" className={`h-3 w-3 rounded-full border-2 border-[#ef6c3e] ${itemIndex === index ? "bg-[#ef6c3e]" : "bg-transparent"}`} />
              </button>
            ))}
          </div>

          {!reducedMotion ? (
            <button type="button" onClick={() => setManualPaused((value) => !value)} aria-pressed={manualPaused} className="min-h-11 rounded-xl border-2 border-[#ef6c3e] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#c94d24] focus:outline-none focus:ring-4 focus:ring-[#ef6c3e]/30">{manualPaused ? "Resume rotation" : "Pause rotation"}</button>
          ) : (
            <span className="rounded-xl border border-[#d8a97d] px-4 py-2 text-xs font-bold text-[#765548]">Reduced motion: manual controls only</span>
          )}
        </div>
      </div>
    </section>
  );
}
