'use client';

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { hugzSeedCatalog } from "@/lib/hugzSeedCatalog";
import { HUGZ_BOUNDARY_HOLD } from "@/lib/hugzBoundaryHold";
import { PRODUCT_OFFER_LAW, formatUsd } from "@/lib/productOfferLaw";

const ROTATION_MS = 33_000;

function FitSingleLine({
  children,
  className = "",
  maxPx = 88,
  minPx = 16,
}: {
  children: ReactNode;
  className?: string;
  maxPx?: number;
  minPx?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const fit = () => {
      const available = element.clientWidth;
      if (!available) return;

      let low = minPx;
      let high = maxPx;
      let best = minPx;

      for (let pass = 0; pass < 12; pass += 1) {
        const middle = (low + high) / 2;
        element.style.fontSize = `${middle}px`;

        if (element.scrollWidth <= available + 1) {
          best = middle;
          low = middle;
        } else {
          high = middle;
        }
      }

      element.style.fontSize = `${best}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    window.addEventListener("resize", fit);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [children, maxPx, minPx]);

  return (
    <h1
      ref={ref}
      className={`block w-full whitespace-nowrap leading-[0.94] tracking-[-0.045em] ${className}`}
    >
      {children}
    </h1>
  );
}

export default function HugzRotatingLanding() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = hugzSeedCatalog[activeIndex];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % hugzSeedCatalog.length);
    }, ROTATION_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  const previous = () => {
    setActiveIndex(
      (current) =>
        (current - 1 + hugzSeedCatalog.length) % hugzSeedCatalog.length,
    );
  };

  const next = () => {
    setActiveIndex((current) => (current + 1) % hugzSeedCatalog.length);
  };

  return (
    <section
      aria-label="13 HUGz Card discovery"
      className="min-h-[calc(100dvh-4.5rem)] overflow-hidden rounded-[1.5rem] border border-[#FFD54F]/35 bg-[#09070B] text-white shadow-2xl lg:h-full lg:min-h-0"
    >
      <div
        key={active.slug}
        className="grid min-h-[calc(100dvh-4.5rem)] lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <div className="relative min-h-[36vh] overflow-hidden bg-[#09070B] lg:h-full lg:min-h-0">
          <img
            src={active.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-contain object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09070B] via-transparent to-black/15 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#09070B]" />
          <div className="absolute left-5 top-5 rounded-full border border-white/25 bg-black/55 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] backdrop-blur">
            HUGz Card {activeIndex + 1} of {hugzSeedCatalog.length}
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col justify-start overflow-hidden p-4 sm:p-5 lg:p-6">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FFD54F]">
              HUGz Card · {active.seedCount} matching {formatUsd(PRODUCT_OFFER_LAW.HUG.priceUsd)} HUG choices
            </p>

            <div className="mt-3 min-w-0">
              <FitSingleLine
                className="font-black"
                maxPx={64}
                minPx={15}
              >
                {active.headline}
              </FitSingleLine>
            </div>

            <p className="mt-3 max-w-2xl text-sm font-bold leading-5 text-[#D7CCC8] sm:text-base sm:leading-6">
              {active.description}
            </p>

            <p className="mt-2 text-xs font-bold leading-5 text-[#BCAAA4] sm:text-sm">
              The HUGz Card is a sentiment container, not an II or media file. Open it to compare three KK or KOMBO HUG choices at a time.
            </p>

            <p className="mt-3 rounded-xl border border-[#FFD54F]/35 bg-black/30 px-4 py-3 text-xs font-black uppercase leading-5 tracking-[0.12em] text-[#FFF8E1]">
              {HUGZ_BOUNDARY_HOLD.publicMessage}
            </p>

            <div className="mt-3 space-y-2">
              {active.seeds.slice(0, 3).map((seed) => (
                <div
                  key={seed.assetId}
                  className="rounded-xl border border-[#8D6E63]/40 bg-[#120A06] px-4 py-2 text-xs font-bold text-[#EFEBE9] sm:text-sm"
                >
                  “{seed.excerpt}”
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Link
              href={`/hugz/${active.slug}`}
              className="inline-flex rounded-xl bg-[#FFD54F] px-6 py-3 text-sm font-black text-black"
            >
              Open this HUGz Card
            </Link>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={previous}
                className="rounded-xl border border-[#FFD54F]/55 px-4 py-3 text-sm font-black text-[#FFD54F]"
                aria-label="Previous HUGz Card"
              >
                Previous
              </button>

              <div className="min-w-0 flex-1">
                <div className="h-1 overflow-hidden rounded-full bg-white/15">
                  <div
                    key={`progress-${active.slug}`}
                    className="hugz-progress h-full rounded-full bg-[#FFD54F]"
                  />
                </div>
                <p className="mt-2 text-center text-xs font-black uppercase tracking-[0.2em] text-[#BCAAA4]">
                  Next HUGz Card in 33 seconds
                </p>
              </div>

              <button
                type="button"
                onClick={next}
                className="rounded-xl border border-[#FFD54F]/55 px-4 py-3 text-sm font-black text-[#FFD54F]"
                aria-label="Next HUGz Card"
              >
                Next
              </button>
            </div>

            <div
              className="mt-3 flex flex-wrap justify-center gap-1.5"
              aria-label="Choose a HUGz Card"
            >
              {hugzSeedCatalog.map((container, index) => (
                <button
                  key={container.slug}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex
                      ? "w-9 bg-[#FFD54F]"
                      : "w-2.5 bg-white/30 hover:bg-white/55"
                  }`}
                  aria-label={`Show ${container.headline}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hugz-progress {
          transform-origin: left center;
          animation: hugz-rotate-progress 33s linear forwards;
        }

        @keyframes hugz-rotate-progress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hugz-progress {
            animation: none;
            transform: scaleX(1);
          }
        }
      `}</style>
    </section>
  );
}
