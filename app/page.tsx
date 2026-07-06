import Link from "next/link";

export const metadata = {
  title: "K-KUT | Send Feeling Musically",
  description:
    "K-KUT turns real G Putnam Music song moments into private, sendable HUGs for personal, holiday, romance, comfort, thanks, and support.",
};

const lanes = [
  {
    title: "Personal HUGs",
    text: "Birthday, apology, thanks, encouragement, comfort, love, and just-because moments.",
    href: "/personal",
  },
  {
    title: "Romance",
    text: "Choose the romance level and hear a real GPM music moment before sending.",
    href: "/romance",
  },
  {
    title: "TUGs",
    text: "Careful support moments for apology, repair, grief, longing, and hard feelings.",
    href: "/tug",
  },
  {
    title: "Find a HUG",
    text: "Start simple. Pick the feeling first, then listen.",
    href: "/find",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[#150b07] text-[#fff6e8]">
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#2a160c] p-6 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-amber-200">
            K-KUT by G Putnam Music
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Send feeling musically.
          </h1>

          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            K-KUT turns real G Putnam Music song moments into private, sendable
            HUGs for the moments ordinary messages do not carry.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/personal"
              className="rounded-2xl bg-amber-200 px-5 py-3 text-center text-sm font-black text-[#150b07] transition hover:bg-amber-100"
            >
              Start with Personal HUGs
            </Link>
            <Link
              href="/sms-optin"
              className="rounded-2xl border border-amber-200/40 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-amber-100/10"
            >
              SMS delivery updates
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {lanes.map((lane) => (
            <Link
              key={lane.href}
              href={lane.href}
              className="rounded-[1.5rem] border border-amber-200/15 bg-[#241208] p-5 transition hover:border-amber-200/45 hover:bg-[#30190d]"
            >
              <h2 className="text-2xl font-black text-amber-100">
                {lane.title}
              </h2>
              <p className="mt-3 text-sm font-bold leading-6 text-amber-50/70">
                {lane.text}
              </p>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-amber-200/15 bg-black/20 p-5">
          <p className="text-sm font-bold leading-6 text-amber-50/70">
            K-KUT is the customer delivery lane. GPMC / GPMx source catalog
            authority remains separate.
          </p>
        </section>
      </section>
    </main>
  );
}
