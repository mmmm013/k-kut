import Link from "next/link";
import { hugzSeedCatalog } from "@/lib/hugzSeedCatalog";

export default function HugzDiscoveryGrid() {
  return (
    <section aria-labelledby="hugz-heading">
      <div className="mb-8 rounded-[2rem] border border-[#FFD54F]/35 bg-[#120A06] p-6 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FFD54F]">
          Temporary music discovery lane · 13 HUGz
        </p>
        <h1 id="hugz-heading" className="mt-3 text-4xl font-black sm:text-6xl">
          Choose the feeling. Then choose the music.
        </h1>
        <p className="mt-4 max-w-4xl text-base font-bold leading-7 text-[#D7CCC8]">
          HUGz organize music choices by sentiment. A HUGz is not a song and not an II.
          Open one to hear several music options. Your chosen music is delivered inside a HUG package.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {hugzSeedCatalog.map((container) => (
          <article key={container.slug} className="overflow-hidden rounded-[1.75rem] border border-[#FFD54F]/35 bg-[#120A06] shadow-xl">
            <img src={container.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
            <div className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD54F]">
                HUGz container · {container.seedCount} music choices
              </p>
              <h2 className="mt-2 text-2xl font-black">{container.headline}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-[#D7CCC8]">{container.description}</p>
              <div className="mt-4 space-y-2 text-sm font-bold text-[#EFEBE9]">
                {container.seeds.slice(0, 3).map((seed) => (
                  <p key={seed.assetId}>“{seed.excerpt}”</p>
                ))}
              </div>
              <Link href={`/hugz/${container.slug}`} className="mt-5 inline-block rounded-xl bg-[#FFD54F] px-5 py-3 text-sm font-black text-black">
                Open this HUGz
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
