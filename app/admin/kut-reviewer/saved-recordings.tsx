"use client";
import { useEffect, useState } from "react";

type Item = { record_key: string; title: string; parent_title: string; product_layer: string; inventory_state: string; object_exists: boolean; source_table: string; source_record_id: string; capture_start_sec: number | null; capture_end_sec: number | null };
type Decision = { id: string; ii_key: string; action: string; corrected_end_sec: number | null; created_at: string };

export function SavedRecordings() {
  const [items, setItems] = useState<Item[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [active, setActive] = useState<Item | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Loading saved recordings…");
  const [played, setPlayed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/kut-reviewer/saved", { signal: controller.signal }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Your owner session is required to open private recordings." : body.error);
      setItems(body.items); setDecisions(body.decisions); setActive(body.items.find((item: Item) => item.object_exists) || body.items[0] || null);
      setStatus(`${body.total} existing inventory records · ${body.linkedAudio} exact stored-audio links`);
    }).catch(error => { if (!controller.signal.aborted) setStatus(error.message); });
    return () => controller.abort();
  }, []);
  return <section className="rounded-xl border border-amber-300/30 bg-stone-950 p-5 text-stone-100">
    <h2 className="text-2xl font-bold">Your saved KUT recordings</h2>
    <p className="my-3" role="status">{status}</p>
    <p className="mb-3 text-sm text-stone-400">Listen to each existing recording as stored. Source boundaries and previous decisions are retained. Listening does not approve or release a product.</p>
    <input aria-label="Find saved KUT" placeholder="Find a song or KUT" value={query} onChange={e => setQuery(e.target.value)} className="mb-3 w-full rounded bg-stone-800 p-3" />
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <div className="max-h-[65vh] overflow-auto">{items.filter(item => `${item.title} ${item.parent_title}`.toLowerCase().includes(query.toLowerCase())).map(item => <button key={item.record_key} aria-pressed={active?.record_key === item.record_key} onClick={() => { setActive(item); setPlayed(false); }} className="mb-2 block w-full rounded border border-stone-700 p-3 text-left">
        <b>{item.parent_title || item.title}</b><br /><span>{item.title}</span><br /><small>{item.object_exists ? "Stored recording linked" : "Recording link recovery pending"}</small>
      </button>)}</div>
      <div>{active && <><h3 className="text-xl font-bold">{active.parent_title || active.title}</h3><p>{active.title}</p><p className="my-2 text-sm">{active.inventory_state}</p>
        {active.object_exists ? <audio key={active.record_key} controls preload="metadata" className="my-4 w-full" src={`/api/admin/kut-reviewer/saved?audio=${encodeURIComponent(active.record_key)}`} onPlaying={() => setPlayed(true)} onError={() => setStatus("The selected recording failed to load. Its inventory record remains preserved.")} /> : <p className="my-4">This saved record is retained while its exact audio location is recovered.</p>}
        {played && <p>Playback started for this saved recording.</p>}
        <p className="text-sm text-stone-400">Saved source reference: {active.source_table} / {active.source_record_id}</p>
        {active.capture_start_sec !== null && <p className="text-sm text-stone-400">Recorded source coordinates: {active.capture_start_sec}–{active.capture_end_sec}. Playback starts at the beginning of the stored excerpt.</p>}
      </>}</div>
    </div>
    <details className="mt-5"><summary>Saved owner decisions ({decisions.length})</summary><p className="my-2 text-sm">Original decision identities are preserved; unmatched decisions are not reassigned to other recordings.</p>{decisions.map(decision => <p key={decision.id} className="my-2 text-sm">{decision.ii_key}: {decision.action}{decision.corrected_end_sec !== null ? ` · saved END ${Number(decision.corrected_end_sec).toFixed(3)}` : ""} · {decision.created_at}</p>)}</details>
  </section>;
}
