import Link from "next/link";

const MOMENTS = [
  {
    label: "Warmth",
    line: "For gratitude, love, care, and the quiet things people remember.",
  },
  {
    label: "Support",
    line: "For someone who needs to feel seen, heard, or carried.",
  },
  {
    label: "Repair",
    line: "For apology, longing, distance, and words that are hard to say.",
  },
  {
    label: "Memory",
    line: "For remembrance, legacy, family, and love that remains.",
  },
];

export default function SomPage() {
  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] border border-amber-300/30 bg-[#24180F] shadow-2xl shadow-black/40">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <p className="text-sm font-black uppercase tracking-[0.32em] text-amber-300">
                Sound of Moment
              </p>

              <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-7xl">
                Find the feeling. Hear the moment. Send it privately.
              </h1>

              <p className="mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-amber-50/80">
                SOM turns real music moments into private K-KUT HUGs and TUGs:
                short, meaningful sound sections chosen for what someone needs
                to feel right now.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {MOMENTS.map((moment) => (
                  <div
                    key={moment.label}
                    className="rounded-2xl border border-amber-300/20 bg-black/20 p-4"
                  >
                    <h2 className="text-xl font-black text-amber-200">
                      {moment.label}
                    </h2>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-amber-50/70">
                      {moment.line}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/hug/mothers-day"
                  className="inline-flex items-center justify-center rounded-full bg-amber-300 px-7 py-4 text-lg font-black text-[#2a180d] shadow-lg shadow-amber-500/20 transition hover:bg-amber-200"
                >
                  Start with Mother’s Day <span className="ml-3">→</span>
                </Link>

                <Link
                  href="/find"
                  className="inline-flex items-center justify-center rounded-full border border-amber-300/45 px-7 py-4 text-lg font-black text-amber-100 transition hover:bg-amber-300/10"
                >
                  Hear samples
                </Link>
              </div>

              <p className="mt-6 max-w-2xl text-sm font-bold leading-relaxed text-amber-50/60">
                No raw downloads. No public blast. Each order becomes a private
                link you can send by text, DM, social link, or email.
              </p>
            </div>

            <div className="relative min-h-[420px] overflow-hidden border-t border-amber-300/20 bg-black/30 lg:border-l lg:border-t-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,rgba(251,191,36,0.28),transparent_34%),radial-gradient(circle_at_70%_60%,rgba(34,211,238,0.16),transparent_28%)]" />

              <div className="relative z-10 flex h-full min-h-[420px] items-center justify-center p-8">
                <div className="relative h-72 w-72 rounded-full border-4 border-amber-300/70 shadow-[0_0_80px_rgba(251,191,36,0.42)]">
                  <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/75 blur-md" />
                  <div className="absolute inset-0 flex items-center justify-center text-7xl font-black text-[#2a180d]">
                    ♫
                  </div>
                  <div className="absolute -bottom-8 left-1/2 h-24 w-[26rem] -translate-x-1/2 rounded-full border-t border-amber-300/60" />
                  <div className="absolute -bottom-14 left-1/2 h-24 w-[31rem] -translate-x-1/2 rounded-full border-t border-amber-300/35" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-300/25 px-7 py-6 sm:px-10">
            <h2 className="text-2xl font-black text-amber-100">
              What is SOM?
            </h2>
            <p className="mt-2 max-w-4xl text-sm font-bold leading-relaxed text-amber-50/75">
              SOM is the public way to choose a K-KUT by feeling instead of by
              catalog. Internally, K-KUT tracks inventory items, cost items,
              stress, calm, phrase strength, and audio proof. Publicly, people
              just choose the moment they need to send.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
