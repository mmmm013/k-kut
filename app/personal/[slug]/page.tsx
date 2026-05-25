export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import KKSectionAudio from "@/components/KKSectionAudio";
import { createClient as createSupabaseCatalogClient } from "@supabase/supabase-js";

type KKMeta = Record<string, unknown>;

type KKRow = {
  kut_id: string | null;
  delivered_url_or_path: string | null;
  storage_object_name?: string | null;
  pass_type?: string | null;
  track_id?: string | null;
  audio_status?: string | null;
  capture_start_sec?: number | null;
  capture_end_sec?: number | null;
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
  anniversary: [
    { id: "still-us", label: "Still us", helper: "Romantic and steady.", terms: ["anniversary", "love", "always"] },
    { id: "remember-why", label: "Remember why", helper: "A shared-memory HUG.", terms: ["anniversary", "memory", "forever"] },
  ],
  wedding: [
    { id: "for-the-couple", label: "For the couple", helper: "A ceremonial music moment.", terms: ["wedding", "forever", "love"] },
    { id: "first-dance", label: "First dance feeling", helper: "Romantic and lasting.", terms: ["wedding", "dance", "forever"] },
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
    title: "Send a real birthday song moment",
    prompt: "Hear the birthday audio first. Then choose the Birthday HUG that feels right.",
    intro: "K-KUT Birthday HUGs are private music moments for making someone feel celebrated, remembered, and glad to be here.",
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
  anniversary: {
    title: "Send a real anniversary song moment",
    prompt: "Hear the anniversary audio first. Then choose the HUG that carries the feeling.",
    intro: "K-KUT Anniversary HUGs are private music moments for remembering why it still matters.",
    options: [
      { name: "Awesome Anniversary HUG", helper: "Anniversary-specific: warm, direct, and easy to send." },
      { name: "Still Us HUG", helper: "Anniversary-specific: romantic, steady, and personal." },
    ],
  },
  wedding: {
    title: "Forever & A Day Wedding Pack",
    prompt: "Hear the full Forever & A Day first. Then MC-BOT recommends the best KKs while still showing the complete governed menu.",
    intro: "Wedding is hard-gated to Forever & A Day only. The full song stays first because users need context before choosing the exact KUT.",
    options: [
      { name: "Full song first", helper: "Hear the entire Forever & A Day before choosing a KK." },
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
  anniversary: ["anniversary", "love", "always", "forever"],
  wedding: ["wedding", "forever", "dance", "ceremony", "love"],
  personal: ["love", "heart", "comfort", "care", "hope", "hold on", "angel", "believe", "always", "support"],
};

const WEDDING_PENDING_SECTIONS = [
  {
    title: "RECOMMENDED: V2 + Ch2 — Best KK-Kombo",
    helper: "Start here. Verse 2 resolving into Chorus 2 is the strongest first Wedding KK recommendation.",
  },
  {
    title: "RECOMMENDED NEXT: V2-End",
    helper: "Verse 2 + Chorus 2 + Bridge + Final Chorus + Outro. Best fuller closing Wedding KK-Kombo.",
  },

  {
    title: "SOLO: Intro",
    helper: "Opening mood-setter.",
  },
  {
    title: "SOLO: Verse 1",
    helper: "First story section.",
  },
  {
    title: "SOLO: Chorus 1",
    helper: "First title-hook chorus.",
  },
  {
    title: "SOLO: Verse 2",
    helper: "Second story section.",
  },
  {
    title: "SOLO: Chorus 2",
    helper: "Second chorus payoff.",
  },
  {
    title: "SOLO: Bridge",
    helper: "Through-it-all commitment turn.",
  },
  {
    title: "SOLO: Final Chorus",
    helper: "Final hook payoff.",
  },
  {
    title: "SOLO: Outro",
    helper: "Closing tail / ending moment.",
  },

  {
    title: "KOMBO: Intro + Verse 1",
    helper: "Contiguous opening setup.",
  },
  {
    title: "KOMBO: Verse 1 + Chorus 1",
    helper: "First story plus first hook.",
  },
  {
    title: "KOMBO: Verse 2 + Chorus 2",
    helper: "Same as recommended V2 + Ch2; listed here as the formal contiguous combo.",
  },
  {
    title: "KOMBO: Verse 2 + Chorus 2 + Bridge",
    helper: "Second story through commitment turn.",
  },
  {
    title: "KOMBO: Bridge + Final Chorus",
    helper: "Through-it-all moment into final payoff.",
  },
  {
    title: "KOMBO: Final Chorus + Outro",
    helper: "Final hook through ending.",
  },
  {
    title: "KOMBO: V2-End",
    helper: "Verse 2 through Outro. Same as recommended fuller closing combo.",
  },
];

const SOURCE_BACKED_FALLBACKS: Record<string, KKRow[]> = {
  birthday: [
    {
      kut_id: "source-backed-best-birthday-short",
      delivered_url_or_path: "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/tracks/Best%20Birthday%20(1).mp3",
      storage_object_name: "Best Birthday (1).mp3",
      track_id: "Best Birthday (1).mp3",
      audio_status: "playable",
      meta: {
        kut_title: "Best Birthday HUG",
        purpose: "Birthday HUG",
        source_status: "PIX / source-backed sales candidate",
        release_note: "Source-backed Birthday HUG while governed Birthday KUT is materialized.",
      },
    },
    {
      kut_id: "source-backed-best-birthday-long",
      delivered_url_or_path: "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/tracks/Best%20Birthday%20-%20Long.mp3",
      storage_object_name: "Best Birthday - Long.mp3",
      track_id: "Best Birthday - Long.mp3",
      audio_status: "playable",
      meta: {
        kut_title: "Best Birthday Long HUG",
        purpose: "Birthday HUG",
        source_status: "PIX / source-backed sales candidate",
        release_note: "Source-backed Birthday HUG while governed Birthday KUT is materialized.",
      },
    },
  ],
  anniversary: [
    {
      kut_id: "source-backed-awesome-anniversary",
      delivered_url_or_path: "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/tracks/Awesome%20Anniversary.mp3",
      storage_object_name: "Awesome Anniversary.mp3",
      track_id: "Awesome Anniversary.mp3",
      audio_status: "playable",
      meta: {
        kut_title: "Awesome Anniversary HUG",
        purpose: "Anniversary HUG",
        source_status: "PIX / source-backed sales candidate",
        release_note: "Source-backed Anniversary HUG while governed Anniversary KUT is materialized.",
      },
    },
  ],
  wedding: [
    {
      kut_id: "source-backed-forever-and-a-day-reference",
      delivered_url_or_path: "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/tracks/Forever%20&%20A%20Day.mp3",
      storage_object_name: "Forever & A Day.mp3",
      track_id: "Forever & A Day.mp3",
      audio_status: "playable",
      meta: {
        kut_title: "Forever & A Day — Full Song Reference",
        purpose: "Wedding Pack full-song reference",
        source_status: "PIX / full source reference",
        release_note: "Users must hear the full song before choosing a KK.",
      },
    },
  ],
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
  const sourceStatus = pickFirstText(row.meta, ["source_status"]);
  const pieces = [purpose || copyForSlug(slug).title.replace(/^Send a /i, ""), section, sourceStatus].filter(Boolean);
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

  return rows.map((row) => ({ ...row, meta: row.kut_id ? metas.get(row.kut_id) ?? row.meta ?? null : row.meta ?? null }));
}

async function fetchLaunchRows(supabase: ReturnType<typeof createClient>, slug: string) {
  const { data } = await supabase
    .from("k_kut_launch_audio")
    .select("kut_id, delivered_url_or_path, track_id, audio_status")
    .eq("slug", slug)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(8);

  const launchRows = ((data ?? []) as KKRow[]).map((row) => ({ ...row, audio_status: "playable" }));
  return attachMetadata(supabase, launchRows);
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

function weddingKKSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function PendingButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#D4A017]/25 bg-black/25 px-4 py-2 text-sm font-black text-[#C8A882]">
      {children}
    </span>
  );
}

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams?: Promise<{ intent?: string; sourcePix?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const slug = resolvedParams?.slug ?? "personal";
  const copy = copyForSlug(slug);
  const intents = INTENT_CHOICES[slug] ?? INTENT_CHOICES.personal;
  const selectedIntent = intents.find((item) => item.id === resolvedSearchParams?.intent) ?? null;
  const selectedWeddingKK = resolvedSearchParams?.kk ?? null;
  const sourcePix = resolvedSearchParams?.sourcePix ?? null;
  const sourceBackedRows = SOURCE_BACKED_FALLBACKS[slug] ?? [];
  const isWeddingOnlyPromo = slug === "wedding";
  const supabase = isWeddingOnlyPromo ? null : (createAudioCatalogClient() ?? createClient());

  const launchRowsRaw = isWeddingOnlyPromo || !supabase ? [] : await fetchLaunchRows(supabase, slug);
  const launchRows = Array.isArray(launchRowsRaw) ? launchRowsRaw : [];

  const immutableResult =
    isWeddingOnlyPromo || launchRows.length > 0 || !supabase
      ? { rows: [], error: null }
      : await fetchImmutableRows(supabase!, slug, selectedIntent, sourcePix);

  const immutableRows = Array.isArray(immutableResult?.rows) ? immutableResult.rows : [];
  const rows = isWeddingOnlyPromo
    ? sourceBackedRows
    : launchRows.length > 0
      ? launchRows
      : immutableRows.length > 0
        ? immutableRows
        : sourceBackedRows;
  const isSourceBackedFallback = sourceBackedRows.length > 0 && (isWeddingOnlyPromo || (launchRows.length === 0 && immutableRows.length === 0));
  const error = immutableResult?.error ?? null;

  return (
    <main className="min-h-screen bg-[#1A120B] px-6 py-10 text-[#F5E6C8]">
      <section className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 shadow-2xl sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">MC-BOT step 2 of 4</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.95] text-[#FFD36A] sm:text-6xl">{copy.title}</h1>
          <p className="mt-6 max-w-2xl text-lg font-bold leading-relaxed text-[#F5E6C8]/85">{copy.prompt}</p>
          {isWeddingOnlyPromo && (
            <div className="mt-5 rounded-2xl border border-[#FFD36A]/30 bg-black/20 p-5">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FFD36A]">MC-BOT Wedding Path</p>
              <p className="mt-2 text-sm font-bold leading-relaxed text-[#F5E6C8]/80">
                Step 1: hear the full song. Step 2: compare V2 + Ch2 and V2-End. Step 3: checkout opens only after the selected KK passes final approval.
              </p>
            </div>
          )}
          <div className="mt-5 rounded-2xl border border-[#D4A017]/25 bg-[#160D08] p-5"><p className="text-sm font-bold leading-relaxed text-[#F5E6C8]/80">{copy.intro}</p></div>
          {isSourceBackedFallback && (
            <div className="mt-5 rounded-2xl border border-[#FFD36A]/30 bg-[#D4A017]/10 p-5">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FFD36A]">Hear it first</p>
              <p className="mt-2 text-sm font-bold leading-relaxed text-[#F5E6C8]/85">
                {isWeddingOnlyPromo
                  ? "This is the full Forever & A Day source reference. Wedding section KUTs are not sellable until finishing review approves the audio."
                  : "This path is using real source-backed HUG audio while the governed KUT record is being materialized behind the scenes."}
              </p>
            </div>
          )}

          {!isWeddingOnlyPromo && (
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
          )}

          {error && <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-200">K-KUT list failed: {error.message}</div>}
          {!error && rows.length === 0 && <div className="mt-6 rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5 text-[#F5E6C8]/80">No verified playable K-KUT or source-backed HUG audio is available for this path yet.</div>}

          <div className="mt-8 flex flex-col gap-4">
            {rows.map((kk, index) => {
              const option = copy.options[index] ?? { name: `K-KUT HUG option ${index + 1}`, helper: "Listen, then choose if it fits." };
              const kkId = kk.kut_id ?? "";
              const isSourceBacked = kkId.startsWith("source-backed-");
              const audioSrc = toAudioSrc(kk.delivered_url_or_path);
              const title = displayTitle(kk, option.name);
              const metaLine = displayMetaLine(kk, slug);
              const isReferenceOnly = kkId.endsWith("-reference");
              const isWeddingReviewKut = isWeddingOnlyPromo && !isReferenceOnly;
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
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#C8A882]">{isReferenceOnly ? "Full source reference audio" : isWeddingReviewKut ? "Playable KK review audio" : isSourceBacked ? "Real HUG audio" : "Full K-KUT audio"}</p>
                      {audioSrc ? (
                        <>
                          {isSourceBacked || audioSrc.includes("/mk-products/") ? (
                            <audio key={audioSrc} controls preload="metadata" className="w-full">
                              <source src={audioSrc} type="audio/mpeg" />
                              Your browser does not support audio playback.
                            </audio>
                          ) : (
                            <KKSectionAudio
                              src={audioSrc}
                              startSec={kk.capture_start_sec ?? undefined}
                              endSec={kk.capture_end_sec ?? undefined}
                            />
                          )}
                          <a href={audioSrc} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-black text-[#FFD36A] underline">Open audio directly</a>
                        </>
                      ) : (
                        <p className="text-sm font-bold text-red-200">Audio source unavailable.</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {isReferenceOnly ? (
                        <PendingButton>Checkout disabled until approved KUTs exist</PendingButton>
                      ) : isWeddingReviewKut ? (
                        <PendingButton>Playable KK audio — checkout locked until final approval</PendingButton>
                      ) : kkId ? (
                        isSourceBacked ? (
                          <Link href={`/checkout?product=${encodeURIComponent(slug)}&source=${encodeURIComponent(kkId)}`} className="rounded-full border border-[#D4A017]/40 px-4 py-2 text-sm font-black text-[#FFD36A] hover:bg-[#D4A017]/10">Use this {slug === "birthday" ? "Birthday" : slug === "anniversary" ? "Anniversary" : "K-KUT"} HUG</Link>
                        ) : (
                          <Link href={`/k/${encodeURIComponent(kkId)}`} className="rounded-full border border-[#D4A017]/40 px-4 py-2 text-sm font-black text-[#FFD36A] hover:bg-[#D4A017]/10">Use this K-KUT HUG</Link>
                        )
                      ) : null}
                      {!isWeddingOnlyPromo && (
                        <Link
                          href={`/personal/${encodeURIComponent(slug)}?intent=${encodeURIComponent(selectedIntent?.id ?? "")}&sourcePix=${encodeURIComponent(pixKey(kk))}`}
                          className="rounded-full border border-[#D4A017]/30 px-4 py-2 text-sm font-black text-[#F5E6C8] hover:bg-[#D4A017]/10"
                        >
                          More from this same song
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {isWeddingOnlyPromo && (
            <div id="wedding-kk-menu" className="mt-8 rounded-2xl border border-[#D4A017]/30 bg-[#160D08] p-5">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#D4A017]">Wedding KK Menu — recommended first</p>
              <p className="mt-2 text-sm font-bold leading-relaxed text-[#F5E6C8]/75">
                MC-BOT recommends the first two KKs first, but the full governed menu is available below: solo sections and contiguous KK-Kombos only. No non-contiguous stitching.
              </p>
              {selectedWeddingKK && (
                <div className="mt-4 rounded-2xl border border-[#FFD36A]/30 bg-[#D4A017]/10 p-4">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FFD36A]">Selected Wedding KK</p>
                  <p className="mt-1 text-sm font-bold text-[#F5E6C8]/80">{selectedWeddingKK}</p>
                </div>
              )}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {WEDDING_PENDING_SECTIONS.map((section) => {
                  const kkSlug = weddingKKSlug(section.title);
                  const isSelected = selectedWeddingKK === kkSlug;

                  return (
                    <div
                      key={section.title}
                      className={`rounded-2xl border p-4 ${
                        isSelected
                          ? "border-[#FFD36A] bg-[#D4A017]/20"
                          : "border-[#D4A017]/25 bg-black/20"
                      }`}
                    >
                      <p className="text-lg font-black text-[#FFD36A]">{section.title}</p>
                      <p className="mt-1 text-sm font-bold text-[#F5E6C8]/70">{section.helper}</p>
                      <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-[#C8A882]">
                        {isSelected ? "Selected KK path — checkout/audio opens after exact KK is approved" : "Menu option — audio/checkout opens after exact KK is approved"}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/personal/wedding?kk=${encodeURIComponent(kkSlug)}#wedding-kk-menu`}
                          className="rounded-full border border-[#D4A017]/40 px-4 py-2 text-sm font-black text-[#FFD36A] hover:bg-[#D4A017]/10"
                        >
                          {isSelected ? "Selected" : "Choose this KK"}
                        </Link>
                        {isSelected && (
                          <span className="rounded-full border border-[#D4A017]/25 bg-black/25 px-4 py-2 text-sm font-black text-[#C8A882]">
                            Checkout locked until approved audio exists
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6"><Link href="/find" className="text-sm font-black text-[#FFD36A] hover:underline">Back to MC-BOT step 1</Link></div>
      </section>
    </main>
  );
}
