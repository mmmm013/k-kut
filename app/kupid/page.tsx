export const metadata = {
  title: "K-UPID HUGs | G Putnam Music",
  description:
    "Send a bold romantic K-UPID HUG with real GPM music, chosen by feeling.",
};

const KUPID_READY_HUGS = [
  {
    level: "Desire / Passion / Physical Spark",
    title: "Your Heart Poundin'",
    description:
      "Bold, intimate, charged, and routed for K-UPID-style romantic energy.",
    audioUrl:
      "/ii-delivery/romance/your-heart-poundin-1f016b4a-f85d-4945-b881-2e0f571e6a49-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",
  },
];

export default function KupidPage() {
  return (
    <main className="min-h-screen bg-[#09050d] text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#2b1430] via-[#140819] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.48em] text-[#FFD54F]">
            G Putnam Music
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            K-UPID HUGs
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            Send desire, passion, and physical spark as a real GPM music HUG.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            K-UPID is the romantic K-KUT path for bold, intimate, adult-feeling
            music moments. Pick the feeling. Press play. Send the HUG.
          </p>
        </header>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            K-UPID Matching
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white/80">
              Desire / Passion
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white/80">
              Physical Spark
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white/80">
              Private Intimate
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-white/55">
            K-UPID starts with pre-made K-KUTs first. Customer delivery audio
            includes padding and the GPM signature end sound.
          </p>
        </section>

        <section>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Ready Now
          </p>

          <div className="grid gap-5 md:grid-cols-1">
            {KUPID_READY_HUGS.map((hug) => (
              <article
                key={hug.level}
                className="rounded-[1.75rem] border border-pink-200/15 bg-[#0d0711] p-5 shadow-xl"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                  {hug.level}
                </p>

                <h2 className="mt-3 text-2xl font-black">{hug.title}</h2>

                <p className="mt-3 text-sm leading-6 text-white/68">
                  {hug.description}
                </p>

                <audio
                  className="mt-5 w-full"
                  controls
                  preload="metadata"
                  src={hug.audioUrl}
                />

                <a
                  className="mt-5 block rounded-2xl bg-pink-200 px-5 py-3 text-center font-black text-[#160915] transition hover:bg-white"
                  href={hug.checkoutUrl}
                >
                  Send this K-UPID HUG
                </a>
              </article>
            ))}
          </div>
        </section>

        <footer className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/62">
          <strong className="text-white">GPM HUG delivery:</strong> private
          link, real music, no AI voice, no download required.
        </footer>
      </section>
    </main>
  );
}
