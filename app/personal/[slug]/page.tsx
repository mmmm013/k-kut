export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type KKRow = {
  kut_id: string | null;
  delivered_url_or_path: string | null;
  pass_type?: string | null;
  track_id?: string | null;
};

type StepCopy = {
  title: string;
  prompt: string;
  intro: string;
  options: { name: string; helper: string }[];
};

const STEP_COPY: Record<string, StepCopy> = {
  "thank-you": {
    title: "Thank you",
    prompt: "MC-BOT found K-KUT HUG options for saying thanks.",
    intro: "Listen to each K-KUT option. Choose the one that feels closest to the thank-you you want to send.",
    options: [
      { name: "A warm thank-you HUG", helper: "Feels personal, kind, and grateful." },
      { name: "A quiet appreciation HUG", helper: "Feels gentle, sincere, and not too big." },
      { name: "A big-hearted thanks HUG", helper: "Feels fuller, brighter, and more expressive." },
      { name: "A simple sincere HUG", helper: "Feels direct, clean, and easy to send." },
    ],
  },
  birthday: {
    title: "Celebrate someone",
    prompt: "MC-BOT found K-KUT HUG options for celebrating them.",
    intro: "Listen to each K-KUT option. Choose the one that best fits their moment.",
    options: [
      { name: "A bright celebration HUG", helper: "Feels happy, open, and energetic." },
      { name: "A sweet personal HUG", helper: "Feels close, caring, and specific." },
      { name: "A fun upbeat HUG", helper: "Feels playful and easy to enjoy." },
      { name: "A proud joyful HUG", helper: "Feels supportive and big-hearted." },
    ],
  },
  apology: {
    title: "Repair or reconnect",
    prompt: "MC-BOT found K-KUT HUG options for repair.",
    intro: "Listen to each K-KUT option. Choose the one that says it the way you mean it.",
    options: [
      { name: "A soft apology HUG", helper: "Feels gentle, careful, and accountable." },
      { name: "A missing-you HUG", helper: "Feels tender, honest, and close." },
      { name: "An open-hearted repair HUG", helper: "Feels direct, human, and hopeful." },
      { name: "A gentle reconnection HUG", helper: "Feels calm, patient, and safe." },
    ],
  },
  personal: {
    title: "Love or comfort",
    prompt: "MC-BOT found K-KUT HUG options for care and comfort.",
    intro: "Listen to each K-KUT option. Choose the one that feels right for the person receiving it.",
    options: [
      { name: "A comforting HUG", helper: "Feels steady, soft, and reassuring." },
      { name: "A loving HUG", helper: "Feels warm, close, and personal." },
      { name: "A steady-support HUG", helper: "Feels grounding and dependable." },
      { name: "A close-and-warm HUG", helper: "Feels intimate, kind, and present." },
    ],
  },
};

function copyForSlug(slug: string) {
  return STEP_COPY[slug] ?? STEP_COPY.personal;
}

function encodePath(path: string) {
  return path.split("/").map((part) => encodeURIComponent(part)).join("/");
}

function isAllowedKKutAudio(rawValue: string | null) {
  const raw = rawValue?.trim().toLowerCase();
  if (!raw) return false;

  if (raw.includes("instro") || raw.includes("instrumental") || raw.includes("mk-products") || raw.includes("/mks/") || raw.includes("mini")) return false;
  if (raw.endsWith(".wav")) return false;

  const currentHost = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
  if (raw.startsWith("http") && currentHost && !raw.includes(currentHost)) return false;

  return raw.includes("/tracks/") || raw.includes("tracks/") || raw.endsWith(".mp3") || raw.endsWith(".m4a");
}

function toAudioSrc(rawValue: string | null) {
  const raw = rawValue?.trim();
  if (!raw || !isAllowedKKutAudio(raw)) return null;

  if (/^https?:\/\//i.test(raw)) return encodeURI(raw);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

  if (raw.startsWith("/storage/v1/object/public/")) return supabaseUrl ? `${supabaseUrl}${encodeURI(raw)}` : encodeURI(raw);
  if (raw.startsWith("storage/v1/object/public/")) return supabaseUrl ? `${supabaseUrl}/${encodeURI(raw)}` : `/${encodeURI(raw)}`;
  if (raw.startsWith("public/")) return encodeURI(raw.replace(/^public/, ""));
  if (raw.startsWith("/audio/") || raw.startsWith("/assets/")) return encodeURI(raw);
  if (raw.startsWith("audio/") || raw.startsWith("assets/")) return `/${encodeURI(raw)}`;
  if (!supabaseUrl) return encodeURI(raw);
  if (raw.startsWith("tracks/")) return `${supabaseUrl}/storage/v1/object/public/${encodePath(raw)}`;

  return `${supabaseUrl}/storage/v1/object/public/tracks/${encodePath(raw)}`;
}

function pickDiverseRows(rows: KKRow[], count: number) {
  const chosen: KKRow[] = [];
  const usedTrack = new Set<string>();

  for (const row of rows) {
    if (!toAudioSrc(row.delivered_url_or_path)) continue;
    const family = row.track_id ?? row.kut_id ?? row.delivered_url_or_path ?? "";
    if (usedTrack.has(family)) continue;
    chosen.push(row);
    usedTrack.add(family);
    if (chosen.length >= count) break;
  }

  return chosen;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params?.slug ?? "personal";
  const supabase = createClient();
  const copy = copyForSlug(slug);

  const { data, error } = await supabase
    .from("k_kuts")
    .select("kut_id, delivered_url_or_path, pass_type, track_id")
    .eq("pass_type", "LT-PIX")
    .eq("generated_by", "gpmx-first-pass-process.mjs")
    .not("delivered_url_or_path", "is", null)
    .limit(500);

  const rows = pickDiverseRows((data ?? []) as KKRow[], 4);

  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">MC-BOT step 2 of 4</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-6xl">{copy.title}</h1>
          <p className="mt-6 max-w-2xl text-lg font-bold leading-relaxed text-[#F5E6C8]/85">{copy.prompt}</p>
          <div className="mt-5 rounded-2xl border border-[#D4A017]/25 bg-[#160D08] p-5">
            <p className="text-sm font-bold leading-relaxed text-[#F5E6C8]/80">{copy.intro}</p>
          </div>

          {error && <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-200">K-KUT list failed: {error.message}</div>}
          {!error && rows.length === 0 && (
            <div className="mt-6 rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5 text-[#F5E6C8]/80">
              No playable vocal K-KUT HUG options are available for this path yet.
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4">
            {rows.map((kk, index) => {
              const option = copy.options[index] ?? { name: `K-KUT HUG option ${index + 1}`, helper: "Listen, then choose if it fits." };
              const kkId = kk.kut_id ?? "";
              const audioSrc = toAudioSrc(kk.delivered_url_or_path);
              return (
                <div key={kkId || kk.delivered_url_or_path || index} className="rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5">
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4A017]">K-KUT HUG option {index + 1} of {rows.length}</p>
                      <h2 className="mt-2 text-2xl font-black text-[#FFD36A]">{option.name}</h2>
                      <p className="mt-2 text-sm font-bold text-[#F5E6C8]/70">{option.helper}</p>
                    </div>
                    <div className="rounded-xl border border-[#D4A017]/20 bg-black/25 p-4">
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#C8A882]">Listen here</p>
                      <audio controls preload="metadata" src={audioSrc ?? undefined} className="w-full" />
                    </div>
                    {kkId && <Link href={`/k/${encodeURIComponent(kkId)}`} className="self-start rounded-full border border-[#D4A017]/40 px-4 py-2 text-sm font-black text-[#FFD36A] hover:bg-[#D4A017]/10">Use this K-KUT HUG</Link>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-6"><Link href="/find" className="text-sm font-black text-[#FFD36A] hover:underline">Back to MC-BOT step 1</Link></div>
      </section>
    </main>
  );
}
