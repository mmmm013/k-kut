import Link from "next/link";

export const metadata = {
  title: "Send Mom a K-KUT HUG",
  description:
    "Pick a feeling, hear real music samples, order a Mother’s Day HUG, and send Mom a private K-KUT link.",
};

const FEELINGS = [
  {
    title: "Send warmth",
    text: "For gratitude, love, care, and the quiet things people remember.",
  },
  {
    title: "Send support",
    text: "For Mom when you want her to feel seen, appreciated, and carried.",
  },
  {
    title: "Send repair",
    text: "For distance, apology, longing, or words that are hard to say.",
  },
];

const STEPS = [
  "Choose the feeling you want Mom to receive.",
  "Hear the Mother’s Day K-KUT samples.",
  "Order the HUG.",
  "After checkout, send Mom the private HUG link.",
];

export default function MomPage() {
  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-amber-300/30 bg-[#24180F] p-7 shadow-2xl shadow-black/40 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.32em] text-amber-300">
            Mother’s Day K-KUT HUG
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-7xl">
            Send Mom a real music moment.
          </h1>

          <p className="mt-6 max-w-3xl text-lg font-bold leading-relaxed text-amber-50/80">
            Pick a feeling, hear real music samples, order the HUG, then send
            Mom the private K-KUT link after checkout.
          </p>

          <div className="mt-8 rounded-3xl border border-amber-300/25 bg-black/20 p-5">
            <h2 className="text-3xl font-black text-amber-100">
              What to do
            </h2>

            <ol className="mt-5 grid gap-3 md:grid-cols-4">
              {STEPS.map((step, index) => (
                <li
                  key={step}
                  className="rounded-2xl border border-amber-300/20 bg-[#160D08] p-4"
                >
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-300">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-amber-50/80">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {FEELINGS.map((feeling) => (
              <Link
                key={feeling.title}
                href="/hug/mothers-day"
                className="rounded-2xl border border-amber-300/20 bg-black/20 p-5 transition hover:border-amber-300/55 hover:bg-amber-300/10"
              >
                <h2 className="text-2xl font-black text-amber-200">
                  {feeling.title}
                </h2>
                <p className="mt-3 text-sm font-bold leading-relaxed text-amber-50/75">
                  {feeling.text}
                </p>
                <p className="mt-5 text-sm font-black text-amber-300">
                  Choose this feeling →
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/find"
              className="inline-flex items-center justify-center rounded-full border border-amber-300/45 px-7 py-4 text-lg font-black text-amber-100 transition hover:bg-amber-300/10"
            >
              Hear samples first
            </Link>

            <Link
              href="/hug/mothers-day"
              className="inline-flex items-center justify-center rounded-full bg-amber-300 px-7 py-4 text-lg font-black text-[#2a180d] shadow-lg shadow-amber-500/20 transition hover:bg-amber-200"
            >
              Order Mother’s Day HUG →
            </Link>
          </div>

          <p className="mt-6 max-w-3xl text-sm font-bold leading-relaxed text-amber-50/60">
            This page is the buying path. The private HUG link is created after
            checkout. Do not send “[PRIVATE HUG LINK]” to Mom — replace it with
            the actual private HUG link after purchase.
          </p>
        </div>
      </section>
    </main>
  );
}
