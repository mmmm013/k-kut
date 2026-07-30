import Link from "next/link";
import { hugzSeedCatalog } from "@/lib/hugzSeedCatalog";

export const metadata = {
  title: "Music Themes | G Putnam Music",
  description:
    "Choose a G Putnam Music pathway by feeling, relationship, or occasion.",
};

const featuredThemes = [
  {
    href: "/kupid",
    title: "Kupid",
    description: "Desire, passion, physical spark, and intimate connection.",
  },
  {
    href: "/wedding",
    title: "Wedding",
    description: "Wedding, vow, first-dance, ceremony, and forever feelings.",
  },
];

export default function ThemesPage() {
  return (
    <main className="min-h-screen bg-[#09070b] px-5 py-10 text-white sm:px-8">
      <section className="mx-auto max-w-6xl">
        <header className="rounded-[2rem] border border-[#FFD54F]/30 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302] p-7 shadow-2xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-[#FFD54F]">
            G Putnam Music
          </p>
          <h1 className="mt-4 text-5xl font-black sm:text-7xl">Themes</h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-[#FFF8E1]">
            Start with the feeling, relationship, or occasion. You always
            choose the final music.
          </p>
        </header>

        <section className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            Featured pathways
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {featuredThemes.map((theme) => (
              <article
                key={theme.href}
                className="flex flex-col rounded-[1.75rem] border border-[#FFD54F]/30 bg-gradient-to-br from-[#2b1430] via-[#140819] to-[#050307] p-6"
              >
                <h2 className="text-3xl font-black">{theme.title}</h2>
                <p className="mt-3 flex-1 text-sm font-bold leading-7 text-[#D7CCC8]">
                  {theme.description}
                </p>
                <Link
                  href={theme.href}
                  className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FFD54F] px-5 py-3 text-center text-sm font-black text-black"
                >
                  Start a New Sentimeant
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
                13 HUGz Cards
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Choose the human moment.
              </h2>
            </div>
            <Link
              href="/find"
              className="rounded-xl border border-[#FFD54F]/55 px-5 py-3 text-sm font-black text-[#FFD54F]"
            >
              Ask MC-BOT to help
            </Link>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {hugzSeedCatalog.map((theme) => (
            <article
              key={theme.slug}
              className="overflow-hidden rounded-[1.75rem] border border-[#8D6E63]/40 bg-[#120A06]"
            >
              <img
                src={theme.imageUrl}
                alt=""
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="flex min-h-56 flex-col p-6">
                <h3 className="text-2xl font-black">{theme.headline}</h3>
                <p className="mt-3 flex-1 text-sm font-bold leading-7 text-[#D7CCC8]">
                  {theme.description}
                </p>
                <Link
                  href={`/hugz/${theme.slug}`}
                  className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FFD54F] px-5 py-3 text-center text-sm font-black text-black"
                >
                  Start a New Sentimeant
                </Link>
              </div>
            </article>
          ))}
          </div>
        </section>
      </section>
    </main>
  );
}
