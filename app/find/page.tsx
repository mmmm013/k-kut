export const dynamic = "force-dynamic";

import fs from "node:fs";
import path from "node:path";
import Link from "next/link";

type BridgeRecord = {
  public_option_id: string;
  source_pix_id_or_track_id: string;
  display_title: string;
  interpretation_summary: string;
  action_object_meaning: {
    verb: string;
    object: string;
    situation: string;
  };
  buyer_scenario_ids: string[];
  intent_lane: string;
  audio_delivery_url: string;
  stripe_url_if_payment_allowed: string;
  public_route: string;
  more_for_this_feeling_allowed: boolean;
  more_from_this_track_allowed: boolean;
};

type SearchParams = {
  feeling?: string | string[];
  track?: string | string[];
};

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

function loadBridgeRecords(): BridgeRecord[] {
  const filePath = path.join(
    process.cwd(),
    "data/publication-bridge/public-option-records.generated.json"
  );

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    records?: BridgeRecord[];
  };

  return Array.isArray(parsed.records) ? parsed.records : [];
}

function titleCaseSlug(value: string) {
  return value
    .replace(/_/g, "-")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default async function FindPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const bridgeRecords = loadBridgeRecords();
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const activeFeeling = getSingleParam(resolvedSearchParams.feeling);
  const activeTrack = getSingleParam(resolvedSearchParams.track);

  const filteredRecords = bridgeRecords.filter((record) => {
    if (activeFeeling && record.intent_lane !== activeFeeling) return false;
    if (activeTrack && record.source_pix_id_or_track_id !== activeTrack) {
      return false;
    }
    return true;
  });

  const filterLabel = activeFeeling
    ? `More for this feeling: ${titleCaseSlug(activeFeeling)}`
    : activeTrack
      ? "More from this track"
      : "All approved HUG options";

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
            Pick one need. MC-BOT will show approved HUG options with music you can hear next.
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
                    Options
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <section className="mt-8 rounded-[2rem] border border-[#D4A017]/30 bg-[#160D08] p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#D4A017]">
            Approved HUG options
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#FFD36A]">
            Hear approved K-KUT HUG options
          </h2>

          <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-[#F5E6C8]/75">
            These options are approved for public K-KUT HUG browsing. No raw inventory, no unapproved router candidates, and no high-risk Sympathy results appear here.
          </p>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#D4A017]/20 bg-[#24180F] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
                Current view
              </p>
              <p className="mt-1 text-sm font-black text-[#F5E6C8]/85">
                {filterLabel} — {filteredRecords.length} option
                {filteredRecords.length === 1 ? "" : "s"}
              </p>
            </div>

            {(activeFeeling || activeTrack) && (
              <Link
                href="/find"
                className="rounded-xl border border-[#D4A017]/30 px-4 py-3 text-center text-sm font-black text-[#FFD36A] hover:bg-[#D4A017]/10"
              >
                Show all approved options
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {filteredRecords.map((record) => (
              <article
                key={record.public_option_id}
                className="rounded-2xl border border-[#D4A017]/25 bg-[#24180F] p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
                  {titleCaseSlug(record.intent_lane)}
                </p>

                <h3 className="mt-2 text-2xl font-black text-[#FFD36A]">
                  {record.display_title}
                </h3>

                <p className="mt-2 text-sm font-bold leading-relaxed text-[#F5E6C8]/75">
                  {record.interpretation_summary}
                </p>

                <div className="mt-4 rounded-xl border border-[#D4A017]/20 bg-[#160D08] p-3">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D4A017]">
                    Match shape
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#F5E6C8]/75">
                    {record.action_object_meaning.verb}{" "}
                    {record.action_object_meaning.object} —{" "}
                    {record.action_object_meaning.situation}
                  </p>
                </div>

                <audio
                  controls
                  preload="none"
                  className="mt-4 w-full"
                  src={record.audio_delivery_url}
                >
                  <a href={record.audio_delivery_url}>Play audio</a>
                </audio>

                <div className="mt-4 flex flex-wrap gap-2">
                  {record.buyer_scenario_ids.map((scenario) => (
                    <span
                      key={scenario}
                      className="rounded-full border border-[#D4A017]/25 px-3 py-1 text-xs font-black text-[#F5E6C8]/70"
                    >
                      {titleCaseSlug(scenario)}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {record.more_for_this_feeling_allowed && (
                    <Link
                      href={`/find?feeling=${encodeURIComponent(
                        record.intent_lane
                      )}`}
                      className="rounded-xl border border-[#D4A017]/30 px-4 py-3 text-center text-sm font-black text-[#FFD36A] hover:bg-[#D4A017]/10"
                    >
                      More for this feeling
                    </Link>
                  )}

                  {record.more_from_this_track_allowed && (
                    <Link
                      href={`/find?track=${encodeURIComponent(
                        record.source_pix_id_or_track_id
                      )}`}
                      className="rounded-xl border border-[#D4A017]/30 px-4 py-3 text-center text-sm font-black text-[#FFD36A] hover:bg-[#D4A017]/10"
                    >
                      More from this track
                    </Link>
                  )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Link
                    href={record.public_route}
                    className="rounded-xl bg-[#D4A017] px-4 py-3 text-center text-sm font-black text-[#1A120B] hover:bg-[#FFD36A]"
                  >
                    View route
                  </Link>

                  <a
                    href={record.stripe_url_if_payment_allowed}
                    className="rounded-xl border border-[#D4A017]/40 px-4 py-3 text-center text-sm font-black text-[#FFD36A] hover:bg-[#D4A017]/10"
                  >
                    Send this HUG
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-[#D4A017]/25 bg-[#160D08] p-5">
          <p className="text-sm font-bold leading-relaxed text-[#F5E6C8]/75">
            MC-BOT keeps this simple: pick the need, review approved HUG options, hear the music, then choose what fits.
          </p>
        </div>
      </section>
    </main>
  );
}
