export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseCatalogClient } from "@supabase/supabase-js";

type KKMeta = Record<string, unknown>;

type KKRow = {
  kut_id: string | null;
  delivered_url_or_path: string | null;
  storage_object_name?: string | null;
  pass_type?: string | null;
  track_id?: string | null;
  audio_status?: string | null;
  meta?: KKMeta | null;
};


type IntentChoice = {
  id: string;
  label: string;
  helper: string;
  terms: string[];
};

const INTENT_CHOICES: Record<string, IntentChoice[]> = {
  apology: [
    { id: "im-sorry", label: "I’m sorry", helper: "Gentle accountability.", terms: ["sorry", "apolog", "regret"] },
    { id: "i-was-wrong", label: "I was wrong", helper: "Owning the mistake.", terms: ["wrong", "sorry", "regret"] },
    { id: "please-hear-me", label: "Please hear me", helper: "Trying to be understood.", terms: ["hear", "understand", "sorry"] },
    { id: "i-miss-you", label: "I miss you", helper: "Tender distance and longing.", terms: ["miss", "missing", "come back"] },
    { id: "repair-this", label: "Can we repair this?", helper: "Repair and reconnection.", terms: ["repair", "reconnect", "forgive"] },
    { id: "make-it-right", label: "I want to make it right", helper: "Direct repair.", terms: ["make it right", "repair", "sorry"] },
  ],
  "thank-you": [
    { id: "simple-thanks", label: "Simple thanks", helper: "Clear appreciation.", terms: ["thank", "thanks"] },
    { id: "deep-thanks", label: "Deep thanks", helper: "Bigger gratitude.", terms: ["grateful", "gratitude", "appreciat"] },
    { id: "you-helped-me", label: "You helped me", helper: "Support that mattered.", terms: ["help", "support", "thank"] },
    { id: "i-see-you", label: "I see what you did", helper: "Noticing effort.", terms: ["see", "appreciat", "thank"] },
  ],
  personal: [
    { id: "love", label: "I love you", helper: "Warm and close.", terms: ["love", "heart", "always"] },
    { id: "comfort", label: "Comfort", helper: "Soft reassurance.", terms: ["comfort", "care", "hold on"] },
    { id: "support", label: "Support", helper: "Grounding and dependable.", terms: ["support", "believe", "hope"] },
    { id: "not-alone", label: "You’re not alone", helper: "Presence.", terms: ["not alone", "angel", "care"] },
  ],
  birthday: [
    { id: "birthday", label: "Birthday", helper: "Celebrate them.", terms: ["birthday", "bday", "celebrat"] },
    { id: "glad-you-exist", label: "Glad you exist", helper: "Warm personal birthday.", terms: ["birthday", "love", "thank"] },
  ],
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
    prompt: "Choose the kind of thank-you you want to send, then listen for the K-KUT that says it best.",
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
    prompt: "Choose the kind of apology or repair you want to send, then listen for the K-KUT that says it best.",
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
    prompt: "Choose the kind of love or comfort you want to send, then listen for the K-KUT that says it best.",
    intro: "This is love and comfort music. Listen to each Love or Comfort HUG, then choose the one that fits the person receiving it.",
    options: [
      { name: "Comfort HUG", helper: "Comfort-specific: steady, soft, and reassuring." },
      { name: "Love HUG", helper: "Love-specific: warm, close, and personal." },
      { name: "Support HUG", helper: "Support-specific: grounding and dependable." },
      { name: "Close Comfort HUG", helper: "Comfort-specific: intimate, kind, and present." },
    ],
  },
};

const PURPOSE_TERMS: Record<string, string[]> = {
  "thank-you": ["thank", "thanks", "grateful", "gratitude", "appreciat"],
  birthday: ["birthday", "bday", "born", "celebrat"],
  apology: ["sorry", "apolog", "forgive", "miss", "repair", "reconnect", "regret"],
  personal: ["love", "heart", "comfort", "care", "hope", "hold on", "angel", "believe", "always", "support"],
};

function copyForSlug(slug: string) {
  return STEP_COPY[slug] ?? STEP_COPY.personal;
}


function createAudioCatalogClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  return createSupabaseCatalogClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
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

function valueAsText(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function pickFirstText(meta: KKMeta | null | undefined, keys: string[]) {
  if (!meta) return "";
  for (const key of keys) {
    const text = valueAsText(meta[key]);
    if (text) return text;
  }
  return "";
}

function metadataBlob(row: KKRow) {
  return `${JSON.stringify(row.meta ?? {})} ${row.storage_object_name ?? ""} ${row.track_id ?? ""}`.toLowerCase();
}

function purposeScore(row: KKRow, slug: string, intent?: IntentChoice | null) {
  const terms = intent?.terms?.length ? intent.terms : PURPOSE_TERMS[slug] ?? PURPOSE_TERMS.personal;
  const blob = metadataBlob(row);
  return terms.reduce((score, term) => score + (blob.includes(term) ? 1 : 0), 0);
}

function displayTitle(row: KKRow, fallback: string) {
  const title = pickFirstText(row.meta, [
    "kkr_title",
    "kk_title",
    "kut_title",
    "public_title",
    "title",
    "track_title",
    "song_title",
    "display_title",
    "name",
  ]);
  return title || fallback;
}

function displayMetaLine(row: KKRow, slug: string) {
  const purpose = pickFirstText(row.meta, ["purpose", "occasion", "emotion", "mood", "use_case", "category"]);
  const section = pickFirstText(row.meta, ["section", "section_label", "structure_tag", "part", "segment", "lyric_hook"]);
  const pieces = [purpose || copyForSlug(slug).title.replace(/^Send a /i, ""), section].filter(Boolean);
  return pieces.join(" • ");
}


function pixKey(row: KKRow) {
  return [
    pickFirstText(row.meta, ["source_master_id", "source_master_filename", "track_id"]),
    row.track_id ?? "",
    row.storage_object_name ?? "",
  ].find(Boolean) || row.kut_id || "";
}

function diversifyByPix(rows: KKRow[], maxPerPix = 2) {
  const groups = new Map<string, KKRow[]>();

  for (const row of rows) {
    const key = pixKey(row);
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }

  const picked: KKRow[] = [];

  for (let pass = 0; pass < maxPerPix; pass += 1) {
    for (const group of groups.values()) {
      const row = group[pass];
      if (row) picked.push(row);
    }
  }

  return picked;
}

function sortAndPickRows(rows: KKRow[], slug: string, count: number, intent?: IntentChoice | null, sourcePix?: string | null) {
  const playable = rows.filter(isVerifiedPlayable);

  const pool = sourcePix ? playable.filter((row) => pixKey(row) === sourcePix) : playable;

  const scoreTerms = (terms: string[]) =>
    pool
      .map((row, index) => ({
        row,
        index,
        score: terms.reduce((score, term) => score + (metadataBlob(row).includes(term.toLowerCase()) ? 1 : 0), 0),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map((item) => item.row);

  const exactTerms = intent?.terms ?? [];
  const exactMatches = scoreTerms(exactTerms);
  if (exactMatches.length > 0) return diversifyByPix(exactMatches, 2).slice(0, count);

  const samePurposeTerms = (INTENT_CHOICES[slug] ?? []).flatMap((choice) => choice.terms);
  const samePurposeMatches = scoreTerms(samePurposeTerms);
  if (samePurposeMatches.length > 0) return diversifyByPix(samePurposeMatches, 2).slice(0, count);

  const purposeMatches = scoreTerms(PURPOSE_TERMS[slug] ?? PURPOSE_TERMS.personal);
  return diversifyByPix(purposeMatches, 2).slice(0, count);
}

async function attachMetadata(supabase: ReturnType<typeof createClient>, rows: KKRow[]) {
  const ids = rows.map((row) => row.kut_id).filter(Boolean) as string[];
  if (ids.length === 0) return rows;

  const metas = new Map<string, KKMeta>();

  for (let i = 0; i < ids.length; i += 100) {
    const { data } = await supabase.from("k_kuts").select("*").in("kut_id", ids.slice(i, i + 100));

    for (const item of (data ?? []) as KKMeta[]) {
    const id = valueAsText(item.kut_id) || valueAsText(item.id);
      if (id) metas.set(id, item);
    }
  }

  return rows.map((row) => ({ ...row, meta: row.kut_id ? metas.get(row.kut_id) ?? null : null }));
}

async function fetchLaunchRows(supabase: ReturnType<typeof createClient>, slug: string, intent?: IntentChoice | null, sourcePix?: string | null) {
  const { data } = await supabase
    .from("k_kut_launch_audio")
    .select("kut_id, delivered_url_or_path, track_id, audio_status")
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("audio_status", "playable")
    .order("sort_order", { ascending: true })
    .limit(4);

  const rows = await attachMetadata(supabase, (data ?? []) as KKRow[]);
  return sortAndPickRows(rows, slug, 4, intent, sourcePix);
}

async function fetchImmutableRows(supabase: ReturnType<typeof createClient>, slug: string, intent?: IntentChoice | null, sourcePix?: string | null) {
  const { data, error } = await supabase
    .from("k_kut_audio_qc")
    .select("kut_id, delivered_url_or_path, storage_object_name, audio_status")
    .eq("audio_status", "playable")
    .not("delivered_url_or_path", "is", null)
    .order("checked_at", { ascending: false })
    .limit(1901);

  const rows = await attachMetadata(supabase, (data ?? []) as KKRow[]);
  return { rows: sortAndPickRows(rows, slug, 4, intent, sourcePix), error };
}

export default async function Page({ params, searchParams }: { params: { slug: string }; searchParams?: { intent?: string; sourcePix?: string } }) {
  const slug = params?.slug ?? "personal";
  const supabase = createAudioCatalogClient() ?? createClient();
  const copy = copyForSlug(slug);
  const intents = INTENT_CHOICES[slug] ?? INTENT_CHOICES.personal;
  const selectedIntent = intents.find((item) => item.id === searchParams?.intent) ?? null;
  const sourcePix = searchParams?.sourcePix ?? null;
  const launchRows = await fetchLaunchRows(supabase, slug, selectedIntent, sourcePix);
  const immutableResult = launchRows.length > 0 ? { rows: [], error: null } : await fetchImmutableRows(supabase, slug, selectedIntent, sourcePix);
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

          <div className="mt-6 rounded-2xl border border-[#D4A017]/25 bg-[#160D08] p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#D4A017]">What are you trying to say?</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {intents.map((intent) => (
                <Link
                  key={intent.id}
                  href={`/personal/${encodeURIComponent(slug)}?intent=${encodeURIComponent(intent.id)}`}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedIntent?.id === intent.id
                      ? "border-[#FFD36A] bg-[#D4A017]/20 text-[#FFD36A]"
                      : "border-[#D4A017]/25 bg-black/20 text-[#F5E6C8] hover:bg-[#D4A017]/10"
                  }`}
                >
                  <span className="block text-lg font-black">{intent.label}</span>
                  <span className="mt-1 block text-sm font-bold opacity-75">{intent.helper}</span>
                </Link>
              ))}
            </div>
          </div>
          {error && <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-200">K-KUT list failed: {error.message}</div>}
          {!error && rows.length === 0 && <div className="mt-6 rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5 text-[#F5E6C8]/80">No verified playable vocal K-KUT audio is available for this path yet.</div>}
          <div className="mt-8 flex flex-col gap-4">
            {rows.map((kk, index) => {
              const option = copy.options[index] ?? { name: `K-KUT HUG option ${index + 1}`, helper: "Listen, then choose if it fits." };
              const kkId = kk.kut_id ?? "";
              const audioSrc = toAudioSrc(kk.delivered_url_or_path);
              const title = displayTitle(kk, option.name);
              const metaLine = displayMetaLine(kk, slug);
              return (
                <div key={kkId || kk.delivered_url_or_path || index} className="rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5">
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#D4A017]">{option.name} · option {index + 1} of {rows.length}</p>
                      <h2 className="mt-2 text-2xl font-black text-[#FFD36A]">{title}</h2>
                      <p className="mt-2 text-sm font-bold text-[#F5E6C8]/70">{option.helper}</p>
                      {metaLine && <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-[#C8A882]">{metaLine}</p>}
                    </div>
                    <div className="rounded-xl border border-[#D4A017]/20 bg-black/25 p-4">
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#C8A882]">Full K-KUT audio</p>
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
                    <div className="flex flex-wrap gap-3">
                      {kkId && <Link href={`/k/${encodeURIComponent(kkId)}`} className="rounded-full border border-[#D4A017]/40 px-4 py-2 text-sm font-black text-[#FFD36A] hover:bg-[#D4A017]/10">Use this K-KUT HUG</Link>}
                      <Link
                        href={`/personal/${encodeURIComponent(slug)}?intent=${encodeURIComponent(selectedIntent?.id ?? "")}&sourcePix=${encodeURIComponent(pixKey(kk))}`}
                        className="rounded-full border border-[#D4A017]/30 px-4 py-2 text-sm font-black text-[#F5E6C8] hover:bg-[#D4A017]/10"
                      >
                        More from this same song
                      </Link>
                    </div>
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
