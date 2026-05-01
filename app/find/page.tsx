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
        setError("BB didn’t find a perfect match — showing closest moments.");
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

      <section className="mx-auto max-w-4xl px-6 py-14">
        <h1 className="text-4xl font-bold">Tell BB what happened.</h1>

        <p className="mt-4 text-[#E8CFA8] max-w-2xl">
          More than a message — BB finds real moments that speak for you.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
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
            className="flex-1 p-3 rounded bg-[#120C07] border border-[#D4A017]/40 text-[#F5E6C8]"
          />

          <button
            onClick={search}
            disabled={loading}
            className="px-6 py-3 border border-[#D4A017] text-[#D4A017] rounded hover:bg-[#D4A017]/10"
          >
            {loading ? "BB is finding..." : "Find Feeling"}
          </button>
        </div>

        {error && (
          <div className="mt-6 border border-[#D4A017]/30 bg-[#24180F] p-4">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4">
          {moments.map((m) => (
            <div key={m.id} className="border border-[#D4A017]/20 bg-[#24180F] p-5 rounded">
              <h2 className="text-xl text-[#D4A017]">
                {m.phrase || m.title || "K-KUT Moment"}
              </h2>

              <p className="text-sm text-[#C8A882] mt-1">
                {m.source_title || "GPM source audio"}
              </p>

              <p className="text-sm mt-2">
                A moment that says it for you.
              </p>

              {m.audio_url && (
                <audio controls src={m.audio_url} className="mt-4 w-full" />
              )}

              <div className="mt-4 flex gap-3 flex-wrap">

                {/* PRIMARY ACTION */}
                <a
                  href="mailto:?subject=This says it better than I could&body=I found something for you: https://k-kut.com/find"
                  className="px-4 py-2 border border-[#D4A017] text-[#D4A017] rounded"
                >
                  Send This Moment
                </a>

                {/* SECONDARY */}
                <a
                  href={`mailto:hello@gputnammusic.com?subject=Moment Request&body=${encodeURIComponent(m.title || m.id)}`}
                  className="px-4 py-2 border border-[#D4A017]/50 text-[#E8CFA8] rounded"
                >
                  Request Variation
                </a>

              </div>
            </div>
          ))}
        </div>

        {/* DONATION BLOCK */}
        <div className="mt-10 border border-[#D4A017]/30 p-5 rounded bg-[#24180F]">

          <p className="text-[#D4A017] font-semibold">
            More than a message.
          </p>

          <p className="mt-2">
            Supporting Michael Scherer and his family.
          </p>

          <p className="text-sm text-[#C8A882] mt-2">
            100% of donations go directly to him.
          </p>

          <div className="mt-4 flex gap-3">
            <a
              href="mailto:hello@gputnammusic.com?subject=Support Michael"
              className="px-4 py-2 border border-[#D4A017] text-[#D4A017] rounded"
            >
              Send Support
            </a>
          </div>
        </div>

      </section>
    </main>
  );
}