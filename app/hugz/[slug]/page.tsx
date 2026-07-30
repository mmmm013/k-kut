import Link from "next/link";
import { notFound } from "next/navigation";
import HugzThreeChoiceTray from "@/components/HugzThreeChoiceTray";
import { getHugzContainer, hugzSeedCatalog } from "@/lib/hugzSeedCatalog";
import { PRODUCT_OFFER_LAW, formatUsd } from "@/lib/productOfferLaw";
import { HUGZ_BOUNDARY_HOLD } from "@/lib/hugzBoundaryHold";

export function generateStaticParams() {
  return hugzSeedCatalog.map((container) => ({ slug: container.slug }));
}

export default async function HugzContainerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const container = getHugzContainer(slug);
  if (!container) notFound();

  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <Link href="/hugz" className="text-sm font-black text-[#FFD54F]">
          ← All 13 HUGz Cards
        </Link>

        <div className="mt-5 grid gap-7 lg:grid-cols-[0.82fr_1.18fr]">
          <img
            src={container.imageUrl}
            alt=""
            className="w-full rounded-[2rem] object-cover"
          />

          <div className="rounded-[2rem] border border-[#FFD54F]/35 bg-[#120A06] p-7">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FFD54F]">
              HUGz Card · {container.seedCount} matching HUG choices
            </p>
            <h1 className="mt-3 text-4xl font-black sm:text-6xl">
              {container.headline}
            </h1>
            <p className="mt-4 text-lg font-bold leading-8 text-[#D7CCC8]">
              {container.description}
            </p>
            <div className="mt-5 rounded-2xl border border-[#8D6E63]/45 bg-black/20 p-5 text-sm font-bold leading-7 text-[#FFF8E1]">
              <p>
                This HUGz Card organizes matching sentiment choices. It is not an II and it is not the music.
              </p>
              <p className="mt-2">
                Choose one KK or KOMBO packaged as a {PRODUCT_OFFER_LAW.HUG.customerName} for {formatUsd(PRODUCT_OFFER_LAW.HUG.priceUsd)} after its exact TP and CC boundary approval passes.
              </p>
              <p className="mt-2 text-[#FFD54F]">
                {HUGZ_BOUNDARY_HOLD.publicMessage}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <HugzThreeChoiceTray
            seeds={container.seeds}
            cardHeadline={container.headline}
          />
        </div>
      </section>
    </main>
  );
}
