import Link from "next/link";
import { PRODUCT_OFFER_LAW, formatUsd } from "@/lib/productOfferLaw";

export const metadata = {
  title: "K-KUT HUGs, TUGs & BUGs | G Putnam Music",
  description:
    "K-KUT customer offers: $7.99 HUGs from KKs or KOMBOs, $4.99 TUGs from sKs, and $1.99 BUGs from approved mKs.",
};

export default function HugPage() {
  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="rounded-[2rem] border border-[#8D6E63]/45 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302] p-6 shadow-2xl md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music · K-KUT
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">
            Send the sentimeant.
          </h1>

          <p className="mt-5 max-w-4xl text-xl font-black leading-9 text-[#FFF8E1] md:text-3xl">
            Hear the music. Choose the fit. Send the exact item.
          </p>

          <p className="mt-5 max-w-4xl text-base font-bold leading-8 text-[#D7CCC8]">
            Every customer item remains traceable to its original LT-PIX lineage. HUG, TUG, and BUG are clear customer offers; they do not replace the permanent II identity.
          </p>

          <Link
            href="/hugz"
            className="mt-8 inline-flex rounded-2xl bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#160A05]"
          >
            Open the 13 HUGz Cards
          </Link>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[1.75rem] border border-[#FFD54F]/45 bg-[#120A06] p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
              HUG · {formatUsd(PRODUCT_OFFER_LAW.HUG.priceUsd)}
            </p>
            <h2 className="mt-3 text-3xl font-black">KK or KOMBO</h2>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              HUGs are the only customer items housed inside the 13 HUGz Cards. Each card shows three matching choices at a time.
            </p>
            <Link
              href="/hugz"
              className="mt-5 inline-flex rounded-xl bg-[#FFD54F] px-5 py-3 text-sm font-black text-black"
            >
              Choose a HUG
            </Link>
          </article>

          <article className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#120A06] p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
              TUG · {formatUsd(PRODUCT_OFFER_LAW.TUG.priceUsd)}
            </p>
            <h2 className="mt-3 text-3xl font-black">sK</h2>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              TUGs use sKs and stay in their own offer lane. They do not appear inside HUGz Cards.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#120A06] p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
              BUG · {formatUsd(PRODUCT_OFFER_LAW.BUG.priceUsd)}
            </p>
            <h2 className="mt-3 text-3xl font-black">mK</h2>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              Choose Repeat BUG for the same exact BUG three times, or Story BUG for three different but related BUGs in Hook, Build, and Payoff order. Both use three timed Sends and one charge.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
