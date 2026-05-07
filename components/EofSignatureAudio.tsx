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
};

const DEFAULT_SIGNATURE_LEAD_SECONDS = 1.5;

export default function EofSignatureAudio({
  src,
  className = "mt-5 w-full",
  signatureSrc = "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3",
  leadSeconds = DEFAULT_SIGNATURE_LEAD_SECONDS,
  audioRef,
  onPlay,
  onEnded,
}: EofSignatureAudioProps) {
  const mainRef = useRef<HTMLAudioElement | null>(null);
  const signatureRef = useRef<HTMLAudioElement | null>(null);
  const firedRef = useRef(false);

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
