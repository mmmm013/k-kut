import Link from "next/link";

import EofSignatureAudio from "@/components/EofSignatureAudio";
const GUIDE_OPTIONS = [
  {
    title: "Send warmth",
    description: "For gratitude, love, care, and the quiet things people remember.",
    href: "/hug/mothers-day",
  },
  {
    title: "Send support",
    description: "For someone who needs to feel seen, heard, or carried.",
    href: "/hug/mothers-day",
  },
  {
    title: "Send repair",
    description: "For apology, longing, distance, and words that are hard to say.",
    href: "/hug/mothers-day",
  },
];

const KK_SAMPLES = [
  {
    title: "Opening feeling",
    subtitle: "A gentle first moment for warmth and gratitude.",
    audioUrl: "/mothers-day/samples/thank-you-kk-opening.mp3",
  },
  {
    title: "Chorus feeling",
    subtitle: "A stronger song-section moment for love and appreciation.",
    audioUrl: "/mothers-day/samples/thank-you-chorus-sample.mp3",
  },
  {
    title: "Final feeling",
    subtitle: "A closing moment for memory, thanks, and lasting love.",
    audioUrl: "/mothers-day/samples/thank-you-outro-sample.mp3",
  },
];

export default function FindPage() {
  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
            MC-BOT Guide
          </p>

          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-7xl">
            Pick the feeling first.
          </h1>

          <p className="mt-6 max-w-3xl text-lg font-bold leading-relaxed text-[#F5E6C8]/85">
            I’ll guide you to the right Mother’s Day K-KUT HUG. Start with the
            feeling, hear real music samples, then choose the private HUG link
            you want to send.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {GUIDE_OPTIONS.map((option) => (
              <Link
                key={option.title}
                href={option.href}
                className="rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5 transition hover:border-[#FFD36A] hover:bg-[#2A180D]"
              >
                <h2 className="text-2xl font-black text-[#FFD36A]">
                  {option.title}
                </h2>
                <p className="mt-3 text-sm font-bold leading-relaxed text-[#F5E6C8]/75">
                  {option.description}
                </p>
                <p className="mt-5 text-sm font-black text-[#FFD36A]">
                  Continue →
                </p>
              </Link>
            ))}
          </div>
        </div>

        <section className="mt-10 rounded-[2rem] border border-[#D4A017]/30 bg-[#24180F] p-7 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
            Listen first
          </p>

          <h2 className="mt-4 text-4xl font-black text-[#FFD36A]">
            Hear Mother’s Day K-KUT moments
          </h2>

          <p className="mt-4 max-w-3xl text-base font-bold leading-relaxed text-[#F5E6C8]/75">
            These are public samples only. The final HUG is sent as a private
            link. No raw downloads.
          </p>

          <div className="mt-7 grid gap-5">
            {KK_SAMPLES.map((sample) => (
              <article
                key={sample.title}
                className="rounded-2xl border border-[#D4A017]/25 bg-[#160D08] p-5"
              >
                <h3 className="text-2xl font-black text-[#FFD36A]">
                  {sample.title}
                </h3>

                <p className="mt-2 text-sm font-bold text-[#C8A882]">
                  {sample.subtitle}
                </p>

                <EofSignatureAudio
                src={sample.audioUrl}
                className="mt-5 w-full rounded-xl border border-[#D4A017]/25 bg-[#1A120B] p-3"
              />

                <Link
                  href="/hug/mothers-day"
                  className="mt-5 inline-block rounded-xl border border-[#D4A017] px-5 py-3 text-sm font-black text-[#FFD36A] transition hover:bg-[#D4A017]/10"
                >
                  Choose a Mother’s Day HUG →
                </Link>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
