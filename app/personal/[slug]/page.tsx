const PERSONAL_II_OPTIONS = [
  {
    label: "Warmth / Care",
    title: "A Love Like That",
    description:
      "A warm, flexible HUG for care, thanks, support, friendship, family, and everyday connection.",
    audioUrl:
      "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/aFabJ0cEK5Amaq09RA4ow0A",
  },
  {
    label: "Repair / Still Care",
    title: "Don't Call It Love",
    description:
      "A softer HUG for apology, repair, grief, comfort, missing someone, or a feeling that is hard to say.",
    audioUrl:
      "/ii-delivery/romance/dont-call-it-love-6e959ac6-9546-4bae-87b2-ed6584185682-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/aFabJ0cEK5Amaq09RA4ow0A",
  },
  {
    label: "Lift / Spark",
    title: "Your Heart Poundin'",
    description:
      "A more energetic HUG for celebration, confidence, romance, excitement, or playful connection.",
    audioUrl:
      "/ii-delivery/romance/your-heart-poundin-1f016b4a-f85d-4945-b881-2e0f571e6a49-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",
  },
];

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function PersonalUseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = titleFromSlug(slug);
  const isSympathy = slug === "sympathy" || slug === "grief" || slug === "memorial" || slug === "celebration-of-life";

  if (isSympathy) {
    return (
      <main className="min-h-screen bg-[#09070b] text-white">
        <section className="mx-auto flex max-w-4xl flex-col gap-8 px-5 py-10">
          <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#241223] via-[#120816] to-[#050307] p-6 shadow-2xl md:p-9">
            <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
              G Putnam Music
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
              {title} K-KUT HUGs
            </h1>

            <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
              Sympathy HUGs require a stricter human review before public selection.
            </p>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
              This category is being held until each music moment is confirmed grief-safe,
              remembrance-safe, and free from romance, spark, celebration, or mixed-intent routing.
            </p>
          </header>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/70">
            <p className="font-bold text-white">
              No generic personal HUG cards are shown here.
            </p>
            <p className="mt-3">
              For sympathy, the music must match the human situation first. Mood, level,
              softness, or care metadata is not enough.
            </p>
            <a className="mt-6 inline-flex font-black text-[#FFD54F]" href="/personal">
              Back to Personal HUGs
            </a>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#241223] via-[#120816] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            {title} K-KUT HUGs
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            Choose a ready music HUG with customer-safe II delivery audio.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            These options use approved delivery audio with padding and the GPM
            signature end sound. No raw source audio is exposed here.
          </p>
        </header>

        <section>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Ready Now
          </p>

          <div className="grid gap-5 md:grid-cols-3">
            {PERSONAL_II_OPTIONS.map((hug) => (
              <article
                key={hug.label}
                className="rounded-[1.75rem] border border-pink-200/15 bg-[#0d0711] p-5 shadow-xl"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                  {hug.label}
                </p>

                <h2 className="mt-3 text-2xl font-black">{hug.title}</h2>

                <p className="mt-3 min-h-[96px] text-sm leading-6 text-white/68">
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
                  Send this Personal HUG
                </a>
              </article>
            ))}
          </div>
        </section>

        <footer className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/62">
          <a className="font-black text-[#FFD54F]" href="/personal">
            Back to Personal HUGs
          </a>
        </footer>
      </section>
    </main>
  );
}
