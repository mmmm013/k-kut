import Link from "next/link";
import { hugzSeedCatalog } from "@/lib/hugzSeedCatalog";

export default function HugzCardGrid() {
  return (
    <section aria-label="13 HUGz Cards" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {hugzSeedCatalog.map((card) => (
        <article
          key={card.slug}
          className="overflow-hidden rounded-[1.75rem] border border-[#8D6E63]/40 bg-[#120A06]"
        >
          <img
            src={card.imageUrl}
            alt=""
            className="aspect-[16/10] w-full object-cover"
          />
          <div className="flex min-h-56 flex-col p-6">
            <h2 className="text-2xl font-black">{card.headline}</h2>
            <p className="mt-3 flex-1 text-sm font-bold leading-7 text-[#D7CCC8]">
              {card.description}
            </p>
            <Link
              href={`/hugz/${card.slug}`}
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FFD54F] px-5 py-3 text-center text-sm font-black text-black"
            >
              Open this HUGz Card
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
