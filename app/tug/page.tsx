import Link from "next/link";

const TUG_TYPES = [
  {
    title: "Personal TUG",
    href: "/personal",
    kicker: "For one person",
    body: "Missing someone, apology, repair, grief, longing, regret, distance, or the pull to reconnect.",
    cta: "Choose Personal TUG",
  },
] as const;

export default function TugLandingPage() {
  return (
    <main className="min-h-screen bg-[#120a06] px-5 py-6 text-[#f7ead2]">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col rounded-[2rem] border border-amber-300/20 bg-black/30 p-5 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.28em] text-amber-300/80">
          <Link href="/" className="hover:text-amber-200">
            K-KUT
          </Link>
          <span>MC guided TUG flow</span>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-amber-300/25 bg-[#231208] p-5">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
            MC
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-[#fff2cf]">
            What are you feeling right now?
          </h1>
          <p className="mt-4 text-base font-semibold leading-7 text-amber-50/80">
            Some feelings take more than words. I&apos;ll find the right music
            for what you&apos;re carrying. Take your time.
          </p>
        </div>

        <div className="mt-5 rounded-[1.25rem] border border-amber-300/20 bg-black/25 p-4">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">
            Current activity
          </p>
          <p className="mt-2 text-lg font-black text-[#fff2cf]">
            Choose the TUG lane.
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-amber-50/70">
            A TUG pulls them closer. This is for the hard feelings &mdash;
            the ones that need a real music moment, not just a message.
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          {TUG_TYPES.map((path) => (
            <Link
              key={path.href}
              href={path.href}
              className="group rounded-[1.5rem] border border-amber-300/20 bg-[#1b100b] p-5 transition hover:border-amber-300/60 hover:bg-[#2a170c]"
            >
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300/80">
                {path.kicker}
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#fff2cf]">
                {path.title}
              </h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-amber-50/75">
                {path.body}
              </p>
              <p className="mt-5 text-sm font-black text-amber-300 group-hover:text-amber-200">
                {path.cta} &rarr;
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-8">
          <div className="rounded-2xl border border-amber-300/15 bg-black/25 p-4 text-sm font-semibold leading-6 text-amber-50/70">
            MC asks one question at a time. No source titles, artist names,
            company names, audio URLs, or full-source playback are exposed.
          </div>
        </div>
      </section>
    </main>
  );
}
