import Link from "next/link";
import KkutHomeProducts from "@/components/KkutHomeProducts";

export const metadata = {
  title: "K-KUT | Real Music Gifts from G Putnam Music",
  description:
    "Hear a real music greeting first, then choose a Short KUT, HUG, or Big HUG for private delivery.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-12">
        <header className="overflow-hidden rounded-[2.25rem] border border-[#8D6E63]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] shadow-2xl">
          <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10 lg:p-14">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
                G Putnam Music · K-KUT
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.96] tracking-tight md:text-7xl">
                Send the sentimeant with real music.
              </h1>
              <p className="mt-6 max-w-3xl text-lg font-bold leading-8 text-[#EFEBE9] md:text-xl">
                Press play first. Choose the size that feels right. We manually review the paid order before private link delivery.
              </p>

              <div className="mt-7 flex flex-wrap gap-3 text-sm font-black">
                <span className="rounded-full border border-[#FFD54F]/35 bg-black/25 px-4 py-2 text-[#FFD54F]">
                  Short KUT · $4.99
                </span>
                <span className="rounded-full border border-[#FFD54F]/35 bg-black/25 px-4 py-2 text-[#FFD54F]">
                  HUG · $7.99
                </span>
                <span className="rounded-full border border-[#FFD54F]/35 bg-black/25 px-4 py-2 text-[#FFD54F]">
                  Big HUG · $12.99
                </span>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-[#FFD54F]/30 bg-black/25 p-6">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#FFD54F]">
                How it works
              </p>
              <ol className="mt-5 space-y-4 text-sm font-bold leading-7 text-[#D7CCC8]">
                <li><strong className="text-white">1. Listen.</strong> Hear the real finished audio before choosing.</li>
                <li><strong className="text-white">2. Choose.</strong> Select one exact Short KUT, HUG, or Big HUG.</li>
                <li><strong className="text-white">3. We review and deliver.</strong> Every paid order is checked before its private link is prepared.</li>
              </ol>
              <Link
                href="/find"
                className="mt-6 block rounded-2xl border border-[#FFD54F]/65 px-5 py-3 text-center text-sm font-black text-[#FFD54F] transition hover:bg-[#FFD54F] hover:text-[#160A05]"
              >
                Need help choosing? Ask MC-BOT
              </Link>
            </aside>
          </div>
        </header>

        <KkutHomeProducts />

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-[#120A06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">Real audio</p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">No AI voice in the finished customer audio. The exact playable item you hear remains the selected item.</p>
          </article>
          <article className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-[#120A06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">Private delivery</p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">Recipients use a private link. No uncontrolled public download and no automatic SMS.</p>
          </article>
          <article className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-[#120A06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">Human review</p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">Payment records the exact selection. G Putnam Music reviews the order before delivery.</p>
          </article>
        </section>

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Need help with a purchase or delivery? Contact reachus@gputnammusic.com.
        </footer>
      </section>
    </main>
  );
}
