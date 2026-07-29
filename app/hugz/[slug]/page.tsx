import Link from "next/link";
import { notFound } from "next/navigation";
import { getHugzContainer, hugzSeedCatalog } from "@/lib/hugzSeedCatalog";

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
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <Link href="/hugz" className="text-sm font-black text-[#FFD54F]">← All HUGz</Link>
        <div className="mt-5 grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <img src={container.imageUrl} alt="" className="w-full rounded-[2rem] object-cover" />
          <div className="rounded-[2rem] border border-[#FFD54F]/35 bg-[#120A06] p-7">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FFD54F]">
              Temporary HUGz container · {container.seedCount} music choices
            </p>
            <h1 className="mt-3 text-4xl font-black sm:text-6xl">{container.headline}</h1>
            <p className="mt-4 text-lg font-bold leading-8 text-[#D7CCC8]">{container.description}</p>
            <p className="mt-4 text-sm font-bold leading-6 text-[#BCAAA4]">
              This HUGz organizes choices. It is not the media. Pick the music below; checkout packages the selected media as a HUG.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {container.seeds.map((seed) => (
            <article key={seed.assetId} className="rounded-[1.5rem] border border-[#8D6E63]/45 bg-[#120A06] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD54F]">Music choice {seed.rank}</p>
              <p className="mt-2 text-xl font-black">“{seed.excerpt}”</p>
              <audio className="mt-4 w-full" controls preload="metadata" src={seed.previewUrl} />
              <a href={seed.buyUrl} className="mt-5 inline-block rounded-xl bg-[#FFD54F] px-5 py-3 text-sm font-black text-black">
                Package this music as a HUG · {seed.price}
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
