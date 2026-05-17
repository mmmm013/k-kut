import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type MKRow = {
  id: string;
  audio_url: string | null;
  audio_qc_status: string | null;
  pix_pck_id: string | null;
};

const STEP_COPY: Record<string, { title: string; prompt: string; tones: string[] }> = {
  "thank-you": {
    title: "Thank you",
    prompt: "Pick the feeling closest to what you want them to receive.",
    tones: ["Warm and grateful", "Quiet appreciation", "Big-hearted thanks", "Simple and sincere"],
  },
  birthday: {
    title: "Celebrate someone",
    prompt: "Pick the kind of lift this moment should carry.",
    tones: ["Bright celebration", "Sweet and personal", "Fun and upbeat", "Proud and joyful"],
  },
  apology: {
    title: "Repair or reconnect",
    prompt: "Pick the tone that fits the repair.",
    tones: ["Soft apology", "Missing you", "Open-hearted repair", "Gentle reconnection"],
  },
  personal: {
    title: "Love or comfort",
    prompt: "Pick the feeling closest to the message.",
    tones: ["Comforting", "Loving", "Steady support", "Close and warm"],
  },
};

function copyForSlug(slug: string) {
  return STEP_COPY[slug] ?? STEP_COPY.personal;
}

function pickDiverseRows(rows: MKRow[], count: number) {
  const chosen: MKRow[] = [];
  const usedPix = new Set<string>();

  for (const row of rows) {
    const family = row.pix_pck_id ?? row.id;
    if (usedPix.has(family)) continue;
    chosen.push(row);
    usedPix.add(family);
    if (chosen.length >= count) break;
  }

  if (chosen.length < count) {
    for (const row of rows) {
      if (chosen.some((item) => item.id === row.id)) continue;
      chosen.push(row);
      if (chosen.length >= count) break;
    }
  }

  return chosen;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params?.slug ?? "personal";
  const supabase = createClient();
  const copy = copyForSlug(slug);

  const { data, error } = await supabase
    .from("m_kut_assets")
    .select("id, audio_url, audio_qc_status, pix_pck_id")
    .eq("audio_qc_status", "pass")
    .not("audio_url", "is", null)
    .limit(500);

  const rows = pickDiverseRows((data ?? []) as MKRow[], 4);

  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
            MC-BOT step 2 of 4
          </p>

          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-6xl">
            {copy.title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-bold leading-relaxed text-[#F5E6C8]/85">
            {copy.prompt}
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
            {rows.map((mk, index) => (
              <Link
                key={mk.id}
                href={`/mkut/${encodeURIComponent(mk.id)}`}
                className="rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5 transition hover:border-[#FFD36A] hover:bg-[#2A180D]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-[#FFD36A]">
                      {copy.tones[index] ?? `Music moment ${index + 1}`}
                    </h2>
                    <p className="mt-2 text-sm font-bold text-[#F5E6C8]/65">
                      Play this moment, then choose if it fits.
                    </p>
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
