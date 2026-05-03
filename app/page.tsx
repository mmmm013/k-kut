const CHECKOUT_LINKS = {
  hug: "https://buy.stripe.com/28EfZgdIO7Iuaq03tc4ow0m",
};

const KK_SAMPLES = [
  {
    title: "Thank You — KK",
    subtitle: "Mother’s Day song-section sample",
    audioUrl:
      "/mothers-day/samples/thank-you-kk-opening.mp3",
  },
];

const CONTEXT_LINKS = [
  {
    label: "Interview context: Thank You source story",
    href: "/mothers-day/thank-you-source.mp3",
  },
  {
    label: "BB-BOT Story context: Why Thank You matters",
    href: "/mothers-day/thank-you-source.mp3",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-[#D4A017]/35 bg-[#24180F] p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.28em] text-[#D4A017]">
            K-KUT · Mother’s Day HUG
          </p>

          <h1 className="mt-4 text-4xl font-bold leading-tight text-[#FFD36A] md:text-6xl">
            Exact song-section ownership.
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-[#F5E6C8]">
            K-KUTs are real, human-made song-section audio gifts. Choose a
            Mother’s Day HUG, press play, and send a meaningful musical moment.
          </p>

          <a
            href={CHECKOUT_LINKS.hug}
            className="mt-8 inline-block rounded-2xl border border-[#D4A017] bg-[#D4A017] px-6 py-4 text-base font-bold text-[#1A120B]"
          >
            Order Mother’s Day HUG
          </a>
        </div>

        <section className="mt-10 rounded-3xl border border-[#D4A017]/30 bg-[#24180F] p-6">
          <h2 className="text-3xl font-bold text-[#FFD36A]">
            Hear Mother’s Day KK Samples
          </h2>

          <p className="mt-3 max-w-3xl text-[#C8A882]">
            Public players are reserved for Mother’s Day KK audio.
          </p>

          <div className="mt-6 grid gap-5">
            {KK_SAMPLES.map((sample) => (
              <article
                key={sample.title}
                className="rounded-2xl border border-[#D4A017]/25 bg-[#160D08] p-5"
              >
                <h3 className="text-2xl font-bold text-[#FFD36A]">
                  {sample.title}
                </h3>

                <p className="mt-2 text-sm text-[#C8A882]">
                  {sample.subtitle}
                </p>

                <audio
                  controls
                  preload="metadata"
                  className="mt-5 w-full rounded-xl border border-[#D4A017]/25 bg-[#1A120B] p-3"
                >
                  <source src={sample.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>

                <a
                  href={CHECKOUT_LINKS.hug}
                  className="mt-5 inline-block rounded-xl border border-[#D4A017] px-5 py-3 text-sm font-bold text-[#FFD36A]"
                >
                  Order Mother’s Day HUG
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[#D4A017]/20 bg-[#24180F] p-6">
          <h2 className="text-2xl font-bold text-[#FFD36A]">
            Optional context links
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#C8A882]">
            These are links only. They do not replace the KK samples above.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            {CONTEXT_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-xl border border-[#D4A017]/30 px-4 py-3 text-sm font-semibold text-[#FFD36A]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
