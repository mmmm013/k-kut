import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const SLUG_TERMS: Record<string, string[]> = {
  "thank-you": ["thank", "better", "blue"],
  birthday: ["dance", "celebrate", "night", "heart"],
  apology: ["sorry", "better", "deep", "memories"],
};

function titleForSlug(slug: string) {
  if (slug === "thank-you") return "Thank you";
  if (slug === "birthday") return "Celebrate someone";
  if (slug === "apology") return "Repair or reconnect";
  return "Love or comfort";
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params?.slug ?? "personal";
  const supabase = createClient();
  const terms = SLUG_TERMS[slug] ?? ["kleigh", "music", "heart", "memories"];

  let query = supabase
    .from("m_kut_assets")
    .select("id, content, structure_tag, audio_url, audio_qc_status")
    .eq("audio_qc_status", "pass")
    .not("audio_url", "is", null)
    .limit(12);

  const orFilter = terms
    .map((term) => `id.ilike.%${term}%,content.ilike.%${term}%,structure_tag.ilike.%${term}%`)
    .join(",");

  query = query.or(orFilter);

  const { data, error } = await query;
  const rows = data ?? [];

  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
            MC-BOT step 2 of 4
          </p>

          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-6xl">
            {titleForSlug(slug)}
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-bold leading-relaxed text-[#F5E6C8]/85">
            Choose one playable music moment. Every option below is connected to a passed MP3 audio row.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-200">
              Audio list failed: {error.message}
            </div>
          )}

          {!error && rows.length === 0 && (
            <div className="mt-6 rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5 text-[#F5E6C8]/80">
              No playable mKs found for this path yet.
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4">
            {rows.map((mk) => (
              <Link
                key={mk.id}
                href={`/mkut/${encodeURIComponent(mk.id)}`}
                className="rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5 transition hover:border-[#FFD36A] hover:bg-[#2A180D]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-[#FFD36A]">
                      {mk.content || mk.id}
                    </h2>
                    {mk.structure_tag && (
                      <p className="mt-2 text-sm font-bold text-[#F5E6C8]/65">
                        {mk.structure_tag}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full border border-[#D4A017]/40 px-4 py-2 text-sm font-black text-[#FFD36A]">
                    Play
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Link href="/find" className="text-sm font-black text-[#FFD36A] hover:underline">
            Back to MC-BOT step 1
          </Link>
        </div>
      </section>
    </main>
  );
}
