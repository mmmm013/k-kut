'use client';

import { useMemo, useState } from "react";
import { HUGZ_BOUNDARY_HOLD } from "@/lib/hugzBoundaryHold";
import { HUGZ_CARD_RULES, PRODUCT_OFFER_LAW, formatUsd } from "@/lib/productOfferLaw";

type HugzSeed = {
  rank: number;
  assetId: string;
  assetKind: string;
  excerpt: string;
  previewUrl: string;
  buyUrl: string;
  price: string;
  reference: string;
};

export default function HugzThreeChoiceTray({
  seeds,
  cardHeadline,
}: {
  seeds: readonly HugzSeed[];
  cardHeadline: string;
}) {
  const [startIndex, setStartIndex] = useState(0);

  const visibleSeeds = useMemo(() => {
    if (seeds.length === 0) return [];

    return Array.from({ length: Math.min(HUGZ_CARD_RULES.optionsVisibleAtOnce, seeds.length) }, (_, position) => {
      return seeds[(startIndex + position) % seeds.length];
    });
  }, [seeds, startIndex]);

  const move = (direction: 1 | -1) => {
    if (seeds.length <= HUGZ_CARD_RULES.optionsVisibleAtOnce) return;
    setStartIndex((current) => {
      const next = current + direction * HUGZ_CARD_RULES.optionsVisibleAtOnce;
      return ((next % seeds.length) + seeds.length) % seeds.length;
    });
  };

  if (visibleSeeds.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-amber-300/35 bg-[#120A06] p-6 text-sm font-bold text-[#FFF8E1]">
        This HUGz Card does not yet have a sale-ready HUG choice.
      </div>
    );
  }

  return (
    <section aria-label={`${cardHeadline} HUG choices`}>
      <div className="mb-5 rounded-[1.5rem] border border-[#FFD54F]/35 bg-[#120A06] p-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
            Boundary-quality review in progress
          </p>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-[#D7CCC8]">
            {HUGZ_BOUNDARY_HOLD.publicMessage}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#BCAAA4]">
            Playback and checkout remain closed until each exact KK or KOMBO passes TP and CC verification.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {visibleSeeds.map((seed, position) => (
          <article
            key={`${startIndex}-${seed.assetId}`}
            className="flex flex-col rounded-[1.5rem] border border-[#8D6E63]/45 bg-[#120A06] p-5"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD54F]">
              Choice {position + 1} of 3 · HUG
            </p>
            <p className="mt-3 flex-1 text-xl font-black leading-8">“{seed.excerpt}”</p>
            <div className="mt-5 rounded-xl border border-[#FFD54F]/35 bg-black/25 px-4 py-4 text-sm font-black text-[#FFF8E1]">
              Audio and {formatUsd(PRODUCT_OFFER_LAW.HUG.priceUsd)} checkout held for exact vocal-boundary approval.
            </div>
          </article>
        ))}
      </div>

      {seeds.length > HUGZ_CARD_RULES.optionsVisibleAtOnce ? (
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => move(-1)}
            className="rounded-xl border border-[#FFD54F]/60 px-5 py-3 text-sm font-black text-[#FFD54F]"
          >
            Previous 3
          </button>
          <p className="text-center text-xs font-bold leading-5 text-[#BCAAA4]">
            Stay in this HUGz Card and compare another three matching choices.
          </p>
          <button
            type="button"
            onClick={() => move(1)}
            className="rounded-xl border border-[#FFD54F]/60 px-5 py-3 text-sm font-black text-[#FFD54F]"
          >
            Next 3
          </button>
        </div>
      ) : null}
    </section>
  );
}
