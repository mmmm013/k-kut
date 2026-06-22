import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

type HolidayCard = {
  slug: string;
  display_title: string;
  intent: string;
  target: string;
  status: string;
  source_rule: string;
};

type HolidayIndex = {
  holidays: HolidayCard[];
};

type AudioCandidate = {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  candidate_type: string;
  source_family: string;
  fit: string;
  ownership_note: string;
};

type HolidayAudioEntry = {
  status: string;
  public_note: string;
  candidates: AudioCandidate[];
};

type HolidayAudioRegistry = {
  holidays: Record<string, HolidayAudioEntry | undefined>;
};

const feelingMenus: Record<string, string[]> = {
  christmas: [
    "Warm Family",
    "Wonder",
    "Giving",
    "Nostalgia",
    "Faith-Friendly",
    "Soft Missing You",
    "Home",
    "Love",
  ],
  "mothers-day": [
    "Thank You",
    "Gentle Gratitude",
    "Love",
    "You Were There",
    "Family Warmth",
    "Soft Support",
    "Repair",
    "Proud of You",
  ],
  "fathers-day": [
    "Respect",
    "Strength",
    "Steady Dad",
    "Legacy",
    "Proud of You",
    "Keep Going",
    "Missing Dad",
    "Complicated / Repair",
  ],
  "valentines-day": [
    "I Love You",
    "I Choose You",
    "Romance",
    "Devotion",
    "Longing",
    "Forever",
    "Tender",
    "Playful",
  ],
  thanksgiving: [
    "Thankful for You",
    "Family Warmth",
    "Home",
    "Togetherness",
    "Blessing",
    "Memory",
    "Appreciation",
    "Soft Gratitude",
  ],
  "new-year": [
    "Fresh Start",
    "Hope",
    "Keep Going",
    "Reflection",
    "Celebration",
    "New Beginning",
    "Believe Again",
    "Goodbye / Hello",
  ],
  easter: [
    "Hope",
    "Renewal",
    "Light",
    "Family",
    "Faith-Friendly",
    "Spring",
    "Gentle Joy",
    "Peace",
  ],
  "memorial-remembrance": [
    "Missing You",
    "Honor",
    "Memory",
    "Legacy",
    "Soft Grief",
    "Comfort",
    "Never Forgotten",
    "Still With Us",
  ],
};

function readJson<T>(relativePath: string): T {
  const file = path.join(process.cwd(), relativePath);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function getHolidayIndex(): HolidayIndex {
  return readJson<HolidayIndex>(
    "data/holiday-clean-rebuild/lists/holiday-index-v001.json"
  );
}

function getAudioRegistry(): HolidayAudioRegistry {
  return readJson<HolidayAudioRegistry>(
    "data/holiday-clean-rebuild/lists/holiday-audio-candidates-v001.json"
  );
}

function getHoliday(slug: string): HolidayCard | undefined {
  return getHolidayIndex().holidays.find((holiday) => holiday.slug === slug);
}

function getPublicStatus(slug: string, audioEntry: HolidayAudioEntry): string {
  const count = audioEntry.candidates.length;

  if (count >= 8) {
    return "Ready to preview";
  }

  if (slug === "valentines-day" && count > 0) {
    return "Preview candidates under review";
  }

  if (count > 0) {
    return "Preview set started";
  }

  return "K-KUT set being curated";
}

function getPublicNote(slug: string, audioEntry: HolidayAudioEntry): string {
  const count = audioEntry.candidates.length;

  if (count >= 8) {
    return "Press play, compare the feeling, then choose the K-KUT that fits.";
  }

  if (slug === "valentines-day" && count > 0) {
    return "Romance previews are connected for listening, but final sendable K-KUTs need owner review before public sale.";
  }

  if (count > 0) {
    return "A starter preview set is connected. More K-KUTs can be added as this holiday lane grows.";
  }

  return "This holiday lane is connected. The K-KUT preview set is being assembled so the page can stay clean instead of using the wrong audio.";
}

export function generateStaticParams() {
  return getHolidayIndex().holidays.map((holiday) => ({
    slug: holiday.slug,
  }));
}

export default async function HolidaySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const holiday = getHoliday(slug);

  if (!holiday) {
    notFound();
  }

  const audioEntry = getAudioRegistry().holidays[slug] ?? {
    status: "K-KUT set being curated",
    public_note: "This holiday lane is connected. The K-KUT preview set is being assembled.",
    candidates: [],
  };

  const candidates = audioEntry.candidates;
  const playableCount = candidates.length;
  const publicStatus = getPublicStatus(slug, audioEntry);
  const publicNote = getPublicNote(slug, audioEntry);
  const feelings = feelingMenus[slug] ?? [
    "Warm",
    "Gentle",
    "Strong",
    "Reflective",
    "Celebration",
    "Support",
    "Love",
    "Memory",
  ];

  return (
    <main className="min-h-screen bg-[#1b0f09] text-white">
      <section className="mx-auto max-w-6xl px-5 py-8">
        <a
          href="/holiday"
          className="inline-block rounded-full border border-[#7a5a2a] px-4 py-2 text-sm text-[#f6e6c8]"
        >
          ← Back to Holiday K-KUTs
        </a>

        <div className="mt-5 rounded-2xl border border-[#7a5a2a]/70 bg-[#2b190f] p-6 shadow-xl">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#FFD54F]">
            Holiday K-KUT
          </p>

          <h1 className="text-4xl font-black tracking-tight text-[#fff7df] md:text-5xl">
            {holiday.display_title}
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-[#f2dfbd]">
            {holiday.intent}
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <p className="rounded-xl bg-black/25 p-4 text-sm text-[#f6e6c8]">
              <span className="font-semibold text-[#FFD54F]">Status:</span>{" "}
              {publicStatus}
            </p>

            <p className="rounded-xl bg-black/25 p-4 text-sm text-[#f6e6c8]">
              <span className="font-semibold text-[#FFD54F]">Preview count:</span>{" "}
              {playableCount > 0
                ? `${playableCount} connected audio candidate${playableCount === 1 ? "" : "s"}`
                : "Preview set in progress"}
            </p>
          </div>

          <p className="mt-4 rounded-xl bg-black/25 p-4 text-sm text-[#f6e6c8]">
            {publicNote}
          </p>

          {slug === "fathers-day" ? (
            <div className="mt-4 rounded-xl border border-[#FFD54F]/50 bg-[#FFD54F]/10 p-4 text-sm text-[#fff7df]">
              <p className="font-bold text-[#FFD54F]">
                Father’s Day feature — today only
              </p>
              <p className="mt-2">
                Use code <span className="font-bold">DAD20</span> for 20% off today.
              </p>
            </div>
          ) : null}

          <p className="mt-4 rounded-xl bg-black/25 p-4 text-sm text-[#f6e6c8]">
            Holiday and Personal are separate lanes. Theme match only. No holiday ownership.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-[#7a5a2a]/60 bg-[#3b2416] p-5">
          <h2 className="text-2xl font-bold text-[#fff7df]">
            Choose the feeling first
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {feelings.map((feeling) => (
              <span
                key={feeling}
                className="rounded-full border border-[#FFD54F]/40 bg-black/25 px-4 py-2 text-sm text-[#fff7df]"
              >
                {feeling}
              </span>
            ))}
          </div>
        </section>

        {candidates.length > 0 ? (
          <section className="mt-8 grid gap-4 md:grid-cols-2">
            {candidates.map((candidate) => (
              <article
                key={candidate.id}
                className="rounded-2xl border border-[#7a5a2a]/60 bg-[#3b2416] p-5 shadow-lg"
              >
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#FFD54F]">
                  K-KUT Preview
                </p>

                <h2 className="text-2xl font-bold text-[#fff7df]">
                  {candidate.title}
                </h2>

                <p className="mt-3 text-[#f2dfbd]">
                  {candidate.description}
                </p>

                <audio
                  className="mt-4 w-full"
                  controls
                  preload="none"
                  src={candidate.audio_url}
                />

                <p className="mt-3 rounded-xl bg-black/25 p-3 text-sm text-[#f6e6c8]">
                  <span className="font-semibold text-[#FFD54F]">Feeling fit:</span>{" "}
                  {candidate.fit}
                </p>

                {candidate.candidate_type === "KK" ? (
                  <a
                    href={`/checkout?kk=${candidate.id}`}
                    className="mt-4 inline-block rounded-full bg-[#FFD54F] px-5 py-3 font-semibold text-black"
                  >
                    Send this K-KUT
                  </a>
                ) : (
                  <p className="mt-4 rounded-xl border border-[#FFD54F]/40 p-3 text-sm text-[#fff7df]">
                    Preview only for now. Final sendable K-KUT needs owner review.
                  </p>
                )}
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-2xl border border-[#7a5a2a]/60 bg-[#3b2416] p-5">
            <h2 className="text-2xl font-bold text-[#fff7df]">
              Preview set being assembled
            </h2>

            <p className="mt-3 text-[#f2dfbd]">
              This holiday page is connected, but the public K-KUT audio set is still being curated.
              We will not fill this page with the wrong music just to make it look full.
            </p>

            <a
              href="/find"
              className="mt-5 inline-block rounded-full bg-[#FFD54F] px-5 py-3 font-semibold text-black"
            >
              Find another K-KUT
            </a>
          </section>
        )}
      </section>
    </main>
  );
}
