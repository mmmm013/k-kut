import Link from "next/link";
import PublicIiBrowser from "@/components/PublicIiBrowser";

export const metadata = {
  title: "Browse All K-KUTs | G Putnam Music",
  description:
    "Listen to released K-KUT music moments, use MC-BOT to narrow the catalog, and choose the exact K-KUT you want.",
};

export const dynamic = "force-dynamic";

export default function BrowsePage() {
  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="rounded-[2rem] border border-[#8D6E63]/45 bg-gradient-to-br from-[#2A1710] via-[#140C08] to-[#050302] p-6 shadow-2xl md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
                G Putnam Music · K-KUT
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-7xl">
                Browse All K-KUTs
              </h1>
              <p className="mt-5 max-w-4xl text-lg font-bold leading-8 text-[#EFEBE9]">
                Hear the real music moment first. Choose the exact one that fits. MC-BOT can help narrow the released catalog without guessing for you.
              </p>
            </div>

            <Link
              href="/hug"
              className="rounded-2xl border border-[#FFD54F]/65 px-5 py-3 text-sm font-black text-[#FFD54F] transition hover:bg-[#FFD54F] hover:text-[#160A05]"
            >
              Back to K-KUT HUGs
            </Link>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#8D6E63]/35 bg-black/25 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD54F]">
                1 · Listen
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#D7CCC8]">
                Every option uses the finished public delivery capsule.
              </p>
            </div>
            <div className="rounded-2xl border border-[#8D6E63]/35 bg-black/25 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD54F]">
                2 · Choose
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#D7CCC8]">
                Your exact K-KUT ID travels into checkout for order reconciliation.
              </p>
            </div>
            <div className="rounded-2xl border border-[#8D6E63]/35 bg-black/25 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD54F]">
                3 · Receive
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-[#D7CCC8]">
                K-KUT uses the paid order record to fulfill the exact music moment selected.
              </p>
            </div>
          </div>
        </header>

        <PublicIiBrowser />

        <footer className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Released catalog rule: public storage verified, exact K-KUT identity preserved, and canonical GPMx Twinkle proof required. MC-BOT may narrow by available metadata, but listening and customer choice remain decisive.
        </footer>
      </section>
    </main>
  );
}
