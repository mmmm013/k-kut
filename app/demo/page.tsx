import Link from "next/link";
import { AssuranceLink } from "@/components/gpex/AssuranceLink";

const DEMO_LINKS = [
  ["buyer", "Buyer", "Regular public HUG buyer demo."],
  ["holiday", "Holiday", "Timely holiday venue demo."],
  ["wedding", "Wedding", "Purpose-routed wedding HUG demo."],
  ["sponsor", "Sponsor / Partner", "Campaign or partner demo without restricted inventory."],
  ["attorney", "Attorney / IP", "Restricted invention/IP-facing demo."],
  ["manufacturing", "Manufacturing", "Town or maker proof-path demo."],
  ["internal", "Internal", "Admin/helper inventory and readiness demo."],
] as const;

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#140904] px-5 py-10 text-amber-50">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-amber-200/15 bg-[#2a1308] p-6 shadow-2xl md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">
          K-KUT demo routing
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
          Demo access by client need.
        </h1>

        <p className="mt-5 max-w-3xl text-lg font-bold leading-relaxed text-amber-100/75">
          Public buyers get simple HUG demos. Holiday buyers get timely venues.
          Partners, attorneys, manufacturers, and internal helpers get purpose-routed
          access without exposing restricted PIX, mKs, KPDs, LLFs, or chamber-system detail.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {DEMO_LINKS.map(([slug, title, body]) => (
            <Link
              key={slug}
              href={`/demo/${slug}`}
              className="rounded-3xl border border-amber-200/15 bg-[#1f0d05] p-5 transition hover:border-amber-300 hover:bg-[#2d1609]"
            >
              <p className="text-xl font-black text-amber-100">{title}</p>
              <p className="mt-2 text-sm font-bold leading-relaxed text-amber-100/70">
                {body}
              </p>
            </Link>
          ))}
        </div>

        <Link
          href="/hug"
          className="mt-8 inline-block rounded-2xl bg-amber-300 px-6 py-4 text-base font-black text-[#211004]"
        >
          Open regular HUG flow
        </Link>
                <div className="mt-8">
            <AssuranceLink label="View GPEx Assurance" />
          </div>
        </section>
    </main>
  );
}
