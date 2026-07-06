import Link from "next/link";

export const metadata = {
  title: "K-KUT HUGs | Send Feeling Musically",
  description:
    "K-KUT HUGs are private, sendable music moments for personal feelings, support, romance, thanks, comfort, and care.",
};

const hugPaths = [
  {
    title: "Personal HUGs",
    text: "Birthday, thanks, apology, encouragement, comfort, love, and just-because.",
    href: "/personal",
  },
  {
    title: "Romance HUGs",
    text: "Choose the romance level, hear the music moment, then send privately.",
    href: "/romance",
  },
  {
    title: "TUGs",
    text: "Careful music support for apology, repair, grief, longing, and hard feelings.",
    href: "/tug",
  },
  {
    title: "Find a HUG",
    text: "Start with the feeling first. Then listen.",
    href: "/find",
  },
];

export default function HugPage() {
  return (
    <main className="min-h-screen bg-[#150b07] text-[#fff6e8]">
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#2a160c] p-6 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-200">
            K-KUT HUGs
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Send feeling musically.
          </h1>

          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            A K-KUT HUG is a private music moment selected for the feeling you
            want someone to receive.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/checkout"
              className="rounded-2xl bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#150b07] transition hover:bg-amber-100"
            >
              Start HUG Order
            </Link>
            <Link
              href="/personal"
              className="rounded-2xl border border-amber-200/40 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-amber-100/10"
            >
              Browse Personal HUGs
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {hugPaths.map((path) => (
            <Link
              key={path.href}
              href={path.href}
              className="rounded-[1.5rem] border border-amber-200/15 bg-[#241208] p-5 transition hover:border-amber-200/45 hover:bg-[#30190d]"
            >
              <h2 className="text-2xl font-black text-amber-100">
                {path.title}
              </h2>
              <p className="mt-3 text-sm font-bold leading-6 text-amber-50/70">
                {path.text}
              </p>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
