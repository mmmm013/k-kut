"use client";

let activeKkutAudio: HTMLAudioElement | null = null;

function stopAllAudio() {
  if (typeof window === "undefined") return;

  if (activeKkutAudio) {
    activeKkutAudio.pause();
    activeKkutAudio.currentTime = 0;
    activeKkutAudio = null;
  }

  document.querySelectorAll("audio").forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });

  window.dispatchEvent(new Event("k-kut-stop-audio"));
}

function playOneAudio(src: string) {
  if (typeof window === "undefined") return;

  stopAllAudio();

  const audio = new Audio(src);
  activeKkutAudio = audio;
  audio.volume = 0.95;
  audio.currentTime = 0;

  const clearIfActive = () => {
    if (activeKkutAudio === audio) {
      activeKkutAudio = null;
    }
  };

  audio.addEventListener("ended", clearIfActive, { once: true });
  audio.addEventListener("pause", clearIfActive, { once: true });

  audio.play().catch(() => {
    clearIfActive();
    console.log("Audio blocked until user taps:", src);
  });
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", stopAllAudio);
  window.addEventListener("beforeunload", stopAllAudio);
}





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
  const kleighVoice: Record<string, string> = {
    welcome: "/audio/kleigh/guide-final/32-welcome-mother-s-day.m4a",
    "start-hug": "/audio/kleigh/guide-final/28-start-hug.m4a",
    "pick-one": "/audio/kleigh/guide-final/07-choose-feel.m4a",
    "play-demo": "/audio/kleigh/guide-final/24-press-play.m4a",
    "choose-hug": "/audio/kleigh/guide-final/03-best-hug.m4a",
  };

  function playMcBotVoice(clip: string = "welcome") {
    if (typeof window === "undefined") return;

    playOneAudio(kleighVoice[clip] ?? kleighVoice.welcome);
  }

  function speak(_text: string) {
    playMcBotVoice("welcome");
  }

  useEffect(() => {
    function greetOnFirstInteraction() {
      if (hasAutoGreetedRef.current) return;
      hasAutoGreetedRef.current = true;
      playMcBotVoice("welcome");
    }

    window.addEventListener("pointerdown", greetOnFirstInteraction, { once: true });
    window.addEventListener("keydown", greetOnFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", greetOnFirstInteraction);
      window.removeEventListener("keydown", greetOnFirstInteraction);
    };
  }, []);

  const [step, setStep] = useState<Step>(0);
  const [typedFeeling, setTypedFeeling] = useState("");
  const [gotFeeling, setSeedFeeling] = useState("");
  const [optionIds, setOptionIds] = useState<string[]>(["chorus", "opening", "outro"]);
  const [selectedId, setSelectedId] = useState<string>("chorus");
  const [focusTitle, setFocusTitle] = useState<string>("Learn");
  const [focusBody, setFocusBody] = useState<string>(
    "A HUG sends a real song moment to Mom by text, DM, social link, or email. Start here, then choose how Mom should feel."
  );

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const hasAutoGreetedRef = useRef(false);

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
      return `Step 2. I got "${gotFeeling}". These are your best HUG options. Press Play on any option, then choose one.`;
    }

    return `Step 3. Good choice. You picked "${selectedDemo.title}". Now checkout to order this HUG.`;
  }, [step, gotFeeling, selectedDemo.title]);

  function show(_text: string) {
    // No BOT guide. BB-BOT is visual guidance only.
  }

  function normalizeFeeling(input: string) {
    const raw = input.trim().toLowerCase();

    if (!raw) {
      return {
        got: "loved",
        optionIds: ["chorus", "opening", "outro"],
      };
    }

    if (
      raw.includes("appreciated") ||
      raw.includes("grateful") ||
      raw.includes("thank") ||
      raw.includes("thanks")
    ) {
      return {
        got: "appreciated",
        optionIds: ["chorus", "opening", "outro"],
      };
    }

    if (
      raw.includes("gentle") ||
      raw.includes("soft") ||
      raw.includes("tender")
    ) {
      return {
        got: "gentle",
        optionIds: ["opening", "chorus", "outro"],
      };
    }

    if (
      raw.includes("peaceful") ||
      raw.includes("calm") ||
      raw.includes("peace")
    ) {
      return {
        got: "peaceful",
        optionIds: ["outro", "opening", "chorus"],
      };
    }

    if (
      raw.includes("emotional") ||
      raw.includes("big heart") ||
      raw.includes("love") ||
      raw.includes("loved")
    ) {
      return {
        got: "big heart",
        optionIds: ["chorus", "outro", "opening"],
      };
    }

    return {
      got: raw,
      optionIds: ["chorus", "opening", "outro"],
    };
  }

  function setFocus(title: string, body: string) {
    setFocusTitle(title);
    setFocusBody(body);
  }

  function submitFeeling(value: string) {
    const result = normalizeFeeling(value);
    setSeedFeeling(result.got);
    setOptionIds(result.optionIds);
    setSelectedId(result.optionIds[0]);
    setTypedFeeling("");
    setFocus("Good choice", `You picked ${result.heard}. Now hear your best HUG options.`);
    setStep(2);
  }

  function stopOtherDemoAudio(current: HTMLAudioElement) {
    for (const el of Object.values(audioRefs.current)) {
      if (!el || el === current) continue;
      el.pause();
      el.currentTime = 0;
    }
  }

  function playDemo(id: string) {
    const el = audioRefs.current[id];
    if (!el) return;

    stopOtherDemoAudio(el);
    el.play().catch(() => {});
  }

  const progress = [
    { n: 1, label: "Learn" },
    { n: 2, label: "Tell BB-BOT" },
    { n: 3, label: "See options" },
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
              BB-BOT guide · MC-BOT voice · MC-BOT voice
            </div>
          </div>

          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            Send Mom a real audio greeting card.
          </h1>

          <div className="mt-5 rounded-[1.5rem] border border-amber-300/30 bg-black/25 p-5">
            <p className="text-lg font-black text-amber-100">
              Get a private HUG link Mom can open — no file download.
            </p>
            <p className="mt-2 text-base font-bold leading-7 text-amber-50/80">
              Send by email, DM, social link, or text from your own phone.
              No shipping. No app. No file download. Just a real music moment Mom can open instantly.
            </p>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-amber-300/30 bg-amber-300 px-5 py-4 text-[#2a180d] shadow-lg">
            <p className="text-sm font-black uppercase tracking-[0.18em]">
              BB-BOT
            </p>
            <p className="mt-2 text-2xl font-black leading-tight">{botMessage}</p>

              <button
                type="button"
                onClick={() => playMcBotVoice("welcome")}
                className="mt-4 rounded-2xl bg-[#2a180d] px-5 py-3 text-base font-black text-amber-100 transition hover:opacity-90"
              >
                Play MC-BOT Guide
              </button>
          </div>

          <section className="mt-6 rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Current step
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-50">{focusTitle}</h2>
            <p className="mt-3 text-lg leading-8 text-amber-50/80">{focusBody}</p>
          </section>

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
                  ♪ Tell BB-BOT how Mom should feel.
                </div>
                <div className="rounded-2xl bg-black/20 px-4 py-4 text-lg">
                  2. See a few HUG options.
                </div>
                <div className="rounded-2xl bg-black/20 px-4 py-4 text-lg">
                  ♩ Choose one HUG.
                </div>
                <div className="rounded-2xl bg-black/20 px-4 py-4 text-lg">
                  ♫ Checkout.
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                    playMcBotVoice("start-hug");
                    setFocus("Start the HUG", "Now choose how you want Mom to feel.");
                    setStep(1);
                  }}
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
                  playMcBotVoice("pick-one");
                  setFocus("Feeling entered", "I’ll use that to find your best HUG options.");
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
                    onClick={() => {
                      playMcBotVoice("pick-one");
                      setFocus("Feeling picked", `You picked ${feeling}. I’ll show matching HUG options.`);
                      submitFeeling(feeling);
                    }}
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
                BB-BOT got: <span className="font-black text-amber-200">{gotFeeling}</span>
              </p>

              <p className="mt-4 rounded-2xl bg-black/25 px-4 py-3 text-base font-bold text-amber-100">
                If this HUG does not feel right, tell BB-BOT.
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
                          onClick={() => {
                          playMcBotVoice("play-demo");
                          setFocus("Listen first", `You are playing ${demo.title}. If it feels right, choose this HUG.`);
                          playDemo(demo.id);
                        }}
                          className="rounded-2xl bg-amber-300 px-6 py-4 text-lg font-black text-[#2a180d] transition hover:bg-amber-200"
                        >
                          Play demo
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            playMcBotVoice("choose-hug");
                            setFocus("HUG selected", `${demo.title} is selected. Checkout is ready.`);
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
                        onPlay={(event) => {
                          stopOtherDemoAudio(event.currentTarget);
                          show(`You are hearing ${demo.title}.`);
                        }}
                        className="mt-4 w-full"
                        onEnded={() => show("Demo finished. Choose this HUG if it feels right.")}
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
                  onClick={() => {
                    playMcBotVoice("start-hug");
                    setFocus("Start the HUG", "Now choose how you want Mom to feel.");
                    setStep(1);
                  }}
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
                onClick={() => show("Opening secure checkout now.")}
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
                  See options again
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
        <div className="mt-6 rounded-2xl border border-amber-200/15 bg-black/20 p-4 text-center">
          <p className="text-sm font-bold leading-6 text-amber-50/70">
            A HUG uses a focused song moment. For full tracks, artists, and more music, visit{" "}
            <a
              href="https://www.gputnammusic.com"
              target="_blank"
              rel="noreferrer"
              className="font-black text-amber-200 underline underline-offset-4"
            >
              G Putnam Music
            </a>.
          </p>
        </div>

        </div>
      </section>
    </main>
  );
}
