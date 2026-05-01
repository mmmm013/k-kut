"use client";

import { useState } from "react";
import Link from "next/link";

type Moment = {
  id: string;
  title?: string;
  phrase?: string;
  source_title?: string;
  description?: string;
  keenness_score?: number;
  audio_url?: string;
};

const PAY_LINKS = {
  mK: "https://buy.stripe.com/3cI28q48e2oa0Pq4xg4ow0i",
  KK: "https://buy.stripe.com/4gMaEW9sye6Scy8d3M4ow0j",
  KPD: "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",
  VOCAL_NOTE: "https://buy.stripe.com/aFabJ0bAG0g27dO1l44ow0l",
  HUG: "https://buy.stripe.com/28EfZgdIO7Iuaq03tc4ow0m",
  PRODUCTION: "https://buy.stripe.com/14A9AScEKfaWcy8aVE4ow0n",
  MS_DONATION: "https://buy.stripe.com/6oUcN47kq8Mybu43tc4ow0g",
};

export default function FindMomentPage() {
  const [q, setQ] = useState("Tell BB what happened...");
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    setLoading(true);
    setError("");
    setMoments([]);

    try {
      const res = await fetch(`/api/bot/moments?q=${encodeURIComponent(q)}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "BB could not complete the search.");
        return;
      }

      setMoments(json.moments || []);

      if (!json.moments || json.moments.length === 0) {
        setError("BB didn’t find a perfect match yet. Try: encouragement, love, apology, thanks, grief, birthday, support.");
      }
    } catch {
      setError("Network/API error. BB could not complete the moment search.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#1A120B] text-[#F5E6C8]">
      <header className="border-b border-[#D4A017]/20 px-6 py-4 flex justify-between">
        <Link href="/" className="text-[#D4A017] font-bold">← K-KUT</Link>
        <Link href="/supe" className="text-[#D4A017]">SUPE Specialties</Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h1 className="text-4xl font-bold">Tell BB what happened.</h1>

        <p className="mt-4 max-w-2xl text-[#E8CFA8]">
          More than a message — BB finds real song moments for support, love, grief,
          celebration, apology, distance, and care.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => {
              if (q === "Tell BB what happened...") setQ("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") search();
            }}
            placeholder="my friend is sick and I want to send support"
            className="flex-1 rounded border border-[#D4A017]/40 bg-[#120C07] p-3 text-[#F5E6C8] placeholder:text-[#C8A882]/60"
          />

          <button
            onClick={search}
            disabled={loading}
            className="rounded border border-[#D4A017] px-6 py-3 text-[#D4A017] hover:bg-[#D4A017]/10 disabled:opacity-50"
          >
            {loading ? "BB is finding..." : "Find Feeling"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded border border-[#D4A017]/30 bg-[#24180F] p-4 text-[#E8CFA8]">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4">
          {moments.map((m) => (
            <div key={m.id} className="rounded border border-[#D4A017]/20 bg-[#24180F] p-5">
              <h2 className="text-xl font-semibold text-[#D4A017]">
                {m.phrase || m.title || "K-KUT Moment"}
              </h2>

              <p className="mt-2 text-sm text-[#C8A882]">
                {m.source_title || "GPM source audio"}
              </p>

              <p className="mt-2 text-sm text-[#E8CFA8]">
                A real-audio moment that says it for you.
              </p>

              {m.description && (
                <p className="mt-3 text-sm text-[#E8CFA8]">{m.description}</p>
              )}

              {typeof m.keenness_score !== "undefined" && (
                <p className="mt-2 text-sm text-[#E8CFA8]">
                  Feel score: {m.keenness_score}
                </p>
              )}

              {m.audio_url && (
                <audio controls src={m.audio_url} className="mt-4 w-full" />
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <a
                  href={PAY_LINKS.mK}
                  className="rounded border border-[#D4A017] px-4 py-2 text-center text-[#D4A017] hover:bg-[#D4A017]/10"
                >
                  Buy mK — $2.79
                </a>

                <a
                  href={PAY_LINKS.KK}
                  className="rounded border border-[#D4A017] px-4 py-2 text-center text-[#D4A017] hover:bg-[#D4A017]/10"
                >
                  Buy KK — $14.99
                </a>

                <a
                  href={PAY_LINKS.KPD}
                  className="rounded border border-[#D4A017] px-4 py-2 text-center text-[#D4A017] hover:bg-[#D4A017]/10"
                >
                  Buy KPD — $49
                </a>

                <a
                  href={PAY_LINKS.VOCAL_NOTE}
                  className="rounded border border-[#D4A017]/50 px-4 py-2 text-center text-[#E8CFA8] hover:bg-[#D4A017]/10"
                >
                  Add Vocal Note
                </a>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href={PAY_LINKS.HUG}
                  className="rounded border border-[#D4A017]/50 px-4 py-2 text-[#E8CFA8] hover:bg-[#D4A017]/10"
                >
                  Send as HUG — $9.99
                </a>

                <a
                  href={PAY_LINKS.PRODUCTION}
                  className="rounded border border-[#D4A017]/50 px-4 py-2 text-[#E8CFA8] hover:bg-[#D4A017]/10"
                >
                  Production Use Deposit
                </a>

                <a
                  href={`mailto:hello@gputnammusic.com?subject=Moment Request&body=${encodeURIComponent(
                    `I want help with this K-KUT moment: ${m.phrase || m.title || m.id}`
                  )}`}
                  className="rounded border border-[#D4A017]/30 px-4 py-2 text-[#C8A882] hover:bg-[#D4A017]/10"
                >
                  Ask GPM
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded border border-[#D4A017]/30 bg-[#24180F] p-5">
          <p className="font-semibold text-[#D4A017]">K-KUT Product Ladder</p>

          <p className="mt-2 text-sm text-[#E8CFA8]">
            Start small, send feeling, add voice, or request production use.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a href={PAY_LINKS.mK} className="rounded border border-[#D4A017]/40 p-4 hover:bg-[#D4A017]/10">
              <span className="block font-semibold text-[#D4A017]">mK — $2.79</span>
              <span className="mt-1 block text-sm text-[#C8A882]">A tiny phrase, word, sigh, or emotional hit.</span>
            </a>

            <a href={PAY_LINKS.KK} className="rounded border border-[#D4A017]/40 p-4 hover:bg-[#D4A017]/10">
              <span className="block font-semibold text-[#D4A017]">KK — $14.99</span>
              <span className="mt-1 block text-sm text-[#C8A882]">A regular K-KUT emotional moment.</span>
            </a>

            <a href={PAY_LINKS.KPD} className="rounded border border-[#D4A017]/40 p-4 hover:bg-[#D4A017]/10">
              <span className="block font-semibold text-[#D4A017]">KPD — $49</span>
              <span className="mt-1 block text-sm text-[#C8A882]">A bold production-grade moment.</span>
            </a>

            <a href={PAY_LINKS.VOCAL_NOTE} className="rounded border border-[#D4A017]/40 p-4 hover:bg-[#D4A017]/10">
              <span className="block font-semibold text-[#D4A017]">Add Vocal Note — $24.99</span>
              <span className="mt-1 block text-sm text-[#C8A882]">Add a custom note or directed message layer.</span>
            </a>

            <a href={PAY_LINKS.HUG} className="rounded border border-[#D4A017]/40 p-4 hover:bg-[#D4A017]/10">
              <span className="block font-semibold text-[#D4A017]">HUG — $9.99</span>
              <span className="mt-1 block text-sm text-[#C8A882]">A sendable real-audio feeling object.</span>
            </a>

            <a href={PAY_LINKS.PRODUCTION} className="rounded border border-[#D4A017]/40 p-4 hover:bg-[#D4A017]/10">
              <span className="block font-semibold text-[#D4A017]">Production Deposit — $99</span>
              <span className="mt-1 block text-sm text-[#C8A882]">For supervisor, licensing, or custom production review.</span>
            </a>
          </div>
        </div>

        <div className="mt-10 rounded border border-[#D4A017]/30 bg-[#24180F] p-5">
          <p className="font-semibold text-[#D4A017]">
            Support Michael Scherer and his family
          </p>

          <p className="mt-2 text-sm text-[#C8A882]">
            Personal support for Michael Scherer and his family. G Putnam Music promotes this support effort.
          </p>

          <a
            href={PAY_LINKS.MS_DONATION}
            className="mt-4 inline-block rounded border border-[#D4A017] px-4 py-2 text-[#D4A017] hover:bg-[#D4A017]/10"
          >
            MS Donation — $25
          </a>
        </div>

        <p className="mt-10 text-sm text-[#C8A882]">
          Powered by 4PE PROMOTER. Final audio remains real source audio.
        </p>
      </section>
    </main>
  );
}
