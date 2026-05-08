import Link from "next/link";
import { notFound } from "next/navigation";

const holidays = {
  "new-years-day": {
    title: "New Year’s Day",
    line: "Begin again with hope, reflection, and renewal.",
    question: "What kind of beginning should this HUG carry?",
    paths: ["Fresh start", "Hope", "Reflection", "New beginning", "I believe in this year"],
  },
  "martin-luther-king-jr-day": {
    title: "Martin Luther King Jr. Day",
    line: "Honor courage, service, justice, and shared humanity.",
    question: "What should this remembrance hold?",
    paths: ["Courage", "Service", "Justice", "Hope", "Shared humanity"],
  },
  "valentines-day": {
    title: "Valentine’s Day",
    line: "Send love, devotion, longing, romance, or tenderness.",
    question: "What kind of love should this HUG carry?",
    paths: ["I love you", "I choose you", "Romance", "Longing", "Deep devotion"],
  },
  "presidents-day": {
    title: "Presidents’ Day",
    line: "Mark leadership, history, civic memory, and reflection.",
    question: "What kind of civic reflection fits?",
    paths: ["Leadership", "History", "Service", "Reflection", "Country"],
  },
  "st-patricks-day": {
    title: "St. Patrick’s Day",
    line: "Send luck, joy, friendship, celebration, and warmth.",
    question: "What kind of celebration fits?",
    paths: ["Good luck", "Joy", "Friendship", "Playful", "Celebrate"],
  },
  easter: {
    title: "Easter",
    line: "Send hope, renewal, faith, spring, and family warmth.",
    question: "What kind of renewal should this HUG carry?",
    paths: ["Hope", "Renewal", "Faith", "Family warmth", "Spring joy"],
  },
  "mothers-day": {
    title: "Mother’s Day",
    line: "Thank Mom with a focused music moment.",
    question: "What do you want Mom to feel?",
    paths: ["Thank you, Mom", "I love you, Mom", "You were there", "Family love", "Gentle gratitude"],
  },
  "memorial-day": {
    title: "Memorial Day",
    line: "Honor remembrance, sacrifice, gratitude, and quiet reflection.",
    question: "What kind of remembrance is needed?",
    paths: ["Remembrance", "Sacrifice", "Gratitude", "Quiet honor", "Never forgotten"],
  },
  "fathers-day": {
    title: "Father’s Day",
    line: "Send thanks, respect, love, pride, or memory for Dad.",
    question: "What do you want Dad to feel?",
    paths: ["Thank you, Dad", "I love you, Dad", "Respect", "Proud of you", "Missing Dad"],
  },
  juneteenth: {
    title: "Juneteenth",
    line: "Honor freedom, resilience, memory, and celebration.",
    question: "What should this HUG honor?",
    paths: ["Freedom", "Resilience", "Memory", "Celebration", "Hope"],
  },
  "independence-day": {
    title: "Independence Day",
    line: "Celebrate freedom, home, summer, family, and national pride.",
    question: "What kind of Fourth of July feeling fits?",
    paths: ["Freedom", "Home", "Summer", "Family", "Celebrate"],
  },
  "labor-day": {
    title: "Labor Day",
    line: "Honor work, rest, effort, family, and the close of summer.",
    question: "What kind of Labor Day moment fits?",
    paths: ["Rest", "Hard work", "Family time", "Summer close", "Gratitude"],
  },
  "indigenous-peoples-day": {
    title: "Indigenous Peoples’ Day",
    line: "Honor memory, heritage, land, people, and respect.",
    question: "What should this observance hold?",
    paths: ["Respect", "Heritage", "Memory", "Land", "People"],
  },
  halloween: {
    title: "Halloween",
    line: "Send playful, spooky, funny, dramatic, or mischievous moments.",
    question: "What kind of Halloween feeling fits?",
    paths: ["Spooky", "Playful", "Funny", "Dramatic", "Mischief"],
  },
  "veterans-day": {
    title: "Veterans Day",
    line: "Honor service, courage, gratitude, and sacrifice.",
    question: "What kind of thanks should this HUG carry?",
    paths: ["Thank you for serving", "Courage", "Honor", "Sacrifice", "Respect"],
  },
  thanksgiving: {
    title: "Thanksgiving",
    line: "Send gratitude, family warmth, home, memory, and togetherness.",
    question: "What kind of gratitude fits?",
    paths: ["Thankful for you", "Family warmth", "Home", "Togetherness", "Blessing"],
  },
  christmas: {
    title: "Christmas",
    line: "Send joy, wonder, love, faith, nostalgia, or family warmth.",
    question: "What kind of Christmas feeling should this HUG carry?",
    paths: ["Joy", "Wonder", "Family warmth", "Nostalgia", "Love"],
  },
  hanukkah: {
    title: "Hanukkah",
    line: "Send light, resilience, family, blessing, and celebration.",
    question: "What should this Hanukkah HUG carry?",
    paths: ["Light", "Family", "Blessing", "Resilience", "Celebration"],
  },
  kwanzaa: {
    title: "Kwanzaa",
    line: "Send unity, culture, family, purpose, and celebration.",
    question: "What should this Kwanzaa HUG carry?",
    paths: ["Unity", "Culture", "Family", "Purpose", "Celebration"],
  },
  "new-years-eve": {
    title: "New Year’s Eve",
    line: "Send reflection, goodbye, hope, celebration, and new beginnings.",
    question: "What kind of year-end moment fits?",
    paths: ["Goodbye to this year", "Hope", "Celebrate", "Reflection", "New beginning"],
  },
} as const;

type Slug = keyof typeof holidays;

export function generateStaticParams() {
  return Object.keys(holidays).map((slug) => ({ slug }));
}

export default function HolidayCategoryPage({ params }: { params: { slug: string } }) {
  const holiday = holidays[params.slug as Slug];

  if (!holiday) {
    notFound();
  }

  const isLiveMothersDay = params.slug === "mothers-day";

  return (
    <main className="min-h-screen bg-[#120b12] text-[#fff6e8]">
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#22101f] p-6 shadow-2xl sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
            K-KUT Holiday HUG
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            {holiday.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            {holiday.line}
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Current step
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-50">
              {holiday.question}
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
              href="/holiday"
              className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
            >
              All Holiday HUGs
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {holiday.paths.map((path) => (
              <div
                key={path}
                className="rounded-[1.25rem] border border-amber-300/20 bg-[#23111d] p-5 shadow-lg"
              >
                <p className="text-xl font-black text-amber-50">{path}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-amber-50/70">
                  A focused K-KUT HUG path for this holiday intent.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-amber-300/20 bg-black/25 p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Next
          </p>

          {isLiveMothersDay ? (
            <>
              <h2 className="mt-2 text-2xl font-black">
                Mother’s Day HUG is live now.
              </h2>
              <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
                Open the live Mother’s Day path to listen, choose the feeling, and send the HUG.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/hug/mothers-day"
                  className="rounded-2xl bg-amber-300 px-6 py-4 text-center text-lg font-black text-[#2a180d] transition hover:bg-amber-200"
                >
                  Open Mother’s Day HUG
                </Link>
                <Link
                  href="/find"
                  className="rounded-2xl border border-amber-200/25 px-6 py-4 text-center text-lg font-black text-amber-100 transition hover:bg-white/10"
                >
                  Find the Right Words
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-black">
                Featured holiday HUG samples will go here.
              </h2>
              <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
                This page is ready for curated holiday PIX and K-KUT inventory.
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
