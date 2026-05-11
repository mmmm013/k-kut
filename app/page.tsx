import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#120b08] px-5 py-8 text-amber-50">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-amber-300/40 bg-gradient-to-br from-[#24100b] via-[#160c0a] to-black shadow-2xl shadow-amber-900/30">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <p className="tracking-[0.45em] text-amber-300">K-KUT HUG</p>

              <h1 className="mt-7 max-w-2xl text-5xl font-black leading-[0.95] text-cyan-100 sm:text-6xl lg:text-7xl">
                Send feeling through music.
              </h1>

              <p className="mt-6 max-w-xl text-xl font-bold text-amber-50/85">
                A historic audio greeting card.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-amber-300/60 text-xl">
                    ♡
                  </span>
                  <p className="text-xl font-black">Choose the feeling.</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-amber-300/60 text-xl">
                    ⌕
                  </span>
                  <p className="text-xl font-black">Find the fit.</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-amber-300/60 text-xl">
                    ✈
                  </span>
                  <p className="text-xl font-black">Send the moment.</p>
                </div>
              </div>

              <Link
                href="/find"
                className="mt-9 inline-flex items-center gap-4 rounded-full bg-amber-300 px-8 py-4 text-2xl font-black text-[#2a180d] shadow-lg shadow-amber-500/20 transition hover:bg-amber-200"
              >
                Find the right words <span aria-hidden="true">→</span>
              </Link>

              <div className="mt-9 border-t border-amber-300/25 pt-5 text-sm font-bold text-amber-50/75 sm:flex sm:items-center sm:justify-between">
                <span>Send by text, DM, social link, or email.</span>
                <span className="mt-3 block tracking-[0.35em] text-amber-300 sm:mt-0">
                  k-kut.com
                </span>
              </div>
            </div>

            <div className="relative min-h-[360px] overflow-hidden border-t border-amber-300/20 bg-black/30 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,rgba(251,191,36,0.28),transparent_34%),radial-gradient(circle_at_70%_60%,rgba(34,211,238,0.16),transparent_28%)]" />

              <div className="absolute inset-x-8 top-16 rounded-full border border-amber-300/30" />
              <div className="absolute inset-x-16 top-28 rounded-full border border-amber-300/20" />

              <div className="relative z-10 flex h-full min-h-[360px] items-center justify-center p-8">
                <div className="relative h-60 w-72">
                  <div className="absolute inset-0 rounded-[45%] border-4 border-amber-300/70 shadow-[0_0_60px_rgba(251,191,36,0.45)]" />
                  <div className="absolute left-8 top-16 h-28 w-28 rotate-45 rounded-3xl bg-amber-400/80 blur-sm" />
                  <div className="absolute right-8 top-16 h-28 w-28 rotate-45 rounded-3xl bg-amber-400/80 blur-sm" />
                  <div className="absolute inset-x-0 top-24 text-center text-6xl font-black text-[#2a180d]">
                    ♫
                  </div>
                  <div className="absolute -bottom-6 left-1/2 h-24 w-[26rem] -translate-x-1/2 rounded-full border-t border-amber-300/60" />
                  <div className="absolute -bottom-10 left-1/2 h-24 w-[30rem] -translate-x-1/2 rounded-full border-t border-amber-300/40" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-300/25 px-7 py-6 sm:px-10">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Choose your path
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <a
                href="/personal"
                className="rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5 transition hover:border-amber-300/60 hover:bg-white/10"
              >
                <p className="text-2xl font-black text-amber-50">Personal</p>
                <p className="mt-2 text-sm font-bold leading-6 text-amber-50/75">
                  Year-round HUGs for love, thanks, birthdays, apology, comfort,
                  friendship, family, encouragement, and real human moments.
                </p>
                <p className="mt-4 text-sm font-black text-amber-200">
                  Open Personal →
                </p>
              </a>

              <a
                href="/holiday"
                className="rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5 transition hover:border-amber-300/60 hover:bg-white/10"
              >
                <p className="text-2xl font-black text-amber-50">Holiday</p>
                <p className="mt-2 text-sm font-bold leading-6 text-amber-50/75">
                  Seasonal HUGs for Mother’s Day, Father’s Day, Valentine’s Day,
                  Thanksgiving, Christmas, New Year’s, and more.
                </p>
                <p className="mt-4 text-sm font-black text-amber-200">
                  Open Holiday →
                </p>
              </a>
            </div>
          </div>

          <div className="border-t border-amber-300/25 px-7 py-5 sm:px-10">
            <h2 className="text-2xl font-black">K-KUT HUGs &amp; TUGs</h2>
            <p className="mt-2 max-w-3xl text-sm font-bold text-amber-50/75">
              HUGs are for warmth, gratitude, love, and support. TUGs are for
              the feelings that pull harder — apology, longing, repair, grief,
              and hard feelings.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
