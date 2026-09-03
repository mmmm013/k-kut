"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type DecisionAction = "APPROVE" | "TRIM" | "HOLD" | "REJECT";

type QueueItem = {
  kutId: string;
  iiId: string;
  reviewId: string;
  title: string;
  authorityState: string;
  storageObjectPath: string;
  sourceSha256: string;
  capturedStartSec: number;
  capturedEndSec: number;
  correctedEndSec: number;
  vtpEndSec: number | null;
  reviewState: string | null;
  boundaryProsecutionState: string | null;
  notes: string | null;
  trackEvidence: {
    canonicalLyrics: boolean;
    sequentialBlks: boolean;
    exactVtpPairs: boolean;
  };
  provenance: {
    trackId: string;
    sourcePath: string;
    storageObjectName: string | null;
    deliveredUrlOrPath: string | null;
  };
};

type QueueResponse = {
  queue: QueueItem[];
  total: number;
};

const REVIEW_LEAD = 4;
const REVIEW_TAIL = 1.25;
const EPSILON = 0.001;
const STEP = 0.01;

function fixed(value: number) {
  return Number(value.toFixed(3));
}

function timeLabel(value: number) {
  const minutes = Math.floor(value / 60);
  return `${minutes}:${(value - minutes * 60).toFixed(3).padStart(6, "0")}`;
}

function Waveform({
  buffer,
  start,
  end,
  capturedEnd,
  proposedEnd,
}: {
  buffer: AudioBuffer | null;
  start: number;
  end: number;
  capturedEnd: number;
  proposedEnd: number;
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
      const first = Math.max(0, Math.floor(start * buffer.sampleRate));
      const last = Math.min(data.length, Math.ceil(end * buffer.sampleRate));
      const samplesPerColumn = Math.max(1, Math.floor((last - first) / width));
      context.strokeStyle = "#e6bd55";
      context.lineWidth = 1;
      context.beginPath();
      for (let x = 0; x < width; x += 1) {
        const from = first + x * samplesPerColumn;
        const to = Math.min(last, from + samplesPerColumn);
        let peak = 0;
        for (let sample = from; sample < to; sample += 1) {
          peak = Math.max(peak, Math.abs(data[sample] || 0));
        }
        const amplitude = Math.max(1, peak * (height * 0.46));
        context.moveTo(x + 0.5, height / 2 - amplitude);
        context.lineTo(x + 0.5, height / 2 + amplitude);
      }
      context.stroke();
    } else {
      context.fillStyle = "#a99b86";
      context.font = "13px system-ui";
      context.fillText("Waveform unavailable for current audio.", 16, height / 2 + 4);
    }

    const position = (seconds: number) =>
      ((seconds - start) / Math.max(0.001, end - start)) * width;

    const capturedX = position(capturedEnd);
    const proposedX = position(proposedEnd);
    context.setLineDash([5, 5]);
    context.strokeStyle = "#9ca3af";
    context.beginPath();
    context.moveTo(capturedX, 0);
    context.lineTo(capturedX, height);
    context.stroke();

    context.setLineDash([]);
    context.strokeStyle = "#22c55e";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(proposedX, 0);
    context.lineTo(proposedX, height);
    context.stroke();

    if (Number.isFinite(proposedEnd) && Number.isFinite(end) && proposedEnd > end + EPSILON) {
      context.strokeStyle = "#ef4444";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(width - 2, 0);
      context.lineTo(width - 2, height);
      context.stroke();
    }
  }, [buffer, capturedEnd, end, proposedEnd, start]);

  return (
    <canvas
      ref={canvasRef}
      className="h-36 w-full rounded-xl border border-amber-200/20"
      aria-label="Waveform near reviewed endpoint"
    />
  );
}

export function KutReviewerWorkbench({ token }: { token: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopAtRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loadedTotal, setLoadedTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [hasPlayedWindow, setHasPlayedWindow] = useState(false);
  const [lastVocalConfirmed, setLastVocalConfirmed] = useState(false);
  const [reviewerNote, setReviewerNote] = useState("");
  const [pendingSave, setPendingSave] = useState(false);

  const active = queue[0] ?? null;
  const [proposedEnd, setProposedEnd] = useState<number>(0);

  useEffect(() => {
    let alive = true;
    async function loadQueue() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/kut-reviewer?token=${encodeURIComponent(token)}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as QueueResponse & {
          error?: string;
          detail?: string;
        };

        if (!response.ok) {
          throw new Error(payload.detail || payload.error || "Queue load failed");
        }

        if (!alive) return;
        setQueue(payload.queue || []);
        setLoadedTotal(payload.total || 0);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Queue load failed");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadQueue();
    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    if (!active) {
      setProposedEnd(0);
      setAudioBuffer(null);
      setAudioReady(false);
      setHasPlayedWindow(false);
      setLastVocalConfirmed(false);
      setReviewerNote("");
      return;
    }

    setProposedEnd(active.correctedEndSec || active.capturedEndSec);
    setAudioReady(false);
    setHasPlayedWindow(false);
    setLastVocalConfirmed(false);
    setReviewerNote("");

    let cancelled = false;

    async function loadWaveform() {
      try {
        const src = `/api/admin/kkr-authority/audio/${encodeURIComponent(active.iiId)}?token=${encodeURIComponent(token)}`;
        const response = await fetch(src, { cache: "no-store" });
        if (!response.ok) {
          setAudioBuffer(null);
          return;
        }
        const bytes = await response.arrayBuffer();
        const context = new AudioContext();
        const decoded = await context.decodeAudioData(bytes.slice(0));
        await context.close();
        if (!cancelled) setAudioBuffer(decoded);
      } catch {
        if (!cancelled) setAudioBuffer(null);
      }
    }

    void loadWaveform();
    return () => {
      cancelled = true;
    };
  }, [active, token]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => setAudioReady(true);
    const handleError = () => setAudioReady(false);
    const handleTime = () => {
      if (stopAtRef.current !== null && audio.currentTime >= stopAtRef.current) {
        audio.pause();
        stopAtRef.current = null;
      }
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("timeupdate", handleTime);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("timeupdate", handleTime);
    };
  }, []);

  const vtpBoundaryError = useMemo(() => {
    if (!active || active.vtpEndSec === null) return null;
    if (proposedEnd > active.vtpEndSec + EPSILON) {
      return `END ${proposedEnd.toFixed(3)} exceeds VTP-END ${active.vtpEndSec.toFixed(3)}.`;
    }
    return null;
  }, [active, proposedEnd]);

  const playWindow = useCallback(
    (mode: "endpoint" | "full") => {
      if (!active) return;
      const audio = audioRef.current;
      if (!audio || !audioReady) return;
      const start =
        mode === "endpoint"
          ? Math.max(active.capturedStartSec, proposedEnd - REVIEW_LEAD)
          : active.capturedStartSec;
      const stopAt =
        mode === "endpoint"
          ? Math.min(audio.duration, proposedEnd + REVIEW_TAIL)
          : Math.min(audio.duration, active.capturedEndSec + REVIEW_TAIL);
      audio.currentTime = Math.max(0, start);
      stopAtRef.current = stopAt;
      setHasPlayedWindow(true);
      void audio.play();
    },
    [active, audioReady, proposedEnd],
  );

  async function saveDecision(action: DecisionAction) {
    if (!active) return;

    if ((action === "APPROVE" || action === "TRIM") && !lastVocalConfirmed) {
      setSaveMessage("Confirm that END equals the last vocal note before APPROVE/TRIM.");
      return;
    }

    if ((action === "APPROVE" || action === "TRIM") && !hasPlayedWindow) {
      setSaveMessage("Playback is required before APPROVE/TRIM.");
      return;
    }

    if (vtpBoundaryError) {
      setSaveMessage(vtpBoundaryError);
      return;
    }

    if (action === "APPROVE" && Math.abs(proposedEnd - active.capturedEndSec) > 0.01) {
      setSaveMessage("APPROVE must keep captured END. Use TRIM for endpoint changes.");
      return;
    }

    if (action === "TRIM" && proposedEnd >= active.capturedEndSec - EPSILON) {
      setSaveMessage("TRIM must set END earlier than captured END.");
      return;
    }

    setPendingSave(true);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/admin/kut-reviewer?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kutId: active.kutId,
          action,
          proposedEndSec: proposedEnd,
          capturedStartSec: active.capturedStartSec,
          capturedEndSec: active.capturedEndSec,
          vtpEndSec: active.vtpEndSec,
          lastVocalConfirmed,
          reviewerNote,
        }),
      });

      const payload = (await response.json()) as { error?: string; detail?: string };
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || "Decision save failed");
      }

      setQueue((current) => current.slice(1));
      setSaveMessage(`${action} saved. Moved to next queue item.`);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Decision save failed");
    } finally {
      setPendingSave(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-100">
        <div className="mx-auto max-w-5xl rounded-2xl border border-stone-700 bg-stone-900 p-6">
          Loading governed KUT queue from Supabase…
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-100">
        <div className="mx-auto max-w-5xl rounded-2xl border border-red-500/40 bg-stone-900 p-6 text-red-300">
          Queue unavailable: {error}
        </div>
      </main>
    );
  }

  if (!active) {
    return (
      <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-100">
        <section className="mx-auto max-w-5xl rounded-2xl border border-amber-300/30 bg-stone-900 p-6">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-amber-300">
            Internal KUT Reviewer
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Queue complete</h1>
          <p className="mt-3 text-stone-300">
            No governed KUT items are waiting for review.
          </p>
          <p className="mt-2 text-sm text-stone-400">
            Reviewed this session: {loadedTotal.toLocaleString()}
          </p>
        </section>
      </main>
    );
  }

  const reviewedCount = loadedTotal - queue.length;
  const currentIndex = reviewedCount + 1;
  const endpointWindowStart = Math.max(active.capturedStartSec, proposedEnd - REVIEW_LEAD);
  const endpointWindowEnd = Math.max(proposedEnd + REVIEW_TAIL, active.capturedEndSec + REVIEW_TAIL);
  const audioSrc = `/api/admin/kkr-authority/audio/${encodeURIComponent(active.iiId)}?token=${encodeURIComponent(token)}`;

  return (
    <main className="min-h-screen bg-stone-950 px-5 py-8 text-stone-100">
      <audio ref={audioRef} preload="auto" src={audioSrc} />

      <section className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-2xl border border-amber-300/35 bg-stone-900 p-5">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            Internal Admin · Governed KUT Reviewer
          </p>
          <h1 className="mt-2 text-3xl font-black">{active.title}</h1>
          <p className="mt-2 text-sm text-stone-300">
            Queue item {currentIndex} of {loadedTotal} · Remaining {queue.length}
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <article className="rounded-2xl border border-stone-700 bg-stone-900 p-5">
              <h2 className="text-xl font-bold text-amber-200">Identity + lineage</h2>
              <div className="mt-3 grid gap-2 text-sm text-stone-300">
                <p><strong className="text-stone-100">KUT/Review ID:</strong> {active.kutId}</p>
                <p><strong className="text-stone-100">II ID:</strong> {active.iiId}</p>
                <p><strong className="text-stone-100">Authority:</strong> {active.authorityState}</p>
                <p><strong className="text-stone-100">Source path:</strong> <span className="break-all">{active.storageObjectPath}</span></p>
                <p><strong className="text-stone-100">SHA256:</strong> <span className="break-all">{active.sourceSha256}</span></p>
              </div>
            </article>

            <article className="rounded-2xl border border-stone-700 bg-stone-900 p-5">
              <h2 className="text-xl font-bold text-amber-200">Captured boundaries</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm text-stone-300">
                <p><strong className="text-stone-100">START</strong><br />{timeLabel(active.capturedStartSec)}</p>
                <p><strong className="text-stone-100">Captured END</strong><br />{timeLabel(active.capturedEndSec)}</p>
                <p><strong className="text-stone-100">VTP-END</strong><br />{active.vtpEndSec === null ? "Unavailable" : timeLabel(active.vtpEndSec)}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => playWindow("full")}
                  disabled={!audioReady}
                  className="rounded-xl bg-sky-500 px-4 py-2 font-black text-black disabled:opacity-30"
                >
                  Hear full capture
                </button>
                <button
                  onClick={() => playWindow("endpoint")}
                  disabled={!audioReady}
                  className="rounded-xl border border-sky-400/60 px-4 py-2 font-bold text-sky-300 disabled:opacity-30"
                >
                  Hear endpoint
                </button>
                <span className="self-center text-xs text-stone-500">
                  {audioReady ? "Authoritative source loaded." : "Loading authoritative source audio…"}
                </span>
              </div>

              <div className="mt-5">
                <Waveform
                  buffer={audioBuffer}
                  start={endpointWindowStart}
                  end={endpointWindowEnd}
                  capturedEnd={active.capturedEndSec}
                  proposedEnd={proposedEnd}
                />
                <div className="mt-2 flex justify-between text-[11px] text-stone-500">
                  <span>{timeLabel(endpointWindowStart)}</span>
                  <span>gray = captured END · green = proposed END</span>
                  <span>{timeLabel(endpointWindowEnd)}</span>
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="proposed-end" className="text-xs font-black uppercase tracking-widest text-stone-400">
                  Proposed END (last vocal note)
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setProposedEnd((current) => fixed(current - 0.05))}
                    className="rounded-lg bg-stone-800 px-3 py-2 font-black"
                  >
                    −.05
                  </button>
                  <input
                    id="proposed-end"
                    type="number"
                    step={STEP}
                    min={active.capturedStartSec}
                    max={active.vtpEndSec ?? undefined}
                    value={proposedEnd}
                    onChange={(event) => setProposedEnd(fixed(Number(event.target.value)))}
                    className="min-w-0 flex-1 rounded-lg border border-stone-600 bg-black px-4 py-2 text-center font-mono text-lg text-emerald-300"
                  />
                  <button
                    onClick={() => setProposedEnd((current) => fixed(current + 0.05))}
                    className="rounded-lg bg-stone-800 px-3 py-2 font-black"
                  >
                    +.05
                  </button>
                </div>
              </div>

              {vtpBoundaryError && (
                <p className="mt-3 rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-300">
                  {vtpBoundaryError}
                </p>
              )}
            </article>
          </div>

          <aside className="space-y-4">
            <article className="rounded-2xl border border-stone-700 bg-stone-900 p-5">
              <h2 className="text-xl font-bold text-amber-200">Decision</h2>
              <label className="mt-4 flex gap-2 text-sm text-stone-300">
                <input
                  type="checkbox"
                  checked={lastVocalConfirmed}
                  onChange={(event) => setLastVocalConfirmed(event.target.checked)}
                />
                I confirm proposed END equals the last vocal note and does not pass VTP-END.
              </label>

              <label className="mt-4 block text-xs font-black uppercase tracking-widest text-stone-400">
                Reviewer note (optional)
              </label>
              <textarea
                value={reviewerNote}
                onChange={(event) => setReviewerNote(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-lg border border-stone-700 bg-black/50 px-3 py-2 text-sm text-stone-200"
              />

              <div className="mt-4 grid gap-2">
                <button
                  onClick={() => void saveDecision("APPROVE")}
                  disabled={pendingSave}
                  className="rounded-xl bg-emerald-400 px-4 py-3 font-black text-black disabled:opacity-40"
                >
                  APPROVE
                </button>
                <button
                  onClick={() => void saveDecision("TRIM")}
                  disabled={pendingSave}
                  className="rounded-xl bg-cyan-400 px-4 py-3 font-black text-black disabled:opacity-40"
                >
                  TRIM
                </button>
                <button
                  onClick={() => void saveDecision("HOLD")}
                  disabled={pendingSave}
                  className="rounded-xl border border-amber-300/60 bg-amber-300/10 px-4 py-3 font-black text-amber-200 disabled:opacity-40"
                >
                  HOLD
                </button>
                <button
                  onClick={() => void saveDecision("REJECT")}
                  disabled={pendingSave}
                  className="rounded-xl border border-red-300/60 bg-red-400/10 px-4 py-3 font-black text-red-300 disabled:opacity-40"
                >
                  REJECT
                </button>
              </div>

              {saveMessage && (
                <p className="mt-3 text-sm text-stone-300">{saveMessage}</p>
              )}
            </article>

            <article className="rounded-2xl border border-stone-700 bg-stone-900 p-5 text-sm text-stone-300">
              <h3 className="font-black text-amber-200">Governance signals</h3>
              <ul className="mt-3 space-y-1 text-xs">
                <li>Current review state: {active.reviewState || "(none)"}</li>
                <li>Current boundary state: {active.boundaryProsecutionState || "(none)"}</li>
                <li>Canonical lyrics: {active.trackEvidence.canonicalLyrics ? "yes" : "no"}</li>
                <li>Sequential BLKs: {active.trackEvidence.sequentialBlks ? "yes" : "no"}</li>
                <li>Exact VTP pairs: {active.trackEvidence.exactVtpPairs ? "yes" : "no"}</li>
                <li>Track ID: {active.provenance.trackId}</li>
                <li>Storage object name: {active.provenance.storageObjectName || "n/a"}</li>
              </ul>
            </article>
          </aside>
        </section>
      </section>
    </main>
  );
}
