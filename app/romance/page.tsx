export const metadata = {
  title: "K-KUT Romance Levels | G Putnam Music",
  description:
    "Choose a Romance Level and send a real GPM music moment as a K-KUT HUG.",
};

const ROMANCE_LEVELS = [
  "Gentle Affection",
  "New Love",
  "Committed Love",
  "Longtime Love",
  "Missing You",
  "Repair / Apology",
  "Desire / Passion",
  "Anniversary",
  "Wedding / Vow-Level",
  "Private Intimate",
];

const READY_HUGS = [
  {
    level: "Gentle Affection / Sweet Love",
    title: "A Love Like That",
    description:
      "Warm, easy to receive, and romantic without overwhelming the moment.",
    audioUrl:
      "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/28EfZg6gme6S8hS1l44ow0r",
  },
  {
    level: "Desire / Passion",
    title: "Your Heart Poundin'",
    description:
      "Bold, intimate, charged, and routed for K-UPID-style romantic energy.",
    audioUrl:
      "/ii-delivery/romance/your-heart-poundin-1f016b4a-f85d-4945-b881-2e0f571e6a49-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",
  },
  {
    level: "Repair / Still Love You",
    title: "Don't Call It Love",
    description:
      "Tender, complicated, and still caring. A softer repair-level HUG.",
    audioUrl:
      "/ii-delivery/romance/dont-call-it-love-6e959ac6-9546-4bae-87b2-ed6584185682-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/28EfZg6gme6S8hS1l44ow0r",
  },
];

export default function RomancePage() {
  return (
    <main className="min-h-screen bg-[#0b0610] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#2b1430] via-[#140819] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.48em] text-[#FFD54F]">
            G Putnam Music
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            K-KUT Romance Levels
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            Choose the level. Hear the moment. Send a real GPM HUG.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            Romance is not one bucket. K-KUT routes romantic moments by level:
            gentle, new, committed, longtime, missing, repairing, passionate,
            vow-level, and private. The customer hears a simple choice. The
            system preserves the deeper match.
          </p>
        </header>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Romance Matching Schema
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {ROMANCE_LEVELS.map((level) => (
              <div
                key={level}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white/80"
              >
                {level}
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm leading-6 text-white/55">
            All levels seed from pre-made K-KUTs first. No duplicate delivery
            object. No raw source audio. Customer delivery audio includes
            padding and the GPM signature end sound.
          </p>
        </section>

        <section>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Ready Now
          </p>

          <div className="grid gap-5 md:grid-cols-3">
            {READY_HUGS.map((hug) => (
              <article
                key={hug.level}
                className="rounded-[1.75rem] border border-pink-200/15 bg-[#0d0711] p-5 shadow-xl"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                  {hug.level}
                </p>

                <h2 className="mt-3 text-2xl font-black">{hug.title}</h2>

                <p className="mt-3 min-h-[78px] text-sm leading-6 text-white/68">
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
                  Send this GPM HUG
                </a>
              </article>
            ))}
          </div>
        </section>

        <footer className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/62">
          <strong className="text-white">GPM HUG delivery:</strong> private
          link, real music, no AI voice, no download required. Just press play
          and send the feeling.
        </footer>
      </section>
    </main>
  );
}
