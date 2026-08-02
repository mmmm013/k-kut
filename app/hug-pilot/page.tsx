import type { Metadata } from "next";
import pilot from "@/data/hug-pilot/bic-hug-revenue-pilot-v001.json";

export const metadata: Metadata = {
  title: "Two Ready HUGs | K-KUT",
  description:
    "Two evidence-controlled HUG choices with exact music identity and governed checkout.",
};

const needLabels: Record<string, string> = {
  warmth_care: "Warmth & care",
  romantic_devotion: "Romantic devotion",
  celebration_new_beginning: "Commitment & celebration",
  physical_spark: "Adult romantic spark",
};

function price(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function HugPilotPage() {
  return (
    <main className="min-h-screen bg-[#09070B] px-5 py-10 text-[#FFF8E1] sm:px-8">
      <section className="mx-auto max-w-5xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD54F]">
          K-KUT · BIC-controlled pilot
        </p>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">
          Two ready HUG paths
        </h1>
        <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-[#D7CCC8]">
          Start with what the person needs. Hear the exact governed music choice.
          Need direction and music identity stay separate all the way through
          checkout.
        </p>

        <div className="mt-5 rounded-2xl border border-[#FFD54F]/35 bg-[#120A06] p-5 text-sm font-bold leading-7 text-[#EFEBE9]">
          <p>
            These two HUGs come from separately approved reusable IIs outside
            the held 13HUGz seed packet. The current 104 13HUGz associations
            remain held for fresh per-item matching proof.
          </p>
          <p className="mt-2">
            A third candidate was removed after its song meaning was found to
            conflict with the assigned customer need. It remains held for
            song → BLK → NBLK reprocessing.
          </p>
          <p className="mt-2 text-[#FFD54F]">
            HUG package: $7.99 · exact KK identity preserved · governed K-KUT
            checkout
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {pilot.records.map((record) => {
            const needIds = [
              record.primary_need_id,
              ...record.secondary_need_ids,
            ];

            return (
              <article
                key={record.ii_id}
                className="flex flex-col rounded-[1.75rem] border border-[#FFD54F]/30 bg-[#120A06] p-6 shadow-xl"
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD54F]">
                  {needIds.map((needId) => needLabels[needId] || needId).join(" · ")}
                </p>
                <h2 className="mt-3 text-2xl font-black text-white">
                  {record.display_title}
                </h2>
                <p className="mt-3 min-h-24 text-sm font-bold leading-6 text-[#D7CCC8]">
                  {record.customer_interpretation}
                </p>

                <audio
                  className="mt-5 w-full"
                  controls
                  controlsList="nodownload"
                  preload="none"
                  src={record.audio_url}
                  aria-label={`Hear ${record.display_title}`}
                >
                  Your browser does not support audio playback.
                </audio>

                <details className="mt-5 rounded-xl border border-[#8D6E63]/40 bg-black/20 p-4 text-sm">
                  <summary className="cursor-pointer font-black text-[#FFD54F]">
                    Why this direction fits
                  </summary>
                  <ul className="mt-3 space-y-2 font-bold leading-6 text-[#EFEBE9]">
                    {record.positive_evidence.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-[#BCAAA4]">
                    Matching boundaries
                  </p>
                  <ul className="mt-2 space-y-2 text-xs font-bold leading-5 text-[#D7CCC8]">
                    {record.exclusions.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </details>

                <form action="/checkout" method="post" className="mt-auto pt-6">
                  <input type="hidden" name="ii" value={record.ii_id} />
                  <input type="hidden" name="offer" value="kk" />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#FFD54F] px-5 py-4 text-base font-black text-black transition hover:bg-[#FFE082]"
                  >
                    Send this HUG · {price(record.price_cents)}
                  </button>
                </form>
              </article>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs font-bold leading-6 text-[#BCAAA4]">
          Payment does not rename or rebuild the music. K-KUT carries the exact
          selected II into the pending-order and fulfillment record. No test
          order is created by viewing or playing this page.
        </p>
      </section>
    </main>
  );
}
