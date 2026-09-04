"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clampNoTrespassEnd,
  nextQueueIndexAfterDecision,
  type GovernedKutQueueItem,
  type ReviewerAction,
} from "@/lib/admin/kutReviewer";

type QueueResponse = {
  queue?: GovernedKutQueueItem[];
};

const STEP = 0.01;
const SMALL_NUDGE = 0.05;
const BIG_NUDGE = 0.25;
const END_WINDOW_LEAD = 4;
const END_WINDOW_TAIL = 1.2;

function fixed(value: number) {
  return Number(value.toFixed(3));
}

function timeLabel(value: number) {
  const minutes = Math.floor(value / 60);
  return `${minutes}:${(value - minutes * 60).toFixed(3).padStart(6, "0")}`;
}

function Waveform({
  buffer,
  windowStart,
  windowEnd,
  storedEnd,
  correctedEnd,
}: {
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
        for (let sample = from; sample < to; sample += 1) {
          peak = Math.max(peak, Math.abs(data[sample]));
        }
        const amplitude = Math.max(1, peak * (height * 0.46));
        context.moveTo(x + 0.5, height / 2 - amplitude);
        context.lineTo(x + 0.5, height / 2 + amplitude);
      }
      context.stroke();
    }

    const position = (seconds: number) => ((seconds - windowStart) / (windowEnd - windowStart)) * width;
    const storedX = position(storedEnd);
    const correctedX = position(correctedEnd);

    context.setLineDash([5, 5]);
    context.strokeStyle = "#9ca3af";
    context.beginPath();
    context.moveTo(storedX, 0);
    context.lineTo(storedX, height);
    context.stroke();

    context.setLineDash([]);
    context.strokeStyle = "#22c55e";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(correctedX, 0);
    context.lineTo(correctedX, height);
    context.stroke();
  }, [buffer, correctedEnd, storedEnd, windowEnd, windowStart]);

  return <canvas ref={canvasRef} className="h-36 w-full rounded-xl border border-amber-200/20" aria-label="Audio waveform around endpoint" />;
}

export function KutReviewerWorkbench() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopAtRef = useRef<number | null>(null);
  const [queue, setQueue] = useState<GovernedKutQueueItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ReviewerAction | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasPlayedCurrent, setHasPlayedCurrent] = useState(false);
  const [corrections, setCorrections] = useState<Record<string, number>>({});

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (stopAtRef.current !== null && audio.currentTime >= stopAtRef.current) {
        audio.pause();
        stopAtRef.current = null;
      }
    };
    const onReady = () => {
      setAudioReady(true);
      setAudioError(null);
    };
    const onError = () => {
      setAudioReady(false);
      setAudioError("Governed audio did not load in the browser.");
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onReady);
    audio.addEventListener("canplay", onReady);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onReady);
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingQueue(true);
    setQueueError(null);

    void fetch("/api/admin/kut-reviewer/queue")
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as QueueResponse & {
          error?: string;
          detail?: string;
        };
        if (!response.ok) {
          throw new Error(body.detail || body.error || "Queue load failed");
        }
        if (!cancelled) {
          const items = body.queue || [];
          setQueue(items);
          setActiveIndex(0);
          setCorrections(Object.fromEntries(items.map((item) => [item.id, item.correctedEndSec])));
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setQueueError(error instanceof Error ? error.message : "Queue load failed");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingQueue(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeItem = queue[activeIndex] || null;
  const correctedEndSec = activeItem ? corrections[activeItem.id] ?? activeItem.correctedEndSec : 0;

  const audioSrc = useMemo(() => {
    if (!activeItem) return "";
    return `/api/admin/kut-reviewer/audio/${encodeURIComponent(activeItem.id)}`;
  }, [activeItem]);

  useEffect(() => {
    let cancelled = false;

    if (!activeItem || !audioSrc) {
      setAudioBuffer(null);
      setAudioReady(false);
      setAudioError(null);
      return;
    }

    setAudioReady(false);
    setAudioError(null);
    setAudioBuffer(null);
    setHasPlayedCurrent(false);
    stopAtRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = audioSrc;
      audioRef.current.load();
    }

    // Waveform decoding is supplemental. Failure here must never disable PLAY.
    void fetch(audioSrc)
      .then((response) => {
        if (!response.ok) throw new Error("Waveform audio fetch failed");
        return response.arrayBuffer();
      })
      .then(async (arrayBuffer) => {
        const context = new AudioContext();
        try {
          const decoded = await context.decodeAudioData(arrayBuffer.slice(0));
          if (!cancelled) setAudioBuffer(decoded);
        } finally {
          await context.close();
        }
      })
      .catch(() => {
        if (!cancelled) setAudioBuffer(null);
      });

    return () => {
      cancelled = true;
    };
  }, [activeItem, audioSrc]);

  const playWindow = useCallback((fullCapture = false) => {
    const audio = audioRef.current;
    if (!audio || !activeItem || !audioReady) return;

    const start = fullCapture
      ? activeItem.startSec
      : Math.max(activeItem.startSec, correctedEndSec - END_WINDOW_LEAD);
    const finiteDuration = Number.isFinite(audio.duration) ? audio.duration : activeItem.storedEndSec;
    const stopAt = Math.min(finiteDuration, correctedEndSec + END_WINDOW_TAIL);

    audio.currentTime = Math.max(0, start);
    stopAtRef.current = stopAt;
    void audio.play()
      .then(() => {
        setHasPlayedCurrent(true);
        setAudioError(null);
      })
      .catch((error: unknown) => {
        setHasPlayedCurrent(false);
        setAudioError(error instanceof Error ? error.message : "Browser blocked governed audio playback.");
      });
  }, [activeItem, audioReady, correctedEndSec]);

  const setCurrentEnd = useCallback((next: number) => {
    if (!activeItem) return;
    setCorrections((current) => ({
      ...current,
      [activeItem.id]: clampNoTrespassEnd(activeItem.startSec, activeItem.storedEndSec, next),
    }));
    setHasPlayedCurrent(false);
  }, [activeItem]);

  const commitDecision = useCallback(async (action: ReviewerAction) => {
    if (!activeItem || pendingAction) return;
    if ((action === "APPROVE" || action === "TRIM") && (!audioReady || !hasPlayedCurrent)) return;

    setPendingAction(action);
    try {
      const response = await fetch("/api/admin/kut-reviewer/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: activeItem.id,
          action,
          correctedEndSec,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { detail?: string; error?: string };
        throw new Error(body.detail || body.error || "Decision save failed");
      }

      setQueue((current) => current.filter((item) => item.id !== activeItem.id));
      setActiveIndex((index) => nextQueueIndexAfterDecision(index, queue.length));
      setHasPlayedCurrent(false);
      if (audioRef.current) audioRef.current.pause();
    } catch (error) {
      setQueueError(error instanceof Error ? error.message : "Decision save failed");
    } finally {
      setPendingAction(null);
    }
  }, [activeItem, audioReady, correctedEndSec, hasPlayedCurrent, pendingAction, queue.length]);

  useEffect(() => {
    if (!activeItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT") return;

      if (event.key === " ") {
        event.preventDefault();
        playWindow(false);
      } else if (event.key.toLowerCase() === "j") {
        event.preventDefault();
        setCurrentEnd(correctedEndSec - (event.shiftKey ? BIG_NUDGE : SMALL_NUDGE));
      } else if (event.key.toLowerCase() === "l") {
        event.preventDefault();
        setCurrentEnd(correctedEndSec + (event.shiftKey ? BIG_NUDGE : SMALL_NUDGE));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(queue.length - 1, index + 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeItem, correctedEndSec, playWindow, queue.length, setCurrentEnd]);

  if (isLoadingQueue) {
    return <main className="min-h-screen bg-[#090806] p-8 text-stone-200">Loading governed KUT queue…</main>;
  }

  if (!activeItem) {
    return (
      <main className="min-h-screen bg-[#090806] p-8 text-stone-200">
        <h1 className="text-2xl font-black text-amber-200">P0 KUT REVIEWER</h1>
        <p className="mt-4">No pending governed KUT review items in Supabase.</p>
        {queueError && <p className="mt-2 text-red-400">{queueError}</p>}
      </main>
    );
  }

  const windowStart = Math.max(activeItem.startSec, correctedEndSec - END_WINDOW_LEAD);
  const windowEnd = correctedEndSec + END_WINDOW_TAIL;

  return (
    <main className="min-h-screen bg-[#090806] text-stone-100">
      <audio ref={audioRef} preload="auto" />
      <header className="border-b border-amber-200/20 bg-[#100d08] px-5 py-4">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Internal · Admin only</p>
        <h1 className="mt-1 text-2xl font-black">P0 KUT REVIEWER</h1>
        <p className="mt-1 text-sm text-stone-400">Supabase governed queue · one KUT at a time · source audio loaded automatically.</p>
      </header>

      <section className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-stone-700 bg-stone-900/80 p-4">
          <p className="text-sm text-stone-300">Pending queue: <strong>{queue.length}</strong></p>
          <div className="mt-3 max-h-[70vh] space-y-1 overflow-y-auto pr-1">
            {queue.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(index)}
                className={`w-full rounded-lg border px-3 py-2 text-left ${index === activeIndex ? "border-amber-300 bg-amber-300/10" : "border-transparent bg-stone-800/60 hover:border-stone-600"}`}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 font-mono text-[11px] text-stone-400">{timeLabel(item.startSec)} → {timeLabel(item.storedEndSec)}</p>
                <p className="mt-1 text-[11px] text-stone-500">{item.productFamily || "KUT"} · {item.intentLane || "governed"}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-amber-300/30 bg-stone-900 p-5 shadow-2xl">
          <p className="text-xs font-black uppercase tracking-widest text-amber-300">Review {activeIndex + 1} of {queue.length}</p>
          <h2 className="mt-1 text-3xl font-black">{activeItem.title}</h2>
          <p className="mt-2 text-sm text-stone-300">Exact capture: {timeLabel(activeItem.startSec)} → {timeLabel(activeItem.storedEndSec)}</p>
          <p className="mt-1 text-xs text-stone-500">Route: {activeItem.publicRoute || "unassigned"} · state {activeItem.reviewState} / {activeItem.boundaryState}</p>

          <div className="mt-5">
            <Waveform
              buffer={audioBuffer}
              windowStart={windowStart}
              windowEnd={windowEnd}
              storedEnd={activeItem.storedEndSec}
              correctedEnd={correctedEndSec}
            />
            <div className="mt-2 flex justify-between text-[11px] text-stone-500"><span>{timeLabel(windowStart)}</span><span>{audioBuffer ? "waveform loaded" : "waveform optional"} · gray = stored · green = END</span><span>{timeLabel(windowEnd)}</span></div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label htmlFor="corrected-end" className="text-xs font-black uppercase tracking-widest text-stone-400">END (last vocal note)</label>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => setCurrentEnd(correctedEndSec - SMALL_NUDGE)} className="rounded-lg bg-stone-800 px-3 py-3 font-black">−.05</button>
                <input
                  id="corrected-end"
                  type="number"
                  step={STEP}
                  min={activeItem.startSec}
                  max={activeItem.storedEndSec}
                  value={correctedEndSec}
                  onChange={(event) => setCurrentEnd(fixed(Number(event.target.value)))}
                  className="min-w-0 flex-1 rounded-lg border border-stone-600 bg-black px-4 py-3 text-center font-mono text-xl text-emerald-300"
                />
                <button onClick={() => setCurrentEnd(correctedEndSec + SMALL_NUDGE)} className="rounded-lg bg-stone-800 px-3 py-3 font-black">+.05</button>
              </div>
              <p className="mt-2 text-xs text-stone-500">Hard rule: END cannot go past stored endpoint (no post-vocal trespass).</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => playWindow(false)} disabled={!audioReady} className="rounded-xl bg-sky-500 px-5 py-3 font-black text-black disabled:cursor-not-allowed disabled:opacity-30">▶ Play END window</button>
              <button onClick={() => playWindow(true)} disabled={!audioReady} className="rounded-xl border border-sky-400/50 px-4 py-3 font-bold text-sky-300 disabled:cursor-not-allowed disabled:opacity-30">Play full capture</button>
            </div>
          </div>

          <div className="mt-2 text-right text-xs">
            {audioReady ? <span className="text-emerald-300">Audio ready</span> : <span className="text-amber-300">Loading governed audio…</span>}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button onClick={() => void commitDecision("APPROVE")} disabled={pendingAction !== null || !audioReady || !hasPlayedCurrent} className="rounded-xl bg-emerald-400 px-5 py-4 text-lg font-black text-black disabled:cursor-not-allowed disabled:opacity-30">APPROVE</button>
            <button onClick={() => void commitDecision("TRIM")} disabled={pendingAction !== null || !audioReady || !hasPlayedCurrent} className="rounded-xl bg-cyan-400 px-5 py-4 text-lg font-black disabled:cursor-not-allowed disabled:opacity-30">TRIM</button>
            <button onClick={() => void commitDecision("HOLD")} disabled={pendingAction !== null} className="rounded-xl border border-amber-300/60 bg-amber-300/10 px-5 py-4 text-lg font-black text-amber-200">HOLD</button>
            <button onClick={() => void commitDecision("REJECT")} disabled={pendingAction !== null} className="rounded-xl border border-red-400/60 bg-red-500/10 px-5 py-4 text-lg font-black text-red-300">REJECT</button>
          </div>

          {!hasPlayedCurrent && (
            <p className="mt-3 text-center text-xs text-stone-500">APPROVE/TRIM unlock after playback from governed source.</p>
          )}
          {audioError && <p className="mt-3 text-center text-xs text-red-400">{audioError}</p>}
          {queueError && <p className="mt-3 text-center text-xs text-red-400">{queueError}</p>}
        </section>
      </section>
    </main>
  );
}
