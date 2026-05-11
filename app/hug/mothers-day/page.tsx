import Link from "next/link";

export default function MothersDayArchivePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/50">
          K-KUT Holiday HUG
        </p>
        <h1 className="mt-4 text-3xl font-black">Mother’s Day archive</h1>
        <p className="mt-4 text-white/70">
          This seasonal HUG path is archived. Public ordering and listening flow are closed for this season.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/holiday" className="rounded-full bg-white px-5 py-3 font-black text-black">
            Open Holiday
          </Link>
          <Link href="/hug" className="rounded-full border border-white/20 px-5 py-3 font-black text-white">
            Open HUG
          </Link>
        </div>
      </section>
    </main>
  );
}
