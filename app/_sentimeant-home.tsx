import SentimeantMcBotIntentReview from "@/components/SentimeantMcBotIntentReview";

export const metadata = {
  title: "Find the Sentimeant | G Putnam Music",
  description:
    "A review-only, non-audio MC-BOT flow that captures meaning, feeling, and relationship direction before approved music matching.",
};

export default function SentimeantHome() {
  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-8 sm:px-8 sm:py-10">
        <SentimeantMcBotIntentReview />

        <section className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Customer-side intent metadata will later be compared with the updated LT-PIX and KK metadata through governed MetaGrab Sets. Only independently approved KK or KOMBO inventory may enter a customer offer after boundary, meaning, presentation, identity, and delivery proof pass.
        </section>

        <footer className="rounded-[1.5rem] border border-[#8D6E63]/35 bg-black/20 p-5 text-sm font-bold leading-7 text-[#BCAAA4]">
          Review branch only. Need help? Contact reachus@gputnammusic.com.
        </footer>
      </div>
    </main>
  );
}
