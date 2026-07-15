import ApprovedPublicOptionGrid from "@/components/ApprovedPublicOptionGrid";
import { loadApprovedPublicOptions } from "@/lib/publication-bridge/approvedPublicOptions";

export const metadata = {
  title: "Wedding K-KUT HUGs | G Putnam Music",
  description:
    "Send a wedding-ready GPM music HUG from MIAL-approved customer delivery inventory.",
};

const WEDDING_LEVELS = ["Wedding / Vow-Level", "First Dance", "Forever / Ceremony"];

export default function WeddingPage() {
  const records = loadApprovedPublicOptions("/wedding");

  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#2b1430] via-[#140819] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.48em] text-[#FFD54F]">
            G Putnam Music
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Wedding K-KUT HUGs
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            Send a real music moment for the wedding, vow, or first-dance feeling.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            This route reads only MIAL-approved II records whose audio, rights, route fit, and
            payment relationship pass the publication bridge.
          </p>
        </header>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            Wedding Matching
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {WEDDING_LEVELS.map((label) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold text-white/80"
              >
                {label}
              </div>
            ))}
          </div>
        </section>

        <ApprovedPublicOptionGrid
          records={records}
          emptyTitle="No MIAL-approved Wedding IIs are published yet."
          buttonLabel="Send this Wedding HUG"
        />

        <footer className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/62">
          <strong className="text-white">GPM HUG delivery:</strong> private link, real music,
          no AI voice, no download required.
        </footer>
      </section>
    </main>
  );
}
