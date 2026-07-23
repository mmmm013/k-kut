import Link from "next/link";
import CuteHugCarousel from "@/components/CuteHugCarousel";

export default function SentimeantHome() {
  return (
    <main className="min-h-screen bg-[#fff8ed] text-[#35180f]">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-5 sm:px-7 sm:py-8">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-[#eabf92] bg-white/90 px-5 py-6 shadow-sm sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#d65c2f]">
              Sent-i-Meants · G Putnam Music
            </p>
            <h1 className="mt-2 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">
              A real musical HUG for the moment words cannot carry.
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/find"
              className="rounded-2xl bg-[#ef6c3e] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg transition hover:bg-[#d95427] focus:outline-none focus:ring-4 focus:ring-[#ef6c3e]/35"
            >
              Start a HUG
            </Link>
            <Link
              href="/browse"
              className="rounded-2xl border-2 border-[#ef6c3e] bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#c94d24] transition hover:bg-[#fff0e7] focus:outline-none focus:ring-4 focus:ring-[#ef6c3e]/25"
            >
              Browse HUGs
            </Link>
          </div>
        </header>

        <CuteHugCarousel />

        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2rem] border border-[#eabf92] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d65c2f]">
              The same real HUG catalog
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Listen first. Choose the exact finished music.
            </h2>
            <p className="mt-4 max-w-3xl text-base font-semibold leading-8 text-[#6b493c]">
              The cute stories help you begin with the human moment. Find and Browse use the shared K-KUT catalog, checkout, private review, and delivery system.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/find"
                className="rounded-2xl bg-[#ef6c3e] px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#d95427] focus:outline-none focus:ring-4 focus:ring-[#ef6c3e]/35"
              >
                Find the right HUG
              </Link>
              <Link
                href="/browse"
                className="rounded-2xl border-2 border-[#ef6c3e] px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#c94d24] transition hover:bg-[#fff0e7] focus:outline-none focus:ring-4 focus:ring-[#ef6c3e]/25"
              >
                Hear all available HUGs
              </Link>
            </div>
          </article>

          <aside className="rounded-[2rem] border border-[#eabf92] bg-[#fff0e4] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d65c2f]">
              Three simple steps
            </p>
            <ol className="mt-4 space-y-5 text-sm font-bold leading-7 text-[#6b493c]">
              <li><strong className="text-[#35180f]">1. Choose the moment.</strong> Start with one of the 13 stories or browse freely.</li>
              <li><strong className="text-[#35180f]">2. Hear the music.</strong> Listen to the exact finished HUG before purchase.</li>
              <li><strong className="text-[#35180f]">3. Send privately.</strong> Share the reviewed link by DM or email.</li>
            </ol>
          </aside>
        </section>

        <footer className="rounded-[1.5rem] border border-[#eabf92] bg-white px-5 py-4 text-sm font-semibold text-[#765548]">
          Need help with a purchase or delivery? Contact reachus@gputnammusic.com.
        </footer>
      </div>
    </main>
  );
}
