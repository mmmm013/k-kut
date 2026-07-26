import Link from "next/link";
import CuteHugCarousel from "@/components/CuteHugCarousel";

export const metadata = {
  title: "Send a Musical HUG | Sent-i-Meants and K-KUT",
  description:
    "Choose from 2,611 verified finished musical HUGs, listen first, and send a private link by DM or email.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-5 sm:px-8 sm:py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#8D6E63]/35 bg-[#120A06] px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
              Sent-i-Meants · K-KUT · G Putnam Music
            </p>
            <p className="mt-1 text-sm font-bold text-[#D7CCC8]">
              Music that helps you say what matters.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/find" className="rounded-xl bg-[#FFD54F] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#160A05]">
              Start a HUG
            </Link>
            <Link href="/browse" className="rounded-xl border border-[#FFD54F]/70 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#FFD54F]">
              Browse HUGs
            </Link>
          </div>
        </header>

        <CuteHugCarousel />

        <section className="grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-[1.75rem] border border-[#FFD54F]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-6 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD54F]">
              Live now · 2,611 verified choices
            </p>
            <h1 className="mt-3 text-4xl font-black sm:text-5xl">Full musical HUG · $7.99</h1>
            <p className="mt-4 max-w-3xl text-base font-bold leading-8 text-[#EFEBE9]">
              Listen to the exact finished audio before purchase. Choose one HUG, add an optional note of up to 13 words, and receive a privately reviewed delivery link to share by DM or email.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/find" className="rounded-2xl bg-[#FFD54F] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#160A05] transition hover:bg-white">
                Start a HUG now
              </Link>
              <Link href="/browse" className="rounded-2xl border border-[#FFD54F]/70 px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#FFD54F] transition hover:bg-[#FFD54F] hover:text-[#160A05]">
                Browse all 2,611
              </Link>
            </div>
          </article>

          <aside className="rounded-[1.75rem] border border-[#8D6E63]/45 bg-[#120A06] p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD54F]">Simple and private</p>
            <ol className="mt-4 space-y-4 text-sm font-bold leading-7 text-[#D7CCC8]">
              <li><strong className="text-white">1. Listen.</strong> Hear the exact finished HUG.</li>
              <li><strong className="text-white">2. Choose.</strong> Pick the one that fits the feeling.</li>
              <li><strong className="text-white">3. Send.</strong> Share the reviewed private link your way.</li>
            </ol>
          </aside>
        </section>

        <footer className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Need help with a purchase or delivery? Contact reachus@gputnammusic.com.
        </footer>
      </div>
    </main>
  );
}
