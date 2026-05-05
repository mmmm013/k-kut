"use client";

import { useMemo, useState } from "react";

const STRIPE_URL = "https://buy.stripe.com";

const demos = [
  {
    id: "opening",
    title: "Thank You — KK Opening",
    feeling: "Gentle start",
    bestFor: "When you want Mom to feel seen right away.",
    helper: "BB-BOT says: Start here if your message is soft, thankful, and personal.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-opening.mp3",
  },
  {
    id: "chorus",
    title: "Thank You — KK Chorus",
    feeling: "Big heart",
    bestFor: "When you want the strongest emotional Mother’s Day moment.",
    helper: "BB-BOT says: This is the safest first choice for most Mother’s Day HUGs.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-chorus.mp3",
  },
  {
    id: "outro",
    title: "Thank You — KK Outro",
    feeling: "Warm closing",
    bestFor: "When you want the HUG to feel peaceful, complete, and easy to send.",
    helper: "BB-BOT says: Use this when the message should land gently.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-outro.mp3",
  },
];

const steps = [
  {
    label: "Step 1",
    title: "Tell BB-BOT the feeling",
    body: "Choose what Mom should feel: gentle, grateful, emotional, or peaceful.",
  },
  {
    label: "Step 2",
    title: "Hear the demo",
    body: "Press play. Pick the K-KUT HUG that feels right.",
  },
  {
    label: "Step 3",
    title: "Order the HUG",
    body: "Use secure checkout. G Putnam Music prepares the sendable audio HUG.",
  },
  {
    label: "Step 4",
    title: "Send it to Mom",
    body: "You receive a playable audio gift link you can text or email.",
  },
];

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDemo, setSelectedDemo] = useState(demos[1]);
  const [botLine, setBotLine] = useState(
    "Hi, I’m BB-BOT. I’ll help you choose the right Mother’s Day audio HUG."
  );
  const [voiceStatus, setVoiceStatus] = useState("Voice helper ready.");

  const selectedIndex = useMemo(
    () => demos.findIndex((demo) => demo.id === selectedDemo.id),
    [selectedDemo]
  );

  function chooseDemo(demo: (typeof demos)[number]) {
    setSelectedDemo(demo);
    setActiveStep(1);
    setBotLine(demo.helper);
  }

  function startVoice() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus("Voice is not supported in this browser. Use the buttons below.");
      setBotLine("No problem. Tap a feeling below and I’ll still guide you.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setVoiceStatus("Listening. Say: gentle, emotional, grateful, or peaceful.");

    recognition.onresult = (event: any) => {
      const phrase = String(event.results?.[0]?.[0]?.transcript || "").toLowerCase();

      if (phrase.includes("gentle") || phrase.includes("soft")) {
        chooseDemo(demos[0]);
        setVoiceStatus(`Heard: "${phrase}"`);
        return;
      }

      if (
        phrase.includes("emotional") ||
        phrase.includes("heart") ||
        phrase.includes("grateful") ||
        phrase.includes("thank")
      ) {
        chooseDemo(demos[1]);
        setVoiceStatus(`Heard: "${phrase}"`);
        return;
      }

      if (
        phrase.includes("peace") ||
        phrase.includes("peaceful") ||
        phrase.includes("closing") ||
        phrase.includes("outro")
      ) {
        chooseDemo(demos[2]);
        setVoiceStatus(`Heard: "${phrase}"`);
        return;
      }

      setBotLine("I heard you. For Mother’s Day, I recommend the Chorus HUG first.");
      setSelectedDemo(demos[1]);
      setActiveStep(1);
      setVoiceStatus(`Heard: "${phrase}"`);
    };

    recognition.onerror = () => {
      setVoiceStatus("Voice did not start. Use the feeling buttons below.");
      setBotLine("No problem. I can still guide you step by step.");
    };

    recognition.start();
  }

  return (
    <main className="min-h-screen bg-[#2b190d] text-[#fff7e8]">
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="rounded-[2rem] border border-amber-300/25 bg-[#3a2111] p-5 shadow-2xl sm:p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
            K-KUT HUGs · Mother’s Day
          </p>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">
                Send Mom a real audio greeting card.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-amber-50/85">
                BB-BOT helps you choose a human-made K-KUT HUG, hear the demo,
                order securely, and send Mom a meaningful musical moment.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={startVoice}
                  className="rounded-2xl bg-amber-300 px-6 py-4 text-base font-black text-[#2b190d] shadow-lg transition hover:bg-amber-200"
                >
                  Speak to BB-BOT
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(0);
                    setBotLine("Start with the feeling. I’ll keep this simple.");
                  }}
                  className="rounded-2xl border border-amber-200/40 px-6 py-4 text-base font-bold text-amber-50 transition hover:bg-white/10"
                >
                  Start without voice
                </button>
              </div>

              <p className="mt-3 text-sm text-amber-100/70">{voiceStatus}</p>
            </div>

            <div className="rounded-[1.5rem] border border-amber-200/25 bg-black/20 p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-amber-300 text-xl font-black text-[#2b190d]">
                  BB
                </div>
                <div>
                  <h2 className="text-2xl font-black">BB-BOT is here first.</h2>
                  <p className="mt-2 text-base leading-7 text-amber-50/85">{botLine}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {["Gentle", "Grateful", "Emotional", "Peaceful"].map((feeling) => (
                  <button
                    key={feeling}
                    type="button"
                    onClick={() => {
                      if (feeling === "Gentle") chooseDemo(demos[0]);
                      if (feeling === "Grateful") chooseDemo(demos[1]);
                      if (feeling === "Emotional") chooseDemo(demos[1]);
                      if (feeling === "Peaceful") chooseDemo(demos[2]);
                    }}
                    className="rounded-2xl border border-amber-200/20 bg-white/5 px-4 py-3 text-left font-bold transition hover:bg-white/10"
                  >
                    I want Mom to feel: {feeling}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => {
            const active = activeStep === index;

            return (
              <button
                key={step.label}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`rounded-[1.5rem] border p-5 text-left transition ${
                  active
                    ? "border-amber-300 bg-amber-300 text-[#2b190d] shadow-xl"
                    : "border-amber-200/20 bg-white/5 text-amber-50 hover:bg-white/10"
                }`}
              >
                <p className="text-sm font-black uppercase tracking-[0.18em]">
                  {step.label}
                </p>
                <h3 className="mt-3 text-xl font-black">{step.title}</h3>
                <p className={`mt-3 text-sm leading-6 ${active ? "text-[#2b190d]/80" : "text-amber-50/75"}`}>
                  {step.body}
                </p>
              </button>
            );
          })}
        </section>

        <section className="mt-8 rounded-[2rem] border border-amber-200/20 bg-[#3a2111] p-5 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
                Guided demo
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Choose the feeling. Hear the HUG.
              </h2>
            </div>

            <a
              href={STRIPE_URL}
              className="rounded-2xl bg-amber-300 px-6 py-4 text-center font-black text-[#2b190d] shadow-lg transition hover:bg-amber-200"
            >
              Order Mother’s Day HUG
            </a>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-3">
              {demos.map((demo, index) => {
                const active = selectedDemo.id === demo.id;

                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => chooseDemo(demo)}
                    className={`rounded-[1.25rem] border p-5 text-left transition ${
                      active
                        ? "border-amber-300 bg-amber-300 text-[#2b190d]"
                        : "border-amber-200/20 bg-white/5 text-amber-50 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-sm font-black uppercase tracking-[0.18em]">
                      Demo {index + 1} · {demo.feeling}
                    </p>
                    <h3 className="mt-2 text-xl font-black">{demo.title}</h3>
                    <p className={`mt-2 text-sm leading-6 ${active ? "text-[#2b190d]/75" : "text-amber-50/70"}`}>
                      {demo.bestFor}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[1.5rem] border border-amber-200/20 bg-black/20 p-5">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                Selected HUG · Demo {selectedIndex + 1}
              </p>
              <h3 className="mt-3 text-3xl font-black">{selectedDemo.title}</h3>
              <p className="mt-3 text-lg leading-8 text-amber-50/85">
                {selectedDemo.bestFor}
              </p>

              <audio
                key={selectedDemo.audioSrc}
                controls
                preload="metadata"
                className="mt-6 w-full"
              >
                <source src={selectedDemo.audioSrc} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>

              <div className="mt-6 rounded-2xl bg-white/5 p-4">
                <p className="font-bold text-amber-100">
                  What happens after purchase?
                </p>
                <p className="mt-2 leading-7 text-amber-50/75">
                  G Putnam Music prepares the Mother’s Day audio HUG and provides
                  a playable link you can text or email to Mom.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="rounded-2xl border border-amber-200/30 px-5 py-4 font-black text-amber-50 transition hover:bg-white/10"
                >
                  This is my HUG
                </button>

                <a
                  href={STRIPE_URL}
                  className="rounded-2xl bg-amber-300 px-5 py-4 text-center font-black text-[#2b190d] transition hover:bg-amber-200"
                >
                  Secure checkout
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-5">
            <h3 className="text-xl font-black">Real audio.</h3>
            <p className="mt-2 leading-7 text-amber-50/75">
              Human-made song-section audio. No fake greeting-card template feel.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-5">
            <h3 className="text-xl font-black">BB-BOT guided.</h3>
            <p className="mt-2 leading-7 text-amber-50/75">
              Voice or tap. The user gets one highlighted step at a time.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-5">
            <h3 className="text-xl font-black">Simple delivery.</h3>
            <p className="mt-2 leading-7 text-amber-50/75">
              Order, receive the playable HUG, and send it to Mom by text or email.
            </p>
          </div>
        </section>

        <footer className="mt-10 border-t border-amber-200/15 pt-6 text-sm leading-7 text-amber-50/65">
          <p>
            K-KUT HUG checkout is live through Stripe. Fulfillment is controlled
            by G Putnam Music. Public playback is reserved for approved KK audio.
          </p>
        </footer>
      </section>
    </main>
  );
}
