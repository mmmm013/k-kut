"use client";

import { useEffect } from "react";

export default function SingleAudioPlaybackGuard() {
  useEffect(() => {
    const onPlay = (event: Event) => {
      const current = event.target;
      if (!(current instanceof HTMLAudioElement)) return;

      for (const audio of Array.from(document.querySelectorAll("audio"))) {
        if (audio !== current) audio.pause();
      }
    };

    document.addEventListener("play", onPlay, true);
    return () => document.removeEventListener("play", onPlay, true);
  }, []);

  return null;
}
