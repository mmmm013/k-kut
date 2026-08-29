import Link from "next/link";
import { PRODUCT_OFFER_LAW, formatUsd } from "@/lib/productOfferLaw";

export const metadata = {
  title: "TUG Status | K-KUT",
  description:
    "See the current release status of the K-KUT TUG offer.",
};

export default function TugPage() {
  return (
    <main className="min-h-screen bg-[#1A120B] px-5 py-12 text-[#F5E6C8] sm:px-8">
      <section className="mx-auto max-w-4xl">
        <header className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
            K-KUT TUG · {formatUsd(PRODUCT_OFFER_LAW.TUG.priceUsd)}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            Short music moments are in product review.
          </h1>
          <p className="mt-6 text-lg font-bold leading-8 text-[#F5E6C8]/80">
            The stored short-form music inventory is not yet mapped to the TUG customer offer. Until that mapping is approved, K-KUT will not show a player or start payment.
          </p>
        </header>

        <section className="mt-8 rounded-[1.75rem] border border-amber-300/30 bg-black/20 p-6">
          <h2 className="text-2xl font-black text-[#FFD36A]">What must pass</h2>
          <ol className="mt-4 space-y-3 text-sm font-bold leading-7 text-[#F5E6C8]/75">
            <li>1. Map the exact music item to the TUG offer.</li>
            <li>2. Approve its customer-safe title, meaning, and audio boundaries.</li>
            <li>3. Verify the locked {formatUsd(PRODUCT_OFFER_LAW.TUG.priceUsd)} server checkout and delivery path.</li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/hugz"
              className="rounded-xl bg-[#FFD36A] px-5 py-3 text-sm font-black text-[#1A120B]"
            >
              Browse HUGz Cards
            </Link>
            <Link
              href="/hug"
              className="rounded-xl border border-[#FFD36A]/55 px-5 py-3 text-sm font-black text-[#FFD36A]"
            >
              Back to all offers
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
