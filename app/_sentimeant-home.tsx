import Link from "next/link";

export const metadata = {
  title: "Sent-i-Meants | Music Safety Hold",
  description:
    "Sent-i-Meants public playback and purchase are temporarily disabled while every II is revalidated for authorized music and LT-PIX SSOT proof.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-8">
        <header className="rounded-[2rem] border border-[#FFD54F]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-7 shadow-2xl md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            Sent-i-Meants · K-KUT · G Putnam Music
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
            Music safety hold
          </h1>

          <p className="mt-6 max-w-3xl text-lg font-bold leading-8 text-[#EFEBE9]">
            The 13 Sent-i-Meants paths are temporarily closed. Every customer-facing II must contain real authorized music and have an LT-PIX SSOT parent. MC-BOT voice scripts and all no-music audio are isolated from customer use.
          </p>

          <div className="mt-8 rounded-[1.5rem] border border-red-400/40 bg-red-950/30 p-6">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-red-200">
              Zero public audio · zero checkout
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-red-100">
              Service will reopen only after per-II strict-music, LT-PIX SSOT, rights, identity, and customer-audio proof pass.
            </p>
          </div>

          <Link
            href="/browse"
            className="mt-7 inline-block rounded-2xl border border-[#FFD54F]/70 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#FFD54F]"
          >
            View hold status
          </Link>
        </header>

        <footer className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Need help? Contact reachus@gputnammusic.com.
        </footer>
      </div>
    </main>
  );
}
