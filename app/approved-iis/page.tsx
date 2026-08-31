import Link from "next/link";
import ApprovedIiReleaseGrid from "@/components/ApprovedIiReleaseGrid";
import {
  approvedIiCheckoutConfigured,
  loadApprovedIiRelease,
} from "@/lib/approvedIiRelease";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Approved K-KUT HUGs | G Putnam Music",
  description:
    "Hear Gregory-approved K-KUT music moments and send the exact HUG you choose.",
};

export default async function ApprovedIisPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const records = loadApprovedIiRelease();
  const query = await searchParams;
  const checkoutConfigured = {
    regular_hug: approvedIiCheckoutConfigured("regular_hug"),
    holiday_hug: approvedIiCheckoutConfigured("holiday_hug"),
  };

  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className="rounded-[2rem] border border-[#FFD54F]/40 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-7 shadow-2xl md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music · Approved IIs
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Hear the exact moment. Send the Sent-i-Meant.
          </h1>
          <p className="mt-5 max-w-4xl text-lg font-bold leading-8 text-[#EFEBE9]">
            36 Gregory-approved real-music IIs are ready to hear: 30 regular HUG moments at $7.99 and six C&apos;mon Christmas! moments in the $14.99 holiday container.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-black">
            <span className="rounded-full border border-pink-200/35 px-4 py-2 text-pink-100">
              No AI audio
            </span>
            <span className="rounded-full border border-pink-200/35 px-4 py-2 text-pink-100">
              One exact II per purchase
            </span>
            <span className="rounded-full border border-pink-200/35 px-4 py-2 text-pink-100">
              Private HUG delivery
            </span>
          </div>
        </header>

        {query.checkout && (
          <section className="rounded-2xl border border-amber-300/35 bg-amber-950/25 p-5 text-sm font-black text-amber-100">
            Checkout is still closed until the matching Stripe Payment Link is active at the exact locked price. Your II choice was not lost; no charge was attempted.
          </section>
        )}

        <ApprovedIiReleaseGrid
          records={records}
          checkoutConfigured={checkoutConfigured}
        />

        <footer className="flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm font-bold text-white/65">
          <p>Recipients receive a private HUG link and press play. No download is required.</p>
          <Link href="/hug" className="font-black text-[#FFD54F]">
            Back to all offers
          </Link>
        </footer>
      </section>
    </main>
  );
}
