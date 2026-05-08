import Link from "next/link";

const holidays = [
  ["new-years-day", "New Year’s Day", "Begin again with hope, reflection, and renewal."],
  ["martin-luther-king-jr-day", "Martin Luther King Jr. Day", "Honor courage, service, justice, and shared humanity."],
  ["valentines-day", "Valentine’s Day", "Send love, devotion, longing, romance, or tenderness."],
  ["presidents-day", "Presidents’ Day", "Mark leadership, history, civic memory, and reflection."],
  ["st-patricks-day", "St. Patrick’s Day", "Send luck, joy, friendship, celebration, and warmth."],
  ["easter", "Easter", "Send hope, renewal, faith, spring, and family warmth."],
  ["mothers-day", "Mother’s Day", "Thank Mom with a focused music moment."],
  ["memorial-day", "Memorial Day", "Honor remembrance, sacrifice, gratitude, and quiet reflection."],
  ["fathers-day", "Father’s Day", "Send thanks, respect, love, pride, or memory for Dad."],
  ["juneteenth", "Juneteenth", "Honor freedom, resilience, memory, and celebration."],
  ["independence-day", "Independence Day", "Celebrate freedom, home, summer, family, and national pride."],
  ["labor-day", "Labor Day", "Honor work, rest, effort, family, and the close of summer."],
  ["indigenous-peoples-day", "Indigenous Peoples’ Day", "Honor memory, heritage, land, people, and respect."],
  ["halloween", "Halloween", "Send playful, spooky, funny, dramatic, or mischievous moments."],
  ["veterans-day", "Veterans Day", "Honor service, courage, gratitude, and sacrifice."],
  ["thanksgiving", "Thanksgiving", "Send gratitude, family warmth, home, memory, and togetherness."],
  ["christmas", "Christmas", "Send joy, wonder, love, faith, nostalgia, or family warmth."],
  ["hanukkah", "Hanukkah", "Send light, resilience, family, blessing, and celebration."],
  ["kwanzaa", "Kwanzaa", "Send unity, culture, family, purpose, and celebration."],
  ["new-years-eve", "New Year’s Eve", "Send reflection, goodbye, hope, celebration, and new beginnings."],
];

export default function HolidayPage() {
  return (
    <main className="min-h-screen bg-[#120b12] text-[#fff6e8]">
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#22101f] p-6 shadow-2xl sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
            K-KUT Holiday
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Holiday HUGs for every season.
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-amber-50/80">
            Holiday K-KUT HUGs help people send focused music moments for national,
            seasonal, family, faith, remembrance, gratitude, and celebration days.
          </p>
        </div>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Holiday collections
              </p>
              <h2 className="mt-2 text-3xl font-black">Choose the holiday moment.</h2>
            </div>
            <Link
              href="/"
              className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
            >
              Back home
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {holidays.map(([slug, title, line]) => (
              <Link
                key={slug}
                href={`/holiday/${slug}`}
                className="rounded-[1.5rem] border border-amber-300/20 bg-[#23111d] p-5 shadow-xl transition hover:border-amber-300/50 hover:bg-[#30162a]"
              >
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                  Holiday HUG
                </p>
                <h3 className="mt-2 text-2xl font-black text-amber-50">{title}</h3>
                <p className="mt-2 text-base font-bold leading-7 text-amber-50/75">
                  {line}
                </p>
                <p className="mt-5 text-sm font-black text-amber-200">
                  Open {title} →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-amber-300/20 bg-black/25 p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Holiday doctrine
          </p>
          <p className="mt-3 text-xl font-black leading-8">
            The holiday opens the door. The feeling chooses the HUG.
          </p>
        </section>
      </section>
    </main>
  );
}
