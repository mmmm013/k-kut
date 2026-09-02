"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type WorkItem = {
  id: string;
  start: number;
  storedEnd: number;
  titles: string[];
  consumerKeys: string[];
  productFamilies: string[];
};

type ReviewStatus = "PROVED" | "PENDING" | "CONFIRMED" | "HOLD";

type Decision = {
  correctedEnd: number;
  status: ReviewStatus;
  listeningVerified: boolean;
  updatedAt: string | null;
};

type EndpointGroup = {
  key: string;
  storedEnd: number;
  items: WorkItem[];
  earliestStart: number;
  nearestStart: number;
};

type Props = {
  sourceTitle: string;
  sourcePath: string;
  sourceSha256: string;
  worklistSchema: string;
  items: WorkItem[];
  prosecution: ProsecutionEndpoint[];
  measuredAlignment: {
    lag_sec: number;
    instrumental_scale: number;
    residual_mse: number;
    correlation: number;
  };
};

export type ProsecutionEndpoint = {
  stored_end_sec: number;
  proposed_end_sec: number;
  prosecution_state: "LOCKED_KKR_REFERENCE_PASS" | "KKR_SCIENTIFIC_BATCH_PASS" | "KKR_EXCEPTION_REVIEW";
  confidence: number;
  evidence: {
    authority: string;
    separator_duration_sec: number | null;
    pre_vocal_ratio: number | null;
    separator_ratio: number | null;
    post_vocal_ratio: number | null;
  };
};

type AudioState =
  | { state: "EMPTY" }
  | { state: "HASHING"; fileName: string }
  | { state: "READY"; fileName: string; sha256: string; duration: number }
  | { state: "MISMATCH"; fileName: string; sha256: string }
  | { state: "ERROR"; message: string };

const STEP = 0.01;
const NUDGE = 0.05;
const BIG_NUDGE = 0.25;
const REVIEW_LEAD = 4;
const REVIEW_TAIL = 1.5;

function fixed(value: number) {
  return Number(value.toFixed(3));
}

function timeLabel(value: number) {
  const minutes = Math.floor(value / 60);
  return `${minutes}:${(value - minutes * 60).toFixed(3).padStart(6, "0")}`;
}

function makeGroups(items: WorkItem[]): EndpointGroup[] {
  const grouped = new Map<string, WorkItem[]>();
  for (const item of items) {
    const key = item.storedEnd.toFixed(3);
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  return [...grouped.entries()]
    .map(([key, groupedItems]) => ({
      key,
      storedEnd: groupedItems[0].storedEnd,
      items: groupedItems,
      earliestStart: Math.min(...groupedItems.map((item) => item.start)),
      nearestStart: Math.max(...groupedItems.map((item) => item.start)),
    }))
    .sort((a, b) => a.storedEnd - b.storedEnd);
}

function createInitialDecisions(groups: EndpointGroup[], prosecution: ProsecutionEndpoint[]) {
  const evidenceByEnd = new Map(prosecution.map((endpoint) => [endpoint.stored_end_sec.toFixed(3), endpoint]));
  return Object.fromEntries(
    groups.map((group) => [
      group.key,
      {
        correctedEnd: evidenceByEnd.get(group.key)?.proposed_end_sec ?? group.storedEnd,
        status: evidenceByEnd.get(group.key)?.prosecution_state === "KKR_EXCEPTION_REVIEW" ? "HOLD" as const : "PROVED" as const,
        listeningVerified: false,
        updatedAt: null,
      },
    ]),
  );
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
        for (let sample = from; sample < to; sample += 1) peak = Math.max(peak, Math.abs(data[sample]));
        const amplitude = Math.max(1, peak * (height * 0.46));
        context.moveTo(x + 0.5, height / 2 - amplitude);
        context.lineTo(x + 0.5, height / 2 + amplitude);
      }
      context.stroke();
    } else {
      context.fillStyle = "#a99b86";
      context.font = "13px system-ui";
      context.fillText("Choose the governed source audio to draw the ending waveform.", 16, height / 2 + 5);
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

  return <canvas ref={canvasRef} className="h-36 w-full rounded-xl border border-amber-200/20" aria-label="Audio waveform around the stored endpoint" />;
}

export function CominTrueBoundaryWorkbench({ sourceTitle, sourcePath, sourceSha256, worklistSchema, items, prosecution, measuredAlignment }: Props) {
  const groups = useMemo(() => makeGroups(items), [items]);
  const evidenceByEnd = useMemo(() => new Map(prosecution.map((endpoint) => [endpoint.stored_end_sec.toFixed(3), endpoint])), [prosecution]);
  const storageKey = `kkr-boundary-review:v2:${sourceSha256}`;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopAtRef = useRef<number | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({ state: "EMPTY" });
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Decision>>(() => createInitialDecisions(groups, prosecution));
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, prosecution.findIndex((endpoint) => endpoint.prosecution_state === "KKR_EXCEPTION_REVIEW")));
  const [filter, setFilter] = useState<"ALL" | ReviewStatus>("HOLD");
  const [hasPlayedCurrent, setHasPlayedCurrent] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Progress saves in this browser.");

  const activeGroup = groups[activeIndex];
  const activeDecision = decisions[activeGroup.key];
  const activeEvidence = evidenceByEnd.get(activeGroup.key);
  const audioReady = audioState.state === "READY";

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { decisions?: Record<string, Decision> };
      if (!parsed.decisions) return;
      setDecisions((current) => {
        const next = { ...current };
        for (const group of groups) {
          const savedDecision = parsed.decisions?.[group.key];
          if (savedDecision && typeof savedDecision.correctedEnd === "number") next[group.key] = savedDecision;
        }
        return next;
      });
      setSaveMessage("Restored saved browser progress.");
    } catch {
      setSaveMessage("Saved progress could not be read; the governed worklist is unchanged.");
    }
  }, [groups, storageKey]);

  useEffect(() => {
    const payload = JSON.stringify({ sourceSha256, savedAt: new Date().toISOString(), decisions });
    window.localStorage.setItem(storageKey, payload);
  }, [decisions, sourceSha256, storageKey]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const updateDecision = useCallback((key: string, patch: Partial<Decision>) => {
    setDecisions((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
    }));
  }, []);

  const goTo = useCallback((index: number) => {
    setActiveIndex(Math.min(groups.length - 1, Math.max(0, index)));
    setHasPlayedCurrent(false);
    const audio = audioRef.current;
    if (audio) audio.pause();
  }, [groups.length]);

  const playWindow = useCallback((fullCapture = false) => {
    const audio = audioRef.current;
    if (!audio || !audioReady) return;
    const decision = decisions[activeGroup.key];
    const start = fullCapture ? activeGroup.nearestStart : Math.max(activeGroup.nearestStart, decision.correctedEnd - REVIEW_LEAD);
    const stopAt = Math.min(audio.duration, decision.correctedEnd + REVIEW_TAIL);
    audio.currentTime = Math.max(0, start);
    stopAtRef.current = stopAt;
    setHasPlayedCurrent(true);
    void audio.play();
  }, [activeGroup, audioReady, decisions]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTime = () => {
      if (stopAtRef.current !== null && audio.currentTime >= stopAtRef.current) {
        audio.pause();
        stopAtRef.current = null;
      }
    };
    audio.addEventListener("timeupdate", handleTime);
    return () => audio.removeEventListener("timeupdate", handleTime);
  }, []);

  const commitStatus = useCallback((status: "CONFIRMED" | "HOLD") => {
    if (status === "CONFIRMED" && (!audioReady || !hasPlayedCurrent)) return;
    updateDecision(activeGroup.key, {
      status,
      listeningVerified: status === "CONFIRMED",
      updatedAt: new Date().toISOString(),
    });
    if (activeIndex < groups.length - 1) goTo(activeIndex + 1);
  }, [activeGroup.key, activeIndex, audioReady, goTo, groups.length, hasPlayedCurrent, updateDecision]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT") return;
      if (event.key === " ") {
        event.preventDefault();
        playWindow(false);
      } else if (event.key.toLowerCase() === "j") {
        event.preventDefault();
        updateDecision(activeGroup.key, { correctedEnd: fixed(activeDecision.correctedEnd - (event.shiftKey ? BIG_NUDGE : NUDGE)), status: "PENDING", listeningVerified: false, updatedAt: null });
        setHasPlayedCurrent(false);
      } else if (event.key.toLowerCase() === "l") {
        event.preventDefault();
        updateDecision(activeGroup.key, { correctedEnd: fixed(activeDecision.correctedEnd + (event.shiftKey ? BIG_NUDGE : NUDGE)), status: "PENDING", listeningVerified: false, updatedAt: null });
        setHasPlayedCurrent(false);
      } else if (event.key === "Enter") {
        event.preventDefault();
        commitStatus("CONFIRMED");
      } else if (event.key.toLowerCase() === "h") {
        event.preventDefault();
        commitStatus("HOLD");
      } else if (event.key === "ArrowLeft") {
        goTo(activeIndex - 1);
      } else if (event.key === "ArrowRight") {
        goTo(activeIndex + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeDecision.correctedEnd, activeGroup.key, activeIndex, commitStatus, goTo, playWindow, updateDecision]);

  async function chooseAudio(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAudioState({ state: "HASHING", fileName: file.name });
    setAudioBuffer(null);
    try {
      const bytes = await file.arrayBuffer();
      const digest = await crypto.subtle.digest("SHA-256", bytes.slice(0));
      const sha256 = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      if (sha256 !== sourceSha256) {
        setAudioState({ state: "MISMATCH", fileName: file.name, sha256 });
        return;
      }
      const context = new AudioContext();
      const decoded = await context.decodeAudioData(bytes.slice(0));
      await context.close();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = URL.createObjectURL(file);
      if (audioRef.current) audioRef.current.src = objectUrlRef.current;
      setAudioBuffer(decoded);
      setAudioState({ state: "READY", fileName: file.name, sha256, duration: decoded.duration });
    } catch (error) {
      setAudioState({ state: "ERROR", message: error instanceof Error ? error.message : "The audio file could not be read." });
    }
  }

  function exportReviewPacket() {
    const exportedItems = items.map((item) => {
      const decision = decisions[item.storedEnd.toFixed(3)];
      return {
        work_item_id: item.id,
        stored_capture_end_sec: item.storedEnd,
        corrected_capture_end_sec: decision.correctedEnd,
        review_state: decision.status === "CONFIRMED" ? "LAST_VOCAL_NOTE_END_CONFIRMED" : decision.status === "PROVED" ? "KKR_SCIENTIFIC_BATCH_PROSECUTED_NOT_DP_RELEASED" : decision.status === "HOLD" ? "HOLD" : "PENDING_LAST_VOCAL_NOTE_END_REVIEW",
        boundary_prosecution_state: decision.status === "CONFIRMED" ? "STRICT_LAST_VOCAL_NOTE_END_PASS" : decision.status === "PROVED" ? "KKR_SCIENTIFIC_BATCH_PASS" : "HOLD",
        listening_verified: decision.listeningVerified,
        post_vocal_audio_allowed: false,
        reviewed_at: decision.updatedAt,
      };
    });
    const confirmedItems = exportedItems.filter((item) => item.listening_verified).length;
    const machineProsecutedItems = exportedItems.filter((item) => item.boundary_prosecution_state === "KKR_SCIENTIFIC_BATCH_PASS").length;
    const packet = {
      schema_version: "GPMX_CAPTURED_CC_BATCH_BOUNDARY_REVIEW_PACKET_V1",
      status: confirmedItems === items.length ? "REVIEW_COMPLETE_NOT_MATERIALIZED" : "DRAFT_REVIEW_IN_PROGRESS",
      generated_at: new Date().toISOString(),
      source: { title: sourceTitle, path: sourcePath, sha256: sourceSha256, worklist_schema: worklistSchema },
      controls: {
        human_listening_required: true,
        public_audio_authorized: false,
        purchase_authorized: false,
        materialization_authorized: false,
        fresh_lt_pix_discovery_permitted: false,
      },
      summary: {
        endpoint_groups: groups.length,
        source_work_items: items.length,
        confirmed_endpoint_groups: groups.filter((group) => decisions[group.key].status === "CONFIRMED").length,
        machine_prosecuted_work_items: machineProsecutedItems,
        human_confirmed_exception_work_items: confirmedItems,
        hold_endpoint_groups: groups.filter((group) => decisions[group.key].status === "HOLD").length,
      },
      endpoint_decisions: groups.map((group) => ({
        stored_capture_end_sec: group.storedEnd,
        corrected_capture_end_sec: decisions[group.key].correctedEnd,
        review_status: decisions[group.key].status,
        listening_verified: decisions[group.key].listeningVerified,
        scientific_evidence: evidenceByEnd.get(group.key) ?? null,
        affected_work_item_ids: group.items.map((item) => item.id),
        reviewed_at: decisions[group.key].updatedAt,
      })),
      items: exportedItems,
    };
    const blob = new Blob([`${JSON.stringify(packet, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "comin-true-captured-cc-boundary-review.draft.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const provedGroups = groups.filter((group) => decisions[group.key].status === "PROVED" || decisions[group.key].status === "CONFIRMED").length;
  const holdGroups = groups.filter((group) => decisions[group.key].status === "HOLD").length;
  const provedItems = groups.reduce((count, group) => count + (["PROVED", "CONFIRMED"].includes(decisions[group.key].status) ? group.items.length : 0), 0);
  const visibleGroups = groups.map((group, index) => ({ group, index })).filter(({ group }) => filter === "ALL" || decisions[group.key].status === filter);
  const windowStart = Math.max(activeGroup.nearestStart, activeDecision.correctedEnd - REVIEW_LEAD);
  const windowEnd = activeDecision.correctedEnd + REVIEW_TAIL;

  return (
    <main className="min-h-screen bg-[#090806] text-stone-100">
      <audio ref={audioRef} preload="auto" />
      <header className="border-b border-amber-200/20 bg-[#100d08] px-5 py-4">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-300">Internal · governed correction HOLD</p>
            <h1 className="mt-1 text-2xl font-black">{sourceTitle} — batch boundary review</h1>
          </div>
          <button onClick={exportReviewPacket} className="rounded-xl border border-amber-300/50 bg-amber-300/10 px-4 py-2 text-sm font-black text-amber-200 hover:bg-amber-300/20">
            Export review packet
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-stone-700 bg-stone-900/80 p-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-stone-800 p-2"><strong className="block text-xl text-emerald-400">{provedGroups}</strong><span className="text-[11px] text-stone-400">of {groups.length} proved</span></div>
            <div className="rounded-xl bg-stone-800 p-2"><strong className="block text-xl text-emerald-400">{provedItems}</strong><span className="text-[11px] text-stone-400">of {items.length} items</span></div>
            <div className="rounded-xl bg-stone-800 p-2"><strong className="block text-xl text-amber-300">{holdGroups}</strong><span className="text-[11px] text-stone-400">holds</span></div>
          </div>
          <div className="mt-4 flex gap-1">
            {(["HOLD", "PROVED", "CONFIRMED", "ALL"] as const).map((value) => (
              <button key={value} onClick={() => setFilter(value)} className={`flex-1 rounded-lg px-1 py-2 text-[10px] font-black ${filter === value ? "bg-amber-300 text-black" : "bg-stone-800 text-stone-300"}`}>{value}</button>
            ))}
          </div>
          <div className="mt-3 max-h-[calc(100vh-190px)] space-y-1 overflow-y-auto pr-1">
            {visibleGroups.map(({ group, index }) => {
              const decision = decisions[group.key];
              return (
                <button key={group.key} onClick={() => goTo(index)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${index === activeIndex ? "border-amber-300 bg-amber-300/10" : "border-transparent bg-stone-800/60 hover:border-stone-600"}`}>
                  <span><strong className="block text-sm">{timeLabel(group.storedEnd)}</strong><span className="text-[11px] text-stone-400">{group.items.length} linked item{group.items.length === 1 ? "" : "s"}</span></span>
                  <span className={`text-xs font-black ${["CONFIRMED", "PROVED"].includes(decision.status) ? "text-emerald-400" : decision.status === "HOLD" ? "text-amber-300" : "text-stone-500"}`}>{decision.status === "CONFIRMED" ? "HUMAN PASS" : decision.status}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="space-y-4">
          <section className="rounded-2xl border border-stone-700 bg-stone-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400">Governed source audio</p>
                <p className="mt-1 font-mono text-xs text-stone-300">{sourcePath}</p>
              </div>
              <label className="cursor-pointer rounded-xl bg-amber-300 px-4 py-2 text-sm font-black text-black hover:bg-amber-200">
                Choose exact source file
                <input type="file" accept="audio/*" onChange={chooseAudio} className="sr-only" />
              </label>
            </div>
            <div className="mt-3 text-sm">
              {audioState.state === "EMPTY" && <p className="text-stone-400">The file stays on this computer. It is never uploaded.</p>}
              {audioState.state === "HASHING" && <p className="text-amber-200">Verifying SHA-256 for {audioState.fileName}…</p>}
              {audioState.state === "READY" && <p className="text-emerald-400">✓ Governed source verified · {audioState.fileName} · {timeLabel(audioState.duration)}</p>}
              {audioState.state === "MISMATCH" && <p className="text-red-400">STOP — {audioState.fileName} does not match the governed SHA-256. Confirmation is blocked.</p>}
              {audioState.state === "ERROR" && <p className="text-red-400">Could not read audio: {audioState.message}</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-300/30 bg-stone-900 p-5 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-amber-300">Endpoint {activeIndex + 1} of {groups.length}</p>
                <h2 className="mt-1 text-3xl font-black">Stored end {timeLabel(activeGroup.storedEnd)}</h2>
                <p className="mt-2 text-sm text-stone-400">The batch prosecutor applies this one endpoint result to {activeGroup.items.length} captured-CC item{activeGroup.items.length === 1 ? "" : "s"}. Text and titles stay exactly as already captured.</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${activeDecision.status === "CONFIRMED" ? "bg-emerald-400/15 text-emerald-400" : activeDecision.status === "HOLD" ? "bg-amber-300/15 text-amber-300" : "bg-stone-700 text-stone-300"}`}>{activeDecision.status}</span>
            </div>

            {activeEvidence && (
              <div className="mt-4 grid gap-2 rounded-xl border border-sky-400/20 bg-sky-400/5 p-4 text-xs sm:grid-cols-4">
                <div><span className="block text-stone-500">Batch result</span><strong className="text-sky-300">{activeEvidence.prosecution_state}</strong></div>
                <div><span className="block text-stone-500">Confidence</span><strong>{Math.round(activeEvidence.confidence * 100)}%</strong></div>
                <div><span className="block text-stone-500">Separator</span><strong>{activeEvidence.evidence.separator_duration_sec === null ? "locked truth" : `${activeEvidence.evidence.separator_duration_sec.toFixed(3)} sec`}</strong></div>
                <div><span className="block text-stone-500">Evidence</span><strong>{activeEvidence.evidence.authority.replaceAll("_", " ")}</strong></div>
              </div>
            )}

            <div className="mt-5">
              <Waveform buffer={audioBuffer} windowStart={windowStart} windowEnd={windowEnd} storedEnd={activeGroup.storedEnd} correctedEnd={activeDecision.correctedEnd} />
              <div className="mt-2 flex justify-between text-[11px] text-stone-500"><span>{timeLabel(windowStart)}</span><span>gray = stored · green = proposed exact end</span><span>{timeLabel(windowEnd)}</span></div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <label htmlFor="corrected-end" className="text-xs font-black uppercase tracking-widest text-stone-400">Proposed exact last-vocal-note end</label>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => { updateDecision(activeGroup.key, { correctedEnd: fixed(activeDecision.correctedEnd - NUDGE), status: "PENDING", listeningVerified: false, updatedAt: null }); setHasPlayedCurrent(false); }} className="rounded-lg bg-stone-800 px-3 py-3 font-black">−.05</button>
                  <input id="corrected-end" type="number" step={STEP} min={Math.max(activeGroup.nearestStart, activeGroup.storedEnd - 3)} max={activeGroup.storedEnd + 2} value={activeDecision.correctedEnd} onChange={(event) => { updateDecision(activeGroup.key, { correctedEnd: fixed(Number(event.target.value)), status: "PENDING", listeningVerified: false, updatedAt: null }); setHasPlayedCurrent(false); }} className="min-w-0 flex-1 rounded-lg border border-stone-600 bg-black px-4 py-3 text-center font-mono text-xl text-emerald-300" />
                  <button onClick={() => { updateDecision(activeGroup.key, { correctedEnd: fixed(activeDecision.correctedEnd + NUDGE), status: "PENDING", listeningVerified: false, updatedAt: null }); setHasPlayedCurrent(false); }} className="rounded-lg bg-stone-800 px-3 py-3 font-black">+.05</button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => playWindow(false)} disabled={!audioReady} className="rounded-xl bg-sky-500 px-5 py-3 font-black text-black disabled:cursor-not-allowed disabled:opacity-30">▶ Hear ending</button>
                <button onClick={() => playWindow(true)} disabled={!audioReady} className="rounded-xl border border-sky-400/50 px-4 py-3 font-bold text-sky-300 disabled:cursor-not-allowed disabled:opacity-30">Hear capture</button>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button onClick={() => commitStatus("CONFIRMED")} disabled={!audioReady || !hasPlayedCurrent} className="rounded-xl bg-emerald-400 px-5 py-4 text-lg font-black text-black disabled:cursor-not-allowed disabled:opacity-30">Confirm exact END + next</button>
              <button onClick={() => commitStatus("HOLD")} className="rounded-xl border border-amber-300/60 bg-amber-300/10 px-5 py-4 text-lg font-black text-amber-200">Uncertain — HOLD + next</button>
            </div>
            {!hasPlayedCurrent && <p className="mt-3 text-center text-xs text-stone-500">Confirmation unlocks only after this endpoint has been played from the verified source.</p>}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-stone-700 bg-stone-900 p-5">
              <h3 className="font-black text-amber-200">Affected captured-CC items</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {activeGroup.items.map((item) => (
                  <div key={item.id} className="rounded-xl bg-stone-800 p-3">
                    <p className="font-semibold">{item.titles.join(" · ")}</p>
                    <p className="mt-1 font-mono text-[11px] text-stone-500">{item.id} · {timeLabel(item.start)} → {timeLabel(item.storedEnd)}</p>
                    <p className="mt-1 text-[11px] text-stone-400">{item.productFamilies.join(", ")} · {item.consumerKeys.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-stone-700 bg-stone-900 p-5 text-sm text-stone-300">
              <h3 className="font-black text-amber-200">Fast keys</h3>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                <dt className="font-mono text-white">Space</dt><dd>hear ending</dd>
                <dt className="font-mono text-white">J / L</dt><dd>− / + 0.05 sec</dd>
                <dt className="font-mono text-white">Shift J/L</dt><dd>− / + 0.25 sec</dd>
                <dt className="font-mono text-white">Enter</dt><dd>confirm + next</dd>
                <dt className="font-mono text-white">H</dt><dd>HOLD + next</dd>
                <dt className="font-mono text-white">← / →</dt><dd>previous / next</dd>
              </dl>
              <p className="mt-5 border-t border-stone-700 pt-4 text-xs leading-5 text-stone-500">Aligned masters: {measuredAlignment.lag_sec.toFixed(3)} sec lag · {measuredAlignment.correlation.toFixed(3)} correlation. {saveMessage} Export is always non-public and does not materialize, serve, sell, or authorize audio.</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
