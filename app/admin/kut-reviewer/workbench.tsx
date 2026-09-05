"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clampTprEnd,
  nextQueueIndexAfterDecision,
  type GovernedKutQueueItem,
  type ReviewerAction,
} from "@/lib/admin/kutReviewer";

type QueueResponse = { queue?: GovernedKutQueueItem[] };

const SMALL_NUDGE = 0.05;
const END_WINDOW_LEAD = 4;
const END_WINDOW_TAIL = 1.2;

function fixed(value: number) { return Number(value.toFixed(3)); }
function timeLabel(value: number) {
  const minutes = Math.floor(value / 60);
  return `${minutes}:${(value - minutes * 60).toFixed(3).padStart(6, "0")}`;
}

function Waveform({ buffer, windowStart, windowEnd, storedEnd, correctedEnd }: {
  buffer: AudioBuffer | null;
  windowStart: number;
  windowEnd: number;
  storedEnd: number;
  correctedEnd: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#17120b";
    context.fillRect(0, 0, width, height);
    if (buffer) {
      const data = buffer.getChannelData(0);
      const first = Math.max(0, Math.floor(windowStart * buffer.sampleRate));
      const last = Math.min(data.length, Math.ceil(windowEnd * buffer.sampleRate));
      const samplesPerColumn = Math.max(1, Math.floor((last - first) / width));
      context.strokeStyle = "#e6bd55";
      context.lineWidth = 1;
      context.beginPath();
      for (let x = 0; x < width; x += 1) {
        const from = first + x * samplesPerColumn;
        const to = Math.min(last, from + samplesPerColumn);
        let peak = 0;
        for (let sample = from; sample < to; sample += 1) peak = Math.max(peak, Math.abs(data[sample]));
        const amplitude = Math.max(1, peak * height * 0.46);
        context.moveTo(x + 0.5, height / 2 - amplitude);
        context.lineTo(x + 0.5, height / 2 + amplitude);
      }
      context.stroke();
    }
    const position = (seconds: number) => ((seconds - windowStart) / (windowEnd - windowStart)) * width;
    context.setLineDash([5, 5]);
    context.strokeStyle = "#9ca3af";
    context.beginPath();
    context.moveTo(position(storedEnd), 0);
    context.lineTo(position(storedEnd), height);
    context.stroke();
    context.setLineDash([]);
    context.strokeStyle = "#22c55e";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(position(correctedEnd), 0);
    context.lineTo(position(correctedEnd), height);
    context.stroke();
  }, [buffer, correctedEnd, storedEnd, windowEnd, windowStart]);
  return <canvas ref={canvasRef} className="h-36 w-full rounded-xl border border-amber-200/20" aria-label="Audio waveform around endpoint" />;
}

export function KutReviewerWorkbench() {
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const [queue, setQueue] = useState<GovernedKutQueueItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ReviewerAction | null>(null);
  const [isRunningIntake, setIsRunningIntake] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasPlayedCurrent, setHasPlayedCurrent] = useState(false);
  const [corrections, setCorrections] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/kut-reviewer/queue")
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as QueueResponse & { error?: string; detail?: string };
        if (!response.ok) throw new Error(body.detail || body.error || "Queue load failed");
        if (!cancelled) {
          const items = body.queue || [];
          setQueue(items);
          setCorrections(Object.fromEntries(items.map((item) => [item.id, item.correctedEndSec])));
        }
      })
      .catch((error: unknown) => !cancelled && setQueueError(error instanceof Error ? error.message : "Queue load failed"))
      .finally(() => !cancelled && setIsLoadingQueue(false));
    return () => { cancelled = true; };
  }, []);

  const activeItem = queue[activeIndex] || null;
  const correctedEndSec = activeItem ? corrections[activeItem.id] ?? activeItem.correctedEndSec : 0;
  const audioSrc = useMemo(() => activeItem ? `/api/admin/kut-reviewer/audio/${encodeURIComponent(activeItem.id)}` : "", [activeItem]);

  useEffect(() => {
    let cancelled = false;
    sourceRef.current?.stop();
    sourceRef.current = null;
    setAudioBuffer(null);
    setAudioError(null);
    setHasPlayedCurrent(false);
    if (!audioSrc) return;

    void fetch(audioSrc, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Governed audio fetch failed (${response.status})`);
        return response.arrayBuffer();
      })
      .then(async (bytes) => {
        const decodeContext = new AudioContext();
        try {
          const decoded = await decodeContext.decodeAudioData(bytes.slice(0));
          if (!cancelled) setAudioBuffer(decoded);
        } finally {
          await decodeContext.close();
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) setAudioError(error instanceof Error ? error.message : "Governed audio could not be decoded.");
      });

    return () => { cancelled = true; sourceRef.current?.stop(); sourceRef.current = null; };
  }, [audioSrc]);

  const playWindow = useCallback(async (mode: "ending" | "blk" | "source") => {
    if (!activeItem || !audioBuffer) return;
    try {
      sourceRef.current?.stop();
      let context = playbackContextRef.current;
      if (!context || context.state === "closed") {
        context = new AudioContext();
        playbackContextRef.current = context;
      }
      if (context.state === "suspended") await context.resume();
      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      const start = mode === "source" ? 0 : mode === "blk" ? activeItem.startSec : Math.max(0, correctedEndSec - END_WINDOW_LEAD);
      const stopAt = mode === "source" ? audioBuffer.duration : Math.min(audioBuffer.duration, correctedEndSec + END_WINDOW_TAIL);
      const duration = Math.max(0.01, stopAt - start);
      source.start(0, Math.max(0, start), duration);
      sourceRef.current = source;
      setHasPlayedCurrent(true);
      setAudioError(null);
      source.onended = () => { if (sourceRef.current === source) sourceRef.current = null; };
    } catch (error) {
      setHasPlayedCurrent(false);
      setAudioError(error instanceof Error ? error.message : "Browser playback failed.");
    }
  }, [activeItem, audioBuffer, correctedEndSec]);

  const setCurrentEnd = useCallback((next: number) => {
    if (!activeItem || !audioBuffer) return;
    setCorrections((current) => ({ ...current, [activeItem.id]: clampTprEnd(activeItem.startSec, audioBuffer.duration, next) }));
    setHasPlayedCurrent(false);
  }, [activeItem, audioBuffer]);

  const runTornMemoriesIntake = useCallback(async () => {
    if (isRunningIntake) return;
    setIsRunningIntake(true);
    setQueueError(null);
    try {
      const response = await fetch("/api/admin/kkr-torn-memories/prosecute", { method: "POST", cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok || body.error) throw new Error(body.error || "KKr intake failed");
      window.location.reload();
    } catch (error) {
      setQueueError(error instanceof Error ? error.message : "KKr intake failed");
    } finally {
      setIsRunningIntake(false);
    }
  }, [isRunningIntake]);

  const commitDecision = useCallback(async (action: ReviewerAction) => {
    if (!activeItem || pendingAction) return;
    const sourceDurationSec = audioBuffer?.duration;
    if ((action === "APPROVE" || action === "TRIM") && (!sourceDurationSec || !hasPlayedCurrent)) return;
    setPendingAction(action);
    try {
      const response = await fetch("/api/admin/kut-reviewer/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: activeItem.id, action, correctedEndSec, sourceDurationSec }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { detail?: string; error?: string };
        throw new Error(body.detail || body.error || "Decision save failed");
      }
      sourceRef.current?.stop();
      setQueue((current) => current.filter((item) => item.id !== activeItem.id));
      setActiveIndex((index) => nextQueueIndexAfterDecision(index, queue.length));
      setHasPlayedCurrent(false);
    } catch (error) {
      setQueueError(error instanceof Error ? error.message : "Decision save failed");
    } finally {
      setPendingAction(null);
    }
  }, [activeItem, audioBuffer, correctedEndSec, hasPlayedCurrent, pendingAction, queue.length]);

  if (isLoadingQueue) return <main className="min-h-screen bg-[#090806] p-8 text-stone-200">Loading governed KUT queue…</main>;
  if (!activeItem) return <main className="min-h-screen bg-[#090806] p-8 text-stone-200"><h1 className="text-2xl font-black text-amber-200">P0 KUT REVIEWER</h1><p className="mt-4">No pending governed KUT review items in Supabase.</p><button onClick={() => void runTornMemoriesIntake()} disabled={isRunningIntake} className="mt-5 rounded-lg bg-amber-300 px-4 py-2 text-sm font-black text-black disabled:opacity-40">{isRunningIntake ? "Running Torn Memories intake…" : "Run Torn Memories intake"}</button>{queueError && <p className="mt-2 text-red-400">{queueError}</p>}</main>;

  const windowStart = Math.max(activeItem.startSec, correctedEndSec - END_WINDOW_LEAD);
  const windowEnd = correctedEndSec + END_WINDOW_TAIL;

  return <main className="min-h-screen bg-[#090806] text-stone-100">
    <header className="border-b border-amber-200/20 bg-[#100d08] px-5 py-4">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Internal · Admin only</p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">P0 KUT REVIEWER</h1>
        <div className="flex flex-wrap gap-2"><a href="/admin/kkr-torn-memories-intake" className="rounded-lg border border-sky-400/60 px-4 py-2 text-sm font-black text-sky-200">Open Torn Memories intake</a><button onClick={() => void runTornMemoriesIntake()} disabled={isRunningIntake} className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-black text-black disabled:opacity-40">{isRunningIntake ? "Running Torn Memories intake…" : "Run Torn Memories intake"}</button></div>
      </div>
      <p className="mt-1 text-sm text-stone-400">BLK → Sister Pair Unit → governed vocal CC. IN-PIX remains internal evidence; review audio is vocal LT-PIX only.</p>
    </header>
    <section className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-stone-700 bg-stone-900/80 p-4">
        <p className="text-sm text-stone-300">Pending queue: <strong>{queue.length}</strong></p>
        <div className="mt-3 max-h-[70vh] space-y-1 overflow-y-auto pr-1">
          {queue.map((item, index) => <button key={item.id} onClick={() => setActiveIndex(index)} className={`w-full rounded-lg border px-3 py-2 text-left ${index === activeIndex ? "border-amber-300 bg-amber-300/10" : "border-transparent bg-stone-800/60 hover:border-stone-600"}`}>
            <p className="text-sm font-semibold">{item.title}</p>
            <p className="mt-1 font-mono text-[11px] text-stone-400">{timeLabel(item.startSec)} → {timeLabel(item.storedEndSec)}</p>
            <p className="mt-1 text-[11px] text-stone-500">{item.productFamily || "KUT"} · {item.intentLane || "governed"}</p>
          </button>)}
        </div>
      </aside>
      <section className="rounded-2xl border border-amber-300/30 bg-stone-900 p-5 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-widest text-amber-300">Review {activeIndex + 1} of {queue.length}</p>
        <h2 className="mt-1 text-3xl font-black">{activeItem.title}</h2>
        <p className="mt-2 text-sm text-stone-300">Machine proposal: {timeLabel(activeItem.startSec)} → {timeLabel(activeItem.storedEndSec)} · owner review range: 0:00.000 → {audioBuffer ? timeLabel(audioBuffer.duration) : "loading"}</p>
        <p className="mt-1 text-xs text-stone-500">state {activeItem.reviewState} / {activeItem.boundaryState}</p>
        <div className="mt-5">
          <Waveform buffer={audioBuffer} windowStart={windowStart} windowEnd={windowEnd} storedEnd={activeItem.storedEndSec} correctedEnd={correctedEndSec} />
          <div className="mt-2 flex justify-between text-[11px] text-stone-500"><span>{timeLabel(windowStart)}</span><span>{audioBuffer ? "audio decoded · ready to play" : "loading governed audio"} · gray = stored · green = END</span><span>{timeLabel(windowEnd)}</span></div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-stone-400">END (LAST VOCAL NOTE)</label>
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => setCurrentEnd(correctedEndSec - SMALL_NUDGE)} className="rounded-lg bg-stone-800 px-3 py-3 font-black">−.05</button>
              <input type="number" step={0.01} min={activeItem.startSec} max={audioBuffer?.duration || undefined} value={correctedEndSec} onChange={(event) => setCurrentEnd(fixed(Number(event.target.value)))} className="min-w-0 flex-1 rounded-lg border border-stone-600 bg-black px-4 py-3 text-center font-mono text-xl text-emerald-300" />
              <button onClick={() => setCurrentEnd(correctedEndSec + SMALL_NUDGE)} className="rounded-lg bg-stone-800 px-3 py-3 font-black">+.05</button>
            </div>
            <p className="mt-2 text-xs text-stone-500">The machine endpoint is a proposal. Owner TPR may set END anywhere after BLK start and before the decoded LT-PIX source ends.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => void playWindow("ending")} disabled={!audioBuffer} className="rounded-xl bg-sky-500 px-5 py-3 font-black text-black disabled:opacity-30">▶ Listen at END</button>
            <button onClick={() => void playWindow("blk")} disabled={!audioBuffer} className="rounded-xl border border-sky-400/50 px-4 py-3 font-bold text-sky-300 disabled:opacity-30">Listen BLK</button>
            <button onClick={() => void playWindow("source")} disabled={!audioBuffer} className="rounded-xl border border-stone-500 px-4 py-3 font-bold text-stone-200 disabled:opacity-30">Listen source</button>
          </div>
        </div>
        <div className="mt-2 text-right text-xs">{audioBuffer ? <span className="text-emerald-300">Audio ready</span> : <span className="text-amber-300">Loading governed audio…</span>}</div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <button onClick={() => void commitDecision("APPROVE")} disabled={pendingAction !== null || !audioBuffer || !hasPlayedCurrent} className="rounded-xl bg-emerald-400 px-5 py-4 text-lg font-black text-black disabled:opacity-30">APPROVE</button>
          <button onClick={() => void commitDecision("TRIM")} disabled={pendingAction !== null || !audioBuffer || !hasPlayedCurrent} className="rounded-xl bg-cyan-400 px-5 py-4 text-lg font-black disabled:opacity-30">TRIM</button>
          <button onClick={() => void commitDecision("HOLD")} disabled={pendingAction !== null} className="rounded-xl border border-amber-300/60 bg-amber-300/10 px-5 py-4 text-lg font-black text-amber-200">HOLD</button>
          <button onClick={() => void commitDecision("REJECT")} disabled={pendingAction !== null} className="rounded-xl border border-red-400/60 bg-red-500/10 px-5 py-4 text-lg font-black text-red-300">REJECT</button>
        </div>
        {!hasPlayedCurrent && <p className="mt-3 text-center text-xs text-stone-500">APPROVE/TRIM unlock after successful governed playback.</p>}
        {audioError && <p className="mt-3 text-center text-xs text-red-400">{audioError}</p>}
        {queueError && <p className="mt-3 text-center text-xs text-red-400">{queueError}</p>}
      </section>
    </section>
  </main>;
}
