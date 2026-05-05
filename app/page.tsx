"use client";

import { useEffect, useMemo, useState } from "react";

const STRIPE_URL = "https://buy.stripe.com/14AeVcawC9QCaq04xg4ow0p";

const demos = [
  {
    id: "opening",
    title: "Thank You — KK Opening",
    feeling: "Gentle start",
    keywords: ["gentle", "soft", "start", "opening", "quiet", "tender"],
    bestFor: "When you want Mom to feel seen right away.",
    bot: "I recommend the gentle opening when your message should feel soft, personal, and thankful.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-opening.mp3",
  },
  {
    id: "chorus",
    title: "Thank You — KK Chorus",
    feeling: "Big heart",
    keywords: ["emotional", "heart", "thank", "thanks", "grateful", "love", "mother", "mom"],
    bestFor: "When you want the strongest emotional Mother’s Day moment.",
    bot: "I recommend the chorus. This is the strongest first choice for most Mother’s Day HUGs.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-chorus.mp3",
  },
  {
    id: "outro",
    title: "Thank You — KK Outro",
    feeling: "Warm closing",
    keywords: ["peace", "peaceful", "closing", "outro", "calm", "complete", "finish"],
    bestFor: "When you want the HUG to feel peaceful, complete, and easy to send.",
    bot: "I recommend the warm closing when you want the HUG to land gently and feel complete.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-outro.mp3",
  },
];

const steps = [
  {
    title: "Tell BB-BOT the feeling",
    body: "Say or type what Mom should feel.",
  },
  {
    title: "Hear the demo",
    body: "BB-BOT recommends a HUG. Press play.",
  },
  {
    title: "Choose the HUG",
    body: "Lock the demo that feels right.",
  },
  {
    title: "Order safely",
    body: "Checkout opens through Stripe.",
  },
];

type ChatLine = {
  who: "bot" | "you";
  text: string;
};

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDemo, setSelectedDemo] = useState(demos[1]);
  const [typedFeeling, setTypedFeeling] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("Voice helper ready.");
  const [botAwake, setBotAwake] = useState(false);
  const [hugChosen, setHugChosen] = useState(false);
  const [chat, setChat] = useState<ChatLine[]>([
    {
      who: "bot",
      text: "Hi, I’m BB-BOT. I’ll help you choose the right Mother’s Day audio HUG.",
    },
    {
      who: "bot",
      text: "Tell me what Mom should feel: gentle, grateful, emotional, peaceful, or loved.",
    },
  ]);

  const selectedIndex = useMemo(
    () => demos.findIndex((demo) => demo.id === selectedDemo.id),
    [selectedDemo]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setBotAwake(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  function speak(text: string) {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.02;
    window.speechSynthesis.speak(utterance);
  }

  function addBot(text: string, shouldSpeak = false) {
    setChat((old) => [...old, { who: "bot", text }]);
    if (shouldSpeak) speak(text);
  }

  function addYou(text: string) {
    setChat((old) => [...old, { who: "you", text }]);
  }

  function chooseDemo(demo: (typeof demos)[number], shouldSpeak = false) {
    setSelectedDemo(demo);
    setActiveStep(1);
    setHugChosen(false);
    addBot(demo.bot, shouldSpeak);
  }

  function analyzeFeeling(raw: string, shouldSpeak = false) {
    const text = raw.trim().toLowerCase();

    if (!text) {
      addBot("Give me one feeling word. Try: gentle, grateful, emotional, peaceful, or loved.", shouldSpeak);
      setActiveStep(0);
      return;
    }

    addYou(raw);
    setTypedFeeling("");

    const matched =
      demos.find((demo) => demo.keywords.some((word) => text.includes(word))) || demos[1];

    chooseDemo(matched, shouldSpeak);

    window.setTimeout(() => {
      addBot("Now press play. If it feels right, choose this HUG and I’ll move you to checkout.", shouldSpeak);
      setActiveStep(1);
    }, 250);
  }

  function startVoice() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    setBotAwake(true);

    if (!SpeechRecognition) {
      setVoiceStatus("Voice is not supported in this browser. Type the feeling below.");
      addBot("Voice is not supported here. Type one feeling and I’ll guide you.", true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setVoiceStatus("Listening now. Say what Mom should feel.");
    addBot("I’m listening. Say what Mom should feel.", true);

    recognition.onresult = (event: any) => {
      const phrase = String(event.results?.[0]?.[0]?.transcript || "");
      setVoiceStatus(`Heard: "${phrase}"`);
      analyzeFeeling(phrase, true);
    };

    recognition.onerror = () => {
      setVoiceStatus("Voice did not start. Type the feeling below.");
      addBot("Voice did not start. Type the feeling below and I’ll still guide you.", true);
    };

    recognition.start();
  }

  function chooseThisHug() {
    setHugChosen(true);
    setActiveStep(2);
    addBot(`Good choice. ${selectedDemo.title} is selected. Next step: secure checkout.`, true);

    window.setTimeout(() => {
      setActiveStep(3);
      addBot("Ready when you are. Tap secure checkout to order the Mother’s Day HUG.", true);
    }, 500);
  }

  return (
    <main className="min-h-screen bg-[#251409] text-[#fff7e8]">
      <section className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
        <div className="rounded-[2rem] border border-amber-300/25 bg-[#3a2111] p-5 shadow-2xl sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-200">
              K-KUT HUGs · Mother’s Day
            </p>

            <div className="flex items-center gap-2 rounded-full border border-green-300/30 bg-green-400/10 px-4 py-2 text-sm font-bold text-green-100">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-300" />
              BB-BOT active
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">
            <div>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">
                Send Mom a real audio greeting card.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-amber-50/85">
                BB-BOT talks the buyer through every step: say the feeling, hear the demo, choose the HUG, and checkout securely.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
                    setBotAwake(true);
                    setActiveStep(0);
                    addBot("I’m active. Type or tap a feeling and I’ll recommend the right HUG.", true);
                  }}
                  className="rounded-2xl border border-amber-200/40 px-6 py-4 text-base font-bold text-amber-50 transition hover:bg-white/10"
                >
                  Wake BB-BOT
                </button>
              </div>

              <p className="mt-3 text-sm text-amber-100/70">{voiceStatus}</p>

              <div className="mt-6 rounded-[1.5rem] border border-amber-200/20 bg-black/20 p-4">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                  Type to BB-BOT
                </p>

                <form
                  className="mt-3 flex flex-col gap-3 sm:flex-row"
                  onSubmit={(event) => {
                    event.preventDefault();
                    analyzeFeeling(typedFeeling, true);
                  }}
                >
                  <input
                    value={typedFeeling}
                    onChange={(event) => setTypedFeeling(event.target.value)}
                    placeholder="Example: I want Mom to feel loved and thanked"
                    className="min-h-12 flex-1 rounded-2xl border border-amber-200/20 bg-white/10 px-4 text-amber-50 outline-none placeholder:text-amber-100/45"
                  />

                  <button
                    type="submit"
                    className="rounded-2xl bg-amber-300 px-6 py-3 font-black text-[#2b190d] transition hover:bg-amber-200"
                  >
                    Ask BB-BOT
                  </button>
                </form>
              </div>
            </div>

            <div
              className={`rounded-[1.5rem] border border-amber-200/25 bg-black/25 p-5 transition ${
                botAwake ? "scale-100 opacity-100" : "scale-[0.98] opacity-80"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-amber-300 text-2xl font-black text-[#2b190d] shadow-lg">
                  BB
                </div>

                <div>
                  <h2 className="text-2xl font-black">BB-BOT is guiding this order.</h2>
                  <p className="mt-2 text-base leading-7 text-amber-50/80">
                    Voice, tap, or type. BB-BOT watches the whole flow and talks you through the next best action.
                  </p>
                </div>
              </div>

              <div className="mt-5 max-h-64 space-y-3 overflow-auto rounded-2xl border border-amber-200/10 bg-black/20 p-3">
                {chat.slice(-6).map((line, index) => (
                  <div
                    key={`${line.who}-${index}-${line.text}`}
                    className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                      line.who === "bot"
                        ? "bg-amber-300 text-[#2b190d]"
                        : "bg-white/10 text-amber-50"
                    }`}
                  >
                    <span className="font-black">{line.who === "bot" ? "BB-BOT: " : "You: "}</span>
                    {line.text}
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {["Gentle", "Grateful", "Emotional", "Peaceful"].map((feeling) => (
                  <button
                    key={feeling}
                    type="button"
                    onClick={() => analyzeFeeling(feeling, true)}
                    className="rounded-2xl border border-amber-200/20 bg-white/5 px-4 py-3 text-left font-bold transition hover:bg-white/10"
                  >
                    {feeling}
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
                key={step.title}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`rounded-[1.5rem] border p-5 text-left transition ${
                  active
                    ? "scale-[1.02] border-amber-300 bg-amber-300 text-[#2b190d] shadow-xl"
                    : "border-amber-200/20 bg-white/5 text-amber-50 hover:bg-white/10"
                }`}
              >
                <p className="text-sm font-black uppercase tracking-[0.18em]">
                  Step {index + 1}
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
                Active guided demo
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                BB-BOT is guiding: {selectedDemo.feeling}
              </h2>
            </div>

            <a
              href={STRIPE_URL}
              className="rounded-2xl bg-amber-300 px-6 py-4 text-center font-black text-[#2b190d] shadow-lg transition hover:bg-amber-200"
            >
              Secure checkout · $7.99
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
                    onClick={() => chooseDemo(demo, true)}
                    className={`rounded-[1.25rem] border p-5 text-left transition ${
                      active
                        ? "scale-[1.01] border-amber-300 bg-amber-300 text-[#2b190d] shadow-xl"
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
                onPlay={() => {
                  setActiveStep(1);
                  addBot("Good. Listen first. Then choose this HUG if it feels right.", false);
                }}
                onEnded={() => {
                  setActiveStep(2);
                  addBot("Demo finished. If it feels right, choose this HUG.", true);
                }}
              >
                <source src={selectedDemo.audioSrc} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>

              <div className="mt-6 rounded-2xl bg-white/5 p-4">
                <p className="font-bold text-amber-100">BB-BOT knows your next action</p>
                <p className="mt-2 leading-7 text-amber-50/75">
                  {hugChosen
                    ? "HUG selected. Go to secure checkout to complete the Mother’s Day order."
                    : "Press play, then choose this HUG. BB-BOT will move you to checkout."}
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={chooseThisHug}
                  className="rounded-2xl border border-amber-200/30 px-5 py-4 font-black text-amber-50 transition hover:bg-white/10"
                >
                  I choose this HUG
                </button>

                <a
                  href={STRIPE_URL}
                  className={`rounded-2xl px-5 py-4 text-center font-black transition ${
                    hugChosen
                      ? "bg-green-300 text-[#102015] hover:bg-green-200"
                      : "bg-amber-300 text-[#2b190d] hover:bg-amber-200"
                  }`}
                >
                  {hugChosen ? "Checkout now · $7.99" : "Secure checkout · $7.99"}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-5">
            <h3 className="text-xl font-black">Voice or type.</h3>
            <p className="mt-2 leading-7 text-amber-50/75">
              BB-BOT talks, listens, responds, and keeps the buyer moving.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-5">
            <h3 className="text-xl font-black">One active step.</h3>
            <p className="mt-2 leading-7 text-amber-50/75">
              BB-BOT highlights the current step and explains what to do next.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-5">
            <h3 className="text-xl font-black">Real checkout.</h3>
            <p className="mt-2 leading-7 text-amber-50/75">
              The order button goes to the active Mother’s Day Section K-KUT payment link.
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
