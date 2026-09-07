"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Staged = { id: string; disco_track_key: string; authority_title: string; operation: string; staged_at: string };
type Run = { id: string; run_key: string; run_state: string; staged_item_count: number; started_at: string };

export function FourPeNextRunWorkbench() {
  const [staged, setStaged] = useState<Staged[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [message, setMessage] = useState("Loading Next Run…");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/4pe/stage", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.detail || body.error || "4PE status unavailable");
    setStaged(body.staged || []);
    setRuns(body.runs || []);
    setMessage("");
  }, []);

  useEffect(() => { void refresh().catch((error) => setMessage(error.message)); }, [refresh]);

  async function stage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/4pe/stage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discoTrackKey: data.get("discoTrackKey"), authorityTitle: data.get("authorityTitle"),
          operation: data.get("operation"), sourceLocator: { stlTrackId: data.get("stlTrackId") },
          stagedReason: data.get("stagedReason"),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || body.error || "Staging failed");
      event.currentTarget.reset();
      await refresh();
      setMessage(`${body.staged.authority_title} is staged for the Next Run.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Staging failed"); }
    finally { setBusy(false); }
  }

  async function cancel(id: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/4pe/stage?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || body.error || "Cancel failed");
      await refresh(); setMessage("Removed from the Next Run.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Cancel failed"); }
    finally { setBusy(false); }
  }

  async function runNow() {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/4pe/run", { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || body.error || "Run start failed");
      await refresh(); setMessage(body.empty ? "Nothing was staged; no empty run was created." : `4PE run started: ${body.runId}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Run start failed"); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#090806] px-5 py-8 text-stone-100">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-2xl border border-amber-300/30 bg-[#100d08] p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Production · 4PE</p>
        <h1 className="mt-2 text-3xl font-black">Next Run</h1>
        <p className="mt-2 text-stone-300">Stage DISCO STL mixed tracks. Intake derives VOCAL + INSTRO, then BLKs/TPs, KK renders, and TPR review. Scheduled runs snapshot staged changes every 12 hours.</p>
        <p className="mt-2 text-sm text-stone-500">Stable catalog IIs remain untouched. REPROCESS or DELETE affects only the named track and preserves archive lineage.</p>
      </header>

      <form onSubmit={stage} className="grid gap-4 rounded-2xl border border-stone-700 bg-stone-900 p-5 md:grid-cols-2">
        <label className="text-sm">Title<input required name="authorityTitle" className="mt-1 w-full rounded-lg border border-stone-600 bg-black p-3" /></label>
        <label className="text-sm">DISCO stable track ID<input required name="stlTrackId" className="mt-1 w-full rounded-lg border border-stone-600 bg-black p-3" /></label>
        <label className="text-sm">DISCO track key<input required name="discoTrackKey" className="mt-1 w-full rounded-lg border border-stone-600 bg-black p-3" placeholder="gotta-keep-movin" /></label>
        <label className="text-sm">Action<select name="operation" className="mt-1 w-full rounded-lg border border-stone-600 bg-black p-3"><option>UPSERT</option><option>REPROCESS</option><option>DELETE</option></select></label>
        <label className="text-sm md:col-span-2">Reason<input name="stagedReason" defaultValue="NEXT_RUN" className="mt-1 w-full rounded-lg border border-stone-600 bg-black p-3" /></label>
        <button disabled={busy} className="rounded-xl bg-amber-300 px-5 py-3 font-black text-black disabled:opacity-50">Stage for Next Run</button>
        <button type="button" disabled={busy || staged.length === 0} onClick={runNow} className="rounded-xl border border-amber-300 px-5 py-3 font-black text-amber-200 disabled:opacity-40">Run staged items now</button>
      </form>

      {message && <p className="rounded-xl border border-amber-200/20 bg-amber-200/5 p-4 text-amber-100">{message}</p>}

      <section className="rounded-2xl border border-stone-700 bg-stone-900 p-5">
        <h2 className="text-xl font-black">Staged: {staged.length}</h2>
        <div className="mt-4 space-y-2">{staged.length === 0 ? <p className="text-stone-400">No changes staged.</p> : staged.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-black/30 p-4">
          <div className="min-w-0 flex-1"><strong>{item.authority_title}</strong><p className="text-xs text-stone-400">{item.operation} · {item.disco_track_key}</p></div>
          <button disabled={busy} onClick={() => cancel(item.id)} className="rounded-lg border border-red-400/50 px-3 py-2 text-sm text-red-200">Remove</button>
        </div>)}</div>
      </section>

      <section className="rounded-2xl border border-stone-700 bg-stone-900 p-5">
        <h2 className="text-xl font-black">Recent runs</h2>
        <div className="mt-4 space-y-2">{runs.map((run) => <div key={run.id} className="rounded-xl bg-black/30 p-3 text-sm"><strong>{run.run_key}</strong> · {run.run_state} · {run.staged_item_count} item(s)</div>)}</div>
      </section>
    </div>
  </main>;
}
