"use client";

import {
  useMemo,
  useRef,
  type ReactEventHandler,
  type SyntheticEvent,
} from "react";

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

  openingSignatureSrc?: string;
  disableOpeningSignature?: boolean;
  showOpeningMessage?: boolean;
  defaultOpeningMessages?: string[];
  personalMessageText?: string;
};

const DEFAULT_SIGNATURE_LEAD_SECONDS = 1.5;

const OPENING_SIGNATURE_USAGE_EVENT_TYPE = "opening_twinkle_played";
const OPENING_MESSAGE_USAGE_EVENT_TYPE = "opening_message_presented";
const PERSONAL_MESSAGE_USAGE_EVENT_TYPE = "personal_message_presented";
const SIGNATURE_USAGE_EVENT_TYPE = "signature_tail_played";

const SIGNATURE_TRACK = "KLEIGH — Get So Down";
const SIGNATURE_SOURCE_START_SECONDS = 251;
const SIGNATURE_SOURCE_END_SECONDS = 259;

const DEFAULT_OPENING_MESSAGES = [
  "This HUG was chosen for you.",
  "This music moment was selected to say what words alone could not.",
];

function stableIndex(value: string, count: number) {
  if (count <= 1) return 0;

  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash % count;
}

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

  openingSignatureSrc = "/mothers-day/signatures/openkut-opening-twinkle.mp3",
  disableOpeningSignature = false,
  showOpeningMessage = true,
  defaultOpeningMessages = DEFAULT_OPENING_MESSAGES,
  personalMessageText,
}: EofSignatureAudioProps) {
  const mainRef = useRef<HTMLAudioElement | null>(null);
  const openingSignatureRef = useRef<HTMLAudioElement | null>(null);
  const signatureRef = useRef<HTMLAudioElement | null>(null);

  const openingPlayedRef = useRef(false);
  const resumingAfterOpeningRef = useRef(false);
  const firedRef = useRef(false);

  const openingMessageLoggedRef = useRef(false);
  const personalMessageLoggedRef = useRef(false);

  const sessionIdRef = useRef(
    `gpex-chamber-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const openingMessage = useMemo(() => {
    const messages = defaultOpeningMessages.filter(Boolean);
    if (!messages.length) return "";
    return messages[stableIndex(src, messages.length)];
  }, [defaultOpeningMessages, src]);

  function setMainAudioRef(element: HTMLAudioElement | null) {
    mainRef.current = element;
    audioRef?.(element);
  }

  function sendUsageEvent(event: Record<string, unknown>) {
    const body = JSON.stringify({
      session_id: sessionIdRef.current,
      created_at: new Date().toISOString(),
      context: usageContext,
      parent_id: parentId ?? null,
      parent_audio_src: src,
      page_path:
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : null,
      ...event,
    });

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

  function logOpeningMessageIfNeeded() {
    if (openingMessageLoggedRef.current) return;
    if (!openingMessage) return;

    openingMessageLoggedRef.current = true;

    sendUsageEvent({
      event_type: OPENING_MESSAGE_USAGE_EVENT_TYPE,
      trigger: "opening_message",
      rule: "Default GPEx opening message. Playback-layer chamber insert only.",
      opening_message_text: openingMessage,
      opening_message_playback_layer_only: true,
    });
  }

  function logPersonalMessageIfNeeded() {
    if (personalMessageLoggedRef.current) return;
    if (!personalMessageText?.trim()) return;

    personalMessageLoggedRef.current = true;

    sendUsageEvent({
      event_type: PERSONAL_MESSAGE_USAGE_EVENT_TYPE,
      trigger: "personal_message",
      rule: "Personal message chamber insert. Not attached to parent derivative audio.",
      personal_message_text: personalMessageText.trim(),
      personal_message_playback_layer_only: true,
    });
  }

  function logOpeningSignatureUsage() {
    const main = mainRef.current;

    sendUsageEvent({
      event_type: OPENING_SIGNATURE_USAGE_EVENT_TYPE,
      trigger: "opening_twinkle",
      rule: "Separate Opening Twinkle usage. Do not alter parent audio duration/start/end.",
      signature_track: SIGNATURE_TRACK,
      signature_asset: openingSignatureSrc,
      signature_playback_layer_only: true,
      parent_current_time_seconds: main?.currentTime ?? null,
      parent_duration_seconds:
        main && Number.isFinite(main.duration) ? main.duration : null,
    });
  }

  function logSignatureUsage() {
    const main = mainRef.current;

    sendUsageEvent({
      event_type: SIGNATURE_USAGE_EVENT_TYPE,
      trigger: "eof_signature_tail",
      rule: "Separate KLEIGH Signature usage. Do not alter parent audio duration/start/end.",
      signature_track: SIGNATURE_TRACK,
      signature_source_start_seconds: SIGNATURE_SOURCE_START_SECONDS,
      signature_source_end_seconds: SIGNATURE_SOURCE_END_SECONDS,
      signature_asset: signatureSrc,
      signature_playback_layer_only: true,
      parent_current_time_seconds: main?.currentTime ?? null,
      parent_duration_seconds:
        main && Number.isFinite(main.duration) ? main.duration : null,
      parent_tail_lead_seconds: leadSeconds,
    });
  }

  function resetSignature() {
    firedRef.current = false;
    openingPlayedRef.current = false;
    resumingAfterOpeningRef.current = false;
    openingMessageLoggedRef.current = false;
    personalMessageLoggedRef.current = false;

    const openingSignature = openingSignatureRef.current;
    if (openingSignature) {
      openingSignature.pause();
      openingSignature.currentTime = 0;
      openingSignature.volume = 0.75;
    }

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

  function resumeMainAfterOpening() {
    const main = mainRef.current;
    if (!main) return;

    resumingAfterOpeningRef.current = true;
    void main.play().catch(() => {
      resumingAfterOpeningRef.current = false;
    });
  }

  function handleOpeningEnded() {
    resumeMainAfterOpening();
  }

  function handlePlay(event: SyntheticEvent<HTMLAudioElement>) {
    const main = event.currentTarget;
    const openingSignature = openingSignatureRef.current;

    if (
      openingSignatureSrc &&
      !disableOpeningSignature &&
      openingSignature &&
      !openingPlayedRef.current &&
      !resumingAfterOpeningRef.current
    ) {
      openingPlayedRef.current = true;
      main.pause();

      logOpeningMessageIfNeeded();
      logPersonalMessageIfNeeded();

      openingSignature.pause();
      openingSignature.currentTime = 0;
      openingSignature.volume = 0.75;

      openingSignature
        .play()
        .then(() => {
          logOpeningSignatureUsage();
        })
        .catch(() => {
          resumeMainAfterOpening();
        });

      return;
    }

    resumingAfterOpeningRef.current = false;
    firedRef.current = false;
    onPlay?.(event);
  }

  function handleTimeUpdate() {
    const main = mainRef.current;
    if (!main || !Number.isFinite(main.duration)) return;

    const secondsRemaining = main.duration - main.currentTime;

    if (secondsRemaining <= leadSeconds) {
      playSignature();
    }
  }

  function handleEnded(event: SyntheticEvent<HTMLAudioElement>) {
    playSignature();
    onEnded?.(event);
  }

  return (
    <div className={className}>
      {showOpeningMessage && (openingMessage || personalMessageText) && (
        <div className="mb-3 rounded-xl border border-amber-300/20 bg-black/20 px-4 py-3 text-sm leading-relaxed text-amber-50/80">
          {openingMessage && <p>{openingMessage}</p>}
          {personalMessageText?.trim() && (
            <p className="mt-2 font-semibold text-amber-100">
              {personalMessageText.trim()}
            </p>
          )}
        </div>
      )}

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
        ref={openingSignatureRef}
        preload="auto"
        src={openingSignatureSrc}
        onEnded={handleOpeningEnded}
        aria-hidden="true"
        className="hidden"
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
