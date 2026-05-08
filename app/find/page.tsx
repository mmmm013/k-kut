import Link from "next/link";

const GUIDE_PATHS = [
  {
    title: "Personal HUGs",
    description:
      "For love, thanks, birthdays, apology, comfort, encouragement, friendship, family, and real human moments.",
    href: "/personal",
    cta: "Browse Personal →",
  },
  {
    title: "Holiday HUGs",
    description:
      "For Mother’s Day, Father’s Day, Valentine’s Day, Thanksgiving, Christmas, New Year’s, and seasonal moments.",
    href: "/holiday",
    cta: "Browse Holiday →",
  },
  {
    title: "Current Mother’s Day HUG",
    description:
      "Use the live Mother’s Day path now. Hear the song-section samples and choose the private HUG link to send.",
    href: "/hug/mothers-day",
    cta: "Open Mother’s Day →",
  },
];

const FEELING_PATHS = [
  {
    title: "Warmth",
    examples: "Thank you, love, care, appreciation, support.",
    href: "/personal/thank-you",
  },
  {
    title: "Celebration",
    examples: "Birthday, anniversary, congratulations, friendship.",
    href: "/personal/birthday",
  },
  {
    title: "Repair",
    examples: "Apology, longing, distance, hard feelings, reconnection.",
    href: "/personal/apology",
  },
  {
    title: "Seasonal",
    examples: "Mother’s Day, Father’s Day, holidays, family traditions.",
    href: "/holiday",
  },
];

export default function FindPage() {
  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
            Find the right words
          </p>

          <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-7xl">
            Start with the feeling.
          </h1>

          <p className="mt-6 max-w-3xl text-lg font-bold leading-relaxed text-[#F5E6C8]/85">
            K-KUT helps you choose a focused music moment for what you want to
            send. Pick the kind of moment first, then narrow into the right HUG.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {GUIDE_PATHS.map((path) => (
              <Link
                key={path.title}
                href={path.href}
                className="rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5 transition hover:border-[#FFD36A] hover:bg-[#2A180D]"
              >
                <h2 className="text-2xl font-black text-[#FFD36A]">
                  {path.title}
                </h2>
                <p className="mt-3 text-sm font-bold leading-relaxed text-[#F5E6C8]/75">
                  {path.description}
                </p>
                <p className="mt-5 text-sm font-black text-[#FFD36A]">
                  {path.cta}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <section className="mt-10 rounded-[2rem] border border-[#D4A017]/30 bg-[#24180F] p-7 sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
            Feeling paths
          </p>

          <h2 className="mt-4 text-4xl font-black text-[#FFD36A]">
            What kind of moment is this?
          </h2>

          <p className="mt-4 max-w-3xl text-base font-bold leading-relaxed text-[#F5E6C8]/75">
            Choose the closest path. The system can grow from here into more
            guided listening, more categories, and more refined HUG options.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {FEELING_PATHS.map((path) => (
              <Link
                key={path.title}
                href={path.href}
                className="rounded-2xl border border-[#D4A017]/25 bg-[#160D08] p-5 transition hover:border-[#FFD36A] hover:bg-[#2A180D]"
              >
                <h3 className="text-2xl font-black text-[#FFD36A]">
                  {path.title}
                </h3>
                <p className="mt-2 text-sm font-bold leading-relaxed text-[#F5E6C8]/75">
                  {path.examples}
                </p>
                <p className="mt-5 text-sm font-black text-[#FFD36A]">
                  Continue →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full border border-[#D4A017]/35 px-5 py-3 text-sm font-black text-[#FFD36A] transition hover:bg-[#D4A017]/10"
          >
            Home
          </Link>
          <Link
            href="/som"
            className="rounded-full border border-[#D4A017]/35 px-5 py-3 text-sm font-black text-[#FFD36A] transition hover:bg-[#D4A017]/10"
          >
            Story of Music
          </Link>
          <Link
            href="/invention"
            className="rounded-full border border-[#D4A017]/35 px-5 py-3 text-sm font-black text-[#FFD36A] transition hover:bg-[#D4A017]/10"
          >
            Invention
          </Link>
        </div>
      </section>
    </main>
  );
}
