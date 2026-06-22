export const metadata = {
  title: "Wedding K-KUT HUGs | G Putnam Music",
  description:
    "Wedding K-KUT HUGs are under lyric-structure review before public checkout.",
};

export default function WeddingPage() {
  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#2b1430] via-[#140819] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.48em] text-[#FFD54F]">
            G Putnam Music
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Wedding K-KUT HUGs
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            Wedding HUGs are under lyric-structure review.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            The wedding lane is being held until the music sections match the
            verified lyric and song structure. No wedding checkout is shown for
            this lane until audio proof passes.
          </p>
        </header>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70">
          <p className="font-bold text-white">
            Structure review hold.
          </p>
          <p className="mt-3">
            GPM will not sell or label a wedding HUG from a generated short
            clip when the musical section has not been verified.
          </p>
          <a className="mt-6 inline-flex font-black text-[#FFD54F]" href="/personal">
            Back to Personal HUGs
          </a>
        </section>
      </section>
    </main>
  );
}
