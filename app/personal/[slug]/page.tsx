import Link from "next/link";
import { notFound } from "next/navigation";

const categories = {
  "thank-you": {
    title: "Thank You",
    question: "What kind of thanks do you want to send?",
    line: "Say thanks when ordinary words are not enough.",
    paths: ["Thank you", "You helped me", "You were there", "I appreciate you", "You made a difference"],
  },
  love: {
    title: "Love",
    question: "What kind of love do you want the HUG to carry?",
    line: "Send a real music moment for love, romance, and devotion.",
    paths: ["I love you", "I choose you", "Still in love", "You are my person", "Deep devotion"],
  },
  wedding: {
    title: "Wedding",
    question: "What should this wedding music moment carry?",
    line: "A ceremonial music package for first dance, forever love, and wedding-party thanks.",
    paths: ["First dance", "Forever love", "Bride’s choice", "Thank the wedding party", "Family blessing"],
    featuredPackage: {
      name: "Wedding Track Pack",
      feature: "Forever and a Day",
      line: "Feature Forever and a Day as the wedding song and build ceremonial K-KUT moments around it.",
      includes: [
        "One bride-preferred KUT from Forever and a Day",
        "Forever and a Day PIX for first dance",
        "Suggested clip feasibility: verse/chorus or two conjoined verses",
        "mK thanks / thank-you phrase options for wedding party",
        "12 KUPIDs / KPDs for the couple",
        "Routine buy options remain available",
      ],
      notes: [
        "Ceremonial, exciting, surprising, and pageant-like within GPMx.",
        "Pricing and final package tiers must be approved before checkout goes live.",
        "Future versions may use new KLEIGH / Michael Clay uploads.",
      ],
    },
  },
  birthday: {
    title: "Birthday",
    question: "What kind of birthday feeling fits?",
    line: "Celebrate someone with a focused song moment.",
    paths: ["Celebrate you", "Proud of you", "You matter", "Joyful birthday", "Milestone birthday"],
  },
  anniversary: {
    title: "Anniversary",
    question: "What part of the story should this anniversary HUG hold?",
    line: "Mark another year, another memory, another reason.",
    paths: ["Still choosing you", "Thank you for us", "Through everything", "Forever feeling"],
  },
  apology: {
    title: "Apology",
    question: "What kind of sorry?",
    line: "Send a careful music moment when sorry matters.",
    paths: ["I’m sorry", "Please forgive me", "I still care", "I want to repair this"],
  },
  encouragement: {
    title: "Encouragement",
    question: "What strength should this HUG give?",
    line: "Help someone keep going.",
    paths: ["Keep going", "You can do this", "I believe in you", "Stay strong"],
  },
  "missing-you": {
    title: "Missing You",
    question: "What kind of distance does this HUG need to cross?",
    line: "Bridge distance with a personal music moment.",
    paths: ["I miss you", "Wish you were here", "Thinking of you", "Distance hurts"],
  },
  friendship: {
    title: "Friendship",
    question: "What kind of friendship moment is this?",
    line: "For the friends who stayed, helped, and mattered.",
    paths: ["Thanks for being there", "I’ve got you", "Best friend energy", "Old friends"],
  },
  family: {
    title: "Family",
    question: "Who in the family is this for?",
    line: "For the people who are part of you.",
    paths: ["Family love", "For Mom", "For Dad", "For child", "For sibling"],
  },
  comfort: {
    title: "Comfort",
    question: "What kind of comfort is needed?",
    line: "Offer warmth, peace, and presence.",
    paths: ["I’m here", "You are not alone", "Thinking of you", "Gentle comfort"],
  },
  reflection: {
    title: "Reflection",
    question: "What are you looking back on?",
    line: "For memories, growth, healing, and looking back.",
    paths: ["Looking back", "Life changed", "I remember", "Healing", "Still becoming"],
  },
  congratulations: {
    title: "Congratulations",
    question: "What kind of win are you honoring?",
    line: "Honor a win, a beginning, or a milestone.",
    paths: ["You did it", "I’m proud of you", "New beginning", "Big win", "Graduation"],
  },
} as const;

type Slug = keyof typeof categories;

export function generateStaticParams() {
  return Object.keys(categories).map((slug) => ({ slug }));
}

export default function PersonalCategoryPage({ params }: { params: { slug: string } }) {
  const category = categories[params.slug as Slug];

  if (!category) {
    notFound();
  }

  const isThankYou = params.slug === "thank-you";
  const featuredPackage = "featuredPackage" in category ? category.featuredPackage : null;

  return (
    <main className="min-h-screen bg-[#150b07] text-[#fff6e8]">
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#2a160c] p-6 shadow-2xl sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
            K-KUT Personal HUG
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            {category.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            {category.line}
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Current step
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-50">
              {category.question}
            </h2>
          </div>
        </div>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Feeling paths
              </p>
              <h2 className="mt-2 text-3xl font-black">Choose the closest intent.</h2>
            </div>
            <Link
              href="/personal"
              className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
            >
              All Personal HUGs
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {category.paths.map((path) => (
              <div
                key={path}
                className="rounded-[1.25rem] border border-amber-300/20 bg-[#251209] p-5 shadow-lg"
              >
                <p className="text-xl font-black text-amber-50">{path}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-amber-50/70">
                  A focused K-KUT HUG path for this emotional intent.
                </p>
              </div>
            ))}
          </div>
        </section>

        {featuredPackage ? (
          <section className="mt-8 rounded-[1.5rem] border border-amber-300/30 bg-[#301407] p-5 shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Featured package
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-50">
              {featuredPackage.name}
            </h2>
            <p className="mt-3 text-lg font-black text-amber-200">
              Featured PIX: {featuredPackage.feature}
            </p>
            <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
              {featuredPackage.line}
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.25rem] border border-amber-300/20 bg-black/25 p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                  Includes
                </p>
                <ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-amber-50/80">
                  {featuredPackage.includes.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.25rem] border border-amber-300/20 bg-black/25 p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                  Package doctrine
                </p>
                <ul className="mt-3 space-y-2 text-sm font-bold leading-6 text-amber-50/80">
                  {featuredPackage.notes.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-8 rounded-[1.5rem] border border-amber-300/20 bg-black/25 p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Next
          </p>

          {isThankYou ? (
            <>
              <h2 className="mt-2 text-2xl font-black">
                Thank You HUG is live now for Mother’s Day.
              </h2>
              <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
                Start with gratitude, then open the live Mother’s Day HUG path to listen, choose, and send.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/hug/mothers-day"
                  className="rounded-2xl bg-amber-300 px-6 py-4 text-center text-lg font-black text-[#2a180d] transition hover:bg-amber-200"
                >
                  Open live Thank You HUG
                </Link>
                <Link
                  href="/holiday/mothers-day"
                  className="rounded-2xl border border-amber-200/25 px-6 py-4 text-center text-lg font-black text-amber-100 transition hover:bg-white/10"
                >
                  See Mother’s Day feeling paths
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-black">Featured HUG samples will go here.</h2>
              <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
                This page is ready for curated PIX and K-KUT inventory.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/find"
                  className="rounded-2xl bg-amber-300 px-6 py-4 text-center text-lg font-black text-[#2a180d] transition hover:bg-amber-200"
                >
                  Find the Right Words
                </Link>
                <Link
                  href="/"
                  className="rounded-2xl border border-amber-200/25 px-6 py-4 text-center text-lg font-black text-amber-100 transition hover:bg-white/10"
                >
                  Back home
                </Link>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
