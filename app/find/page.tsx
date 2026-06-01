export const dynamic = "force-dynamic";

import Link from "next/link";

const FIRST_STEP_OPTIONS = [
  {
    label: "I want to say thank you.",
    helper: "Gratitude, appreciation, care, support.",
    href: "/personal/thank-you",
  },
  {
    label: "I want to send love or comfort.",
    helper: "Warmth, reassurance, closeness, encouragement.",
    href: "/personal",
  },
  {
    label: "I want to celebrate someone.",
    helper: "Birthday, congratulations, friendship, achievement.",
    href: "/personal/birthday",
  },
  {
    label: "I need to repair or reconnect.",
    helper: "Apology, distance, longing, hard feelings.",
    href: "/personal/apology",
  },
];

export default function FindPage() {
  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
            MC-BOT step 1 of 4
          </p>

          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-7xl">
            What do you need this HUG to say?
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-bold leading-relaxed text-[#F5E6C8]/85">
            Pick one need. K-KUT will guide you toward a reviewed HUG path.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {FIRST_STEP_OPTIONS.map((option) => (
              <Link
                key={option.label}
                href={option.href}
                className="group rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5 transition hover:border-[#FFD36A] hover:bg-[#2A180D]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-[#FFD36A]">
                      {option.label}
                    </h2>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-[#F5E6C8]/75">
                      {option.helper}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#D4A017]/40 px-4 py-2 text-sm font-black text-[#FFD36A] group-hover:bg-[#D4A017]/10">
                    Review path
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <section className="mt-8 rounded-[2rem] border border-[#D4A017]/30 bg-[#160D08] p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#D4A017]">
            KKr review active
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#FFD36A]">
            Public HUG options are being re-audited.
          </h2>

          <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-[#F5E6C8]/75">
            K-KUT is reviewing route fit, source diversity, emotional intent, and audio readiness before showing public buyer options here.
          </p>

          <div className="mt-5 rounded-2xl border border-[#D4A017]/20 bg-[#24180F] p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
              Current public rule
            </p>
            <p className="mt-1 text-sm font-black text-[#F5E6C8]/85">
              No raw inventory. No repeated-source router results. No unreviewed Sympathy results. No checkout until exact approved audio is ready.
            </p>
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-[#D4A017]/25 bg-[#160D08] p-5">
          <p className="text-sm font-bold leading-relaxed text-[#F5E6C8]/75">
            MC-BOT keeps this simple: pick the need, review the route, hear approved music when available, then choose what fits.
          </p>
        </div>
      </section>
    </main>
  );
}
