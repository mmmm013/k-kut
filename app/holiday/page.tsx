import Link from "next/link";

export const metadata = {
  title: "K-KUT Holiday HUGs | Seasonal Music Moments",
  description:
    "K-KUT holiday HUGs are seasonal music moments opened only when the holiday lane is active.",
};

export default function HolidayPage() {
  return (
    <main className="min-h-screen bg-[#150b07] text-[#fff6e8]">
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#2a160c] p-6 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-200">
            K-KUT Holiday HUGs
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Seasonal HUGs open when the season is active.
          </h1>

          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            Holiday lanes are temporary. The standard K-KUT experience stays
            focused on personal HUGs and feeling-first music delivery.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/personal"
              className="rounded-2xl bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#150b07] transition hover:bg-amber-100"
            >
              Open Personal HUGs
            </Link>
            <Link
              href="/find"
              className="rounded-2xl border border-amber-200/40 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-amber-100/10"
            >
              Find a HUG
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
