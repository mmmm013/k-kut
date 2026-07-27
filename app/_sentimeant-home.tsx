import CuteHugCarousel from "@/components/CuteHugCarousel";

export const metadata = {
  title: "Send a Musical HUG | Sent-i-Meants and K-KUT",
  description:
    "Choose one of 13 Sent-i-Meants stories and hear a strict-music-proven KK.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-5 sm:px-8 sm:py-10">
        <header className="rounded-3xl border border-[#8D6E63]/35 bg-[#120A06] px-5 py-5">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            Sent-i-Meants · K-KUT · G Putnam Music
          </p>
          <p className="mt-2 text-sm font-bold text-[#D7CCC8]">
            Music that helps you say what matters.
          </p>
        </header>

        <CuteHugCarousel />

        <section className="rounded-[1.75rem] border border-[#FFD54F]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-6 md:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD54F]">
            Live now · 13 strict-music-proven KKs
          </p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Thirteen musical HUG moments
          </h1>
          <p className="mt-4 max-w-3xl text-base font-bold leading-8 text-[#EFEBE9]">
            Each story opens one temporary KK music preview from a different LT-PIX
            parent. MC-BOT scripts and the former general catalog remain isolated.
          </p>
          <p className="mt-4 max-w-3xl text-sm font-bold leading-7 text-[#BCAAA4]">
            Checkout remains closed until its separate customer-visible product,
            amount, receipt, and delivery proof pass.
          </p>
        </section>

        <footer className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Need help? Contact reachus@gputnammusic.com.
        </footer>
      </div>
    </main>
  );
}
