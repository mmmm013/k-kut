export const metadata = {
  title: "Birthday K-KUT HUG Review | G Putnam Music",
  description:
    "Birthday HUG review is active while GPM verifies governed Best Birthday delivery audio.",
};

const BIRTHDAY_HUGS = [
  {
    label: "Milestone Birthday",
    title: "Reflective birthday feeling",
    description:
      "Tender, reflective, and meaningful for a bigger life moment.",
    bestFor: "30th, 40th, 50th, 60th, and big-year birthdays.",
    status: "Human listen review pending",
  },
  {
    label: "Birthday Party Lift",
    title: "Lively birthday feeling",
    description:
      "Energetic, playful, and bold for a livelier birthday message.",
    bestFor: "Celebration energy, playful romance, fun message.",
    status: "Human listen review pending",
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
            Birthday K-KUT HUG Review
          </h1>

          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            Send a birthday feeling, not just another message.
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            Birthday HUGs are under review while GPM verifies the governed Best Birthday delivery audio with padding and signature end sound.
            No Birthday HUG checkout is shown until the exact governed delivery audio passes human listen approval.
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
            Under review
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
                    Review hold
                  </p>
                </div>

                <h2 className="mt-3 text-2xl font-black">{hug.title}</h2>

                <p className="mt-3 text-sm leading-6 text-white/68">
                  {hug.description}
                </p>

                <p className="mt-3 text-xs font-bold leading-5 text-white/45">
                  Best for: {hug.bestFor}
                </p>

                <p className="mt-5 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-white/60">
                  Audio preview is held until the exact Birthday HUG delivery passes human listen approval.
                </p>

                <a
                  className="mt-5 block rounded-2xl bg-pink-200 px-5 py-3 text-center font-black text-[#160915] transition hover:bg-white"
                  href="/hugz/big-win"
                >
                  Help me choose a birthday feeling
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
