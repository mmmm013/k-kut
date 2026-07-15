"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PublicIiRecord = {
  id: string;
  label: string;
  family: string;
  lane: string;
  offer: string;
  priceUsd: number | null;
  audioUrl: string;
  checkout: "short_kut" | "hug" | "big_hug" | "hold";
  checkoutHref: string | null;
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

function money(value: number | null) {
  return value === null
    ? "Price shown at checkout"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
}

export default function PublicIiBrowser() {
  const [records, setRecords] = useState<PublicIiRecord[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [purchasableCount, setPurchasableCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [lane, setLane] = useState("all");
  const [offer, setOffer] = useState("all");
  const [mcNeed, setMcNeed] = useState<(typeof MC_NEEDS)[number]["id"]>("all");
  const [page, setPage] = useState(1);
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

  const offers = useMemo(
    () =>
      [...new Set(records.map((record) => record.offer).filter(Boolean))].sort(),
    [records],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const need = MC_NEEDS.find((item) => item.id === mcNeed) || MC_NEEDS[0];

    return records.filter((record) => {
      const text = searchableText(record);
      const queryPass = !normalizedQuery || text.includes(normalizedQuery);
      const lanePass = lane === "all" || record.lane === lane;
      const offerPass = offer === "all" || record.offer === offer;
      const mcPass =
        need.terms.length === 0 || need.terms.some((term) => text.includes(term));

      return queryPass && lanePass && offerPass && mcPass;
    });
  }, [records, query, lane, offer, mcNeed]);

  useEffect(() => {
    setPage(1);
  }, [query, lane, offer, mcNeed]);

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
        <p className="mt-3 text-sm font-bold">No purchase was started. Please reload this page.</p>
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
              MC-BOT narrows only by released catalog metadata. You make the final choice by listening.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/30 px-5 py-4 text-sm font-black text-emerald-100">
            {inventoryCount.toLocaleString()} playable · {purchasableCount.toLocaleString()} checkout-ready
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
                <span className={`mt-2 block text-xs font-bold leading-5 ${selected ? "text-[#160D08]/75" : "text-[#F5E6C8]/65"}`}>
                  {need.helper}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#D4A017]/25 bg-[#160D08] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
              Search
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search item, lane, or offer"
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
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4A017]">
              Offer
            </span>
            <select
              value={offer}
              onChange={(event) => setOffer(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#D4A017]/30 bg-[#0D0805] px-4 py-3 font-bold text-[#F5E6C8] outline-none focus:border-[#FFD36A]"
            >
              <option value="all">All offers</option>
              {offers.map((value) => (
                <option key={value} value={value}>{value}</option>
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
          {visible.map((record) => (
            <article
              key={record.id}
              className="rounded-[1.75rem] border border-[#8D6E63]/35 bg-[#120A06] p-5 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
                    {record.lane || record.family || "Released K-KUT"}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-white">{record.label}</h3>
                </div>
                <span className="rounded-full border border-[#FFD54F]/35 px-3 py-1 text-xs font-black text-[#FFD54F]">
                  {money(record.priceUsd)}
                </span>
              </div>

              <p className="mt-3 text-sm font-bold text-[#D7CCC8]">{record.offer}</p>

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
                <a
                  href={record.checkoutHref}
                  className="mt-5 block rounded-2xl bg-[#FFD54F] px-5 py-3 text-center font-black text-[#160A05] transition hover:bg-white"
                >
                  Choose this K-KUT
                </a>
              ) : (
                <div className="mt-5 rounded-2xl border border-[#8D6E63]/40 px-5 py-3 text-center text-sm font-black text-[#BCAAA4]">
                  Listen now · offer checkout held
                </div>
              )}
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-[2rem] border border-[#D4A017]/25 bg-[#160D08] p-7 text-center">
          <h2 className="text-2xl font-black text-[#FFD36A]">No exact metadata match yet.</h2>
          <p className="mt-3 text-sm font-bold text-[#F5E6C8]/70">
            MC-BOT will not invent a match. Choose “Show me everything” or clear a filter and listen directly.
          </p>
        </section>
      )}

      <nav className="flex flex-wrap items-center justify-center gap-3" aria-label="Catalog pages">
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
