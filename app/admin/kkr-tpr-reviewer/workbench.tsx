"use client";

import { useEffect, useState } from "react";

type Candidate = {
  candidate_key: string;
  authority_title: string;
  display_text: string | null;
  ii_type: string | null;
  container_type: string | null;
  start_sec: number | null;
  end_sec: number | null;
  review_state: string;
  evidence_state: string | null;
  updated_at: string | null;
  method_notes?: { gregory_decision?: { action: string; note?: string | null; decided_at: string } };
};

export function TprReviewerWorkbench() {
  const [queue, setQueue] = useState<Candidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/admin/kkr-tpr-reviewer/queue", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || json?.error || "load_failed");
      setQueue(json.queue || []);
    } catch (e: any) {
      setError(e?.message || "load_failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(candidateKey: string, action: "APPROVE" | "TRIM" | "HOLD" | "REJECT") {
    setBusyKey(candidateKey);
    try {
      const res = await fetch("/api/admin/kkr-tpr-reviewer/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_key: candidateKey, action, note: notes[candidateKey] || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.detail || json?.error || "decision_failed");
      await load();
    } catch (e: any) {
      setError(e?.message || "decision_failed");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <main className="min-h-screen bg-stone-950 px-5 py-10 text-stone-100">
      <section className="mx-auto max-w-3xl space-y-7">
        <header className="rounded-3xl border border-amber-300/30 bg-stone-900 p-6">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            Internal KKr &middot; TPR Reviewer
          </p>
          <h1 className="mt-3 text-3xl font-black">Listen &amp; Decide</h1>
          <p className="mt-3 leading-7 text-stone-300">
            Reads directly from the prosecuted candidate table. No login wall, no token.
            Approve / Trim / Hold / Reject writes back immediately.
          </p>
          <button
            onClick={() => load()}
            className="mt-5 inline-block rounded-xl bg-amber-300 px-4 py-3 font-black text-stone-950"
          >
            Refresh
          </button>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-400/40 bg-red-950/40 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {queue === null && !error && (
          <p className="text-stone-400">Loading candidates&hellip;</p>
        )}

        {queue && queue.length === 0 && !error && (
          <p className="text-stone-400">No prosecuted TPR candidates right now.</p>
        )}

        {queue?.map((candidate, index) => {
          const decision = candidate.method_notes?.gregory_decision;
          return (
            <article
              key={candidate.candidate_key}
              className="rounded-3xl border border-stone-700 bg-stone-900 p-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">
                {index + 1} of {queue.length} &middot; {candidate.review_state}
              </p>
              <h2 className="mt-2 text-2xl font-black">{candidate.authority_title}</h2>
              <p className="mt-1 break-all text-xs text-stone-400">{candidate.candidate_key}</p>
              {candidate.display_text && (
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-stone-300">
                  {candidate.display_text}
                </p>
              )}
              <p className="mt-2 text-xs text-stone-500">
                {candidate.start_sec?.toFixed(2)}s &ndash; {candidate.end_sec?.toFixed(2)}s &middot;{" "}
                {candidate.ii_type} / {candidate.container_type}
              </p>
              <audio
                className="mt-4 w-full"
                controls
                preload="metadata"
                src={`/api/admin/kkr-tpr-reviewer/audio/${encodeURIComponent(candidate.candidate_key)}`}
              />
              {decision && (
                <p className="mt-3 text-xs text-emerald-300">
                  Last decision: {decision.action} at {decision.decided_at}
                  {decision.note ? ` — ${decision.note}` : ""}
                </p>
              )}
              <input
                type="text"
                placeholder="Optional note"
                value={notes[candidate.candidate_key] || ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [candidate.candidate_key]: e.target.value }))}
                className="mt-4 w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {(["APPROVE", "TRIM", "HOLD", "REJECT"] as const).map((action) => (
                  <button
                    key={action}
                    disabled={busyKey === candidate.candidate_key}
                    onClick={() => decide(candidate.candidate_key, action)}
                    className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-black text-stone-950 disabled:opacity-50"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
