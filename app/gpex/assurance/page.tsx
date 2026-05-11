import Link from "next/link";
import { GPEX_ASSURANCE_STI } from "@/lib/gpex/assuranceSti";

export default function GpexAssurancePage() {
  return (
    <main className="min-h-screen bg-[#140904] px-5 py-10 text-amber-50">
      <section className="mx-auto max-w-4xl rounded-[2rem] border border-amber-200/15 bg-[#2a1308] p-6 shadow-2xl md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">
          {GPEX_ASSURANCE_STI.label}
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
          {GPEX_ASSURANCE_STI.title}
        </h1>

        <p className="mt-4 text-xl font-black text-amber-200">
          {GPEX_ASSURANCE_STI.subtitle}
        </p>

        <section className="mt-8 rounded-3xl bg-amber-300 p-6 text-[#211004]">
          <p className="text-xs font-black uppercase tracking-[0.3em]">
            Founder independence
          </p>
          <p className="mt-3 text-xl font-black leading-snug">
            GPEx is independent. GPEx is not a franchise. No outside company tells GPEx what decisions to make.
          </p>
          <p className="mt-4 text-lg font-black leading-relaxed">
            GPEx is founder-operated, like a ma-and-pa store: personal, accountable, practical,
            and built to serve the customer directly.
          </p>
          <p className="mt-4 text-lg font-black leading-relaxed">
            At its core, GPEx is about love — love shown through clear work, fair process,
            useful tools, honest permission, and respect for the person using the system.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-amber-200/15 bg-[#1f0d05] p-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            STI-controlled trust asset
          </p>
          <p className="mt-3 text-xl font-black leading-snug text-amber-100">
            This assurance is a standard GPEx trust item for GPMDs, ALL. It should appear wherever
            a user is asked for permission, contact, payment, delivery identity, intake, demo access,
            review access, or transaction information.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {GPEX_ASSURANCE_STI.promise.map((line) => (
            <article key={line} className="rounded-3xl border border-amber-200/15 bg-[#1f0d05] p-5">
              <p className="text-lg font-black leading-relaxed text-amber-100">{line}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-amber-200/15 bg-[#1f0d05] p-6">
          <h2 className="text-2xl font-black text-amber-100">Display rule</h2>
          <ul className="mt-4 space-y-3 text-base font-bold leading-relaxed text-amber-100/75">
            {GPEX_ASSURANCE_STI.doctrine.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-3xl bg-amber-300 p-6 text-[#211004]">
          <p className="text-xs font-black uppercase tracking-[0.3em]">
            For K-KUT HUG transactions
          </p>
          <p className="mt-3 text-xl font-black leading-snug">
            {GPEX_ASSURANCE_STI.hugPermissionLine}
          </p>
        </section>

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <Link
            href="/hug"
            className="rounded-2xl bg-amber-300 px-6 py-4 text-center text-base font-black text-[#211004]"
          >
            Return to HUG
          </Link>

          <Link
            href="/demo"
            className="rounded-2xl border border-amber-200/20 px-6 py-4 text-center text-base font-black text-amber-100"
          >
            View demo access
          </Link>
        </div>
      </section>
    </main>
  );
}
