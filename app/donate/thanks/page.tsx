import Link from "next/link";

export default function DonationThanksPage() {
  return (
    <main className="min-h-screen bg-[#1A120B] text-[#F5E6C8] px-6 py-16">
      <section className="mx-auto max-w-2xl border border-[#D4A017]/30 rounded p-6 bg-[#24180F]">
        <h1 className="text-3xl font-bold text-[#D4A017]">Thank you.</h1>

        <p className="mt-4">
          Your MS Donation was received for Michael Scherer support.
        </p>

        <p className="mt-3 text-sm text-[#C8A882]">
          G Putnam Music will track marked MS Donation funds and forward them directly to Michael Scherer.
        </p>

        <p className="mt-3 text-xs text-[#C8A882]">
          This is a support payment, not a tax-deductible charitable contribution unless separately processed by a qualified nonprofit.
        </p>

        <Link href="/find" className="inline-block mt-6 px-4 py-2 border border-[#D4A017] text-[#D4A017] rounded">
          Back to BB
        </Link>
      </section>
    </main>
  );
}
