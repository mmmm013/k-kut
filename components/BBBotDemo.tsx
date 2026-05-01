"use client";

import { useEffect, useMemo, useState } from "react";

export default function BBBotDemo() {
  const [step, setStep] = useState(1);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [voiceReady, setVoiceReady] = useState(false);

  const greeting =
    "Hi, I’m BB. Tell me the feeling you need, and I’ll help you find the exact K-KUT moment.";

  const feelings = useMemo(
    () => [
      "Romance",
      "Heart",
      "Apology",
      "Gratitude",
      "Missing You",
      "Support",
      "Celebration",
      "Comfort",
    ],
    []
  );

  const tones = ["Soft", "Cinematic", "Intimate", "Warm", "Big", "Tender"];

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    const preferred =
      voices.find((v) => v.lang === "en-AU") ||
      voices.find((v) => v.lang.startsWith("en-AU")) ||
      voices.find((v) => v.lang.startsWith("en-GB")) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => setVoiceReady(true);

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    const timer = window.setTimeout(() => {
      speak(greeting);
    }, 600);

    return () => window.clearTimeout(timer);
  }, []);

  const selectFeeling = (f: string) => {
    setFeeling(f);
    setStep(2);
    speak(`Got it. ${f}. Choose your tone.`);
  };

  const selectTone = (tone: string) => {
    speak(`Perfect. I will look for a ${tone.toLowerCase()} ${feeling?.toLowerCase()} moment.`);
  };

  return (
    <div className="border border-[#D4A017]/30 rounded p-6 bg-[#0E0E0E]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#D4A017]">
            BB BOT — Vocal Guided Flow
          </h3>

          <p className="mt-2 text-sm text-[#E8CFA8]">
            I help you send the closest feeling to being there.
          </p>
        </div>

        <button
          onClick={() => speak(greeting)}
          className="px-3 py-2 border border-[#D4A017] rounded text-[#D4A017] hover:bg-[#D4A017]/10 text-sm"
        >
          Hear BB
        </button>
      </div>

      {step === 1 && (
        <div className="mt-6">
          <p className="text-[#E8CFA8]">
            What feeling are you trying to send?
          </p>

          <div className="mt-4 flex gap-3 flex-wrap">
            {feelings.map((f) => (
              <button
                key={f}
                onClick={() => selectFeeling(f)}
                className="px-4 py-2 border border-[#D4A017] rounded text-[#D4A017] hover:bg-[#D4A017]/10"
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6">
          <p className="text-[#E8CFA8]">
            Got it — <span className="text-[#D4A017]">{feeling}</span>.
            Choose the delivery tone:
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {tones.map((opt) => (
              <button
                key={opt}
                onClick={() => selectTone(opt)}
                className="p-3 border border-[#333] rounded text-left hover:border-[#D4A017]/60 hover:bg-[#D4A017]/10"
              >
                <span className="text-[#D4A017]">Option — {opt}</span>
                <span className="block text-xs text-[#C8A882] mt-1">
                  BB will search emotional moments with this tone.
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setStep(1);
              setFeeling(null);
              speak("Let’s choose a new feeling.");
            }}
            className="mt-4 text-sm text-[#C8A882] underline"
          >
            Start over
          </button>
        </div>
      )}

      <div className="mt-6 text-xs text-[#777]">
        GP Experience: Love. Care. Share. Real audio only.
        {!voiceReady && " Voice may require pressing Hear BB on some browsers."}
      </div>
    </div>
  );
}