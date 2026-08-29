import Link from "next/link";
import { notFound } from "next/navigation";
import HugzThreeChoiceTray from "@/components/HugzThreeChoiceTray";
import { HUGZ_BOUNDARY_HOLD } from "@/lib/hugzBoundaryHold";
import { getHugzContainer, hugzSeedCatalog } from "@/lib/hugzSeedCatalog";
import { getHugzIntentPath } from "@/lib/hugzIntentPaths";

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

  const intentPath = getHugzIntentPath(slug);

  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <section
        className="mx-auto max-w-7xl px-5 py-10 sm:px-8"
        data-boundary-hold={HUGZ_BOUNDARY_HOLD.publicMessage}
      >
        <Link href="/hugz" className="text-sm font-black text-[#FFD54F]">
          ← Back to all HUGz Cards
        </Link>

        <div className="mt-5 grid gap-7 lg:grid-cols-[0.82fr_1.18fr]">
          <img
            src={container.imageUrl}
            alt=""
            className="w-full rounded-[2rem] object-cover"
          />

          <div className="rounded-[2rem] border border-[#FFD54F]/35 bg-[#120A06] p-7">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FFD54F]">
              Start with the human reason
            </p>
            <h1 className="mt-3 text-4xl font-black sm:text-6xl">
              {container.headline}
            </h1>
            <p className="mt-4 text-lg font-bold leading-8 text-[#D7CCC8]">
              {container.description}
            </p>
            <p className="mt-5 rounded-2xl border border-[#8D6E63]/45 bg-black/20 p-5 text-base font-bold leading-7 text-[#FFF8E1]">
              Choose what you want this HUG to do. We will narrow the choices from there.
            </p>
          </div>
        </div>

        <section
          className="mt-8 rounded-[2rem] border border-[#FFD54F]/35 bg-[#120A06] p-6 sm:p-8"
          data-governance="Choose one KK or KOMBO"
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FFD54F]">
            First choice
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            {intentPath.question}
          </h2>
          <p className="mt-3 max-w-3xl text-base font-bold leading-7 text-[#D7CCC8]">
            Pick the closest answer. You can narrow it again on the next screen.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {intentPath.choices.map((choice) => (
              <Link
                key={`${choice.href}-${choice.label}`}
                href={choice.href}
                className="rounded-[1.5rem] border border-[#FFD54F]/30 bg-black/25 p-5 transition hover:border-[#FFD54F]/70 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#FFD54F]"
              >
                <span className="block text-xl font-black text-[#FFF8E1]">
                  {choice.label}
                </span>
                <span className="mt-2 block text-sm font-bold leading-6 text-[#D7CCC8]">
                  {choice.description}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/find"
              className="rounded-xl border border-[#FFD54F]/55 px-5 py-3 text-sm font-black text-[#FFD54F]"
            >
              I’m not sure — help me choose
            </Link>
            <Link
              href="/hugz"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white/80"
            >
              Choose a different HUGz Card
            </Link>
          </div>
        </section>

        <div className="mt-8">
          <HugzThreeChoiceTray
            seeds={container.seeds.map((seed) => ({
              rank: seed.rank,
              assetId: seed.assetId,
              assetKind: seed.assetKind,
              excerpt: seed.excerpt,
            }))}
            cardHeadline={container.headline}
          />
        </div>
      </section>
    </main>
  );
}
