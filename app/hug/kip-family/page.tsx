import Link from "next/link";

export default function ArchivedHugPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/50">
          K-KUT HUG
        </p>
        <h1 className="mt-4 text-3xl font-black">Private HUG path archived</h1>
        <p className="mt-4 text-white/70">
          This private seasonal HUG path is no longer active on the public site.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/hug" className="rounded-full bg-white px-5 py-3 font-black text-black">
            Open HUG
          </Link>
          <Link href="/holiday" className="rounded-full border border-white/20 px-5 py-3 font-black text-white">
            Open Holiday
          </Link>
        </div>
      </section>
    </main>
  );
}
