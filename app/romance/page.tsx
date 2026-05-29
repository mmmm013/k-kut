export const metadata = {
  title: "K-KUT Romance HUGs | G Putnam Music",
  description:
    "Send a real GPM music moment by feeling. Romance HUGs with customer-ready delivery audio.",
};

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
    description:
      "Tender, complicated, and still caring. For a softer repair moment.",
    audioUrl:
      "/ii-delivery/romance/dont-call-it-love-6e959ac6-9546-4bae-87b2-ed6584185682-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/28EfZg6gme6S8hS1l44ow0r",
  },
];

export default function RomancePage() {
  return (
    <main className="min-h-screen bg-[#100b14] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <div className="rounded-[2rem] border border-pink-200/20 bg-gradient-to-br from-[#271327] via-[#160b1b] to-[#08060a] p-6 shadow-2xl md:p-9">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-[#FFD54F]">
                G Putnam Music
              </p>

              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
                K-KUT Romance HUGs
              </h1>

              <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-pink-100">
                Real music. Chosen by feeling. Sent as a GPM HUG.
              </p>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/65">
                Pick the feeling. Press play. Send a private music moment.
                These previews are customer-ready delivery audio with front
                padding, back padding, and the GPM signature end sound already
                included.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-sm text-white/70">
              <p className="font-bold text-white">K-KUT by GPM</p>
              <p className="mt-1">Music-aware HUG delivery.</p>
              <p className="mt-1">No download required.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {ROMANCE_HUGS.map((hug) => (
            <article
              key={hug.feeling}
              className="rounded-[1.75rem] border border-pink-200/15 bg-[#0b070f] p-5 shadow-xl"
            >
              <p className="text-xs font-black uppercase tracking-[0.26em] text-[#FFD54F]">
                {hug.feeling}
              </p>

              <h2 className="mt-3 text-2xl font-black">{hug.title}</h2>

              <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/68">
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

        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/62">
          <strong className="text-white">GPM HUG delivery:</strong> private
          link, real music, no AI voice, no download required. Just press play
          and send the feeling.
        </div>
      </section>
    </main>
  );
}
