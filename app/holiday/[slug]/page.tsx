import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import seasonalCampaigns from "@/data/campaigns/seasonal-campaigns.json";
import { holidays, type HolidaySlug } from "@/lib/holidaySeeds";

type Props = {
  params: Promise<{ slug: string }>;
};

// ─── Static Params ──────────────────────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return Object.keys(holidays).map((slug) => ({ slug }));
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const holiday = holidays[slug as HolidaySlug];

  if (!holiday) {
    return {
      title: "Holiday HUG | K-KUT",
      description: "Discover focused music moments for every holiday.",
    };
  }

  return {
    title: `${holiday.title} HUG | K-KUT`,
    description: holiday.line,
    openGraph: {
      title: `${holiday.title} HUG | K-KUT`,
      description: holiday.line,
      url: `https://k-kut.com/holiday/${slug}`,
      siteName: "K-KUT",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${holiday.title} HUG | K-KUT`,
      description: holiday.line,
    },
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────────────────────────
export default async function HolidayCategoryPage({ params }: Props) {
  const { slug } = await params;
  const holiday = holidays[slug as HolidaySlug];

  if (!holiday) {
    notFound();
  }

  const campaign = seasonalCampaigns.campaigns.find(
    (item) => item.holiday_slug === slug,
  );

  // Derive per-holiday audio src; fall back to the universal welcome track
  const audioSrc =
    "audioSrc" in holiday && holiday.audioSrc
      ? (holiday.audioSrc as string)
      : "/audio/kleigh/guide-final/33-welcome.m4a";

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

        <section className="mt-5 rounded-[1.5rem] border border-amber-300/20 bg-black/25 p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Guide
          </p>
          <p className="mt-2 text-lg font-black leading-7 text-amber-50">
            Listen first, then choose the closest holiday intent.
          </p>
          <audio
            className="mt-4 w-full"
            controls
            preload="none"
            src={audioSrc}
          />
        </section>

        <section className="mt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Feeling paths
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Choose the closest intent.
              </h2>
            </div>
            <Link
              href="/holiday"
              className="text-sm font-black uppercase tracking-[0.18em] text-amber-400 underline underline-offset-4"
            >
              All Holiday HUGs
            </Link>
          </div>

          {"candidatePix" in holiday ? (
            <div className="mt-6 rounded-[1.5rem] border border-amber-300/20 bg-black/25 p-5">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Candidate song moments
              </p>
              <ul className="mt-3 space-y-1 text-amber-50/80">
                {holiday.candidatePix.map((pix) => (
                  <li key={pix} className="text-sm">
                    &bull; {pix}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {holiday.paths.map((path) => (
              <Link
                key={path}
                href={`/holiday/${slug}/${encodeURIComponent(
                  path.toLowerCase().replace(/\s+/g, "-"),
                )}`}
                className="rounded-[1.5rem] border border-amber-300/20 bg-[#22101f] p-5 transition hover:border-amber-300/50 hover:bg-[#2e1628]"
              >
                <p className="text-xl font-black text-amber-50">{path}</p>
                <p className="mt-1 text-sm text-amber-200/70">
                  A focused music HUG path for this holiday moment.
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href={`/holiday/${slug}/next`}
              className="inline-block rounded-full bg-amber-400 px-8 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-amber-300"
            >
              Next
            </Link>
          </div>
        </section>

        {campaign ? (
          <>
            <section className="mt-10 rounded-[1.5rem] border border-amber-300/20 bg-[#22101f] p-6 sm:p-9">
              <h2 className="text-2xl font-black text-amber-50">
                {campaign.public_title}
              </h2>
              <p className="mt-2 text-amber-200/80">{campaign.public_note}</p>
              <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-amber-400">
                Season status: {campaign.status}
              </p>
              <div className="mt-4 flex gap-4">
                {campaign.status === "archived" ? (
                  <Link
                    href={`/archive/${campaign.holiday_slug}`}
                    className="rounded-full border border-amber-300/40 px-6 py-2 text-sm font-black uppercase tracking-[0.18em] text-amber-300 transition hover:border-amber-300"
                  >
                    Open archive
                  </Link>
                ) : null}
                {campaign.status === "active" && campaign.checkout_enabled ? (
                  <Link
                    href={`/collection/${campaign.holiday_slug}`}
                    className="rounded-full bg-amber-400 px-6 py-2 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-amber-300"
                  >
                    Open active collection
                  </Link>
                ) : null}
                <Link
                  href="/find"
                  className="rounded-full border border-amber-300/40 px-6 py-2 text-sm font-black uppercase tracking-[0.18em] text-amber-300 transition hover:border-amber-300"
                >
                  Find the Right Words
                </Link>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="mt-10 rounded-[1.5rem] border border-amber-300/20 bg-[#22101f] p-6 sm:p-9">
              <h2 className="text-2xl font-black text-amber-50">
                Featured holiday HUG collections will go here.
              </h2>
              <p className="mt-2 text-amber-200/80">
                This holiday page is available, but no seasonal campaign is
                active yet.
              </p>
              <div className="mt-4 flex gap-4">
                <Link
                  href="/find"
                  className="rounded-full bg-amber-400 px-6 py-2 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-amber-300"
                >
                  Find the Right Words
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-amber-300/40 px-6 py-2 text-sm font-black uppercase tracking-[0.18em] text-amber-300 transition hover:border-amber-300"
                >
                  Back home
                </Link>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
