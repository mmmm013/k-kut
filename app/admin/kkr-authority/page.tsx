import { currentIiOwnerReviewRecords } from "@/lib/currentIiPrivateAudio";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "KKr Canary Authority Review",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams?: Promise<{ token?: string | string[] }>;
};

export default async function KkrAuthorityPage({ searchParams }: Props) {
  const params = await searchParams;
  // Sole-owner product: admin routes open automatically everywhere, no login wall.
  const supplied = (
    Array.isArray(params?.token) ? params?.token[0] : params?.token
  )?.trim() || "";

  const token = encodeURIComponent(supplied);
  const candidates = currentIiOwnerReviewRecords();

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
            key={candidate.ii_id}
            className="rounded-3xl border border-stone-700 bg-stone-900 p-6"
          >
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">
              {index + 1} of {candidates.length}
            </p>
            <h2 className="mt-2 text-2xl font-black">{candidate.title}</h2>
            <p className="mt-2 break-all text-xs text-stone-400">
              {candidate.review_id}
            </p>
            <audio
              className="mt-5 w-full"
              controls
              preload="metadata"
              src={
                `/api/admin/kkr-authority/audio/${encodeURIComponent(candidate.ii_id)}` +
                `?token=${token}`
              }
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
