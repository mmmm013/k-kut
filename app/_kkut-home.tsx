import Link from "next/link";
import { PRODUCT_OFFER_LAW, formatUsd } from "@/lib/productOfferLaw";
import HtbHero from "@/components/landing/HtbHero";

export const kKutMetadata = {
  title: "K-KUT | Private Music Moments",
  description:
    "Browse K-KUT HUG, TUG, and BUG offers. Public audio and payment appear only after each exact music item passes release review.",
};

const offers = [
  {
    name: "HUG",
    price: formatUsd(PRODUCT_OFFER_LAW.HUG.priceUsd),
    heading: "A music moment to share",
    status: "HUG · K-KUT",
    description: "Find a song section that says what you mean.",
    href: "/find?mode=hug",
    cta: "Find a HUG",
    statusHref: "/hugz",
    statusCta: "Explore HUGz Cards",
  },
  {
    name: "TUG",
    price: formatUsd(PRODUCT_OFFER_LAW.TUG.priceUsd),
    heading: "Say it with a lyric",
    status: "TUG · shortKUT",
    description: "Find a phrase or lyric that fits your message.",
    href: "/find?mode=tug",
    cta: "Find a TUG",
    statusHref: "/tug",
    statusCta: "About TUGs",
  },
  {
    name: "BUG",
    price: formatUsd(PRODUCT_OFFER_LAW.BUG.priceUsd),
    heading: "A little musical nudge",
    status: "BUG · mini-KUT",
    description: "Find a compact musical expression for someone on your mind.",
    href: "/find?mode=bug",
    cta: "Find a BUG",
    statusHref: "/bug",
    statusCta: "About BUGs",
  },
] as const;

const standardHeadline = "Send the Sent-i-Meant.";

export default function KKutHome() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
        <HtbHero headline={standardHeadline} />

        <section className="rounded-[1.75rem] border border-pink-200/30 bg-pink-950/20 p-6">
          <h2 className="text-3xl font-black">What would you like to say?</h2>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-pink-50/75">
            Start with your message. Explore music by feeling or occasion, then listen to the available choices.
          </p>
          <Link href="/find" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl border border-pink-200/60 px-5 py-3 text-sm font-black text-pink-100">
            Find the right music moment
          </Link>
        </section>

        <section aria-label="K-KUT offer availability" className="grid gap-5 md:grid-cols-3">
          {offers.map((offer) => (
            <article
              key={offer.name}
              className="flex flex-col rounded-[1.75rem] border border-[#8D6E63]/40 bg-[#120A06] p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                {offer.name} · {offer.price}
              </p>
              <p className="mt-3 text-sm font-black text-[#FFF8E1]">{offer.status}</p>
              <p className="mt-3 flex-1 text-sm font-bold leading-7 text-[#D7CCC8]">
                {offer.description}
              </p>
              <Link
                href={offer.href}
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl border border-[#FFD54F]/60 px-5 py-3 text-center text-sm font-black text-[#FFD54F]"
              >
                {offer.cta}
              </Link>
              <Link
                href={offer.statusHref}
                className="mt-3 text-center text-xs font-black uppercase tracking-[0.12em] text-[#D7CCC8] underline underline-offset-4"
              >
                {offer.statusCta}
              </Link>
            </article>
          ))}
        </section>



        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Need help? Contact reachus@gputnammusic.com.
        </footer>
      </section>
    </main>
  );
}
