import Link from "next/link";

const PATHS = [
  {
    title: "Personal HUG",
    href: "/personal",
    kicker: "Year-round",
    body: "Send a HUG for one person, one feeling, any day.",
    cta: "Choose Personal",
  },
  {
    title: "Holiday HUG",
    href: "/holiday",
    kicker: "Seasonal",
    body: "Choose a holiday or seasonal moment, then pick the feeling.",
    cta: "Choose Holiday",
  },
] as const;

export default function HugLandingPage() {
  return (
    <main className="min-h-screen bg-[#120a06] px-5 py-6 text-[#f7ead2]">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col justify-between rounded-[2rem] border border-amber-300/20 bg-black/30 p-5 shadow-2xl shadow-black/40">
        <div>
          <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.28em] text-amber-300/80">
            <Link href="/" className="hover:text-amber-200">
              K-KUT
            </Link>
            <span>One-step HUG delivery</span>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-amber-300/25 bg-[#231208] p-5">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
              HUG guide
            </p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-[#fff2cf]">
              What kind of HUG are you sending?
            </h1>
            <p className="mt-4 text-base font-semibold leading-7 text-amber-50/80">
              Start with the lane. Personal HUGs are for year-round human moments.
              Holiday HUGs stay in their own seasonal silo.
            </p>
          </div>

          <div className="mt-5 grid gap-4">
            {PATHS.map((path) => (
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
                  {path.cta} →
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-300/15 bg-black/25 p-4 text-sm font-semibold leading-6 text-amber-50/70">
          Generic HUG is the doorway. Audio appears only after the user enters a
          Personal or Holiday path.
        </div>
      </section>
    </main>
  );
}
