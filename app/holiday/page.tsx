import Link from "next/link";
import { holidayList } from "@/lib/holidaySeeds";

export default function HolidayPage() {
  return (
    <main className="min-h-screen bg-[#120b12] text-[#fff6e8]">
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#22101f] p-6 shadow-2xl sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
            K-KUT Holiday
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Holiday HUGs for every season.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            Holiday K-KUT HUGs help people send focused music moments for national,
            seasonal, family, faith, remembrance, gratitude, and celebration days.
          </p>
        </div>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Holiday collections
              </p>
              <h2 className="mt-2 text-3xl font-black">Choose the holiday moment.</h2>
            </div>
            <Link
              href="/"
              className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
            >
              Back home
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {holidayList.map(({ slug, title, line }) => {
              const isLiveMothersDay = slug === "mothers-day";

              return (
                <div
                  key={slug}
                  className={
                    isLiveMothersDay
                      ? "rounded-[1.5rem] border border-amber-300/60 bg-[#2d1710] p-5 shadow-xl shadow-amber-900/20"
                      : "rounded-[1.5rem] border border-amber-300/20 bg-[#23111d] p-5 shadow-xl"
                  }
                >
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                    {isLiveMothersDay ? "Live Holiday HUG" : "Holiday HUG"}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-amber-50">{title}</h3>
                  <p className="mt-2 text-base font-bold leading-7 text-amber-50/75">
                    {line}
                  </p>

                  <div className="mt-5 flex flex-col gap-3">
                    {isLiveMothersDay ? (
                      <>
                        <Link
                          href="/hug/mothers-day"
                          className="rounded-2xl bg-amber-300 px-5 py-3 text-center text-sm font-black text-[#2a180d] transition hover:bg-amber-200"
                        >
                          Open live Mother’s Day HUG →
                        </Link>
                        <Link
                          href="/holiday/mothers-day"
                          className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
                        >
                          See Mother’s Day feeling paths
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`/holiday/${slug}`}
                        className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
                      >
                        Open {title} →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-amber-300/20 bg-black/25 p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Holiday doctrine
          </p>
          <p className="mt-3 text-xl font-black leading-8">
            The holiday opens the door. The feeling chooses the HUG.
          </p>
        </section>
      </section>
    </main>
  );
}
