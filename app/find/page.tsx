import Link from "next/link";
import HugzCardGrid from "@/components/HugzCardGrid";

export const metadata = {
  title: "Find a Music Moment | K-KUT",
  description:
    "Start with the human moment and open the closest K-KUT HUGz Card.",
};

export default function FindPage() {
  return (
    <main className="min-h-screen bg-[#1A120B] px-5 py-10 text-[#F5E6C8] sm:px-8">
      <section className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
            Find the right human moment
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-7xl">
            What should this music moment help you say?
          </h1>
          <p className="mt-6 max-w-3xl text-lg font-bold leading-relaxed text-[#F5E6C8]/85">
            Choose the closest HUGz Card below. Exact music choices stay hidden until their title, meaning, audio, checkout, and delivery proof all pass.
          </p>
          <Link
            href="/hug"
            className="mt-6 inline-flex rounded-xl border border-[#FFD36A]/60 px-5 py-3 text-sm font-black text-[#FFD36A]"
          >
            Compare HUG, TUG, and BUG
          </Link>
        </header>

        <HugzCardGrid />
      </section>
    </main>
  );
}
