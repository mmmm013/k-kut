import ApprovedPublicOptionGrid from "@/components/ApprovedPublicOptionGrid";
import { loadApprovedPublicOptions } from "@/lib/publication-bridge/approvedPublicOptions";

export const metadata = {
  title: "K-UPID HUGs | G Putnam Music",
  description:
    "Send a bold romantic K-UPID HUG from MIAL-approved GPM music inventory.",
};

const KUPID_LEVELS = ["Desire / Passion", "Physical Spark", "Private Intimate"];

export default function KupidPage() {
  const records = loadApprovedPublicOptions("/kupid");

  return (
    <main className="min-h-screen bg-[#09050d] text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#2b1430] via-[#140819] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.48em] text-[#FFD54F]">
            G Putnam Music
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            K-UPID HUGs
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            Send desire, passion, and physical spark as a real GPM music HUG.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            This route reads approved IIs from the MIAL publication bridge. It does not use a
            hand-written title list.
          </p>
        </header>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD54F]">
            K-UPID Matching
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {KUPID_LEVELS.map((label) => (
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
          emptyTitle="No MIAL-approved K-UPID IIs are published yet."
          buttonLabel="Send this K-UPID HUG"
        />

        <footer className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/62">
          <strong className="text-white">GPM HUG delivery:</strong> private link, real music,
          no AI voice, no download required.
        </footer>
      </section>
    </main>
  );
}
