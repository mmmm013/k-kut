"use client";

import Link from "next/link";
import { useRef } from "react";

type Product = {
  offer: "short" | "hug" | "big";
  inventoryId: string;
  name: string;
  price: string;
  title: string;
  description: string;
  audioUrl: string;
  accent: string;
};

const PRODUCTS: Product[] = [
  {
    offer: "short",
    inventoryId: "thank-you-cc-012",
    name: "Short KUT",
    price: "$4.99",
    title: "Just the Feeling",
    description: "One focused real-audio greeting from the song.",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-012.mp3",
    accent: "from-[#F6D365] to-[#FDA085]",
  },
  {
    offer: "hug",
    inventoryId: "thank-you-sec-ch1",
    name: "HUG",
    price: "$7.99",
    title: "Thank You Chorus",
    description: "A fuller real-audio greeting with the heart of the song.",
    audioUrl: "/hug-delivery/thank-you/thank-you-sec-ch1-ii-delivery.mp3",
    accent: "from-[#FFD54F] to-[#FF8A65]",
  },
  {
    offer: "big",
    inventoryId: "thank-you-kk7",
    name: "Big HUG",
    price: "$12.99",
    title: "The Big Thank-You HUG",
    description: "A larger real-audio greeting with the strongest emotional arc.",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk7.mp3",
    accent: "from-[#FFB74D] to-[#E57373]",
  },
];

export default function KkutHomeProducts() {
  const audioRefs = useRef(new Map<string, HTMLAudioElement>());

  function stopOtherAudio(currentId: string) {
    for (const [id, audio] of audioRefs.current.entries()) {
      if (id === currentId) continue;
      audio.pause();
      audio.currentTime = 0;
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-3" aria-label="K-KUT products">
        {PRODUCTS.map((product) => (
          <article
            key={product.offer}
            className="overflow-hidden rounded-[2rem] border border-[#8D6E63]/40 bg-[#160D08] shadow-2xl"
          >
            <div className={`h-3 bg-gradient-to-r ${product.accent}`} />
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FFD54F]">
                    {product.name}
                  </p>
                  <h2 className="mt-3 text-3xl font-black text-white">
                    {product.title}
                  </h2>
                </div>
                <span className="rounded-full border border-[#FFD54F]/40 bg-black/25 px-4 py-2 text-sm font-black text-[#FFD54F]">
                  {product.price}
                </span>
              </div>

              <p className="mt-4 min-h-[56px] text-sm font-bold leading-7 text-[#D7CCC8]">
                {product.description}
              </p>

              <audio
                ref={(element) => {
                  if (element) audioRefs.current.set(product.offer, element);
                  else audioRefs.current.delete(product.offer);
                }}
                className="mt-5 w-full"
                controls
                preload="none"
                src={product.audioUrl}
                onPlay={() => stopOtherAudio(product.offer)}
              />

              <form action="/checkout" method="get" className="mt-5">
                <input type="hidden" name="ii" value={product.inventoryId} />
                <input type="hidden" name="offer" value={product.offer} />
                <button
                  type="submit"
                  className="block w-full rounded-2xl bg-[#FFD54F] px-5 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-[#160A05] transition hover:bg-white"
                >
                  Choose {product.name}
                </button>
              </form>

              <p className="mt-4 text-xs font-bold leading-6 text-[#BCAAA4]">
                One exact real-audio item per purchase. Manually reviewed before private link delivery.
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[1.75rem] border border-[#FFD54F]/25 bg-[#24130C] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FFD54F]">
            More approved HUG choices
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Hear the full released K-KUT catalog.
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-7 text-[#D7CCC8]">
            Browse, listen, add an optional note of up to 13 words, and send the exact K-KUT as a $7.99 HUG.
          </p>
        </div>
        <Link
          href="/browse"
          className="mt-5 block shrink-0 rounded-2xl border border-[#FFD54F]/65 px-5 py-3 text-center text-sm font-black text-[#FFD54F] transition hover:bg-[#FFD54F] hover:text-[#160A05] sm:mt-0"
        >
          Browse all HUGs
        </Link>
      </section>
    </div>
  );
}
