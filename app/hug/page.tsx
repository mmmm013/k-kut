export const metadata = {
  title: "K-KUT HUGs | G Putnam Music",
  description:
    "Send a private music HUG: choose a feeling, press play, and send a real music moment.",
};

const FEATURED_AUDIO =
  "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3";

const HUG_CARDS = [
  {
    title: "Personal HUGs",
    eyebrow: "Everyday moments",
    description:
      "Birthday, thank-you, apology, comfort, encouragement, friendship, family, love, and more.",
    href: "/personal",
    cta: "Browse Personal HUGs",
  },
  {
    title: "Holiday HUGs",
    eyebrow: "Seasonal moments",
    description:
      "Father’s Day, Mother’s Day, Christmas, Thanksgiving, remembrance, gratitude, and care.",
    href: "/holiday",
    cta: "Browse Holiday HUGs",
  },
  {
    title: "Father’s Day HUGs",
    eyebrow: "Active season",
    description:
      "Send Dad a real music moment: warm, steady, grateful, funny, quiet, or hard to say.",
    href: "/holiday/fathers-day",
    cta: "Go to Father’s Day",
  },
  {
    title: "Romance HUGs",
    eyebrow: "Love / repair / spark",
    description:
      "Gentle affection, missing you, committed love, repair, anniversary, and private connection.",
    href: "/romance",
    cta: "Browse Romance HUGs",
  },
];

export default function HugPage() {
  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#8D6E63]/45 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            K-KUT HUGs
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-[#EFEBE9]">
            Send a real music moment as a private HUG link.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[#D7CCC8]">
            Choose the feeling. Press play. Send the HUG. No download required.
            Customer delivery audio is finished before public use.
          </p>

          <div className="mt-6 rounded-[1.5rem] border border-[#8D6E63]/35 bg-black/25 p-4">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FFD54F]">
              One sample
            </p>

            <p className="mt-2 text-sm font-bold text-[#EFEBE9]">
              Hear the feel first. Then choose a HUG path below.
            </p>

            <audio
              className="mt-4 w-full"
              controls
              preload="metadata"
              src={FEATURED_AUDIO}
            />
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {HUG_CARDS.map((card) => (
            <article
              key={card.title}
              className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#120A06] p-5 shadow-xl"
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                {card.eyebrow}
              </p>

              <h2 className="mt-3 text-2xl font-black text-white">
                {card.title}
              </h2>

              <p className="mt-3 min-h-[72px] text-sm leading-6 text-[#D7CCC8]">
                {card.description}
              </p>

              <a
                className="mt-5 block rounded-2xl bg-[#FFD54F] px-5 py-3 text-center font-black text-[#160A05] transition hover:bg-white"
                href={card.href}
              >
                {card.cta}
              </a>
            </article>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#0F0805] p-5">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            MC-BOT guide
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Not sure which HUG fits?
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#D7CCC8]">
            MC-BOT can help narrow the feeling: warm, funny, grateful, missing
            someone, repair, encouragement, family, love, or something harder
            to say.
          </p>

          <a
            className="mt-5 inline-flex rounded-2xl border border-[#FFD54F]/70 px-5 py-3 text-sm font-black text-[#FFD54F] transition hover:bg-[#FFD54F] hover:text-[#160A05]"
            href="/find"
          >
            Ask MC-BOT to help me choose
          </a>
        </section>

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm leading-6 text-[#BCAAA4]">
          A K-KUT HUG uses finished delivery audio. Source/proof audio stays
          separate from customer delivery audio.
        </footer>
      </section>
    </main>
  );
}
