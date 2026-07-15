import Link from "next/link";
import ApprovedPublicOptionGrid from "@/components/ApprovedPublicOptionGrid";
import { loadApprovedPublicOptions } from "@/lib/publication-bridge/approvedPublicOptions";

export default function ApprovedPersonalRoutePage({
  publicRoute,
  title,
  subtitle,
}: {
  publicRoute: string;
  title: string;
  subtitle: string;
}) {
  const records = loadApprovedPublicOptions(publicRoute);

  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#241223] via-[#120816] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            {title} K-KUT HUGs
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            {subtitle}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            Every displayed option is read from the MIAL-controlled publication bridge after
            source lineage, meaning, boundary, audio, route fit, and release approval pass.
          </p>
        </header>

        <ApprovedPublicOptionGrid
          records={records}
          emptyTitle={`No MIAL-approved ${title} IIs are published yet.`}
          buttonLabel={`Send this ${title} HUG`}
        />

        <footer className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/62">
          <Link className="font-black text-[#FFD54F]" href="/find">
            Back to HUG guide
          </Link>
        </footer>
      </section>
    </main>
  );
}
