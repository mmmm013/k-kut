export const dynamic = "force-dynamic";

import Link from "next/link";

export default async function PrivateHugPage({
  searchParams,
}: {
  searchParams: Promise<{
    name?: string;
    msg?: string;
    demo?: string;
    audio?: string;
    slug?: string;
  }>;
}) {
  const params = await searchParams;
  const name = params.name?.trim() || "Mom";
  const message =
    params.msg?.trim() ||
    "I picked this K-KUT HUG for you. Thank you for being there in ways words alone cannot fully carry.";

  const audioSrc =
    params.audio && params.audio.startsWith("/mothers-day/")
      ? params.audio
      : "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-chorus.mp3";

  return (
    <main className="min-h-screen bg-[#170d08] px-5 py-10 text-amber-50">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-amber-200/20 bg-[#2a180d] p-6 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200/70">
          Private K-KUT HUG
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
          {name}, this is for you.
        </h1>

        <p className="mt-5 text-lg font-bold leading-8 text-amber-50/80">
          {message}
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-200/70">
            Your HUG
          </p>
          <h2 className="mt-2 text-2xl font-black">Just press play.</h2>
          <audio src={audioSrc} controls preload="metadata" className="mt-5 w-full" />
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/10 p-5">
          <p className="text-base font-black text-emerald-100">
            No checkout here. No download. No searching.
          </p>
          <p className="mt-2 text-sm font-bold leading-6 text-amber-50/70">
            This page is just the private HUG you were meant to receive.
          </p>
        </div>

        <Link
          href="/mom"
          className="mt-8 inline-flex rounded-2xl border border-amber-200/20 px-5 py-3 text-sm font-black text-amber-100 transition hover:bg-white/10"
        >
          Learn about K-KUT HUGs
        </Link>
      </section>
    </main>
  );
}
