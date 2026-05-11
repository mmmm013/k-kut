import Link from "next/link";
import { notFound } from "next/navigation";
import { holidays, type HolidaySlug } from "@/lib/holidaySeeds";


export function generateStaticParams() {
  return Object.keys(holidays).map((slug) => ({ slug }));
}

export default function HolidayCategoryPage({ params }: { params: { slug: string } }) {
  const holiday = holidays[params.slug as HolidaySlug];

  if (!holiday) {
    notFound();
  }

  const isLiveMothersDay = params.slug === "mothers-day";

  return (
    <main className="min-h-screen bg-[#120b12] text-[#fff6e8]">
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#22101f] p-6 shadow-2xl sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
            K-KUT Holiday HUG
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            {holiday.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            {holiday.line}
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Current step
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-50">
              {holiday.question}
            </h2>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Feeling paths
              </p>
              <h2 className="mt-2 text-3xl font-black">Choose the closest intent.</h2>
            </div>
            <Link
              href="/holiday"
              className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
            >
              All Holiday HUGs
            </Link>
          </div>

          {"candidatePix" in holiday ? (
            <div className="mt-5 rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                Candidate PIX pool
              </p>
              <ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-amber-50/80">
                {holiday.candidatePix.map((pix) => (
                  <li key={pix}>• {pix}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {holiday.paths.map((path) => (
              <div
                key={path}
                className="rounded-[1.25rem] border border-amber-300/20 bg-[#23111d] p-5 shadow-lg"
              >
                <p className="text-xl font-black text-amber-50">{path}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-amber-50/70">
                  A focused K-KUT HUG path for this holiday intent.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-amber-300/20 bg-black/25 p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Next
          </p>

          {isLiveMothersDay ? (
            <>
              <h2 className="mt-2 text-2xl font-black">
                Mother’s Day HUG is live now.
              </h2>
              <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
                Open the live Mother’s Day path to listen, choose the feeling, and send the HUG.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/hug/mothers-day"
                  className="rounded-2xl bg-amber-300 px-6 py-4 text-center text-lg font-black text-[#2a180d] transition hover:bg-amber-200"
                >
                  Open Mother’s Day HUG
                </Link>
                <Link
                  href="/find"
                  className="rounded-2xl border border-amber-200/25 px-6 py-4 text-center text-lg font-black text-amber-100 transition hover:bg-white/10"
                >
                  Find the Right Words
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-black">
                Featured holiday HUG samples will go here.
              </h2>
              <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
                This page is ready for curated holiday PIX and K-KUT inventory.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/find"
                  className="rounded-2xl bg-amber-300 px-6 py-4 text-center text-lg font-black text-[#2a180d] transition hover:bg-amber-200"
                >
                  Find the Right Words
                </Link>
                <Link
                  href="/"
                  className="rounded-2xl border border-amber-200/25 px-6 py-4 text-center text-lg font-black text-amber-100 transition hover:bg-white/10"
                >
                  Back home
                </Link>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
