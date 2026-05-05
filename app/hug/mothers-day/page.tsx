"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STRIPE_URL = "https://buy.stripe.com/14AeVcawC9QCaq04xg4ow0p";

const DEMOS = [
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
] as const;

type Step = 0 | 1 | 2 | 3;

export default function HomePage() {
  const [step, setStep] = useState<Step>(0);
  const [typedFeeling, setTypedFeeling] = useState("");
  const [heardFeeling, setHeardFeeling] = useState("");
  const [optionIds, setOptionIds] = useState<string[]>(["chorus", "opening"]);
  const [selectedId, setSelectedId] = useState<string>("chorus");

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const options = useMemo(
    () => optionIds.map((id) => DEMOS.find((demo) => demo.id === id)).filter(Boolean) as typeof DEMOS,
    [optionIds]
  );

  const selectedDemo = useMemo(
    () => DEMOS.find((demo) => demo.id === selectedId) ?? DEMOS[1],
    [selectedId]
  );

  const botMessage = useMemo(() => {
    if (step === 0) {
      return "Welcome. A HUG is a short real-audio greeting gift for Mom. First, I’ll show you how this works.";
    }

    if (step === 1) {
      return "Step 1. Tell me how Mom should feel.";
    }

    if (step === 2) {
      return `Step 2. I heard "${heardFeeling}". These are your best HUG options. Press Play on any option, then choose one.`;
    }

    return `Step 3. Good choice. You picked "${selectedDemo.title}". Now checkout to order this HUG.`;
  }, [step, heardFeeling, selectedDemo.title]);

  function speak(text: string) {
    if (typeof window === "undefined") return;

    // Shrewd BB-BOT voice rule:
    // Do NOT use generic browser AI voice.
    // Real MC-BOT clips should be placed in /public/voices/mc-bot/
    // Browser speech is intentionally disabled to avoid cheap AI voice.
    console.log("BB-BOT:", text);
  }

  useEffect(() => {
    speak(botMessage);
  }, [botMessage]);

  function normalizeFeeling(input: string) {
    const raw = input.trim().toLowerCase();

    if (!raw) {
      return {
        heard: "loved",
        optionIds: ["chorus", "opening"],
      };
    }

    if (
      raw.includes("appreciated") ||
      raw.includes("grateful") ||
      raw.includes("thank") ||
      raw.includes("thanks")
    ) {
      return {
        heard: "appreciated",
        optionIds: ["chorus", "opening"],
      };
    }

    if (
      raw.includes("gentle") ||
      raw.includes("soft") ||
      raw.includes("tender")
    ) {
      return {
        heard: "gentle",
        optionIds: ["opening", "chorus"],
      };
    }

    if (
      raw.includes("peaceful") ||
      raw.includes("calm") ||
      raw.includes("peace")
    ) {
      return {
        heard: "peaceful",
        optionIds: ["outro", "opening"],
      };
    }

    if (
      raw.includes("emotional") ||
      raw.includes("big heart") ||
      raw.includes("love") ||
      raw.includes("loved")
    ) {
      return {
        heard: "big heart",
        optionIds: ["chorus", "outro"],
      };
    }

    return {
      heard: raw,
      optionIds: ["chorus", "opening"],
    };
  }

  function submitFeeling(value: string) {
    const result = normalizeFeeling(value);
    setHeardFeeling(result.heard);
    setOptionIds(result.optionIds);
    setSelectedId(result.optionIds[0]);
    setTypedFeeling("");
    setStep(2);
  }

  function playDemo(id: string) {
    const el = audioRefs.current[id];
    if (!el) return;

    el.play().catch(() => {});
  }

  const progress = [
    { n: 1, label: "Learn" },
    { n: 2, label: "Tell BB-BOT" },
    { n: 3, label: "Hear options" },
    { n: 4, label: "Checkout" },
  ];

  const activeProgress = step === 0 ? 1 : step === 1 ? 2 : step === 2 ? 3 : 4;

  return (
    <main className="min-h-screen bg-[#261208] text-[#fff6e8]">
      <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#3a1f0f] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-200">
              K-KUT HUG · Mother’s Day
            </p>

            <div className="rounded-full border border-green-300/30 bg-green-400/10 px-4 py-2 text-sm font-bold text-green-100">
              BB-BOT active
            </div>
          </div>

          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            Send Mom a real audio greeting card.
          </h1>

          <div className="mt-6 rounded-[1.5rem] border border-amber-300/30 bg-amber-300 px-5 py-4 text-[#2a180d] shadow-lg">
            <p className="text-sm font-black uppercase tracking-[0.18em]">
              BB-BOT
            </p>
            <p className="mt-2 text-2xl font-black leading-tight">{botMessage}</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {progress.map((item) => {
              const active = activeProgress === item.n;

              return (
                <div
                  key={item.n}
                  className={`rounded-[1.25rem] border px-4 py-4 text-center ${
                    active
                      ? "border-amber-300 bg-amber-300 text-[#2a180d]"
                      : "border-amber-200/20 bg-white/5 text-amber-50/70"
                  }`}
                >
                  <p className="text-sm font-black uppercase tracking-[0.18em]">
                    Step {item.n}
                  </p>
                  <p className="mt-2 text-lg font-black">{item.label}</p>
                </div>
              );
            })}
          </div>

          {step === 0 && (
            <section className="mt-8 rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-6">
              <h2 className="text-3xl font-black">What is a HUG?</h2>
              <p className="mt-4 text-lg leading-8 text-amber-50/85">
                A HUG is a short real-audio greeting gift for Mom.
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl bg-black/20 px-4 py-4 text-lg">
                  1. Tell BB-BOT how Mom should feel.
                </div>
                <div className="rounded-2xl bg-black/20 px-4 py-4 text-lg">
                  2. Hear a few HUG options.
                </div>
                <div className="rounded-2xl bg-black/20 px-4 py-4 text-lg">
                  3. Choose one HUG.
                </div>
                <div className="rounded-2xl bg-black/20 px-4 py-4 text-lg">
                  4. Checkout.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-6 rounded-2xl bg-amber-300 px-8 py-5 text-xl font-black text-[#2a180d] shadow-lg transition hover:bg-amber-200"
              >
                Start
              </button>
            </section>
          )}

          {step === 1 && (
            <section className="mt-8 rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-6">
              <h2 className="text-3xl font-black">How should Mom feel?</h2>

              <form
                className="mt-5 flex flex-col gap-3 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitFeeling(typedFeeling);
                }}
              >
                <input
                  value={typedFeeling}
                  onChange={(event) => setTypedFeeling(event.target.value)}
                  placeholder='Example: "appreciated"'
                  className="min-h-14 flex-1 rounded-2xl border border-amber-200/20 bg-black/20 px-4 text-lg text-amber-50 outline-none placeholder:text-amber-100/40"
                />

                <button
                  type="submit"
                  className="rounded-2xl bg-amber-300 px-6 py-4 text-lg font-black text-[#2a180d] transition hover:bg-amber-200"
                >
                  Show options
                </button>
              </form>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {["Loved", "Appreciated", "Gentle", "Peaceful", "Big Heart"].map((feeling) => (
                  <button
                    key={feeling}
                    type="button"
                    onClick={() => submitFeeling(feeling)}
                    className="rounded-2xl border border-amber-200/20 bg-black/20 px-4 py-4 text-lg font-black transition hover:bg-white/10"
                  >
                    {feeling}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="mt-8">
              <h2 className="text-3xl font-black">Your HUG options</h2>
              <p className="mt-3 text-lg leading-8 text-amber-50/80">
                BB-BOT heard: <span className="font-black text-amber-200">{heardFeeling}</span>
              </p>

              <div className="mt-5 grid gap-4">
                {options.map((demo) => {
                  const chosen = selectedId === demo.id;

                  return (
                    <div
                      key={demo.id}
                      className={`rounded-[1.5rem] border p-6 ${
                        chosen
                          ? "border-amber-300 bg-amber-300/10"
                          : "border-amber-200/20 bg-white/5"
                      }`}
                    >
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                        {demo.feeling}
                      </p>

                      <h3 className="mt-2 text-2xl font-black">{demo.title}</h3>
                      <p className="mt-2 text-base leading-7 text-amber-50/75">
                        {demo.description}
                      </p>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => playDemo(demo.id)}
                          className="rounded-2xl bg-amber-300 px-6 py-4 text-lg font-black text-[#2a180d] transition hover:bg-amber-200"
                        >
                          Play demo
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(demo.id);
                            setStep(3);
                          }}
                          className="rounded-2xl border border-amber-200/30 px-6 py-4 text-lg font-black text-amber-50 transition hover:bg-white/10"
                        >
                          Choose this HUG
                        </button>
                      </div>

                      <audio
                        ref={(el) => {
                          audioRefs.current[demo.id] = el;
                        }}
                        controls
                        preload="metadata"
                        className="mt-4 w-full"
                        onPlay={() => speak(`You are hearing ${demo.title}.`)}
                        onEnded={() => speak("Demo finished. Choose this HUG if it feels right.")}
                      >
                        <source src={demo.audioSrc} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-2xl border border-amber-200/20 px-6 py-4 text-lg font-black text-amber-50/80 transition hover:bg-white/10"
                >
                  Back
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="mt-8 rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-6">
              <h2 className="text-3xl font-black">Checkout</h2>

              <div className="mt-5 rounded-2xl bg-black/20 p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                  Your chosen HUG
                </p>
                <h3 className="mt-2 text-3xl font-black">{selectedDemo.title}</h3>
                <p className="mt-2 text-base leading-7 text-amber-50/75">
                  {selectedDemo.description}
                </p>
              </div>

              <a
                href={STRIPE_URL}
                onClick={() => speak("Opening secure checkout now.")}
                className="mt-6 inline-block rounded-2xl bg-amber-300 px-8 py-5 text-xl font-black text-[#2a180d] shadow-lg transition hover:bg-amber-200"
              >
                Checkout · $7.99
              </a>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-2xl border border-amber-200/20 px-6 py-4 text-lg font-black text-amber-50/80 transition hover:bg-white/10"
                >
                  Hear options again
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setTypedFeeling("");
                  }}
                  className="rounded-2xl border border-amber-200/20 px-6 py-4 text-lg font-black text-amber-50/80 transition hover:bg-white/10"
                >
                  Start over
                </button>
              </div>

              <p className="mt-5 text-sm leading-7 text-amber-50/65">
                One HUG per order. If you want another HUG, return and choose another one.
              </p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
