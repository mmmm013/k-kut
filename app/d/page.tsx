import type { Metadata } from "next";
import RecipientPlayer from "./RecipientPlayer";

export const metadata: Metadata = {
  title: "Your music gift | K-KUT",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function GiftDeliveryPage() {
  return <main className="min-h-screen bg-black px-5 py-12 text-white">
    <section className="mx-auto max-w-xl rounded-2xl border border-amber-300/40 p-7">
      <p className="text-sm font-bold text-amber-300">G PUTNAM MUSIC</p>
      <h1 className="mt-4 text-3xl font-bold">A music moment for you</h1>
      <p className="mt-3 text-stone-300">Open your gift and press play.</p>
      <RecipientPlayer />
      <p className="mt-6 text-sm text-stone-400">Need help? <a className="underline" href="mailto:reachus@gputnammusic.com">Contact G Putnam Music</a>.</p>
    </section>
  </main>;
}
