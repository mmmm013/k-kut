export const metadata = {
  title: "Wedding K-KUT HUGs | G Putnam Music",
  description:
    "Send a wedding-ready GPM music HUG with real customer delivery audio.",
};

const WEDDING_PACKAGES = [
  {
    label: "Wedding / Vow-Level",
    title: "A Love Like That",
    description:
      "Warm, committed, ceremony-safe, and ready for a wedding or vow-level HUG.",
    audioUrl:
      "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/4gM6oG5cifaW41C7Js4ow0t",
  },
  {
    label: "Wedding Track Pack",
    title: "A Love Like That",
    description:
      "A stronger wedding package path for couples who want a larger GPM HUG moment.",
    audioUrl:
      "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/bJeaEW8ou2oa0PqfbU4ow0u",
  },
  {
    label: "Wedding Plus",
    title: "A Love Like That",
    description:
      "A premium wedding HUG path for a more complete ceremonial music gift.",
    audioUrl:
      "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/dRm6oG34agf0dCcaVE4ow0v",
  },
];

export default function WeddingPage() {
  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#2b1430] via-[#140819] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.48em] text-[#FFD54F]">
            G Putnam Music
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Wedding K-KUT HUGs
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            Send a real music moment for the wedding, vow, or first-dance feeling.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            Wedding HUGs start from pre-made K-KUTs first. Pick the path,
            press play, and send the feeling.
          </p>
        </header>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Wedding Matching
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white/80">
              Wedding / Vow-Level
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white/80">
              First Dance
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white/80">
              Forever / Ceremony
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-white/55">
            Customer delivery audio includes front padding, back padding, and
            the GPM signature end sound.
          </p>
        </section>

        <section>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Ready Now
          </p>

          <div className="grid gap-5 md:grid-cols-3">
            {WEDDING_PACKAGES.map((pkg) => (
              <article
                key={pkg.label}
                className="rounded-[1.75rem] border border-pink-200/15 bg-[#0d0711] p-5 shadow-xl"
              >
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                  {pkg.label}
                </p>

                <h2 className="mt-3 text-2xl font-black">{pkg.title}</h2>

                <p className="mt-3 min-h-[78px] text-sm leading-6 text-white/68">
                  {pkg.description}
                </p>

                <audio
                  className="mt-5 w-full"
                  controls
                  preload="metadata"
                  src={pkg.audioUrl}
                />

                <a
                  className="mt-5 block rounded-2xl bg-pink-200 px-5 py-3 text-center font-black text-[#160915] transition hover:bg-white"
                  href={pkg.checkoutUrl}
                >
                  Send this Wedding HUG
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
