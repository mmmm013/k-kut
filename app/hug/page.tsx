import Link from "next/link";

export const metadata = {
  title: "K-KUT HUGs | G Putnam Music",
  description:
    "Listen to released K-KUT music moments, use MC-BOT to narrow the catalog, and choose the exact K-KUT you want to send.",
};

const STEPS = [
  {
    number: "1",
    title: "Say what you need",
    description:
      "Tell MC-BOT whether this is gratitude, love, celebration, repair, comfort, or another human moment.",
  },
  {
    number: "2",
    title: "Hear the music",
    description:
      "Listen to the finished K-KUT delivery audio. The real sound—not a title or marketing claim—guides your choice.",
  },
  {
    number: "3",
    title: "Choose the exact K-KUT",
    description:
      "Your selected K-KUT identity is preserved into checkout so the paid order can be reconciled to the music you chose.",
  },
];

export default function HugPage() {
  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="rounded-[2rem] border border-[#8D6E63]/45 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302] p-6 shadow-2xl md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight md:text-7xl">
            K-KUT HUGs
          </h1>

          <p className="mt-5 max-w-4xl text-xl font-black leading-9 text-[#FFF8E1] md:text-3xl">
            Hear a real music moment. Choose the one that says what you mean.
          </p>

          <p className="mt-5 max-w-4xl text-base font-bold leading-8 text-[#D7CCC8]">
            The released catalog now holds 2,611 playable K-KUTs. Browse them directly or let MC-BOT narrow the choices using the information available—then listen and make the final decision yourself.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/browse"
              className="rounded-2xl bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#160A05] transition hover:bg-white"
            >
              Browse all K-KUTs
            </Link>

            <Link
              href="/find"
              className="rounded-2xl border border-[#FFD54F]/70 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#FFD54F] transition hover:bg-[#FFD54F] hover:text-[#160A05]"
            >
              Ask MC-BOT
            </Link>
          </div>

          <div className="mt-7 rounded-2xl border border-emerald-400/30 bg-emerald-950/25 p-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">
              Released audio standard
            </p>
            <p className="mt-2 text-sm font-bold leading-7 text-emerald-100/90">
              The public catalog uses the verified delivery capsules already placed in public storage. Source audio stays unchanged, and the GPMx Twinkle-at-end proof remains required.
            </p>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <article
              key={step.number}
              className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#120A06] p-6 shadow-xl"
            >
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                Step {step.number}
              </p>
              <h2 className="mt-3 text-2xl font-black text-white">
                {step.title}
              </h2>
              <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
                {step.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-[#FFD54F]/30 bg-gradient-to-r from-[#24130C] to-[#100806] p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            Kindness Kounts
          </p>
          <h2 className="mt-3 text-3xl font-black">
            We Kare. We Share. We Dare.
          </h2>
          <p className="mt-4 max-w-4xl text-sm font-bold leading-7 text-[#D7CCC8]">
            K-KUT exists to help people recognize one another with something real. Choose carefully, listen fully, and send the music moment that feels true.
          </p>
        </section>

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Need help with an order or delivery? Contact reachus@gputnammusic.com.
        </footer>
      </section>
    </main>
  );
}
