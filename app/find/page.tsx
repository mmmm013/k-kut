"use client";

import { useState } from "react";
import Link from "next/link";

type Moment = {
  id: string;
  title?: string;
  phrase?: string;
  phrase_type?: string;
  source_title?: string;
  keenness_score?: number;
  emotion_level?: string;
  audio_url?: string;
};

export default function FindMomentPage() {
  const [q, setQ] = useState("warm romantic lead-in");
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
        setError(json.error || "Search failed.");
        return;
      }

      setMoments(json.moments || []);

      if (!json.moments || json.moments.length === 0) {
        setError("No matching moments found yet. Try: warm, love, heart, romantic, vocal.");
      }
    } catch {
      setError("Network/API error. Moment search could not complete.");
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
        <h1 className="text-4xl font-bold">Find the exact moment you need.</h1>

        <p className="mt-4 text-[#E8CFA8] max-w-2xl">
          Search vocal hooks, phrases, emotional moments, and song sections.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") search();
            }}
            placeholder="warm romantic lead-in"
            className="flex-1 p-3 rounded bg-[#120C07] border border-[#D4A017]/40 text-[#F5E6C8] placeholder:text-[#C8A882]/60"
          />

          <button
            onClick={search}
            disabled={loading}
            className="px-6 py-3 border border-[#D4A017] text-[#D4A017] rounded hover:bg-[#D4A017]/10 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Find Moments"}
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
                {m.phrase || m.title || "Untitled Moment"}
              </h2>

              <p className="mt-2 text-sm text-[#C8A882]">
                {m.source_title || "GPM source audio"}
              </p>

              {typeof m.keenness_score !== "undefined" && (
                <p className="mt-2 text-sm text-[#E8CFA8]">
                  Feel score: {m.keenness_score}
                </p>
              )}

              {m.audio_url && (
                <audio controls src={m.audio_url} className="mt-4 w-full" />
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={`mailto:hello@gputnammusic.com?subject=Moment Request&body=I want to request this moment: ${encodeURIComponent(m.phrase || m.title || m.id)}`}
                  className="px-4 py-2 border border-[#D4A017] text-[#D4A017] rounded hover:bg-[#D4A017]/10"
                >
                  Request This Moment
                </a>

                <Link
                  href="/supe"
                  className="px-4 py-2 border border-[#D4A017]/50 text-[#E8CFA8] rounded hover:bg-[#D4A017]/10"
                >
                  Use in Production
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-[#C8A882]">
          Powered by 4PE PROMOTER. Final audio remains real source audio.
        </p>
      </section>
    </main>
  );
}
