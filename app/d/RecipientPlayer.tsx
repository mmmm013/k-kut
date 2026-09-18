"use client";
import { useRef, useState } from "react";

export default function RecipientPlayer() {
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [audio, setAudio] = useState("");
  const [kind, setKind] = useState("gift");
  async function openGift() {
    if (inFlight.current || audio) return;
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      setError("Open the complete gift link from the message you received.");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/recipient-playback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || !result.playback_url) throw new Error(result.error || "Your gift could not be opened.");
      setAudio(result.playback_url);
      setKind(result.container_type);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Please try again.");
    } finally { inFlight.current = false; setBusy(false); }
  }
  return <div className="mt-6">
    {audio ? <div>
      <p className="mb-3">Your {kind} is ready.</p>
      <audio aria-label="Your music gift" className="w-full" controls controlsList="nodownload" preload="none" src={audio}
        onError={() => setError("Audio could not load. Reopen your gift link to try again.")} />
    </div> : <button type="button" disabled={busy} onClick={openGift}
      className="rounded-xl bg-amber-300 px-6 py-3 font-bold text-black disabled:opacity-60">
      {busy ? "Opening your gift…" : "Open my gift"}
    </button>}
    <p role="status" aria-live="polite" className="mt-4 text-amber-200">{error}</p>
  </div>;
}
