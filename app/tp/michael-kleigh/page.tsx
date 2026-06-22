"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type QueueRow = {
  task_id: string;
  sequence_order: number;
  assigned_to_email: string;
  assigned_to_name: string | null;
  task_type: string;
  task_status: string;
  track_id: string;
  title: string;
  public_title: string | null;
  audio_url: string | null;
  mp3_url: string | null;
  source_path: string | null;
  pix_source_type: string | null;
  artist: string | null;
  vocalist: string | null;
  attribution_status: string | null;
  tp_mark_count?: number | string | null;
  first_tp_sec?: number | string | null;
  last_tp_sec?: number | string | null;
};

const BLK_OPTIONS = [
  "Intro",
  "Verse 1",
  "Chorus 1",
  "Verse 2",
  "Chorus 2",
  "Bridge",
  "NB",
  "Final Chorus",
  "Outro",
  "Other",
];

function readToken() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("token") || "";
}

function cleanSeconds(value: number) {
  return Math.max(0, Math.round(value * 100) / 100);
}

export default function MichaelKleighTpPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [token, setToken] = useState("");
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [index, setIndex] = useState(0);

  const [fromBlk, setFromBlk] = useState("Intro");
  const [toBlk, setToBlk] = useState("Verse 1");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const current = rows[index];

  const audioSrc = useMemo(() => {
    if (!current) return "";
    return current.audio_url || current.mp3_url || "";
  }, [current]);

  async function loadQueue(nextToken: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/tp/michael-kleigh/queue?token=${encodeURIComponent(nextToken)}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Queue failed to load.");
      }

      setRows(data.rows || []);
      setIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown queue error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = readToken();
    setToken(t);
    loadQueue(t);
  }, []);

  async function markTransition() {
    if (!current || !audioRef.current) return;

    const transitionSec = cleanSeconds(audioRef.current.currentTime);

    setSaving(true);
    setError("");
    setSaved("");

    try {
      const res = await fetch("/api/tp/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          taskId: current.task_id,
          transitionSec,
          fromBlkLabel: fromBlk,
          toBlkLabel: toBlk,
          note,
          botNote: "Michael KLEIGH TP tool button click",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "TP mark failed.");
      }

      setSaved(`Saved BLK-TP at ${transitionSec}s: ${fromBlk} → ${toBlk}`);
      setNote("");

      await loadQueue(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown save error.");
    } finally {
      setSaving(false);
    }
  }

  function previousTrack() {
    setSaved("");
    setNote("");
    setIndex((n) => Math.max(0, n - 1));
  }

  function nextTrack() {
    setSaved("");
    setNote("");
    setIndex((n) => Math.min(rows.length - 1, n + 1));
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>
        Michael Clay — KLEIGH TP TSK
      </h1>

      <p style={{ color: "#555", marginBottom: 18 }}>
        TP = Transition Point. TSK = Task. Mark the spot where one BLK changes
        into the next. Do not redo KK work. Do not create mKs.
      </p>

      {loading && <p>Loading KLEIGH LT-PIX queue…</p>}

      {error && (
        <div
          style={{
            border: "1px solid #b00020",
            background: "#fff2f2",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <p>No KLEIGH BLK-TP tasks found.</p>
      )}

      {current && (
        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 18,
            background: "#fff",
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <strong>
              {current.sequence_order} / {rows.length}
            </strong>

            <h2 style={{ margin: "8px 0" }}>
              {current.public_title || current.title}
            </h2>

            <p style={{ color: "#666", margin: 0 }}>
              Artist: {current.artist || "—"} · PIX:{" "}
              {current.pix_source_type || "—"} · Status: {current.task_status} ·
              TP marks: {current.tp_mark_count ?? 0}
            </p>
          </div>

          {audioSrc ? (
            <audio
              ref={audioRef}
              controls
              preload="metadata"
              src={audioSrc}
              style={{ width: "100%", margin: "12px 0 20px" }}
            />
          ) : (
            <p>No audio URL available for this LT-PIX.</p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <label>
              From BLK
              <select
                value={fromBlk}
                onChange={(e) => setFromBlk(e.target.value)}
                style={{ display: "block", width: "100%", padding: 10 }}
              >
                {BLK_OPTIONS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>

            <label>
              To BLK
              <select
                value={toBlk}
                onChange={(e) => setToBlk(e.target.value)}
                style={{ display: "block", width: "100%", padding: 10 }}
              >
                {BLK_OPTIONS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note for Gregory / BOT"
              style={{
                display: "block",
                width: "100%",
                minHeight: 80,
                padding: 10,
                marginTop: 6,
              }}
            />
          </label>

          <button
            onClick={markTransition}
            disabled={saving || !audioSrc}
            style={{
              marginTop: 16,
              width: "100%",
              padding: 16,
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 10,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Mark BLK-TP at current playback time"}
          </button>

          {saved && (
            <p style={{ marginTop: 12, color: "#0a7a2f", fontWeight: 700 }}>
              {saved}
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 20,
              gap: 12,
            }}
          >
            <button onClick={previousTrack} disabled={index === 0}>
              Previous LT-PIX
            </button>

            <button onClick={nextTrack} disabled={index >= rows.length - 1}>
              Next LT-PIX
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
