import Link from "next/link";

export const metadata = {
  title: "Music Themes | G Putnam Music",
  description:
    "Choose a G Putnam Music pathway by feeling, relationship, or occasion.",
};

const themes = [
  {
    href: "/hugz",
    title: "13 HUGz",
    description: "Choose a feeling, then compare matching $7.99 KK HUGs.",
  },
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
  {
    href: "/holiday",
    title: "Holiday",
    description: "Seasonal and approved on-demand holiday matching.",
  },
  {
    href: "/personal",
    title: "Personal",
    description: "Birthday, gratitude, apology, encouragement, care, and more.",
  },
  {
    href: "/find",
    title: "Find with MC-BOT",
    description: "Start with what you need the music moment to do.",
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

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {themes.map((theme) => (
            <article
              key={theme.href}
              className="flex flex-col rounded-[1.75rem] border border-[#8D6E63]/40 bg-[#120A06] p-6"
            >
              <h2 className="text-3xl font-black">{theme.title}</h2>
              <p className="mt-3 flex-1 text-sm font-bold leading-7 text-[#D7CCC8]">
                {theme.description}
              </p>
              <Link
                href={theme.href}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FFD54F] px-5 py-3 text-center text-sm font-black text-black"
              >
                Open {theme.title}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
