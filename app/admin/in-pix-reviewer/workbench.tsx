"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Item = {
  id: number;
  queue_order: number;
  authority_title: string;
  lt_track_id: string;
  in_track_id: string;
  writer_pattern_mode: string;
  review_state: string;
  owner_directive: string | null;
  structure_notes: string | null;
};

type QueueResponse = { queue?: Item[]; error?: string; detail?: string };

export function InPixReviewerWorkbench() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<Item[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Loading IN-PIX listening queue…");

  useEffect(() => {
    void fetch("/api/admin/in-pix-reviewer/queue", { cache: "no-store" })
      .then(async (r) => {
        const body = (await r.json().catch(() => ({}))) as QueueResponse;
        if (!r.ok) throw new Error(body.detail || body.error || "Queue load failed");
        const items = body.queue || [];
        setQueue(items);
        setActiveIndex(0);
        setNotes(items[0]?.structure_notes || "");
        setStatus(items.length ? "Ready." : "No pending IN-PIX structure reviews.");
      })
      .catch((e: unknown) => setStatus(e instanceof Error ? e.message : "Queue load failed"));
  }, []);

  const active = queue[activeIndex] || null;
  const audioSrc = useMemo(() => active ? `/api/admin/in-pix-reviewer/audio/${encodeURIComponent(String(active.id))}` : "", [active]);

  useEffect(() => {
    setNotes(active?.structure_notes || "");
    if (audioRef.current && audioSrc) {
      audioRef.current.pause();
      audioRef.current.src = audioSrc;
      audioRef.current.load();
    }
  }, [active, audioSrc]);

  async function save(reviewState: "PENDING_HUMAN_TPR" | "STRUCTURE_IDENTIFIED" | "HOLD") {
    if (!active) return;
    setStatus("Saving…");
    const r = await fetch("/api/admin/in-pix-reviewer/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: active.id, reviewState, structureNotes: notes }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) { setStatus(body.detail || body.error || "Save failed"); return; }
    if (reviewState === "STRUCTURE_IDENTIFIED") {
      const next = queue.filter((x) => x.id !== active.id);
      setQueue(next);
      setActiveIndex(Math.min(activeIndex, Math.max(0, next.length - 1)));
      setStatus(next.length ? "Saved. Next IN-PIX ready." : "Saved. IN-PIX queue complete.");
    } else {
      setStatus("Saved.");
    }
  }

  if (!active) return <main className="min-h-screen bg-[#090806] p-8 text-stone-100"><h1 className="text-2xl font-black text-amber-200">TPR IN-PIX REVIEWER</h1><p className="mt-4">{status}</p></main>;

  return <main className="min-h-screen bg-[#090806] text-stone-100">
    <header className="border-b border-amber-200/20 bg-[#100d08] px-5 py-4">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Internal · Human TPR</p>
      <h1 className="mt-1 text-2xl font-black">IN-PIX STRUCTURE REVIEW</h1>
      <p className="mt-1 text-sm text-stone-400">Listen one family at a time. Identify actual song parts/BLKs before VTP/CC prosecution.</p>
    </header>
    <section className="mx-auto max-w-5xl p-5">
      <div className="rounded-2xl border border-amber-300/30 bg-stone-900 p-5">
        <p className="text-xs font-black uppercase tracking-widest text-amber-300">Review {activeIndex + 1} of {queue.length}</p>
        <h2 className="mt-1 text-3xl font-black">{active.authority_title}</h2>
        <p className="mt-2 text-sm text-stone-300">Writer-pattern mode: <strong>{active.writer_pattern_mode}</strong></p>
        {active.owner_directive && <p className="mt-3 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-amber-100">{active.owner_directive}</p>}
        <audio ref={audioRef} className="mt-5 w-full" controls preload="metadata" src={audioSrc} />
        <label className="mt-5 block text-xs font-black uppercase tracking-widest text-stone-400">Structure / BLK observations</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={14} className="mt-2 w-full rounded-xl border border-stone-600 bg-black p-4 text-sm text-stone-100" placeholder="Listen through the IN-PIX. Mark actual parts, BLKs, sBLKs, repetitions, transitions, and any stand-alone NsK-capable BLKs. Do not force standard form." />
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => void save("PENDING_HUMAN_TPR")} className="rounded-xl bg-sky-500 px-4 py-3 font-black text-black">SAVE NOTES</button>
          <button onClick={() => void save("STRUCTURE_IDENTIFIED")} className="rounded-xl bg-emerald-400 px-4 py-3 font-black text-black">STRUCTURE IDENTIFIED → NEXT</button>
          <button onClick={() => void save("HOLD")} className="rounded-xl border border-amber-300/60 px-4 py-3 font-black text-amber-200">HOLD</button>
        </div>
        <p className="mt-3 text-xs text-stone-500">{status}</p>
      </div>
    </section>
  </main>;
}
