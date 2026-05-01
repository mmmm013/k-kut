"use client";

import { useState } from "react";
import Link from "next/link";

type Moment = {
  id: string;
  title?: string;
  phrase?: string;
  phrase_type?: string;
  source_title?: string;
  description?: string;
  keenness_score?: number;
  emotion_level?: string;
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
        setError("BB did not find a perfect match yet. Try: I miss you, support my friend, happy birthday, I am sorry.");
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
          BB finds real song moments for support, love, grief, celebration, apology, distance, and care.
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
            placeholder="Example: my friend is sick and I want to send support"
            className="flex-1 p-3 rounded bg-[#120C07] border border-[#D4A017]/40 text-[#F5E6C8] placeholder:text-[#C8A882]/60"
          />

          <button
            onClick={search}
            disabled={loading}
            className="px-6 py-3 border border-[#D4A017] text-[#D4A017] rounded hover:bg-[#D4A017]/10 disabled:opacity-50"
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
                {m.phrase || m.title || "Untitled Moment"}
              </h2>

              <p className="mt-2 text-sm text-[#C8A882]">
                {m.source_title || "GPM source audio"}
              </p>

              {m.description && (
                <p className="mt-3 text-sm text-[#E8CFA8]">{m.description}</p>
              )}

              {typeof m.keenness_score !== "undefined" && (
                <p className="mt-2 text-sm text-[#E8CFA8]">
                  Feel score: {m.keenness_score}
                </p>
              )}

              {m.audio_url && <audio controls src={m.audio_url} className="mt-4 w-full" />}

              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={`mailto:hello@gputnammusic.com?subject=K-KUT Moment Request&body=I want to request this moment: ${encodeURIComponent(m.phrase || m.title || m.id)}`}
                  className="px-4 py-2 border border-[#D4A017] text-[#D4A017] rounded hover:bg-[#D4A017]/10"
                >
                  Request This Moment
                </a>

                <a
                  href="mailto:?subject=Sending you a K-KUT feeling&body=I found a song moment for you: https://k-kut.com/find"
                  className="px-4 py-2 border border-[#D4A017]/50 text-[#E8CFA8] rounded hover:bg-[#D4A017]/10"
                >
                  Share Feeling
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border border-[#D4A017]/30 rounded p-5 bg-[#24180F]">
          <p className="text-[#E8CFA8] text-sm">
            G Putnam Music is supporting Michael Scherer and his family.
          </p>

          <p className="mt-2 text-xs text-[#C8A882]">
            Michael is facing an advanced auto-immune disorder. His wife and three girls need support.
            100% of donations go directly to Michael Scherer.
          </p>

          <div className="mt-4 flex gap-3 flex-wrap">
            <a
              href="mailto:hello@gputnammusic.com?subject=Donation for Michael Scherer&body=I want to help Michael Scherer and his family."
              className="px-4 py-2 border border-[#D4A017] text-[#D4A017] rounded hover:bg-[#D4A017]/10"
            >
              Donate / Help Michael
            </a>

            <a
              href="mailto:?subject=Help Michael Scherer&body=G Putnam Music is supporting Michael Scherer and his family. 100% of donations go directly to Michael. Visit https://k-kut.com/find"
              className="px-4 py-2 border border-[#D4A017]/50 text-[#E8CFA8] rounded hover:bg-[#D4A017]/10"
            >
              Share Campaign
            </a>
          </div>
        </div>

        <p className="mt-10 text-sm text-[#C8A882]">
          Powered by 4PE PROMOTER. Final audio remains real source audio.
        </p>
      </section>
    </main>
  );
}
