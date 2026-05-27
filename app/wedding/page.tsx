import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "K-KUT Wedding VOW Packs — Music Moments for Your Day",
  description:
    "Three curated Wedding VOW Packs. Wedding Song, Ceremony KKs, Couple\u2019s Choice, Wedding Party, Family Thank-You, and Guest mKs. Private Ceremony, Family Circle, or Full Celebration.",
};

const STANDALONE_VALUES = [
  { label: "Wedding Song / PIX", value: "$29.99" },
  { label: "Ceremony KK", value: "$9.99" },
  { label: "Couple\u2019s Choice KK or KK-Kombo", value: "$9.99\u2013$19.99" },
  { label: "Wedding Party KKs (4)", value: "$39.96" },
  { label: "Family Thank-You KKs (4)", value: "$39.96" },
  { label: "Guest mKs (10)", value: "$29.90" },
];

const PACKAGES = [
  {
    id: "private",
    tier: "Private Ceremony",
    price: "$89.99",
    kicker: "Just the two of you",
    description:
      "The essentials. One Wedding Song with PIX, one Ceremony KK, and Couple\u2019s Choice KK or KK-Kombo. MC-BOT guides the couple through the selection \u2014 calm, private, no noise.",
    includes: [
      "Wedding Song / PIX",
      "Ceremony KK",
      "Couple\u2019s Choice KK or KK-Kombo",
      "MC-BOT guided selection",
    ],
    standaloneValue: "$49.97\u2013$59.97",
    saveNote: "Packaged together at $89.99",
    stripeUrl: null,
    email: "founder@gputnammusic.com",
    emailSubject: "Wedding VOW Pack \u2014 Private Ceremony Request",
    highlight: false,
  },
  {
    id: "family",
    tier: "Family Circle",
    price: "$169.99",
    kicker: "For the people closest to you",
    description:
      "Everything in Private Ceremony, plus Wedding Party KKs for up to 4 members, and Family Thank-You KKs for up to 4 family recipients. MC-BOT matches tone and role for each.",
    includes: [
      "Wedding Song / PIX",
      "Ceremony KK",
      "Couple\u2019s Choice KK or KK-Kombo",
      "Wedding Party KKs (up to 4)",
      "Family Thank-You KKs (up to 4)",
      "MC-BOT role matching",
    ],
    standaloneValue: "$129.90\u2013$139.90",
    saveNote: "Packaged together at $169.99",
    stripeUrl: null,
    email: "founder@gputnammusic.com",
    emailSubject: "Wedding VOW Pack \u2014 Family Circle Request",
    highlight: true,
  },
  {
    id: "celebration",
    tier: "Full Celebration",
    price: "$299.99",
    kicker: "The complete wedding music experience",
    description:
      "Everything in Family Circle, plus Guest mKs for up to 10 guests. The full K-KUT wedding suite \u2014 every role, every moment, every music touch point covered.",
    includes: [
      "Wedding Song / PIX",
      "Ceremony KK",
      "Couple\u2019s Choice KK or KK-Kombo",
      "Wedding Party KKs (up to 4)",
      "Family Thank-You KKs (up to 4)",
      "Guest mKs (up to 10)",
      "MC-BOT role matching for all recipients",
    ],
    standaloneValue: "$159.80\u2013$169.80",
    saveNote: "Packaged together at $299.99",
    stripeUrl: null,
    email: "founder@gputnammusic.com",
    emailSubject: "Wedding VOW Pack \u2014 Full Celebration Request",
    highlight: false,
  },
] as const;

export default function WeddingVowPacksPage() {
  return (
    <main className="min-h-screen bg-[#120a06] px-5 py-6 text-[#f7ead2]">
      <section className="mx-auto w-full max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.28em] text-amber-300/80">
          <Link href="/" className="hover:text-amber-200">K-KUT</Link>
          <span>Wedding VOW Packs</span>
        </div>

        {/* Hero */}
        <div className="mt-8 rounded-[1.5rem] border border-amber-300/25 bg-[#231208] p-6">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">MC</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-[#fff2cf]">
            Wedding VOW Packs
          </h1>
          <p className="mt-4 text-base font-semibold leading-7 text-amber-50/80">
            Real music moments for every part of your day. One Wedding Song. Ceremony
            KKs. Couple&apos;s Choice. Wedding Party. Family Thank-You. Guest mKs.
            MC-BOT guides each selection \u2014 calm, private, role by role.
          </p>
        </div>

        {/* Standalone Value Reference */}
        <div className="mt-5 rounded-[1.25rem] border border-amber-300/20 bg-black/25 p-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Standalone Value</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-amber-50/70">
            Each item below is available individually. The VOW Packs bundle them at a significant saving.
          </p>
          <div className="mt-4 grid gap-2">
            {STANDALONE_VALUES.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-amber-50/75">{item.label}</span>
                <span className="font-black text-amber-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Packages */}
        <div className="mt-6 grid gap-5">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-[1.5rem] border p-6 ${
                pkg.highlight
                  ? "border-amber-300/60 bg-[#2a170c]"
                  : "border-amber-300/20 bg-[#1b100b]"
              }`}
            >
              {pkg.highlight && (
                <p className="mb-3 inline-block rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-amber-300">
                  Most Complete
                </p>
              )}
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300/80">
                {pkg.kicker}
              </p>
              <div className="mt-2 flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-black text-[#fff2cf]">{pkg.tier}</h2>
                <span className="text-2xl font-black text-amber-300">{pkg.price}</span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-amber-50/75">
                {pkg.description}
              </p>

              {/* Includes */}
              <ul className="mt-4 grid gap-1">
                {pkg.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm font-semibold text-amber-50/70">
                    <span className="mt-0.5 text-amber-300">\u2713</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Value comparison */}
              <div className="mt-4 rounded-xl border border-amber-300/15 bg-black/20 px-4 py-3">
                <p className="text-xs font-semibold text-amber-50/50">
                  Standalone value: <span className="text-amber-300/80">{pkg.standaloneValue}</span>
                  <span className="mx-2 text-amber-300/30">\u2014</span>
                  {pkg.saveNote}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-5">
                {pkg.stripeUrl ? (
                  <a
                    href={pkg.stripeUrl}
                    className="block w-full rounded-2xl bg-amber-300 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-[#120a06] transition hover:bg-amber-200"
                  >
                    Order {pkg.tier} \u2014 {pkg.price}
                  </a>
                ) : (
                  <a
                    href={`mailto:${pkg.email}?subject=${encodeURIComponent(pkg.emailSubject)}`}
                    className="block w-full rounded-2xl border border-amber-300/40 bg-black/20 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-amber-300 transition hover:border-amber-300/80 hover:bg-black/40"
                  >
                    Request {pkg.tier} by Email
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 mb-4">
          <div className="rounded-2xl border border-amber-300/15 bg-black/25 p-4 text-sm font-semibold leading-6 text-amber-50/70">
            MC guides each selection privately. No source titles, artist names, or audio
            URLs are exposed during the process. All VOW Pack items are delivered as
            private K-KUT links \u2014 not downloadable files.
          </div>
        </div>

      </section>
    </main>
  );
}
