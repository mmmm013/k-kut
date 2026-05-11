import Link from "next/link";
import { AssuranceLink } from "@/components/gpex/AssuranceLink";
import { notFound } from "next/navigation";

const DEMOS = {
  buyer: {
    label: "Buyer Demo Access",
    audience: "Regular K-KUT / HUG buyer",
    purpose: "Shows the guided HUG path, sample options, and private-link delivery concept.",
    access: "Public",
    next: "/hug",
    nextLabel: "Open regular HUG flow",
  },
  holiday: {
    label: "Holiday Demo Access",
    audience: "Holiday buyer",
    purpose: "Shows how a timely holiday can be featured while older holidays remain static venues.",
    access: "Public / seasonal feature",
    next: "/holiday",
    nextLabel: "Open holiday venues",
  },
  wedding: {
    label: "Wedding Demo Access",
    audience: "Couple, planner, family buyer, or wedding party",
    purpose: "Shows ceremonial HUG use, Wedding Track Pack logic, and private emotional delivery.",
    access: "Purpose-routed",
    next: "/personal/wedding",
    nextLabel: "Open wedding venue",
  },
  sponsor: {
    label: "Sponsor / Partner Demo Access",
    audience: "Sponsor, partner, artist, or organization",
    purpose: "Shows how HUGs can be shaped for a specific audience or campaign without exposing restricted inventory.",
    access: "Purpose-routed",
    next: "/hug",
    nextLabel: "Open buyer flow",
  },
  attorney: {
    label: "Attorney / IP Demo Access",
    audience: "Patent attorney, legal reviewer, or invention advisor",
    purpose: "Shows invention-facing context without making protected PIX, mKs, KPDs, LLFs, or chamber details public.",
    access: "Restricted",
    next: "/invention",
    nextLabel: "Open invention overview",
  },
  manufacturing: {
    label: "Manufacturing Demo Access",
    audience: "Town, maker, facility, grant partner, or manufacturing contact",
    purpose: "Shows practical proof-path context for HUG Chamber / HUG Charm manufacturing conversations.",
    access: "Restricted / meeting-routed",
    next: "/invention",
    nextLabel: "Open invention overview",
  },
  internal: {
    label: "Admin / Internal Demo Access",
    audience: "Gregory / internal helpers",
    purpose: "Inventory, audio health, KKr review, PIX, mK, KPD, LLF, and fulfillment readiness.",
    access: "Internal only",
    next: "/admin/hug-health",
    nextLabel: "Open HUG health",
  },
} as const;

type DemoKey = keyof typeof DEMOS;

export function generateStaticParams() {
  return Object.keys(DEMOS).map((context) => ({ context }));
}

export default async function DemoContextPage({
  params,
}: {
  params: Promise<{ context: string }>;
}) {
  const { context } = await params;
  const demo = DEMOS[context as DemoKey];

  if (!demo) notFound();

  return (
    <main className="min-h-screen bg-[#140904] px-5 py-10 text-amber-50">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-amber-200/15 bg-[#2a1308] p-6 shadow-2xl md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">
          K-KUT demo access
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
          {demo.label}
        </h1>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card title="Audience" body={demo.audience} />
          <Card title="Access" body={demo.access} />
          <Card title="Purpose" body={demo.purpose} />
        </div>

        <section className="mt-8 rounded-3xl bg-amber-300 p-6 text-[#211004]">
          <p className="text-xs font-black uppercase tracking-[0.3em]">
            Demo rule
          </p>
          <p className="mt-3 text-xl font-black leading-snug">
            Demo access is routed by client need. Public buyers see simple HUG demos.
            Purpose viewers get tailored demos. Restricted viewers do not receive public
            PIX, mK, KPD, LLF, or chamber-system detail unless approved.
          </p>
        </section>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <Link
            href={demo.next}
            className="rounded-2xl bg-amber-300 px-6 py-4 text-center text-base font-black text-[#211004]"
          >
            {demo.nextLabel}
          </Link>

          <Link
            href="/demo"
            className="rounded-2xl border border-amber-200/20 px-6 py-4 text-center text-base font-black text-amber-100"
          >
            Back to demo home
          </Link>
        </div>
                <div className="mt-8">
            <AssuranceLink label="View GPEx Assurance" />
          </div>
        </section>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-amber-200/15 bg-[#1f0d05] p-5">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">
        {title}
      </p>
      <p className="mt-3 text-base font-bold leading-relaxed text-amber-100/80">
        {body}
      </p>
    </div>
  );
}
