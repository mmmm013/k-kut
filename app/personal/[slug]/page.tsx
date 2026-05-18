export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type KKRow = {
  kut_id: string | null;
  delivered_url_or_path: string | null;
  pass_type?: string | null;
  track_id?: string | null;
  audio_status?: string | null;
};

type StepCopy = {
  title: string;
  prompt: string;
  intro: string;
  options: { name: string; helper: string }[];
};

const STEP_COPY: Record<string, StepCopy> = {
  "thank-you": {
    title: "Send a thank-you HUG",
    prompt: "MC-BOT found verified playable K-KUT Thank-you HUG options for saying thanks.",
    intro: "This is thank-you music. Listen to each Thank-you HUG, then choose the one that says thanks the way you mean it.",
    options: [
      { name: "Warm Thank-you HUG", helper: "Thank-you-specific: personal, kind, and grateful." },
      { name: "Quiet Thank-you HUG", helper: "Thank-you-specific: gentle, sincere, and not too big." },
      { name: "Big-hearted Thank-you HUG", helper: "Thank-you-specific: fuller, brighter, and more expressive." },
      { name: "Simple Thank-you HUG", helper: "Thank-you-specific: direct, clean, and easy to send." },
    ],
  },
  birthday: {
    title: "Send a birthday HUG",
    prompt: "MC-BOT found verified playable K-KUT Birthday HUG options for their birthday.",
    intro: "This is birthday music. Listen to the full birthday HUG and the short birthday HUG, then choose the one that fits their birthday moment.",
    options: [
      { name: "Best Birthday HUG", helper: "Birthday-specific full version. Built for the main birthday send." },
      { name: "Short Birthday HUG", helper: "Birthday-specific short version. Built for a quick birthday send." },
      { name: "Upbeat Birthday HUG", helper: "Birthday-specific: bright, fun, and celebratory." },
      { name: "Personal Birthday HUG", helper: "Birthday-specific: warm, close, and caring." },
    ],
  },
  apology: {
    title: "Send an apology HUG",
    prompt: "MC-BOT found verified playable K-KUT Apology HUG options for repair and reconnection.",
    intro: "This is apology and repair music. Listen to each Apology HUG, then choose the one that says it the way you mean it.",
    options: [
      { name: "Soft Apology HUG", helper: "Apology-specific: gentle, careful, and accountable." },
      { name: "Missing-you Apology HUG", helper: "Apology-specific: tender, honest, and close." },
      { name: "Open-hearted Repair HUG", helper: "Repair-specific: direct, human, and hopeful." },
      { name: "Gentle Reconnection HUG", helper: "Reconnection-specific: calm, patient, and safe." },
    ],
  },
  personal: {
    title: "Send a love or comfort HUG",
    prompt: "MC-BOT found verified playable K-KUT Love and Comfort HUG options for care and support.",
    intro: "This is love and comfort music. Listen to each Love or Comfort HUG, then choose the one that fits the person receiving it.",
    options: [
      { name: "Comfort HUG", helper: "Comfort-specific: steady, soft, and reassuring." },
      { name: "Love HUG", helper: "Love-specific: warm, close, and personal." },
      { name: "Support HUG", helper: "Support-specific: grounding and dependable." },
      { name: "Close Comfort HUG", helper: "Comfort-specific: intimate, kind, and present." },
    ],
  },
};

function copyForSlug(slug: string) {
  return STEP_COPY[slug] ?? STEP_COPY.personal;
}

function encodePath(path: string) {
  return path.split("/").map((part) => encodeURIComponent(part)).join("/");
}

function isHttpUrl(value: string) {
  return value.startsWith("https://") || value.startsWith("http://");
}

function isAllowedKKutAudio(rawValue: string | null) {
  const raw = rawValue?.trim().toLowerCase();
  if (!raw) return false;
  if (raw.includes("instro") || raw.includes("instrumental") || raw.includes("mk-products") || raw.includes("/mks/") || raw.includes("mini")) return false;
  if (raw.endsWith(".wav")) return false;
  return raw.includes("/tracks/") || raw.includes("tracks/") || raw.endsWith(".mp3") || raw.endsWith(".m4a");
}

function toAudioSrc(rawValue: string | null) {
  const raw = rawValue?.trim();
  if (!raw || !isAllowedKKutAudio(raw)) return null;
  if (isHttpUrl(raw)) return raw;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (raw.startsWith("/storage/v1/object/public/")) return supabaseUrl ? `${supabaseUrl}${raw}` : raw;
  if (raw.startsWith("storage/v1/object/public/")) return supabaseUrl ? `${supabaseUrl}/${raw}` : `/${raw}`;
  if (raw.startsWith("public/")) return raw.replace(/^public/, "");
  if (raw.startsWith("/audio/") || raw.startsWith("/assets/")) return raw;
  if (raw.startsWith("audio/") || raw.startsWith("assets/")) return `/${raw}`;
  if (!supabaseUrl) return raw;
  if (raw.startsWith("tracks/")) return `${supabaseUrl}/storage/v1/object/public/${encodePath(raw)}`;
  return `${supabaseUrl}/storage/v1/object/public/tracks/${encodePath(raw)}`;
}

function isVerifiedPlayable(row: KKRow) {
  return row.audio_status === "playable" && Boolean(toAudioSrc(row.delivered_url_or_path));
}

function pickPlayableRows(rows: KKRow[], count: number) {
  return rows.filter(isVerifiedPlayable).slice(0, count);
}

async function fetchLaunchRows(supabase: ReturnType<typeof createClient>, slug: string) {
  const { data } = await supabase
    .from("k_kut_launch_audio")
    .select("kut_id, delivered_url_or_path, track_id, audio_status")
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("audio_status", "playable")
    .order("sort_order", { ascending: true })
    .limit(4);

  return pickPlayableRows((data ?? []) as KKRow[], 4);
}

async function fetchImmutableRows(supabase: ReturnType<typeof createClient>) {
  const { data, error } = await supabase
    .from("k_kut_audio_qc")
    .select("kut_id, delivered_url_or_path, audio_status")
    .eq("audio_status", "playable")
    .not("delivered_url_or_path", "is", null)
    .order("checked_at", { ascending: false })
    .limit(500);

  return { rows: pickPlayableRows((data ?? []) as KKRow[], 4), error };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params?.slug ?? "personal";
  const supabase = createClient();
  const copy = copyForSlug(slug);
  const launchRows = await fetchLaunchRows(supabase, slug);
  const immutableResult = launchRows.length > 0 ? { rows: [], error: null } : await fetchImmutableRows(supabase);
  const rows = launchRows.length > 0 ? launchRows : immutableResult.rows;
  const error = immutableResult.error;

  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">MC-BOT step 2 of 4</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-6xl">{copy.title}</h1>
          <p className="mt-6 max-w-2xl text-lg font-bold leading-relaxed text-[#F5E6C8]/85">{copy.prompt}</p>
          <div className="mt-5 rounded-2xl border border-[#D4A017]/25 bg-[#160D08] p-5"><p className="text-sm font-bold leading-relaxed text-[#F5E6C8]/80">{copy.intro}</p></div>
          {error && <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-200">K-KUT list failed: {error.message}</div>}
          {!error && rows.length === 0 && <div className="mt-6 rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5 text-[#F5E6C8]/80">No verified playable vocal K-KUT audio is available for this path yet.</div>}
          <div className="mt-8 flex flex-col gap-4">
            {rows.map((kk, index) => {
              const option = copy.options[index] ?? { name: `K-KUT HUG option ${index + 1}`, helper: "Listen, then choose if it fits." };
              const kkId = kk.kut_id ?? "";
              const audioSrc = toAudioSrc(kk.delivered_url_or_path);
              return (
                <div key={kkId || kk.delivered_url_or_path || index} className="rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5">
                  <div className="flex flex-col gap-4">
                    <div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4A017]">K-KUT HUG option {index + 1} of {rows.length}</p><h2 className="mt-2 text-2xl font-black text-[#FFD36A]">{option.name}</h2><p className="mt-2 text-sm font-bold text-[#F5E6C8]/70">{option.helper}</p></div>
                    <div className="rounded-xl border border-[#D4A017]/20 bg-black/25 p-4">
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#C8A882]">Listen here</p>
                      {audioSrc ? (
                        <>
                          <audio key={audioSrc} controls preload="auto" className="w-full">
                            <source src={audioSrc} type="audio/mpeg" />
                            Your browser does not support audio playback.
                          </audio>
                          <a href={audioSrc} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-black text-[#FFD36A] underline">Open audio directly</a>
                        </>
                      ) : (
                        <p className="text-sm font-bold text-red-200">Audio source unavailable.</p>
                      )}
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
