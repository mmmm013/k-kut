import Link from "next/link";

export const metadata = {
  title: "Sent-i-Meant | Semantic Match Hold",
  description:
    "Sent-i-Meant previews are temporarily unavailable while each theme is rebuilt from dressed LT-PIX and KK meaning, mood, feeling, and sentiment authority.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-8">
        <header className="rounded-[2rem] border border-[#FFD54F]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-7 shadow-2xl md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            Sent-i-Meant · K-KUT · G Putnam Music
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Semantic match hold
          </h1>

          <p className="mt-6 max-w-3xl text-lg font-bold leading-8 text-[#EFEBE9]">
            The 13 Sent-i-Meant stories are temporarily closed. Music presence alone is not enough. Every KK must match its story through dressed LT-PIX and KK evidence for meaning, mood, feeling, sentiment, relationship, occasion, and actual audio presentation.
          </p>

          <div id="release-status" className="mt-8 rounded-[1.5rem] border border-red-400/40 bg-red-950/30 p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-red-200">
              Public story audio: 0 · Checkout: blocked
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-red-100">
              The prior 13 temporary KK files are preserved as incident evidence but blocked from public playback. Reopening requires one individually reviewed semantic match for each of the 13 themes.
            </p>
          </div>

          <Link
            href="#release-status"
            className="mt-7 inline-block rounded-2xl border border-[#FFD54F]/70 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#FFD54F]"
          >
            View release status
          </Link>
        </header>

        <section className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-black/20 p-6 text-sm font-bold leading-7 text-[#BCAAA4]">
          Rebuild order: dressed LT-PIX SSOT identity → dressed KK lyric and structure → meaning/mood/feeling/sentiment match → actual audio-presentation review → GD approval → customer release.
        </section>

        <footer className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Need help? Contact reachus@gputnammusic.com.
        </footer>
      </div>
    </main>
  );
}
