import Link from "next/link";
import PublicIiBrowser from "@/components/PublicIiBrowser";

export const metadata = {
  title: "Browse All K-KUT HUGs | G Putnam Music",
  description:
    "Listen to verified sKs and KKs, add an optional 13-word note, and send the exact item as a HUG.",
};

export const dynamic = "force-dynamic";

export default function BrowsePage() {
  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="rounded-[2rem] border border-[#8D6E63]/45 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302] p-6 shadow-2xl md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music · K-KUT
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-7xl">
            Browse All HUGs
          </h1>

          <p className="mt-5 max-w-4xl text-lg font-bold leading-8 text-[#EFEBE9]">
            Hear the real finished music first. Choose one exact $4.99 sK HUG or $7.99 KK HUG. Add up to 13 written words, then send it for private delivery.
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
            <span className="rounded-full border border-[#FFD54F]/40 px-4 py-2 text-sm font-black text-[#FFD54F]">
              sK HUG · $4.99
            </span>
            <span className="rounded-full border border-[#FFD54F]/40 px-4 py-2 text-sm font-black text-[#FFD54F]">
              KK HUG · $7.99
            </span>
          </div>

          <Link
            href="/"
            className="mt-7 inline-block rounded-2xl border border-[#FFD54F]/65 px-5 py-3 text-sm font-black text-[#FFD54F]"
          >
            Back to K-KUT
          </Link>
        </header>

        <PublicIiBrowser />

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Every displayed K-KUT must remain publicly playable, preserve its exact identity, and retain the canonical GPMx Twinkle at the end.
        </footer>
      </section>
    </main>
  );
}
