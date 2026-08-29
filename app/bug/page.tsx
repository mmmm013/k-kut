import Link from "next/link";
import { PRODUCT_OFFER_LAW, formatUsd } from "@/lib/productOfferLaw";

export const metadata = {
  title: "BUG Status | K-KUT",
  description:
    "See the current release status of the K-KUT BUG offer.",
};

export default function BugPage() {
  return (
    <main className="min-h-screen bg-[#09070B] px-5 py-12 text-white sm:px-8">
      <section className="mx-auto max-w-4xl">
        <header className="rounded-[2rem] border border-[#FFD54F]/35 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#FFD54F]">
            K-KUT BUG · {formatUsd(PRODUCT_OFFER_LAW.BUG.priceUsd)}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            Mini music moments are not published yet.
          </h1>
          <p className="mt-6 text-lg font-bold leading-8 text-[#D7CCC8]">
            BUG may use only approved mini music from its permitted source forms. No customer-ready BUG inventory currently clears that rule, so this page shows no player and starts no payment.
          </p>
        </header>

        <section className="mt-8 rounded-[1.75rem] border border-[#8D6E63]/40 bg-[#120A06] p-6">
          <h2 className="text-2xl font-black text-[#FFF8E1]">What must pass</h2>
          <ol className="mt-4 space-y-3 text-sm font-bold leading-7 text-[#D7CCC8]">
            <li>1. Publish an eligible mini music item from an allowed source.</li>
            <li>2. Approve its customer-safe title, meaning, and delivery audio.</li>
            <li>3. Verify the locked {formatUsd(PRODUCT_OFFER_LAW.BUG.priceUsd)} checkout and fulfillment path.</li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/hugz"
              className="rounded-xl bg-[#FFD54F] px-5 py-3 text-sm font-black text-black"
            >
              Browse HUGz Cards
            </Link>
            <Link
              href="/hug"
              className="rounded-xl border border-[#FFD54F]/55 px-5 py-3 text-sm font-black text-[#FFD54F]"
            >
              Back to all offers
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
