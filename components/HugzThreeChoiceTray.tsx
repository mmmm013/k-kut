'use client';

import { useEffect, useRef, useState } from "react";
import { PRODUCT_OFFER_LAW, formatUsd } from "@/lib/productOfferLaw";

type HugzSeed = {
  rank: number;
  assetId: string;
  assetKind: string;
  excerpt: string;
  previewUrl: string;
  buyUrl: string | null;
  price: string;
  reference: string;
  checkoutStatus: string;
  musicGateStatus: string;
  twinkleAtEnd: boolean;
};

export default function HugzThreeChoiceTray({
  seeds,
  cardHeadline,
}: {
  seeds: readonly HugzSeed[];
  cardHeadline: string;
}) {
  const [volumeStep, setVolumeStep] = useState(6);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seed = seeds[0];

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volumeStep / 8;
  }, [volumeStep]);

  if (!seed) {
    return (
      <div className="rounded-[1.5rem] border border-amber-300/35 bg-[#120A06] p-6 text-sm font-bold text-[#FFF8E1]">
        This HUGz Card does not yet have a proven KK or approved KOMBO.
      </div>
    );
  }

  return (
    <section aria-label={`${cardHeadline} proven HUG choice`}>
      <article className="rounded-[1.5rem] border border-[#FFD54F]/35 bg-[#120A06] p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
          Proven KK · HUG offer {formatUsd(PRODUCT_OFFER_LAW.HUG.priceUsd)}
        </p>
        <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
          Strict music gate passed. Canonical Twinkle is proven at the end. This is not a phrase or line candidate.
        </p>

        <label className="mt-5 block max-w-sm text-xs font-black uppercase tracking-[0.16em] text-[#FFF8E1]">
          Listening volume · {volumeStep}/8
          <input
            className="mt-2 block w-full accent-[#FFD54F]"
            type="range"
            min="0"
            max="8"
            step="1"
            value={volumeStep}
            onChange={(event) => setVolumeStep(Number(event.target.value))}
          />
        </label>

        <audio
          ref={audioRef}
          className="mt-5 w-full"
          controls
          preload="metadata"
          src={seed.previewUrl}
        />

        <div className="mt-5 rounded-xl border border-amber-300/45 bg-amber-950/30 px-5 py-4 text-sm font-black text-amber-100">
          Checkout held: exact selected KK → $7.99 payment → correct delivery proof is still required.
        </div>
      </article>
    </section>
  );
}
