import Link from "next/link";

export const kKutMetadata = {
  title: "K-KUT | Music Safety Hold",
  description:
    "K-KUT public playback and purchase are temporarily disabled while every II is revalidated for authorized music and LT-PIX SSOT proof.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-12 sm:px-8">
        <header className="rounded-[2.25rem] border border-[#FFD54F]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-7 shadow-2xl md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music · K-KUT
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            Music safety hold
          </h1>

          <p className="mt-6 max-w-3xl text-lg font-bold leading-8 text-[#EFEBE9]">
            Public playback and purchase are disabled while every II is revalidated. No II may return unless it has an LT-PIX SSOT parent, explicit authorized-music proof, and zero MC-BOT or no-music contamination.
          </p>

          <div className="mt-8 rounded-[1.5rem] border border-red-400/40 bg-red-950/30 p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-red-200">
              Stop-the-line control active
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-red-100">
              Play, browse, checkout, and delivery selection remain closed until the strict music gate passes per II.
            </p>
          </div>

          <Link
            href="/browse"
            className="mt-7 inline-block rounded-2xl border border-[#FFD54F]/70 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#FFD54F]"
          >
            View hold status
          </Link>
        </header>

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Need help? Contact reachus@gputnammusic.com.
        </footer>
      </section>
    </main>
  );
}
