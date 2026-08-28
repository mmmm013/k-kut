import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "KKr Canary Authority Review",
  robots: { index: false, follow: false },
};

const candidates = [
  {
    title: "A LOVE LIKE THAT",
    id: "d3dfd13c-7421-4671-8261-0c735cb51f38",
    audio:
      "/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
  },
  {
    title: "YOUR HEART POUNDIN’",
    id: "1f016b4a-f85d-4945-b881-2e0f571e6a49",
    audio:
      "/ii-delivery/romance/your-heart-poundin-1f016b4a-f85d-4945-b881-2e0f571e6a49-bookend-twinkle.mp3",
  },
] as const;

type Props = {
  searchParams?: Promise<{ token?: string | string[] }>;
};

export default async function KkrAuthorityPage({ searchParams }: Props) {
  const params = await searchParams;
  const supplied = (
    Array.isArray(params?.token) ? params?.token[0] : params?.token
  )?.trim();
  const expected = process.env.ADMIN_PREVIEW_TOKEN?.trim();

  if (!expected || supplied !== expected) notFound();

  const token = encodeURIComponent(supplied);

  return (
    <main className="min-h-screen bg-stone-950 px-5 py-10 text-stone-100">
      <section className="mx-auto max-w-3xl space-y-7">
        <header className="rounded-3xl border border-amber-300/30 bg-stone-900 p-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            Internal KKr · Owner Review
          </p>
          <h1 className="mt-3 text-3xl font-black">
            Supabase Authority + Listening
          </h1>
          <p className="mt-3 leading-7 text-stone-300">
            This page uses the server’s existing Supabase connection. It does not
            require a Supabase, GitHub, Gmail, or ChatGPT login. Machine evidence
            and owner listening approval remain separate.
          </p>
          <a
            className="mt-5 inline-block rounded-xl bg-amber-300 px-4 py-3 font-black text-stone-950"
            href={"/api/admin/kkr-authority?token=" + token}
          >
            Read live authority report
          </a>
        </header>

        {candidates.map((candidate, index) => (
          <article
            key={candidate.id}
            className="rounded-3xl border border-stone-700 bg-stone-900 p-6"
          >
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">
              {index + 1} of {candidates.length}
            </p>
            <h2 className="mt-2 text-2xl font-black">{candidate.title}</h2>
            <p className="mt-2 break-all text-xs text-stone-400">
              {candidate.id}
            </p>
            <audio
              className="mt-5 w-full"
              controls
              preload="metadata"
              src={candidate.audio}
            />
            <p className="mt-4 text-sm leading-6 text-stone-300">
              Listen to the complete delivered file. Approval must cover the
              first vocal boundary, last vocal resonance, final Twinkle, and the
              exact current delivery hash. Listening here does not silently write
              STAGE.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
