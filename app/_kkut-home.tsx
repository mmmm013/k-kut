import Link from "next/link";
import { PRODUCT_OFFER_LAW, formatUsd } from "@/lib/productOfferLaw";

export const kKutMetadata = {
  title: "K-KUT | Private Music Moments",
  description:
    "Browse K-KUT HUG, TUG, and BUG offers. Public audio and payment appear only after each exact music item passes release review.",
};

const offers = [
  {
    name: "HUG",
    price: formatUsd(PRODUCT_OFFER_LAW.HUG.priceUsd),
    status: "36 Gregory-approved IIs",
    description:
      "Hear 30 regular HUG moments at $7.99 and six intrinsically Christmas moments in the $14.99 holiday container.",
    href: "/hugz",
    cta: "Browse 13 HUGz Cards",
  },
  {
    name: "TUG",
    price: formatUsd(PRODUCT_OFFER_LAW.TUG.priceUsd),
    status: "Product mapping in review",
    description:
      "TUG is the shorter music-moment offer. Its inventory cannot be sold until each released item is mapped to this customer offer.",
    href: "/tug",
    cta: "View TUG status",
  },
  {
    name: "BUG",
    price: formatUsd(PRODUCT_OFFER_LAW.BUG.priceUsd),
    status: "No public inventory yet",
    description:
      "BUG is the mini music-moment offer. No customer-ready BUG inventory is published, so no payment button is shown.",
    href: "/bug",
    cta: "View BUG status",
  },
] as const;

export default function KKutHome() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
        <header className="rounded-[2.25rem] border border-[#FFD54F]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-7 shadow-2xl md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music · K-KUT
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            Send the Sent-i-Meant.
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-bold leading-8 text-[#EFEBE9]">
            Choose the human moment first. K-KUT shows a player or payment button only when that exact music item is customer-ready.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/hug"
              className="rounded-2xl bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#160A05]"
            >
              See all offers
            </Link>
            <Link
              href="/find"
              className="rounded-2xl border border-[#FFD54F]/70 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#FFD54F]"
            >
              Find the right moment
            </Link>
          </div>
        </header>

        <section className="rounded-[1.75rem] border border-pink-200/30 bg-pink-950/20 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-pink-200">
            Approved real-music release
          </p>
          <h2 className="mt-3 text-3xl font-black">36 Gregory-approved IIs are ready to hear.</h2>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-pink-50/75">
            Choose the exact music moment first. Checkout appears only when its matching Stripe link is active at the locked price.
          </p>
          <Link
            href="/approved-iis"
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl border border-pink-200/60 px-5 py-3 text-sm font-black text-pink-100"
          >
            Hear the approved music moments
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
            </article>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-amber-300/25 bg-amber-950/20 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">
            Release control
          </p>
          <p className="mt-3 text-sm font-bold leading-7 text-amber-50/80">
            Only the 36-item Gregory-approved subset is released here. A LOVE LIKE THAT and the rest of the general catalog remain held. A missing payment button means Stripe price verification is still pending—not that your browser failed.
          </p>
        </section>

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Need help? Contact reachus@gputnammusic.com.
        </footer>
      </section>
    </main>
  );
}
