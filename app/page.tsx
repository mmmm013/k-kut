import Link from "next/link";

export const metadata = {
  title: "K-KUT | Real Music HUGs from G Putnam Music",
  description:
    "Listen first, choose one exact sK or KK, add an optional note, and send it as a privately delivered HUG.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 sm:py-12">
        <header className="rounded-[2.25rem] border border-[#8D6E63]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-6 shadow-2xl md:p-10 lg:p-14">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music · K-KUT
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.96] tracking-tight md:text-7xl">
            Send the sentimeant with real music.
          </h1>

          <p className="mt-6 max-w-3xl text-lg font-bold leading-8 text-[#EFEBE9] md:text-xl">
            Listen first. Choose one exact finished K-KUT. Add up to 13 words, then send it as a privately delivered HUG.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <article className="rounded-[1.75rem] border border-[#FFD54F]/35 bg-black/25 p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD54F]">
                sK HUG
              </p>
              <p className="mt-3 text-4xl font-black">$4.99</p>
              <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
                One exact finished sK, heard before purchase.
              </p>
            </article>

            <article className="rounded-[1.75rem] border border-[#FFD54F]/35 bg-black/25 p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD54F]">
                KK HUG
              </p>
              <p className="mt-3 text-4xl font-black">$7.99</p>
              <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
                One exact finished KK, heard before purchase.
              </p>
            </article>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/browse"
              className="rounded-2xl bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#160A05] transition hover:bg-white"
            >
              Browse all HUGs
            </Link>

            <Link
              href="/find"
              className="rounded-2xl border border-[#FFD54F]/65 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#FFD54F] transition hover:bg-[#FFD54F] hover:text-[#160A05]"
            >
              Ask MC-BOT
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-[#120A06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
              Listen first
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              The customer hears the exact finished audio before choosing.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-[#120A06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
              Private delivery
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              Every paid HUG is manually reviewed before private delivery.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-[#120A06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
              Optional note
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              Add up to 13 written words without changing the locked audio.
            </p>
          </article>
        </section>

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Need help with a purchase or delivery? Contact reachus@gputnammusic.com.
        </footer>
      </section>
    </main>
  );
}
