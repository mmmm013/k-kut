import Link from "next/link";

export default function CurrentIiAuthorityHold({
  itemLabel = "music item",
}: {
  itemLabel?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#160d08] px-6 py-12 text-[#fff3cf]">
      <section className="w-full max-w-xl rounded-3xl border border-[#d6a400]/40 bg-[#24180f] p-8 text-center shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ffd36a]">
          Current-II release review
        </p>
        <h1 className="mt-4 text-3xl font-black">
          This {itemLabel} is not customer-ready.
        </h1>
        <p className="mt-4 text-sm font-bold leading-7 text-[#e8cf9f]">
          No audio or payment can open until the exact item reaches STAGE with
          its LT-PIX, structure, boundary, meaning, delivery, and price proof.
        </p>
        <Link
          href="/find"
          className="mt-6 inline-flex rounded-xl border border-[#ffd36a]/60 px-5 py-3 text-sm font-black text-[#ffd36a]"
        >
          Find a customer-ready moment
        </Link>
      </section>
    </main>
  );
}
