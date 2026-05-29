const ROMANCE_HUGS = [
  {
    feeling: "Sweet Love",
    title: "A Love Like That",
    description: "Warm, easy to receive, and made for a simple romantic HUG.",
    audioUrl:
      "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/28EfZg6gme6S8hS1l44ow0r",
  },
  {
    feeling: "Physical Spark",
    title: "Your Heart Poundin'",
    description: "Bold, intimate, and charged. A K-UPID-style romance HUG.",
    audioUrl:
      "/ii-delivery/romance/your-heart-poundin-1f016b4a-f85d-4945-b881-2e0f571e6a49-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",
  },
  {
    feeling: "Repair / Still Love You",
    title: "Don't Call It Love",
    description: "Tender, complicated, and still caring. For a softer repair moment.",
    audioUrl:
      "/ii-delivery/romance/dont-call-it-love-6e959ac6-9546-4bae-87b2-ed6584185682-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/28EfZg6gme6S8hS1l44ow0r",
  },
];

export default function RomancePage() {
  return (
    <main className="min-h-screen bg-[#100b14] text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-pink-200/80">
            K-KUT HUGs
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            Romance HUGs
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
            Pick the feeling. Press play. Send a real music moment.
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
            These previews are customer-ready delivery audio with front padding,
            back padding, and the GPM signature end sound already included.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {ROMANCE_HUGS.map((hug) => (
            <article
              key={hug.feeling}
              className="rounded-3xl border border-white/10 bg-black/30 p-5 shadow-xl"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-200">
                {hug.feeling}
              </p>

              <h2 className="mt-3 text-2xl font-bold">{hug.title}</h2>

              <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/65">
                {hug.description}
              </p>

              <audio
                className="mt-5 w-full"
                controls
                preload="none"
                src={hug.audioUrl}
              />

              <a
                className="mt-5 block rounded-2xl bg-pink-200 px-5 py-3 text-center font-bold text-[#160915] transition hover:bg-white"
                href={hug.checkoutUrl}
              >
                Send this HUG
              </a>
            </article>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/60">
          No download required. No AI voice. No raw source audio. Just press
          play and send the feeling.
        </div>
      </section>
    </main>
  );
}
