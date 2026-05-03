const PAYMENT_LINKS = {
  hug: "https://buy.stripe.com/28EfZgdIO7Iuaq03tc4ow0m",
};

const KK_SAMPLES = [
  {
    title: "Thank You — KK Opening",
    subtitle: "Mother’s Day KK song-section sample",
    audioUrl: "/mothers-day/samples/thank-you-kk-opening.mp3",
  },
  {
    title: "Thank You — KK Chorus",
    subtitle: "Mother’s Day KK song-section sample",
    audioUrl: "/mothers-day/samples/thank-you-chorus-sample.mp3",
  },
  {
    title: "Thank You — KK Outro",
    subtitle: "Mother’s Day KK song-section sample",
    audioUrl: "/mothers-day/samples/thank-you-outro-sample.mp3",
  },
];

const CONTEXT_LINKS = [
  {
    label: "Interview context: Thank You source story",
    href: "/mothers-day/thank-you-source.mp3",
  },
];

const INVENTIONS = [
  {
    name: "K-KUT",
    status: "Live foundation",
    description:
      "Song-section ownership, delivery, and emotional-use architecture for real, human-made audio moments.",
  },
  {
    name: "HUG",
    status: "Live public offer",
    description:
      "A sendable audio gift object built for care, memory, celebration, and personal meaning.",
  },
  {
    name: "K-UPID",
    status: "Foundational invention",
    description:
      "Identity architecture for audio objects, traceability, and higher-order music-object systems.",
  },
  {
    name: "4PE",
    status: "Active control framework",
    description:
      "The operating system for intake, preparation, proof, control, delivery, and disciplined scaling.",
  },
  {
    name: "GPEx",
    status: "Strategic platform layer",
    description:
      "The broader invention platform for system buildout, product expansion, and commercialization.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#100703] px-6 py-10 text-[#fff3cf]">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-[#d6a400]/35 bg-[#1a0d07] p-8 shadow-2xl shadow-black/40">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-[#d6a400]">
            K-KUT
          </p>

          <h1 className="max-w-4xl text-5xl font-black leading-tight text-[#ffd36a] md:text-7xl">
            Exact song-section ownership.
          </h1>

          <p className="mt-8 max-w-3xl text-2xl font-bold leading-relaxed text-[#fff3cf]">
            K-KUTs are real, human-made song-section audio gifts. Choose a
            Mother’s Day HUG, press play, and send a meaningful musical moment.
          </p>

          <a
            href={PAYMENT_LINKS.hug}
            className="mt-10 inline-flex rounded-3xl bg-[#e0aa00] px-10 py-6 text-2xl font-black text-black shadow-xl transition hover:scale-[1.01] hover:bg-[#ffd36a]"
          >
            Order Mother’s Day HUG
          </a>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl rounded-[2rem] border border-[#d6a400]/35 bg-[#211108] p-8">
        <h2 className="text-4xl font-black leading-tight text-[#ffd36a] md:text-5xl">
          Hear Mother’s Day KK Samples
        </h2>

        <p className="mt-5 max-w-3xl text-xl font-bold leading-relaxed text-[#c9aa73]">
          Public players are reserved for Mother’s Day KK audio.
        </p>

        <div className="mt-8 grid gap-6">
          {KK_SAMPLES.map((sample) => (
            <article
              key={sample.title}
              className="rounded-[2rem] border border-[#d6a400]/30 bg-[#120905] p-6"
            >
              <h3 className="text-3xl font-black text-[#ffd36a]">
                {sample.title}
              </h3>

              <p className="mt-3 text-lg font-bold text-[#c9aa73]">
                {sample.subtitle}
              </p>

              <div className="mt-6 rounded-2xl border border-[#d6a400]/30 bg-black/20 p-4">
                <audio controls preload="metadata" className="w-full">
                  <source src={sample.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>

              <a
                href={PAYMENT_LINKS.hug}
                className="mt-6 inline-flex rounded-2xl border border-[#e0aa00] px-7 py-4 text-xl font-black text-[#ffd36a] transition hover:bg-[#e0aa00] hover:text-black"
              >
                Order Mother’s Day HUG
              </a>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[#d6a400]/25 bg-[#160d08] p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#d6a400]">
            Optional context links
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {CONTEXT_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-lg font-bold text-[#ffd36a] underline decoration-[#d6a400]/50 underline-offset-4 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl rounded-[2rem] border border-[#d6a400]/40 bg-[#1a0d07] p-8">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-[#d6a400]">
          Inventions
        </p>

        <h2 className="mt-4 max-w-4xl text-5xl font-black leading-tight text-[#ffd36a] md:text-7xl">
          Inventions, not content.
        </h2>

        <p className="mt-6 max-w-4xl text-2xl font-bold leading-relaxed text-[#fff3cf]">
          K-KUT. HUG. K-UPID. 4PE. GPEx. Built, controlled, and advancing as a
          real invention platform — not a hobby page, not a template store, not
          a concept deck.
        </p>

        <p className="mt-6 max-w-3xl text-xl font-bold leading-relaxed text-[#c9aa73]">
          Real systems. Real audio. Real control. Real commercialization path.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {INVENTIONS.map((item) => (
            <article
              key={item.name}
              className="rounded-3xl border border-[#d6a400]/25 bg-[#120905] p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="text-3xl font-black text-[#ffd36a]">
                  {item.name}
                </h3>

                <p className="rounded-full border border-[#d6a400]/30 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#d6a400]">
                  {item.status}
                </p>
              </div>

              <p className="mt-5 text-lg font-bold leading-relaxed text-[#fff3cf]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl rounded-[2rem] border border-[#d6a400]/25 bg-[#160d08] p-8">
        <h2 className="text-3xl font-black text-[#ffd36a]">
          Built under PKK control.
        </h2>

        <p className="mt-5 max-w-4xl text-lg font-bold leading-relaxed text-[#c9aa73]">
          K-KUT public playback is KK-only. HUG checkout is live through Stripe.
          Fulfillment is controlled by G Putnam Music. Audio, checkout, and
          delivery are governed by proof-first process discipline.
        </p>
      </section>
    </main>
  );
}
