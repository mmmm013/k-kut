export const metadata = {
  title: "Birthday K-KUT HUGs | G Putnam Music",
  description:
    "Send a birthday-ready GPM music HUG with real customer delivery audio.",
};

const BIRTHDAY_HUGS = [
  {
    label: "Bright Birthday",
    title: "A Love Like That",
    description:
      "Warm, bright, and easy to send for a birthday HUG that feels caring and personal.",
    bestFor: "Friend, sibling, coworker, general birthday.",
    price: "$7.99",
    audioUrl:
      "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/aFabJ0cEK5Amaq09RA4ow0A",
  },
  {
    label: "Sweet Birthday",
    title: "A Love Like That",
    description:
      "Warm, loving, and close. A simple birthday HUG for someone who matters.",
    bestFor: "Partner, parent, child, close family.",
    price: "$7.99",
    audioUrl:
      "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/aFabJ0cEK5Amaq09RA4ow0A",
  },
  {
    label: "Milestone Birthday",
    title: "Don't Call It Love",
    description:
      "Tender, reflective, and meaningful for a bigger life moment.",
    bestFor: "30th, 40th, 50th, 60th, and big-year birthdays.",
    price: "$12.99",
    audioUrl:
      "/ii-delivery/romance/dont-call-it-love-6e959ac6-9546-4bae-87b2-ed6584185682-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/aFabJ0cEK5Amaq09RA4ow0A",
  },
  {
    label: "Birthday Party Lift",
    title: "Your Heart Poundin'",
    description:
      "Energetic, playful, and bold for a livelier birthday message.",
    bestFor: "Celebration energy, playful romance, fun message.",
    price: "$4.99",
    audioUrl:
      "/ii-delivery/romance/your-heart-poundin-1f016b4a-f85d-4945-b881-2e0f571e6a49-bookend-twinkle.mp3",
    checkoutUrl: "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",
  },
];

export default function BirthdayPage() {
  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#2b1430] via-[#140819] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.48em] text-[#FFD54F]">
            G Putnam Music
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Birthday K-KUT HUGs
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            Send a birthday feeling, not just another message.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            Choose a birthday tone. Press play. Send a private GPM HUG.
            Customer delivery audio includes padding and the GPM signature end sound.
          </p>
        </header>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Birthday Matching
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-4">
            {BIRTHDAY_HUGS.map((hug) => (
              <div
                key={hug.label}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white/80"
              >
                {hug.label}
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Ready Now
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            {BIRTHDAY_HUGS.map((hug) => (
              <article
                key={hug.label}
                className="rounded-[1.75rem] border border-pink-200/15 bg-[#0d0711] p-5 shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
                    {hug.label}
                  </p>
                  <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/80">
                    {hug.price}
                  </p>
                </div>

                <h2 className="mt-3 text-2xl font-black">{hug.title}</h2>

                <p className="mt-3 text-sm leading-6 text-white/68">
                  {hug.description}
                </p>

                <p className="mt-3 text-xs font-bold leading-5 text-white/45">
                  Best for: {hug.bestFor}
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
                  Send this Birthday HUG
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
