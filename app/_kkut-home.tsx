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
    status: "15 Comin' True HUGs live",
    description:
      "Hear 15 released HUG and KOMBO moments from Comin' True. Exact-price checkout links remain held until corrected.",
    href: "/hugs/comin-true#hugs",
    cta: "Hear 15 HUGs",
    statusHref: "/hugz",
    statusCta: "Browse HUGz Cards",
  },
  {
    name: "TUG",
    price: formatUsd(PRODUCT_OFFER_LAW.TUG.priceUsd),
    status: "49 Comin' True TUGs live",
    description:
      "Hear 49 released phrase, hook, one-line, line-pair, line-trio, twist, idiom, and metaphor moments.",
    href: "/hugs/comin-true#tugs",
    cta: "Hear 49 TUGs",
    statusHref: "/tug",
    statusCta: "View all TUG status",
  },
  {
    name: "BUG",
    price: formatUsd(PRODUCT_OFFER_LAW.BUG.priceUsd),
    status: "34 BUGs + 3 Story BUGs live",
    description:
      "Hear 34 released compact vocal moments plus three Story BUG progressions.",
    href: "/hugs/comin-true#bugs",
    cta: "Hear BUGs",
    statusHref: "/bug",
    statusCta: "View all BUG status",
  },
] as const;

const standardHeadline = "Send the Sent-i-Meant.";

export default function KKutHome() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
        <HtbHero headline={standardHeadline} />

        <section className="rounded-[1.75rem] border border-pink-200/30 bg-pink-950/20 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-pink-200">
            Customer release review active
          </p>
          <h2 className="mt-3 text-3xl font-black">101 Comin&apos; True IIs are published now.</h2>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-pink-50/75">
            Hear 15 HUGs, 49 TUGs, 34 BUGs, and three Story BUGs. The audio is live; purchase buttons remain held until exact-price Stripe links are corrected.
          </p>
          <Link
            href="/hugs/comin-true"
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl border border-pink-200/60 px-5 py-3 text-sm font-black text-pink-100"
          >
            Hear Comin&apos; True IIs
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

        <section className="rounded-[1.75rem] border border-amber-300/25 bg-amber-950/20 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">
            Release control
          </p>
          <p className="mt-3 text-sm font-bold leading-7 text-amber-50/80">
            Comin&apos; True is the governed public release. Other catalog audio, titles, delivery, and payment remain unavailable until approved. A missing payment button means the exact-price checkout link is not active—not that your browser failed.
          </p>
        </section>

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Need help? Contact reachus@gputnammusic.com.
        </footer>
      </section>
    </main>
  );
}
