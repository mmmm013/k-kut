import Link from "next/link";

export const metadata = {
  title: "K-KUT HUGs | G Putnam Music",
  description:
    "Choose one exact verified KK from the governed K-KUT HUG catalog.",
};

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
            The governed source catalog contains 2,611 verified KKs. Each
            $7.99 K-KUT HUG uses one exact finished KK with an optional note of
            up to 13 words.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/browse"
              className="rounded-2xl bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#160A05]"
            >
              Browse all HUGs
            </Link>

            <Link
              href="/find"
              className="rounded-2xl border border-[#FFD54F]/70 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#FFD54F]"
            >
              Ask MC-BOT
            </Link>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          <article className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#120A06] p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
              1 · Listen
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              Hear the exact finished KK audio.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#120A06] p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
              2 · Choose
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              Select one governed K-KUT HUG.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#120A06] p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
              3 · Send
            </p>
            <p className="mt-3 text-sm font-bold leading-7 text-[#D7CCC8]">
              We manually review the paid order before private delivery.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
