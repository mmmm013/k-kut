import Link from "next/link";
import { PRODUCT_OFFER_LAW, formatUsd } from "@/lib/productOfferLaw";

export const metadata = {
  title: "K-KUT HUGs, TUGs & BUGs | G Putnam Music",
  description:
    "Choose a K-KUT offer and see its current customer availability.",
};

const offers = [
  {
    name: "HUG",
    price: formatUsd(PRODUCT_OFFER_LAW.HUG.priceUsd),
    heading: "A full music moment",
    description:
      "One Sweet Love HUG is approved for the $7.99 purchase canary. All other exact choices remain gated.",
    href: "/hugz",
    cta: "Browse HUGz Cards",
  },
  {
    name: "TUG",
    price: formatUsd(PRODUCT_OFFER_LAW.TUG.priceUsd),
    heading: "A shorter music moment",
    description:
      "TUG inventory is verified at storage level, but its customer product mapping is not approved yet.",
    href: "/tug",
    cta: "View TUG status",
  },
  {
    name: "BUG",
    price: formatUsd(PRODUCT_OFFER_LAW.BUG.priceUsd),
    heading: "A mini music moment",
    description:
      "BUG has strict source rules. No customer-ready BUG inventory is currently published.",
    href: "/bug",
    cta: "View BUG status",
  },
] as const;

export default function HugPage() {
  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="rounded-[2rem] border border-[#8D6E63]/45 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302] p-6 shadow-2xl md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music · K-KUT
          </p>
          <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">
            Send the Sent-i-Meant.
          </h1>
          <p className="mt-5 max-w-4xl text-xl font-black leading-9 text-[#FFF8E1] md:text-3xl">
            Pick the size of the music moment. See what is ready before payment.
          </p>
        </header>

        <section className="rounded-[1.75rem] border border-pink-200/30 bg-pink-950/20 p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-pink-200">
            One approved HUG is ready now
          </p>
          <h2 className="mt-3 text-3xl font-black">A LOVE LIKE THAT · Sweet Love · $7.99</h2>
          <Link
            href="/romance"
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-pink-200 px-5 py-3 text-sm font-black text-[#160915]"
          >
            Hear it and send it
          </Link>
        </section>

        <section aria-label="HUG, TUG, and BUG offers" className="grid gap-5 md:grid-cols-3">
          {offers.map((offer) => (
            <article
              key={offer.name}
              className="flex flex-col rounded-[1.75rem] border border-[#FFD54F]/35 bg-[#120A06] p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                {offer.name} · {offer.price}
              </p>
              <h2 className="mt-3 text-3xl font-black">{offer.heading}</h2>
              <p className="mt-3 flex-1 text-sm font-bold leading-7 text-[#D7CCC8]">
                {offer.description}
              </p>
              <Link
                href={offer.href}
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FFD54F] px-5 py-3 text-center text-sm font-black text-black"
              >
                {offer.cta}
              </Link>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
