"use client";

import { useRef, type ReactEventHandler, type SyntheticEvent } from "react";

type EofSignatureAudioProps = {
  src: string;
  className?: string;
  signatureSrc?: string;
  leadSeconds?: number;
  audioRef?: (element: HTMLAudioElement | null) => void;
  onPlay?: ReactEventHandler<HTMLAudioElement>;
  onEnded?: ReactEventHandler<HTMLAudioElement>;
  usageContext?: string;
  parentId?: string;
};

const DEFAULT_SIGNATURE_LEAD_SECONDS = 1.5;

const SIGNATURE_USAGE_EVENT_TYPE = "signature_tail_played";
const SIGNATURE_TRACK = "KLEIGH — Get So Down";
const SIGNATURE_SOURCE_START_SECONDS = 251;
const SIGNATURE_SOURCE_END_SECONDS = 259;

export default function EofSignatureAudio({
  src,
  className = "mt-5 w-full",
  signatureSrc = "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3",
  leadSeconds = DEFAULT_SIGNATURE_LEAD_SECONDS,
  audioRef,
  onPlay,
  onEnded,
  usageContext = "public_non_pix_playback",
  parentId,
}: EofSignatureAudioProps) {
  const mainRef = useRef<HTMLAudioElement | null>(null);
  const signatureRef = useRef<HTMLAudioElement | null>(null);
  const firedRef = useRef(false);
  const sessionIdRef = useRef(
    `signature-tail-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  function setMainAudioRef(element: HTMLAudioElement | null) {
    mainRef.current = element;
    audioRef?.(element);
  }

  function resetSignature() {
    firedRef.current = false;

    const signature = signatureRef.current;
    if (!signature) return;

    signature.pause();
    signature.currentTime = 0;
    signature.volume = 0.18;
  }

  function rampSignatureVolume(signature: HTMLAudioElement) {
    const steps = [0.28, 0.42, 0.58, 0.75, 0.9, 1.0];

    steps.forEach((volume, index) => {
      window.setTimeout(() => {
        signature.volume = volume;
      }, index * 120);
    });
  }

  function logSignatureUsage() {
    const main = mainRef.current;

    const event = {
      event_type: SIGNATURE_USAGE_EVENT_TYPE,
      session_id: sessionIdRef.current,
      created_at: new Date().toISOString(),

      context: usageContext,
      trigger: "eof_signature_tail",
      rule: "Separate KLEIGH Signature usage. Do not alter parent audio duration/start/end.",

      signature_track: SIGNATURE_TRACK,
      signature_source_start_seconds: SIGNATURE_SOURCE_START_SECONDS,
      signature_source_end_seconds: SIGNATURE_SOURCE_END_SECONDS,
      signature_asset: signatureSrc,
      signature_playback_layer_only: true,

      parent_id: parentId ?? null,
      parent_audio_src: src,
      parent_current_time_seconds: main?.currentTime ?? null,
      parent_duration_seconds:
        main && Number.isFinite(main.duration) ? main.duration : null,
      parent_tail_lead_seconds: leadSeconds,

      page_path:
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : null,
    };

    const body = JSON.stringify(event);

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        const queued = navigator.sendBeacon("/api/4pe/events", blob);
        if (queued) return;
      }

      void fetch("/api/4pe/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {
        // Playback must never fail because reporting failed.
      });
    } catch {
      // Playback must never fail because reporting failed.
    }
  }

  function playSignature() {
    if (firedRef.current) return;

    const signature = signatureRef.current;
    if (!signature) return;

    firedRef.current = true;
    signature.pause();
    signature.currentTime = 0;
    signature.volume = 0.18;

    signature
      .play()
      .then(() => {
        logSignatureUsage();
        rampSignatureVolume(signature);
      })
      .catch(() => {
        // Playback-only treatment. Backend truth remains unchanged.
      });
  }

  function handleTimeUpdate() {
    const main = mainRef.current;
    if (!main || !Number.isFinite(main.duration)) return;

    const secondsRemaining = main.duration - main.currentTime;

    if (secondsRemaining <= leadSeconds) {
      playSignature();
    }
  }

  function handlePlay(event: SyntheticEvent<HTMLAudioElement>) {
    resetSignature();
    onPlay?.(event);
  }

  function handleEnded(event: SyntheticEvent<HTMLAudioElement>) {
    playSignature();
    onEnded?.(event);
  }

  return (
    <div className={className}>
      <audio
        ref={setMainAudioRef}
        className="w-full"
        controls
        preload="metadata"
        src={src}
        onPlay={handlePlay}
        onSeeked={resetSignature}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <audio
        ref={signatureRef}
        preload="auto"
        src={signatureSrc}
        aria-hidden="true"
        className="hidden"
      />
    </div>
  );
}
