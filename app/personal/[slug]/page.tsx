import Link from "next/link";
import ApprovedPublicOptionGrid from "@/components/ApprovedPublicOptionGrid";
import { loadApprovedPublicOptions } from "@/lib/publication-bridge/approvedPublicOptions";

export const dynamic = "force-dynamic";

const SENSITIVE_ROUTES = new Set([
  "sympathy",
  "grief",
  "memorial",
  "celebration-of-life",
]);

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function PersonalUseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = titleFromSlug(slug);
  const sensitive = SENSITIVE_ROUTES.has(slug);
  const records = loadApprovedPublicOptions(`/personal/${slug}`);

  return (
    <main className="min-h-screen bg-[#09070b] text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="rounded-[2rem] border border-[#FFD54F]/25 bg-gradient-to-br from-[#241223] via-[#120816] to-[#050307] p-6 shadow-2xl md:p-9">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
            G Putnam Music · Personal
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            {title} music moments
          </h1>
          <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-pink-100">
            {sensitive
              ? "This human moment requires an extra intent and recipient-safety review."
              : "Only exact music options that clear the current customer release gate appear below."}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/68">
            No generic substitute is shown. A player and payment button appear together only after meaning, rights, audio, route fit, and delivery proof all pass.
          </p>
        </header>

        <ApprovedPublicOptionGrid
          records={records}
          emptyTitle={`No exact ${title} music option is customer-ready yet.`}
        />

        <footer className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/62">
          <Link className="font-black text-[#FFD54F]" href="/personal">
            Back to Personal
          </Link>
        </footer>
      </section>
    </main>
  );
}
