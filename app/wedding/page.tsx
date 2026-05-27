// Wedding VOW Packs — K-KUT
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "K-KUT Wedding VOW Packs — Music Moments for Your Day",
  description:
    "Three curated Wedding VOW Packs. Wedding Song, Ceremony KKs, Couple’s Choice, Wedding Party, Family Thank-You, and Guest mKs. Private Ceremony, Family Circle, or Full Celebration.",
};

const STANDALONE_VALUES = [
  { label: "Wedding Song / PIX", value: "$29.99" },
  { label: "Ceremony KK", value: "$9.99" },
  { label: "Couple’s Choice KK or KK-Kombo", value: "$9.99–$19.99" },
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
      "The essentials. One Wedding Song with PIX, one Ceremony KK, and Couple’s Choice KK or KK-Kombo. MC-BOT guides the couple through the selection — calm, private, no noise.",
    includes: [
      "Wedding Song / PIX",
      "Ceremony KK",
      "Couple’s Choice KK or KK-Kombo",
      "MC-BOT guided selection",
    ],
    standaloneValue: "$49.97–$59.97",
    saveNote: "Packaged together at $89.99",
    stripeUrl: null,
    email: "founder@gputnammusic.com",
    emailSubject: "Wedding VOW Pack — Private Ceremony Request",
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
      "Couple’s Choice KK or KK-Kombo",
      "Wedding Party KKs (up to 4)",
      "Family Thank-You KKs (up to 4)",
      "MC-BOT role matching",
    ],
    standaloneValue: "$129.90–$139.90",
    saveNote: "Packaged together at $169.99",
    stripeUrl: null,
    email: "founder@gputnammusic.com",
    emailSubject: "Wedding VOW Pack — Family Circle Request",
    highlight: true,
  },
  {
    id: "celebration",
    tier: "Full Celebration",
    price: "$299.99",
    kicker: "The complete wedding music experience",
    description:
      "Everything in Family Circle, plus Guest mKs for up to 10 guests. The full K-KUT wedding suite — every role, every moment, every music touch point covered.",
    includes: [
      "Wedding Song / PIX",
      "Ceremony KK",
      "Couple’s Choice KK or KK-Kombo",
      "Wedding Party KKs (up to 4)",
      "Family Thank-You KKs (up to 4)",
      "Guest mKs (up to 10)",
      "MC-BOT role matching for all recipients",
    ],
    standaloneValue: "$159.80–$169.80",
    saveNote: "Packaged together at $299.99",
    stripeUrl: null,
    email: "founder@gputnammusic.com",
    emailSubject: "Wedding VOW Pack — Full Celebration Request",
    highlight: false,
  },
] as const;

export default function WeddingVowPacksPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-amber-50 px-4 py-10 font-sans">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between text-xs tracking-widest uppercase text-amber-500/60">
        <span>K-KUT</span>
        <span>Wedding VOW Packs</span>
      </div>

      {/* Hero */}
      <div className="max-w-2xl mx-auto mb-10 bg-neutral-900 border border-amber-500/20 rounded-2xl p-8">
        <p className="text-xs tracking-widest uppercase text-amber-500 mb-3">MC</p>
        <h1 className="text-3xl font-bold text-amber-100 mb-4">Wedding VOW Packs</h1>
        <p className="text-amber-50/70 text-base leading-relaxed">
          Real music moments for every part of your day. One Wedding Song. Ceremony KKs. Couple’s
          Choice. Wedding Party. Family Thank-You. Guest mKs. MC-BOT guides each selection —
          calm, private, role by role.
        </p>
      </div>

      {/* Standalone Value Reference */}
      <div className="max-w-2xl mx-auto mb-10 bg-neutral-900 border border-amber-500/10 rounded-xl p-6">
        <p className="text-xs tracking-widest uppercase text-amber-500/60 mb-3">Standalone Value</p>
        <p className="text-amber-50/50 text-xs mb-4">Each item below is available individually. The VOW Packs bundle them at a significant saving.</p>
        <div className="space-y-2">
          {STANDALONE_VALUES.map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-amber-50/60">{item.label}</span>
              <span className="text-amber-300 font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-2xl mx-auto space-y-6">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative bg-neutral-900 border rounded-2xl p-8 ${
              pkg.highlight
                ? "border-amber-400/60 shadow-lg shadow-amber-900/20"
                : "border-amber-500/20"
            }`}
          >
            {pkg.highlight && (
              <div className="absolute -top-3 left-6">
                <span className="bg-amber-400 text-neutral-950 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                  Most Complete
                </span>
              </div>
            )}

            <p className="text-xs tracking-widest uppercase text-amber-500/60 mb-1">{pkg.kicker}</p>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-100">{pkg.tier}</h2>
              <span className="text-2xl font-bold text-amber-300">{pkg.price}</span>
            </div>

            <p className="text-amber-50/70 text-sm leading-relaxed mb-5">{pkg.description}</p>

            {/* Includes */}
            <ul className="space-y-1.5 mb-5">
              {pkg.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm font-semibold text-amber-50/70">
                  <span className="mt-0.5 text-amber-300">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Value comparison */}
            <div className="text-xs text-amber-50/40 mb-5 border-t border-amber-500/10 pt-4">
              Standalone value:{" "}
              <span className="text-amber-50/60 line-through">{pkg.standaloneValue}</span>
              {" "}—{" "}
              <span className="text-amber-300 font-semibold">{pkg.saveNote}</span>
            </div>

            {/* CTA */}
            {pkg.stripeUrl ? (
              <Link
                href={pkg.stripeUrl}
                className="block w-full text-center bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm tracking-widest uppercase py-3 rounded-xl transition"
              >
                Order {pkg.tier} — {pkg.price}
              </Link>
            ) : (
              <Link
                href={`mailto:${pkg.email}?subject=${encodeURIComponent(pkg.emailSubject)}`}
                className="block w-full text-center border border-amber-400/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 font-bold text-sm tracking-widest uppercase py-3 rounded-xl transition"
              >
                Request {pkg.tier} by Email
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="max-w-2xl mx-auto mt-12 text-center text-xs text-amber-50/30 leading-relaxed">
        MC guides each selection privately. No source titles, artist names, or audio URLs are
        exposed during the process. All VOW Pack items are delivered as private K-KUT links —
        not downloadable files.
      </div>
    </main>
  );
}
