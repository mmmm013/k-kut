import Link from "next/link";

export const metadata = {
  title: "K-KUT HUGs | G Putnam Music",
  description:
    "Listen to 2,611 K-KUT music moments, add an optional 13-word note, and send the exact one as a HUG for $7.99.",
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
      "Listen to the finished K-KUT audio. The real sound—not a title or marketing claim—guides your choice.",
  },
  {
    number: "3",
    title: "Add your words and send",
    description:
      "Add an optional personal note of up to 13 words, then send the exact K-KUT as a $7.99 HUG.",
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
            Hear a real music moment. Add your words. Send the sentimeant.
          </p>

          <p className="mt-5 max-w-4xl text-base font-bold leading-8 text-[#D7CCC8]">
            The catalog holds 2,611 playable K-KUTs. Every one can be chosen and sent as a Regular HUG for $7.99, with an optional personal note of up to 13 words.
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

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/25 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">
                Finished music
              </p>
              <p className="mt-2 text-sm font-bold leading-7 text-emerald-100/90">
                The catalog uses the finished, verified K-KUT audio already in public storage. Source audio stays unchanged, and the GPMx Twinkle-at-end proof remains required.
              </p>
            </div>

            <div className="rounded-2xl border border-[#FFD54F]/30 bg-[#24130C] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                Your note and private delivery
              </p>
              <p className="mt-2 text-sm font-bold leading-7 text-[#FFF8E1]/85">
                Your optional note is written before the HUG music; it does not change the audio. Every paid HUG is manually reviewed before private delivery. No automatic SMS and no uncontrolled public download.
              </p>
            </div>
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
