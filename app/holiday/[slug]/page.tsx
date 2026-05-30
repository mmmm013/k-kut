const HOLIDAY_II_OPTIONS = [
  {
    label: "Warmth / Care",
    title: "A Love Like That",
    description:
      "A warm holiday HUG for care, connection, family, friendship, and simple support.",
    audioUrl:
      "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/aFadR8eMS5Am55G2p84ow0x",
  },
  {
    label: "Repair / Still Care",
    title: "Don't Call It Love",
    description:
      "A tender holiday HUG for complicated feelings, repair, missing someone, or quiet support.",
    audioUrl:
      "/ii-delivery/romance/dont-call-it-love-6e959ac6-9546-4bae-87b2-ed6584185682-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/aFadR8eMS5Am55G2p84ow0x",
  },
];

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function HolidayUseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = titleFromSlug(slug);

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#102118] via-[#07120d] to-[#030403] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            {title} Holiday HUGs
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-emerald-100">
            Choose a holiday-ready music HUG with customer-safe II delivery
            audio.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            Holiday use-case pages only expose approved delivery audio with
            padding and the GPM signature end sound.
          </p>
        </header>

        <section>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Ready Now
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            {HOLIDAY_II_OPTIONS.map((hug) => (
              <article
                key={hug.label}
                className="rounded-[1.75rem] border border-emerald-200/15 bg-[#07110c] p-5 shadow-xl"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                  {hug.label}
                </p>

                <h2 className="mt-3 text-2xl font-black">{hug.title}</h2>

                <p className="mt-3 min-h-[88px] text-sm leading-6 text-white/68">
                  {hug.description}
                </p>

                <audio
                  className="mt-5 w-full"
                  controls
                  preload="metadata"
                  src={hug.audioUrl}
                />

                <a
                  className="mt-5 block rounded-2xl bg-[#FFD54F] px-5 py-3 text-center font-black text-black transition hover:bg-white"
                  href={hug.checkoutUrl}
                >
                  Send this Holiday HUG
                </a>
              </article>
            ))}
          </div>
        </section>

        <footer className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/62">
          <a className="font-black text-[#FFD54F]" href="/holiday">
            Back to Holiday HUGs
          </a>
        </footer>
      </section>
    </main>
  );
}
