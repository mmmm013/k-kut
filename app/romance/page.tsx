import ApprovedPublicOptionGrid from "@/components/ApprovedPublicOptionGrid";
import { loadApprovedPublicOptions } from "@/lib/publication-bridge/approvedPublicOptions";

export const metadata = {
  title: "K-KUT Romance Levels | G Putnam Music",
  description:
    "Choose a Romance Level and send a MIAL-approved GPM music moment as a K-KUT HUG.",
};

export const dynamic = "force-dynamic";

const ROMANCE_LEVELS = [
  "Gentle Affection",
  "New Love",
  "Committed Love",
  "Longtime Love",
  "Missing You",
  "Repair / Apology",
  "Desire / Passion",
  "Anniversary",
  "Wedding / Vow-Level",
  "Private Intimate",
];

export default function RomancePage() {
  const records = loadApprovedPublicOptions("/romance");

  return (
    <main className="min-h-screen bg-[#0b0610] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#2b1430] via-[#140819] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.48em] text-[#FFD54F]">
            G Putnam Music
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            K-KUT Romance Levels
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            Choose the level. Hear the moment. Send a real GPM HUG.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            Every option below comes from the MIAL-controlled publication bridge after II audio,
            source lineage, route fit, and release approval are proven.
          </p>
        </header>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Romance Matching Schema
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {ROMANCE_LEVELS.map((level) => (
              <div
                key={level}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white/80"
              >
                {level}
              </div>
            ))}
          </div>
        </section>

        <ApprovedPublicOptionGrid records={records} />

        <footer className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/62">
          <strong className="text-white">GPM HUG delivery:</strong> private link, real music,
          no AI voice, no download required.
        </footer>
      </section>
    </main>
  );
}
