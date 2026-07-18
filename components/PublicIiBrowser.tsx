"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PublicIiRecord = {
  id: string;
  label: string;
  family: "KK" | "SK";
  lane: string;
  offer: "sK HUG" | "KK HUG";
  priceUsd: number;
  audioUrl: string;
  checkout: "sk" | "kk";
  checkoutHref: string;
  personalNoteWordLimit: 13;
};

type CatalogResponse = {
  ok: boolean;
  status?: string;
  inventoryCount?: number;
  purchasableCount?: number;
  records?: PublicIiRecord[];
  error?: string;
};

const PAGE_SIZE = 12;
const PERSONAL_NOTE_CHARACTER_LIMIT = 160;

const MC_NEEDS = [
  {
    id: "all",
    label: "Show me everything",
    helper: "Browse every released K-KUT and listen before choosing.",
    terms: [] as string[],
  },
  {
    id: "thanks",
    label: "I want to say thank you",
    helper: "Gratitude, appreciation, care, and support.",
    terms: ["thank", "gratitude", "appreciation", "care", "support"],
  },
  {
    id: "love",
    label: "I want to send love or comfort",
    helper: "Warmth, closeness, encouragement, or romance.",
    terms: ["love", "romance", "warm", "comfort", "encourage", "care", "hug"],
  },
  {
    id: "celebrate",
    label: "I want to celebrate someone",
    helper: "Birthday, achievement, congratulations, or a happy moment.",
    terms: ["birthday", "celebrate", "congrat", "achievement", "holiday", "happy"],
  },
  {
    id: "repair",
    label: "I need to repair or reconnect",
    helper: "Apology, distance, regret, or hard feelings.",
    terms: ["apology", "sorry", "repair", "reconnect", "regret", "distance"],
  },
] as const;

function searchableText(record: PublicIiRecord) {
  return [record.label, record.family, record.lane, record.offer, record.id]
    .join(" ")
    .toLowerCase();
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function wordCount(value: string) {
  const normalized = value.trim();
  return normalized ? normalized.split(/\s+/u).filter(Boolean).length : 0;
}

export default function PublicIiBrowser() {
  const [records, setRecords] = useState<PublicIiRecord[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [purchasableCount, setPurchasableCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [lane, setLane] = useState("all");
  const [mcNeed, setMcNeed] = useState<(typeof MC_NEEDS)[number]["id"]>("all");
  const [page, setPage] = useState(1);
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>({});
  const audioRefs = useRef(new Map<string, HTMLAudioElement>());

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/public-ii-catalog", {
          headers: { Accept: "application/json" },
        });
        const payload = (await response.json()) as CatalogResponse;

        if (!response.ok || !payload.ok || !Array.isArray(payload.records)) {
          throw new Error(payload.error || "catalog_not_ready");
        }

        if (active) {
          setRecords(payload.records);
          setInventoryCount(payload.inventoryCount || payload.records.length);
          setPurchasableCount(payload.purchasableCount || 0);
        }
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "The K-KUT catalog could not be loaded.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  const lanes = useMemo(
    () =>
      [...new Set(records.map((record) => record.lane).filter(Boolean))].sort(),
    [records],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const need = MC_NEEDS.find((item) => item.id === mcNeed) || MC_NEEDS[0];

    return records.filter((record) => {
      const text = searchableText(record);
      const queryPass = !normalizedQuery || text.includes(normalizedQuery);
      const lanePass = lane === "all" || record.lane === lane;
      const mcPass =
        need.terms.length === 0 || need.terms.some((term) => text.includes(term));

      return queryPass && lanePass && mcPass;
    });
  }, [records, query, lane, mcNeed]);

  useEffect(() => {
    setPage(1);
  }, [query, lane, mcNeed]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function stopOtherAudio(currentId: string) {
    for (const [id, audio] of audioRefs.current.entries()) {
      if (id !== currentId && !audio.paused) audio.pause();
    }
  }

  function updatePersonalNote(inventoryId: string, value: string) {
    setPersonalNotes((current) => ({
      ...current,
      [inventoryId]: value.slice(0, PERSONAL_NOTE_CHARACTER_LIMIT),
    }));
  }

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-7 text-[#F5E6C8]">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#FFD36A]">
          MC-BOT is opening the catalog
        </p>
        <p className="mt-3 text-lg font-bold">Loading released K-KUTs…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[2rem] border border-red-400/40 bg-red-950/30 p-7 text-red-100">
        <h2 className="text-2xl font-black">The catalog is temporarily unavailable.</h2>
        <p className="mt-3 text-sm font-bold">
          No purchase was started. Please reload this page.
        </p>
        <p className="mt-3 text-xs opacity-70">Status: {error}</p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-[#D4A017]/35 bg-[#24180F] p-6 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#D4A017]">
              MC-BOT · Start here
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#FFD36A] sm:text-4xl">
              What should this music moment help you do?
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-[#F5E6C8]/75">
              MC-BOT narrows only by available K-KUT information. You make the final choice by listening.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/30 px-5 py-4 text-sm font-black text-emerald-100">
            {inventoryCount.toLocaleString()} playable · {purchasableCount.toLocaleString()} ready to send
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {MC_NEEDS.map((need) => {
            const selected = mcNeed === need.id;
            return (
              <button
                key={need.id}
                type="button"
                onClick={() => setMcNeed(need.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-[#FFD36A] bg-[#FFD36A] text-[#160D08]"
                    : "border-[#D4A017]/25 bg-[#160D08] text-[#F5E6C8] hover:border-[#FFD36A]"
                }`}
                aria-pressed={selected}
              >
                <span className="block text-sm font-black">{need.label}</span>
                <span
                  className={`mt-2 block text-xs font-bold leading-5 ${
                    selected ? "text-[#160D08]/75" : "text-[#F5E6C8]/65"
                  }`}
                >
                  {need.helper}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#D4A017]/25 bg-[#160D08] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
              Search
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search K-KUT or feeling"
              className="mt-2 w-full rounded-xl border border-[#D4A017]/30 bg-[#0D0805] px-4 py-3 font-bold text-[#F5E6C8] outline-none placeholder:text-[#F5E6C8]/35 focus:border-[#FFD36A]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
              Use lane
            </span>
            <select
              value={lane}
              onChange={(event) => setLane(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#D4A017]/30 bg-[#0D0805] px-4 py-3 font-bold text-[#F5E6C8] outline-none focus:border-[#FFD36A]"
            >
              <option value="all">All lanes</option>
              {lanes.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-4 text-sm font-black text-[#F5E6C8]/75">
          {filtered.length.toLocaleString()} matching K-KUTs
        </p>
      </section>

      {visible.length ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((record) => {
            const personalNote = personalNotes[record.id] || "";
            const personalNoteWords = wordCount(personalNote);
            const noteTooLong = personalNoteWords > record.personalNoteWordLimit;
            const noteHelpId = `note-help-${record.id}`;

            return (
              <article
                key={record.id}
                className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#120A06] p-5 shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
                      {record.lane || record.family || "Released K-KUT"}
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-white">
                      {record.label}
                    </h3>
                  </div>
                  <span className="rounded-full border border-[#FFD54F]/35 px-3 py-1 text-xs font-black text-[#FFD54F]">
                    {money(record.priceUsd)}
                  </span>
                </div>

                <p className="mt-3 text-sm font-bold text-[#D7CCC8]">
                  Choose this K-KUT. Add your words. Send a HUG.
                </p>

                <audio
                  ref={(element) => {
                    if (element) audioRefs.current.set(record.id, element);
                    else audioRefs.current.delete(record.id);
                  }}
                  className="mt-5 w-full"
                  controls
                  preload="none"
                  src={record.audioUrl}
                  onPlay={() => stopOtherAudio(record.id)}
                />

                {record.checkoutHref ? (
                  <form action="/checkout" method="post" className="mt-5 space-y-3">
                    <input type="hidden" name="ii" value={record.id} />
                    <input type="hidden" name="offer" value={record.checkout} />

                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.16em] text-[#FFD54F]">
                        Optional personal note · 13 words maximum
                      </span>
                      <textarea
                        name="personal_note"
                        value={personalNote}
                        maxLength={PERSONAL_NOTE_CHARACTER_LIMIT}
                        rows={3}
                        aria-describedby={noteHelpId}
                        onChange={(event) =>
                          updatePersonalNote(record.id, event.target.value)
                        }
                        placeholder="Your words appear before the HUG music."
                        className="mt-2 w-full resize-none rounded-xl border border-[#D4A017]/30 bg-[#0D0805] px-4 py-3 text-sm font-bold text-[#F5E6C8] outline-none placeholder:text-[#F5E6C8]/35 focus:border-[#FFD36A]"
                      />
                    </label>

                    <div
                      id={noteHelpId}
                      className={`flex items-start justify-between gap-3 text-xs font-bold ${
                        noteTooLong ? "text-red-300" : "text-[#BCAAA4]"
                      }`}
                    >
                      <span>
                        Written above the music on the private HUG. The audio remains unchanged.
                      </span>
                      <span className="shrink-0">
                        {personalNoteWords}/{record.personalNoteWordLimit} words
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={noteTooLong}
                      className="block w-full rounded-2xl bg-[#FFD54F] px-5 py-3 text-center font-black text-[#160A05] transition hover:bg-white disabled:cursor-not-allowed disabled:bg-[#8D6E63] disabled:text-white"
                    >
                      {noteTooLong
                        ? "Shorten note to 13 words"
                        : "Send this K-KUT as a HUG"}
                    </button>
                  </form>
                ) : (
                  <div className="mt-5 rounded-2xl border border-[#8D6E63]/40 px-5 py-3 text-center text-sm font-black text-[#BCAAA4]">
                    Listen now · sending held
                  </div>
                )}
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-[#D4A017]/25 bg-[#160D08] p-7 text-center">
          <h2 className="text-2xl font-black text-[#FFD36A]">
            No exact information match yet.
          </h2>
          <p className="mt-3 text-sm font-bold text-[#F5E6C8]/70">
            MC-BOT will not invent a match. Choose “Show me everything” or clear a filter and listen directly.
          </p>
        </section>
      )}

      <nav
        className="flex flex-wrap items-center justify-center gap-3"
        aria-label="Catalog pages"
      >
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          className="rounded-xl border border-[#D4A017]/35 px-5 py-3 font-black text-[#FFD36A] disabled:cursor-not-allowed disabled:opacity-35"
        >
          Previous
        </button>
        <span className="px-4 text-sm font-black text-[#F5E6C8]/75">
          Page {currentPage} of {pageCount}
        </span>
        <button
          type="button"
          disabled={currentPage >= pageCount}
          onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
          className="rounded-xl border border-[#D4A017]/35 px-5 py-3 font-black text-[#FFD36A] disabled:cursor-not-allowed disabled:opacity-35"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
