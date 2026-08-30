import type { Metadata } from "next";
import Link from "next/link";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HUG order received | K-KUT",
  robots: { index: false, follow: false },
};

async function paymentConfirmed(sessionId: string) {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || !/^cs_(?:live|test)_[A-Za-z0-9]+$/u.test(sessionId)) {
    return false;
  }

  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session.payment_status === "paid";
  } catch {
    return false;
  }
}

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: rawSessionId } = await searchParams;
  const sessionId = typeof rawSessionId === "string" ? rawSessionId.trim() : "";
  const confirmed = await paymentConfirmed(sessionId);

  return (
    <main className="min-h-screen bg-[#09070b] px-5 py-12 text-white">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-[#FFD54F]/35 bg-[#120A06] p-7 shadow-2xl sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
          K-KUT · G Putnam Music
        </p>
        <h1 className="mt-4 text-4xl font-black">
          {confirmed ? "Payment received." : "Order confirmation pending."}
        </h1>
        <p className="mt-5 text-lg font-bold leading-8 text-[#FFF8E1]">
          {confirmed
            ? "Your exact HUG is now in GPM’s controlled delivery review."
            : "No completed payment is confirmed for this page yet."}
        </p>

        {confirmed && (
          <ol className="mt-7 space-y-4 text-sm font-bold leading-7 text-[#D7CCC8]">
            <li>1. GPM verifies the purchased music moment and personal note.</li>
            <li>2. GPM prepares one private, stream-only HUG link.</li>
            <li>3. The link is sent to the recipient mobile number entered at checkout.</li>
          </ol>
        )}

        <p className="mt-7 text-sm font-bold leading-7 text-white/60">
          Questions? Contact reachus@gputnammusic.com.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#FFD54F] px-5 py-3 text-sm font-black text-black"
        >
          Return to K-KUT
        </Link>
      </section>
    </main>
  );
}
