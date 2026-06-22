"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type QueueRow = {
  task_id?: string;
  id?: string;
  track_id?: string;
  title?: string;
  public_title?: string;
  internal_source_title?: string;
  source_title?: string;
  audio_url?: string;
  mp3_url?: string;
  wav_url?: string;
  sequence_order?: number;
  artist?: string;
  tp_marks_count?: number;
};

type Mark = {
  trackTitle: string;
  trackId: string;
  taskId: string;
  label: string;
  seconds: number;
  timeText: string;
  saved: boolean;
  saveNote: string;
};

const BUTTONS = [
  { label: "SONG_START", text: "Start Song", from: "NONE", to: "Song Start" },
  { label: "INTRO_END__V1_START", text: "End Intro / Start V1", from: "Intro", to: "Verse 1" },
  { label: "V1_END__CH1_START", text: "End V1 / Start Ch1", from: "Verse 1", to: "Chorus 1" },
  { label: "CH1_END__V2_START", text: "End Ch1 / Start V2", from: "Chorus 1", to: "Verse 2" },
  { label: "V2_END__CH2_START", text: "End V2 / Start Ch2", from: "Verse 2", to: "Chorus 2" },
  { label: "CH2_END__BRIDGE_START", text: "End Ch2 / Start Bridge", from: "Chorus 2", to: "Bridge" },
  { label: "BRIDGE_END__CH3_START", text: "End Bridge / Start Ch3", from: "Bridge", to: "Chorus 3" },
  { label: "CH3_END__OUTRO_START", text: "End Ch3 / Start Outro", from: "Chorus 3", to: "Outro" },
  { label: "SONG_END", text: "End Song", from: "Final Section", to: "Song End" },
];

function fmt(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds - mins * 60;
  return `${mins}:${secs.toFixed(3).padStart(6, "0")}`;
}

function getToken() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("token") || "";
}

function getTitle(row: QueueRow | undefined) {
  if (!row) return "No LT-PIX loaded";
  return (
    row.public_title ||
    row.title ||
    row.internal_source_title ||
    row.source_title ||
    "Untitled KLEIGH LT-PIX"
  );
}

function getAudio(row: QueueRow | undefined) {
  if (!row) return "";
  return row.audio_url || row.mp3_url || row.wav_url || "";
}

export default function MichaelKleighMarkerPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [token, setToken] = useState("");
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [index, setIndex] = useState(0);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [status, setStatus] = useState("Loading KLEIGH LT-PIX queue…");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = getToken();
    setToken(t);

    if (!t) {
      setStatus("Missing review token. Use the retained local launcher or Michael's approved review link.");
      return;
    }

    fetch(`/api/tp/michael-kleigh/queue?token=${encodeURIComponent(t)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || `Queue failed with HTTP ${res.status}`);
        }
        return data;
      })
      .then((rows) => {
        const safeRows = Array.isArray(rows) ? rows : [];
        setQueue(safeRows);
        setIndex(0);
        setStatus(safeRows.length ? `Loaded ${safeRows.length} KLEIGH LT-PIX TSKs.` : "Queue loaded, but no KLEIGH LT-PIX rows were returned.");
      })
      .catch((err) => {
        setStatus(`Queue blocked: ${err.message}`);
      });
  }, []);

  const current = queue[index];
  const title = getTitle(current);
  const audioUrl = getAudio(current);
  const taskId = current?.task_id || current?.id || "";
  const trackId = current?.track_id || "";

  const trackMarks = useMemo(() => {
    return marks.filter((m) => m.taskId === taskId && m.trackId === trackId);
  }, [marks, taskId, trackId]);

  const exportText = useMemo(() => {
    const header = [
      "Michael Clay — KLEIGH BLK-TP marks",
      "Rule:",
      "BLK decides. Time reports only.",
      "TP = where the next section actually begins.",
      "No percentage guessing.",
      "No fake sBLKs.",
      "Do not redo KKs.",
      "Do not create mKs.",
      "",
      `Current LT-PIX: ${title}`,
      `Queue position: ${queue.length ? index + 1 : 0} of ${queue.length}`,
      "",
      "MARKS:",
    ].join("\n");

    const body = marks
      .map((m) => {
        const savedText = m.saved ? "saved_to_backend" : "export_only";
        return [
          `TRACK: ${m.trackTitle}`,
          `TRACK_ID: ${m.trackId}`,
          `TASK_ID: ${m.taskId}`,
          `TP: ${m.label}`,
          `TIME: ${m.seconds.toFixed(3)}s`,
          `TIME_TEXT: ${m.timeText}`,
          `STATUS: ${savedText}`,
          m.saveNote ? `NOTE: ${m.saveNote}` : "",
        ].filter(Boolean).join("\n");
      })
      .join("\n---\n");

    return `${header}\n${body ? body + "\n" : ""}`;
  }, [marks, title, queue.length, index]);

  async function mark(button: (typeof BUTTONS)[number]) {
    const audio = audioRef.current;
    if (!audio || !current) return;

    const seconds = Number(audio.currentTime.toFixed(3));
    const timeText = fmt(seconds);

    let saved = false;
    let saveNote = "Export captured.";

    if (token && taskId) {
      try {
        const res = await fetch("/api/tp/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            taskId,
            transitionSec: seconds,
            fromBlkLabel: button.from,
            toBlkLabel: button.to,
            note: button.label,
            botNote: "Michael Clay KLEIGH marker tool",
          }),
        });

        const data = await res.json().catch(() => null);
        if (res.ok) {
          saved = true;
          saveNote = "Saved to backend and export captured.";
        } else {
          saveNote = `Export captured. Backend save blocked: ${data?.error || res.status}`;
        }
      } catch (err) {
        saveNote = `Export captured. Backend save blocked: ${err instanceof Error ? err.message : "unknown error"}`;
      }
    }

    setMarks((prev) => [
      ...prev,
      {
        trackTitle: title,
        trackId,
        taskId,
        label: button.label,
        seconds,
        timeText,
        saved,
        saveNote,
      },
    ]);

    setCopied(false);
  }

  async function copyExport() {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
  }

  function nextTrack() {
    setIndex((i) => Math.min(i + 1, Math.max(queue.length - 1, 0)));
    setCopied(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prevTrack() {
    setIndex((i) => Math.max(i - 1, 0));
    setCopied(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#2b1b12",
      color: "#fff4dc",
      padding: "32px",
      fontFamily: "Arial, sans-serif",
    }}>
      <h1 style={{ color: "#ffd37a", fontSize: 40, margin: "0 0 8px" }}>
        Michael Clay — KLEIGH BLK-TP Marker
      </h1>

      <p style={{ color: "#e9c893", fontSize: 19, marginBottom: 24 }}>
        Full audio. Click the exact section transition. Export code remains available even if backend save is blocked.
      </p>

      <section style={panelStyle}>
        <h2>Current LT-PIX</h2>
        <p style={{ fontSize: 18 }}>
          <strong>{queue.length ? `${index + 1} of ${queue.length}` : "0 of 0"}</strong> — {title}
        </p>
        <p style={{ color: "#ffd37a", fontWeight: "bold" }}>{status}</p>
      </section>

      <section style={panelStyle}>
        <h2>Full Source Audio</h2>
        {audioUrl ? (
          <audio
            key={audioUrl}
            ref={audioRef}
            controls
            preload="metadata"
            src={audioUrl}
            style={{ width: "100%", margin: "14px 0" }}
          />
        ) : (
          <p style={{ color: "#ffd37a", fontWeight: "bold" }}>
            No audio URL loaded yet. Queue/API must load before Michael can mark this LT-PIX.
          </p>
        )}
        <p style={{ color: "#ffd37a", fontWeight: "bold" }}>
          TP = where the next section actually begins. No percentage guessing. No fake sBLKs.
        </p>
      </section>

      <section style={panelStyle}>
        <h2>Mark BLK-TPs</h2>
        <div>
          {BUTTONS.map((b) => (
            <button key={b.label} onClick={() => mark(b)} disabled={!audioUrl} style={buttonStyle}>
              {b.text}
            </button>
          ))}
        </div>
        <button onClick={copyExport} style={{ ...buttonStyle, background: "#9a612a" }}>
          Export Code / Copy Marks
        </button>
        {copied && <span style={{ marginLeft: 12, color: "#ffd37a", fontWeight: "bold" }}>Copied.</span>}
      </section>

      <section style={panelStyle}>
        <h2>This LT-PIX Marks</h2>
        {trackMarks.length ? (
          <pre style={preStyle}>
            {trackMarks.map((m) => `${m.label}: ${m.seconds.toFixed(3)}s (${m.timeText}) — ${m.saved ? "saved" : "export"}`).join("\n")}
          </pre>
        ) : (
          <p>No marks yet for this LT-PIX.</p>
        )}
      </section>

      <section style={panelStyle}>
        <h2>Marks Output</h2>
        <textarea value={exportText} readOnly style={textareaStyle} />
      </section>

      <section style={panelStyle}>
        <button onClick={prevTrack} disabled={index <= 0} style={buttonStyle}>
          Previous LT-PIX
        </button>
        <button onClick={nextTrack} disabled={!queue.length || index >= queue.length - 1} style={buttonStyle}>
          Next LT-PIX
        </button>
      </section>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  background: "#3a2417",
  border: "1px solid #8b5a2b",
  borderRadius: 18,
  padding: 22,
  margin: "20px 0",
};

const buttonStyle: React.CSSProperties = {
  background: "#7b4a20",
  color: "#fff4dc",
  border: "1px solid #d1994e",
  borderRadius: 12,
  padding: "12px 14px",
  margin: 6,
  fontSize: 15,
  cursor: "pointer",
};

const preStyle: React.CSSProperties = {
  whiteSpace: "pre-wrap",
  background: "#1d110b",
  color: "#fff4dc",
  border: "1px solid #8b5a2b",
  borderRadius: 12,
  padding: 14,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 280,
  background: "#1d110b",
  color: "#fff4dc",
  border: "1px solid #8b5a2b",
  borderRadius: 12,
  padding: 14,
  fontFamily: "ui-monospace, Menlo, monospace",
  fontSize: 14,
};
