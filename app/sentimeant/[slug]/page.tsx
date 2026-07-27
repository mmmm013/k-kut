import Link from "next/link";

export default function SentimeantStoryHoldPage() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <section className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-10 sm:px-8">
        <header className="rounded-[2rem] border border-[#FFD54F]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-7 shadow-2xl md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FFD54F]">
            Sent-i-Meants · Semantic match hold
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
            This story is temporarily unavailable.
          </h1>
          <p className="mt-4 text-lg font-bold leading-8 text-[#EFEBE9]">
            The previous KK assignment proved music was present but did not prove that its lyric, meaning, mood, feeling, sentiment, relationship, occasion, or audio presentation matched this story.
          </p>
        </header>

        <section className="rounded-[1.75rem] border border-red-400/40 bg-red-950/30 p-6 md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-200">
            Audio blocked
          </p>
          <p className="mt-3 text-sm font-bold leading-7 text-red-100">
            Reopening requires a dressed LT-PIX/KK semantic match and an individual GD review decision for this exact theme.
          </p>
        </section>

        <Link
          href="/"
          className="inline-block rounded-2xl border border-[#FFD54F]/70 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-[#FFD54F]"
        >
          Back to hold status
        </Link>
      </section>
    </main>
  );
}
