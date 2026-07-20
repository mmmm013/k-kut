import Link from "next/link";

export const metadata = {
  title: "K-KUT | Send a Private Music HUG",
  description:
    "Listen first, choose one exact KK HUG, add an optional note, and share the private delivery link by DM or email.",
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
            Send a private music HUG now.
          </h1>

          <p className="mt-6 max-w-3xl text-lg font-bold leading-8 text-[#EFEBE9] md:text-xl">
            Listen to the exact finished audio. Choose one KK HUG. Add up to 13 written words. After private delivery, share the link by DM, email, Copy Link, or your own Messages app.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-[1.25fr_0.75fr]">
            <article className="rounded-[1.75rem] border border-[#FFD54F]/45 bg-black/30 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD54F]">
                Live now · 2,611 choices
              </p>
              <h2 className="mt-3 text-4xl font-black">KK HUG · $7.99</h2>
              <p className="mt-4 max-w-2xl text-sm font-bold leading-7 text-[#D7CCC8]">
                Every displayed KK HUG is playable before purchase and keeps its verified identity and canonical GPMx Twinkle at the end.
              </p>
              <Link
                href="/browse"
                className="mt-6 inline-block rounded-2xl bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#160A05] transition hover:bg-white"
              >
                Browse 2,611 KK HUGs
              </Link>
            </article>

            <aside className="rounded-[1.75rem] border border-[#8D6E63]/45 bg-black/20 p-6">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD54F]">
                Share without A2P
              </p>
              <p className="mt-4 text-sm font-bold leading-7 text-[#D7CCC8]">
                The buyer controls the share. A private link can be placed into Instagram, Messenger, WhatsApp, TikTok, email, or the buyer&apos;s own text app.
              </p>
              <p className="mt-4 text-xs font-bold leading-6 text-[#BCAAA4]">
                K-KUT does not automatically SMS the recipient in this launch lane.
              </p>
            </aside>
          </div>

          <p className="mt-6 text-sm font-bold leading-7 text-[#BCAAA4]">
            sK HUG product law remains $4.99. Its checkout opens when its active Stripe Payment Link is connected; it is not part of today&apos;s payment launch.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-[#120A06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
              1 · Listen
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              Hear the exact finished KK HUG before choosing it.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-[#120A06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
              2 · Purchase
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              Add an optional note of up to 13 words and pay $7.99.
            </p>
          </article>

          <article className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-[#120A06] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
              3 · Send privately
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              Receive the reviewed private link, then share it by DM or email.
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
