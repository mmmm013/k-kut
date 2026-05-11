import Link from "next/link";

export default function PrivateHugPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/50">
          K-KUT HUG
        </p>
        <h1 className="mt-4 text-3xl font-black">Private HUG link required</h1>
        <p className="mt-4 text-white/70">
          This page no longer creates or falls back to seasonal audio paths.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/hug" className="rounded-full bg-white px-5 py-3 font-black text-black">
            Open HUG
          </Link>
          <Link href="/find" className="rounded-full border border-white/20 px-5 py-3 font-black text-white">
            Find a HUG
          </Link>
        </div>
      </section>
    </main>
  );
}
