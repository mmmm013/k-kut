import SentimeantMcBotIntentReview from "@/components/SentimeantMcBotIntentReview";

export const metadata = {
  title: "Find the Sentimeant | GPMx",
  description:
    "A review-only MC-BOT dialog that confirms customer intent before later NKK, BLK, KK, and KOMBO theme-fit comparison through MetaGrab Sets.",
};

export default function SentimeantHome() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-8 sm:px-8 sm:py-10">
        <SentimeantMcBotIntentReview />

        <section className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          After today&apos;s revised KKr digestion and two-sided metadata/MGS outputs are verified, every NKK or BLK can be assessed against Winning, Loving, Remembering, Sharing, Urging, Comforting, and Reinforcing. Each proposed fit must state how well it fits, what evidence supports it, what contradicts it, and how the actual audio presents. Any KK or KOMBO with no defensible theme fit remains isolated from Sentimeant presentation.
        </section>

        <footer className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Review branch only. No Production change. Need help? Contact reachus@gputnammusic.com.
        </footer>
      </div>
    </main>
  );
}
