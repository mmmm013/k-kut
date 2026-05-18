"use client";

import { useEffect, useRef } from "react";

type KKSectionAudioProps = {
  src: string;
  startSec: number;
  endSec: number;
};

export default function KKSectionAudio({ src, startSec, endSec }: KKSectionAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      audio.currentTime = startSec;
    };

    const onTimeUpdate = () => {
      if (audio.currentTime >= endSec) {
        audio.pause();
        audio.currentTime = startSec;
      }
    };

    const onPlay = () => {
      if (audio.currentTime < startSec || audio.currentTime >= endSec) {
        audio.currentTime = startSec;
      }
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
    };
  }, [startSec, endSec]);

  return (
    <audio ref={audioRef} controls preload="metadata" className="w-full">
      <source src={src} type="audio/mpeg" />
      Your browser does not support audio playback.
    </audio>
  );
}
