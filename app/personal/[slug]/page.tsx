import Link from "next/link";
import { notFound } from "next/navigation";
import { personalCategories, type PersonalSlug } from "@/lib/personalSeeds";


export function generateStaticParams() {
  return Object.keys(personalCategories).map((slug) => ({ slug }));
}

export default function PersonalCategoryPage({ params }: { params: { slug: string } }) {
  const category = personalCategories[params.slug as PersonalSlug];

  if (!category) {
    notFound();
  }

  const isThankYou = params.slug === "thank-you";
  const featuredPackage = "featuredPackage" in category ? category.featuredPackage : null;
  const candidatePix = "candidatePix" in category ? category.candidatePix : null;

  return (
    <main className="min-h-screen bg-[#150b07] text-[#fff6e8]">
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#2a160c] p-6 shadow-2xl sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
            K-KUT Personal HUG
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            {category.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            {category.line}
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Current step
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-50">
              {category.question}
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
              href="/personal"
              className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
            >
              All Personal HUGs
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {category.paths.map((path) => (
              <div
                key={path}
                className="rounded-[1.25rem] border border-amber-300/20 bg-[#251209] p-5 shadow-lg"
              >
                <p className="text-xl font-black text-amber-50">{path}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-amber-50/70">
                  A focused K-KUT HUG path for this emotional intent.
                </p>
              </div>
            ))}
          </div>
        </section>

        {featuredPackage ? (
          <section className="mt-8 rounded-[1.5rem] border border-amber-300/30 bg-[#301407] p-5 shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Featured package
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-50">
              {featuredPackage.name}
            </h2>
            <p className="mt-3 text-lg font-black text-amber-200">
              Featured PIX: {featuredPackage.feature}
            </p>
            <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
              {featuredPackage.line}
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.25rem] border border-amber-300/20 bg-black/25 p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                  Includes
                </p>
                <ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-amber-50/80">
                  {featuredPackage.includes.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.25rem] border border-amber-300/20 bg-black/25 p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                  Package doctrine
                </p>
                <ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-amber-50/80">
                  {featuredPackage.notes.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {candidatePix ? (
          <section className="mt-8 rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
              Candidate inventory
            </p>
            <h2 className="mt-2 text-2xl font-black text-amber-50">
              KUT-first source pool
            </h2>
            <ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-amber-50/80">
              {candidatePix.map((pix) => (
                <li key={pix}>• {pix}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-bold leading-6 text-amber-50/60">
              Final KUT, mK, and LLF matches still require listening review before promotion.
            </p>
          </section>
        ) : null}

        <section className="mt-8 rounded-[1.5rem] border border-amber-300/20 bg-black/25 p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Next
          </p>

          {isThankYou ? (
            <>
              <h2 className="mt-2 text-2xl font-black">
                Thank You HUG is live now for Mother’s Day.
              </h2>
              <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
                Start with gratitude, then open the live Mother’s Day HUG path to listen, choose, and send.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/hug/mothers-day"
                  className="rounded-2xl bg-amber-300 px-6 py-4 text-center text-lg font-black text-[#2a180d] transition hover:bg-amber-200"
                >
                  Open live Thank You HUG
                </Link>
                <Link
                  href="/holiday/mothers-day"
                  className="rounded-2xl border border-amber-200/25 px-6 py-4 text-center text-lg font-black text-amber-100 transition hover:bg-white/10"
                >
                  See Mother’s Day feeling paths
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-black">Featured HUG samples will go here.</h2>
              <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
                This page is ready for curated PIX and K-KUT inventory.
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
