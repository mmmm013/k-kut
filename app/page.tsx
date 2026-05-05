"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STRIPE_URL = "https://buy.stripe.com/14AeVcawC9QCaq04xg4ow0p";

const demos = [
  {
    id: "opening",
    feeling: "Gentle",
    title: "Thank You — KK Opening",
    description: "Soft and tender. A gentle start.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-opening.mp3",
  },
  {
    id: "chorus",
    feeling: "Big Heart",
    title: "Thank You — KK Chorus",
    description: "Warm, strong, and emotional.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-chorus.mp3",
  },
  {
    id: "outro",
    feeling: "Peaceful",
    title: "Thank You — KK Outro",
    description: "A calm and warm closing.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-outro.mp3",
  },
];

type Step = 1 | 2 | 3;

export default function HomePage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedDemo, setSelectedDemo] = useState(demos[1]);
  const [hugChosen, setHugChosen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const botMessage = useMemo(() => {
    if (step === 1) {
      return "Step 1. Choose how Mom should feel.";
    }
    if (step === 2 && !hugChosen) {
      return `Step 2. Hear the demo for "${selectedDemo.feeling}". Then choose this HUG if it feels right.`;
    }
    return `Step 3. Good choice. You picked "${selectedDemo.title}". Now checkout to order it.`;
  }, [step, hugChosen, selectedDemo]);

  function speak(text: string) {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    speak(botMessage);
  }, [botMessage]);

  function chooseFeeling(demo: (typeof demos)[number]) {
    setSelectedDemo(demo);
    setHugChosen(false);
    setStep(2);
  }

  function playDemo() {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }

  function chooseThisHug() {
    setHugChosen(true);
    setStep(3);
  }

  return (
    <main className="min-h-screen bg-[#261208] text-[#fff6e8]">
      <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#3a1f0f] p-6 shadow-2xl sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-200">
            K-KUT HUG · Mother’s Day
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            Send Mom a real audio greeting card.
          </h1>

          <div className="mt-6 rounded-[1.5rem] border border-amber-300/30 bg-amber-300 px-5 py-4 text-[#2a180d] shadow-lg">
            <p className="text-sm font-black uppercase tracking-[0.18em]">
              BB-BOT
            </p>
            <p className="mt-2 text-2xl font-black leading-tight">
              {botMessage}
            </p>

            <button
              type="button"
              onClick={() => speak(botMessage)}
              className="mt-4 rounded-2xl bg-[#2a180d] px-5 py-3 text-base font-black text-amber-100 transition hover:opacity-90"
            >
              Hear BB-BOT
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((n) => {
              const active = step === n;
              const labels = {
                1: "Choose feeling",
                2: "Hear demo",
                3: "Order",
              } as const;

              return (
                <div
                  key={n}
                  className={`rounded-[1.25rem] border px-4 py-4 text-center ${
                    active
                      ? "border-amber-300 bg-amber-300 text-[#2a180d]"
                      : "border-amber-200/20 bg-white/5 text-amber-50/70"
                  }`}
                >
                  <p className="text-sm font-black uppercase tracking-[0.18em]">
                    Step {n}
                  </p>
                  <p className="mt-2 text-lg font-black">{labels[n as 1 | 2 | 3]}</p>
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <section className="mt-8">
              <h2 className="text-3xl font-black">Choose how Mom should feel.</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {demos.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => chooseFeeling(demo)}
                    className="rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-6 text-left transition hover:bg-white/10"
                  >
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                      Feeling
                    </p>
                    <h3 className="mt-2 text-2xl font-black">{demo.feeling}</h3>
                    <p className="mt-3 text-base leading-7 text-amber-50/75">
                      {demo.description}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="mt-8">
              <h2 className="text-3xl font-black">Hear your demo.</h2>

              <div className="mt-5 rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                  Selected feeling
                </p>
                <h3 className="mt-2 text-3xl font-black">{selectedDemo.feeling}</h3>
                <p className="mt-2 text-lg text-amber-50/80">{selectedDemo.title}</p>
                <p className="mt-2 text-base leading-7 text-amber-50/70">
                  {selectedDemo.description}
                </p>

                <button
                  type="button"
                  onClick={playDemo}
                  className="mt-6 rounded-2xl bg-amber-300 px-6 py-4 text-lg font-black text-[#2a180d] transition hover:bg-amber-200"
                >
                  Play demo
                </button>

                <audio
                  ref={audioRef}
                  controls
                  preload="metadata"
                  className="mt-4 w-full"
                  onPlay={() => speak("You are hearing the demo now.")}
                  onEnded={() =>
                    speak("Demo finished. If you like it, choose this HUG.")
                  }
                >
                  <source src={selectedDemo.audioSrc} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={chooseThisHug}
                    className="rounded-2xl border border-amber-200/30 px-6 py-4 text-lg font-black text-amber-50 transition hover:bg-white/10"
                  >
                    Choose this HUG
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-2xl border border-amber-200/20 px-6 py-4 text-lg font-black text-amber-50/80 transition hover:bg-white/10"
                  >
                    Pick a different feeling
                  </button>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="mt-8">
              <h2 className="text-3xl font-black">Order your HUG.</h2>

              <div className="mt-5 rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                  Your choice
                </p>
                <h3 className="mt-2 text-3xl font-black">{selectedDemo.title}</h3>
                <p className="mt-3 text-base leading-7 text-amber-50/75">
                  {selectedDemo.description}
                </p>

                <a
                  href={STRIPE_URL}
                  onClick={() => speak("Opening secure checkout now.")}
                  className="mt-6 inline-block rounded-2xl bg-amber-300 px-8 py-5 text-xl font-black text-[#2a180d] shadow-lg transition hover:bg-amber-200"
                >
                  Checkout · $7.99
                </a>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-2xl border border-amber-200/20 px-6 py-4 text-lg font-black text-amber-50/80 transition hover:bg-white/10"
                  >
                    Hear the demo again
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
