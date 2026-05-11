"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STRIPE_URL = "https://buy.stripe.com/14AeVcawC9QCaq04xg4ow0p";

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

function playOneAudio(src: string): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);

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

  return audio
    .play()
    .then(() => true)
    .catch(() => {
      clearIfActive();
      console.log("BOT voice blocked until first user interaction:", src);
      return false;
    });
}

const GUIDE_AUDIO = {
  welcome: "/audio/kleigh/guide-final/33-welcome.m4a",
  choose: "/audio/kleigh/guide-final/07-choose-feel.m4a",
  play: "/audio/kleigh/guide-final/24-press-play.m4a",
  checkout: "/audio/kleigh/guide-final/03-best-hug.m4a",
} as const;

const DEMOS = [
  {
    id: "chorus",
    feeling: "Big Heart",
    title: "Thank You — Big Heart HUG",
    shortTitle: "Big Heart",
    description: "Warm, strong, and emotional. Best when the HUG should feel full, grateful, and loved.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-chorus.mp3",
  },
  {
    id: "opening",
    feeling: "Gentle",
    title: "Thank You — Gentle HUG",
    shortTitle: "Gentle",
    description: "Soft and tender. Best when the HUG should feel calm, kind, and close.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-opening.mp3",
  },
  {
    id: "outro",
    feeling: "Peaceful",
    title: "Thank You — Peaceful HUG",
    shortTitle: "Peaceful",
    description: "A calm and warm closing. Best when the HUG should feel reflective, comforting, and complete.",
    audioSrc: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-outro.mp3",
  },
] as const;

type DemoId = (typeof DEMOS)[number]["id"];

const INTENTS: {
  id: string;
  label: string;
  body: string;
  demoId: DemoId;
  order: DemoId[];
}[] = [
  {
    id: "thank-you",
    label: "Thank you",
    body: "For gratitude that needs more than plain words.",
    demoId: "chorus",
    order: ["chorus", "opening", "outro"],
  },
  {
    id: "love",
    label: "Love",
    body: "For warmth, closeness, care, and a private emotional moment.",
    demoId: "opening",
    order: ["opening", "chorus", "outro"],
  },
  {
    id: "support",
    label: "Support",
    body: "For encouragement, comfort, strength, or being there from a distance.",
    demoId: "outro",
    order: ["outro", "opening", "chorus"],
  },
  {
    id: "sorry-repair",
    label: "Sorry / repair",
    body: "For apology, repair, longing, or a feeling that is hard to say directly.",
    demoId: "opening",
    order: ["opening", "outro", "chorus"],
  },
  {
    id: "miss-you",
    label: "I miss you",
    body: "For distance, memory, longing, or wanting someone to feel remembered.",
    demoId: "outro",
    order: ["outro", "chorus", "opening"],
  },
  {
    id: "proud",
    label: "I’m proud of you",
    body: "For recognition, celebration, belief, and emotional encouragement.",
    demoId: "chorus",
    order: ["chorus", "outro", "opening"],
  },
];

type Step = 1 | 2 | 3;

export default function GeneralHugPage() {
  const [step, setStep] = useState<Step>(1);
  const [typedFeeling, setTypedFeeling] = useState("");
  const [selectedIntentId, setSelectedIntentId] = useState("always-there");
  const [selectedId, setSelectedId] = useState<DemoId>("chorus");
  const [optionIds, setOptionIds] = useState<DemoId[]>(["chorus", "opening", "outro"]);
  const [focusTitle, setFocusTitle] = useState("Choose the feeling first");
  const [focusBody, setFocusBody] = useState(
    "Pick the closest HUG intent. Then hear the matching HUG options before checkout."
  );

  const [recipientName, setRecipientName] = useState("");
  const [recipientMessage, setRecipientMessage] = useState(
    "I picked this K-KUT HUG for you because words alone did not feel like enough."
  );
  const [privateHugLink, setPrivateHugLink] = useState("");

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const selectedIntent = useMemo(
    () => INTENTS.find((intent) => intent.id === selectedIntentId) ?? INTENTS[0],
    [selectedIntentId]
  );

  const options = useMemo(
    () =>
      optionIds
        .map((id) => DEMOS.find((demo) => demo.id === id))
        .filter(Boolean) as typeof DEMOS,
    [optionIds]
  );

  const selectedDemo = useMemo(
    () => DEMOS.find((demo) => demo.id === selectedId) ?? DEMOS[0],
    [selectedId]
  );

  const guideMessage = useMemo(() => {
    if (step === 1) {
      return "Step 1. Choose what they should feel.";
    }

    if (step === 2) {
      return `Step 2. You chose “${selectedIntent.label}.” Hear the matching HUG options.`;
    }

    return `Step 3. You selected “${selectedDemo.shortTitle}.” Checkout to order the private HUG link.`;
  }, [step, selectedIntent.label, selectedDemo.shortTitle]);

  function playGuide(kind: keyof typeof GUIDE_AUDIO = "welcome") {
    return playOneAudio(GUIDE_AUDIO[kind]);
  }

  useEffect(() => {
    let greetingPlayed = false;
    let cancelled = false;

    function cleanupGreetingListeners() {
      window.removeEventListener("pointerdown", startGuideGreeting);
      window.removeEventListener("keydown", startGuideGreeting);
      window.removeEventListener("touchstart", startGuideGreeting);
      window.removeEventListener("mousedown", startGuideGreeting);
    }

    function startGuideGreeting() {
      if (greetingPlayed || cancelled) return;

      playGuide("welcome").then((played) => {
        if (!played || cancelled) return;

        greetingPlayed = true;
        cleanupGreetingListeners();
      });
    }

    const timer = window.setTimeout(startGuideGreeting, 800);

    window.addEventListener("pointerdown", startGuideGreeting);
    window.addEventListener("keydown", startGuideGreeting);
    window.addEventListener("touchstart", startGuideGreeting);
    window.addEventListener("mousedown", startGuideGreeting);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cleanupGreetingListeners();
    };
  }, []);

  function chooseIntent(intent: (typeof INTENTS)[number]) {
    setSelectedIntentId(intent.id);
    setSelectedId(intent.demoId);
    setOptionIds(intent.order);
    setFocusTitle(intent.label);
    setFocusBody(intent.body);
    setStep(2);
    playGuide("choose");
  }

  function normalizeTypedFeeling(input: string) {
    const raw = input.trim().toLowerCase();

    if (!raw) return INTENTS[0];

    if (
      raw.includes("miss") ||
      raw.includes("distance") ||
      raw.includes("far") ||
      raw.includes("gone") ||
      raw.includes("memory")
    ) {
      return INTENTS.find((intent) => intent.id === "miss-you") ?? INTENTS[0];
    }

    if (
      raw.includes("peace") ||
      raw.includes("calm") ||
      raw.includes("comfort") ||
      raw.includes("gentle")
    ) {
      return INTENTS.find((intent) => intent.id === "peaceful") ?? INTENTS[0];
    }

    if (
      raw.includes("cry") ||
      raw.includes("tears") ||
      raw.includes("emotional") ||
      raw.includes("big")
    ) {
      return INTENTS.find((intent) => intent.id === "happy-tears") ?? INTENTS[0];
    }

    if (
      raw.includes("help") ||
      raw.includes("there") ||
      raw.includes("always") ||
      raw.includes("support")
    ) {
      return INTENTS.find((intent) => intent.id === "always-there") ?? INTENTS[0];
    }

    if (
      raw.includes("difference") ||
      raw.includes("matter") ||
      raw.includes("important")
    ) {
      return INTENTS.find((intent) => intent.id === "made-difference") ?? INTENTS[0];
    }

    if (
      raw.includes("thank") ||
      raw.includes("grateful") ||
      raw.includes("appreciate") ||
      raw.includes("love") ||
      raw.includes("loved")
    ) {
      return INTENTS.find((intent) => intent.id === "appreciate-everything") ?? INTENTS[0];
    }

    return {
      id: "typed",
      label: input.trim(),
      body: "A custom HUG feeling. Start with the strongest match, then hear the options.",
      demoId: "chorus",
      order: ["chorus", "opening", "outro"],
    };
  }

  function submitTypedFeeling() {
    const intent = normalizeTypedFeeling(typedFeeling);
    chooseIntent(intent);
    setTypedFeeling("");
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
    el.currentTime = 0;
    el.play().catch(() => {});
    playGuide("play");
  }

  function chooseDemo(id: DemoId) {
    const demo = DEMOS.find((item) => item.id === id) ?? DEMOS[0];
    setSelectedId(id);
    setFocusTitle(`${demo.shortTitle} HUG selected`);
    setFocusBody(demo.description);
    setStep(3);
    playGuide("checkout");
  }

  function makeRecipientSlug(name: string) {
    const clean = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32);

    const stamp = Date.now().toString(36).slice(-5);
    return `${clean || "recipient"}-${selectedDemo.id}-${stamp}`;
  }

  function makePrivateHugLink() {
    const slug = makeRecipientSlug(recipientName);
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://www.k-kut.com";

    return `${base}/hug/private?name=${encodeURIComponent(
      recipientName || "them"
    )}&msg=${encodeURIComponent(
      recipientMessage
    )}&demo=${encodeURIComponent(selectedDemo.id)}&audio=${encodeURIComponent(
      selectedDemo.audioSrc
    )}&slug=${encodeURIComponent(slug)}`;
  }

  async function startCheckout() {
    const generatedPrivateLink = makePrivateHugLink();
    setPrivateHugLink(generatedPrivateLink);

    try {
      await fetch("/api/4pe/fulfillment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selected_hug_id: selectedDemo.id,
          selected_hug_title: selectedDemo.title,
          selected_intent_id: selectedIntent.id,
          selected_intent_label: selectedIntent.label,
          source_page: "/hug/mothers-day",
          product_family: "HUG",
          holiday_set: "mothers_day",
          source_song: "Thank You",
          sentiment_product_type: "HUG",
          typed_feeling: selectedIntent.label,
          interpreted_feeling: selectedIntent.label,
          delivery_preference: "private_link",
          consent_sms: false,
          metadata: {
            checkout_handoff: true,
            private_hug_link: generatedPrivateLink,
            recipient_name: recipientName,
            recipient_message: recipientMessage,
            selected_hug_audio: selectedDemo.audioSrc,
            no_download: true,
            sms_enabled: false,
            sms_note: "SMS is pending A2P approval. Use email/manual private link delivery until verified.",
            buyer_page_is_not_recipient_page: true,
          },
        }),
      });
    } catch {
      // Checkout remains available. 4PE can reconcile manually if capture fails.
    }

    window.location.href = STRIPE_URL;
  }

  const progress = [
    { n: 1, label: "Choose feeling" },
    { n: 2, label: "Hear options" },
    { n: 3, label: "Checkout" },
  ];

  return (
    <main className="min-h-screen bg-[#261208] text-[#fff6e8]">
      <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#3a1f0f] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-200">
              K-KUT HUG
            </p>

            <div className="rounded-full border border-green-300/30 bg-green-400/10 px-4 py-2 text-sm font-bold text-green-100">
              BOT-guided path
            </div>
          </div>

          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            Send the right feeling through music and words.
          </h1>

          <div className="mt-5 rounded-[1.5rem] border border-amber-300/30 bg-black/25 p-5">
            <p className="text-lg font-black text-amber-100">
              We walk you through it. Choose the feeling, hear the music, add your words, and send an emotional statement like never before.
            </p>
            <p className="mt-2 text-base font-bold leading-7 text-amber-50/80">
              Sing a feeling forward. A K-KUT HUG helps you say what plain text cannot: gratitude, love, support, repair, memory, or happy tears. First-time users: buy 1, get 1 free.
            </p>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-amber-300/30 bg-amber-300 px-5 py-4 text-[#2a180d] shadow-lg">
            <p className="text-sm font-black uppercase tracking-[0.18em]">
              Guide
            </p>
            <p className="mt-2 text-2xl font-black leading-tight">{guideMessage}</p>
          </div>

          <section className="mt-6 rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Current step
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-50">{focusTitle}</h2>
            <p className="mt-3 text-lg leading-8 text-amber-50/80">{focusBody}</p>
          </section>

          <div className="mt-6 rounded-[1.5rem] border border-amber-300 bg-amber-300 px-5 py-4 text-[#2a180d] shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.2em]">
              Active step {step} of 3
            </p>
            <p className="mt-2 text-2xl font-black">
              {step === 1 ? "Choose feeling" : step === 2 ? "Hear options" : "Send HUG"}
            </p>
          </div>

          {step === 1 ? (
          <section className="mt-8 rounded-[1.5rem] border border-amber-200/20 bg-white/5 p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                  Feeling choices
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  What feeling do you want to send?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setFocusTitle("Choose the feeling first");
                  setFocusBody("Pick the closest HUG intent. Then hear the matching HUG options before checkout.");
                }}
                className="rounded-2xl border border-amber-200/20 px-5 py-3 text-sm font-black text-amber-50/80 transition hover:bg-white/10"
              >
                Start over
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={typedFeeling}
                onChange={(event) => setTypedFeeling(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submitTypedFeeling();
                  }
                }}
                placeholder="Example: I want her to feel appreciated"
                className="min-h-[3.5rem] flex-1 rounded-2xl border border-amber-300/25 bg-black/30 px-5 py-4 text-base font-bold text-amber-50 outline-none placeholder:text-amber-50/45"
              />
              <button
                type="button"
                onClick={submitTypedFeeling}
                className="rounded-2xl bg-amber-300 px-6 py-4 text-base font-black text-[#2a180d] transition hover:bg-amber-200"
              >
                Match feeling
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INTENTS.map((intent) => {
                const active = selectedIntentId === intent.id;

                return (
                  <button
                    key={intent.id}
                    type="button"
                    onClick={() => chooseIntent(intent)}
                    className={`rounded-[1.25rem] border p-5 text-left transition ${
                      active
                        ? "border-amber-300 bg-amber-300 text-[#2a180d]"
                        : "border-amber-300/20 bg-[#251209] text-amber-50 hover:border-amber-300/50 hover:bg-[#30180c]"
                    }`}
                  >
                    <p className="text-lg font-black">{intent.label}</p>
                    <p className={`mt-2 text-sm font-bold leading-6 ${active ? "text-[#2a180d]/75" : "text-amber-50/70"}`}>
                      {intent.body}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          ) : null}

          {step === 2 ? (
          <section className="mt-8 rounded-[1.5rem] border border-amber-200/20 bg-black/25 p-6">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              HUG options
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Hear the best matches for this feeling.
            </h2>
            <p className="mt-3 text-base font-bold leading-7 text-amber-50/75">
              Press Play first. Then choose the HUG that feels right.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {options.map((demo) => {
                const selected = selectedId === demo.id;

                return (
                  <article
                    key={demo.id}
                    className={`rounded-[1.5rem] border p-5 shadow-xl ${
                      selected
                        ? "border-amber-300 bg-[#3a1f0f]"
                        : "border-amber-300/20 bg-[#251209]"
                    }`}
                  >
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                      {demo.feeling}
                    </p>
                    <h3 className="mt-2 text-2xl font-black text-amber-50">
                      {demo.title}
                    </h3>
                    <p className="mt-3 text-sm font-bold leading-6 text-amber-50/75">
                      {demo.description}
                    </p>

                    <audio
                      ref={(el) => {
                        audioRefs.current[demo.id] = el;
                      }}
                      src={demo.audioSrc}
                      preload="metadata"
                      className="mt-5 w-full"
                      controls
                      onPlay={(event) => stopOtherDemoAudio(event.currentTarget)}
                    />

                    <div className="mt-5 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => playDemo(demo.id)}
                        className="rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
                      >
                        Play {demo.shortTitle}
                      </button>

                      <button
                        type="button"
                        onClick={() => chooseDemo(demo.id)}
                        className={
                          selected
                            ? "rounded-2xl bg-amber-300 px-5 py-3 text-center text-sm font-black text-[#2a180d] transition hover:bg-amber-200"
                            : "rounded-2xl border border-amber-200/25 px-5 py-3 text-center text-sm font-black text-amber-100 transition hover:bg-white/10"
                        }
                      >
                        {selected ? "Selected HUG" : "Choose this HUG"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          ) : null}

          {step === 3 ? (
          <section className="mt-8 rounded-[1.5rem] border border-amber-300/30 bg-[#140904] p-6">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Checkout
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-50">
              Order the private HUG link.
            </h2>
            <p className="mt-3 text-base font-bold leading-7 text-amber-50/80">
              Selected feeling: <span className="text-amber-200">{selectedIntent.label}</span>
              <br />
              Selected HUG: <span className="text-amber-200">{selectedDemo.title}</span>
            </p>

            <div className="mt-6 rounded-2xl border border-amber-300/25 bg-black/25 p-5">
              <p className="text-base font-black text-amber-100">
                Delivery note
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-amber-50/75">
                SMS delivery is pending carrier approval. Until then, your private HUG
                link can be delivered by email or sent manually by you through text, DM,
                or social link.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startCheckout}
                className="rounded-2xl bg-amber-300 px-8 py-5 text-xl font-black text-[#2a180d] shadow-lg transition hover:bg-amber-200"
              >
                Checkout for this HUG
              </button>
              <div className="rounded-[1.5rem] border border-amber-300/25 bg-black/30 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200/70">
                  Private recipient HUG link
                </p>
                <h3 className="mt-2 text-2xl font-black text-amber-50">
                  Tell us who opens this HUG.
                </h3>
                <p className="mt-2 text-sm font-bold leading-6 text-amber-50/70">
                  This creates the private link they open after checkout. No checkout,
                  no searching, and no buying pressure appears on the recipient page.
                </p>

                <label className="mt-5 block text-sm font-black text-amber-100">
                  Recipient name
                  <input
                    value={recipientName}
                    onChange={(event) => setRecipientName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-amber-200/20 bg-white px-4 py-3 text-base font-bold text-[#2a180d] outline-none"
                    placeholder="Recipient name"
                  />
                </label>

                <label className="mt-4 block text-sm font-black text-amber-100">
                  Short message
                  <textarea
                    value={recipientMessage}
                    onChange={(event) => setRecipientMessage(event.target.value)}
                    className="mt-2 min-h-28 w-full rounded-2xl border border-amber-200/20 bg-white px-4 py-3 text-base font-bold text-[#2a180d] outline-none"
                    placeholder="Write the note that appears with the HUG."
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setPrivateHugLink(makePrivateHugLink())}
                  className="mt-4 w-full rounded-2xl bg-amber-300 px-5 py-4 text-base font-black text-[#2a180d] shadow-lg transition hover:-translate-y-0.5"
                >
                  Create private HUG link
                </button>

                {privateHugLink ? (
                  <div className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4">
                    <p className="text-sm font-black text-emerald-100">
                      Private HUG link created:
                    </p>
                    <a
                      href={privateHugLink}
                      className="mt-2 block break-words text-sm font-bold text-amber-200 underline"
                    >
                      {privateHugLink}
                    </a>
                    <p className="mt-2 text-xs font-bold leading-5 text-amber-50/65">
                      Keep this link for them. Checkout still completes the order.
                    </p>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setTypedFeeling("");
                  setFocusTitle("Choose the feeling first");
                  setFocusBody("Pick the closest HUG intent. Then hear the matching HUG options before checkout.");
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
          ) : null}

          <div className="mt-6 rounded-2xl border border-amber-200/15 bg-black/20 p-4 text-center">
            <p className="text-sm font-bold leading-6 text-amber-50/70">
              A HUG uses a focused song recipientent. For full tracks, artists, and more music, visit{" "}
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

          <div className="mt-6 rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
              K-KUT Admin Support
            </p>
            <p className="mt-3 text-base font-bold leading-7 text-amber-50/80">
              Need help with an order, HUG link, audio playback, or delivery question?
              Email{" "}
              <a
                className="text-amber-300 underline underline-offset-4"
                href="mailto:reachus@gputnammusic.com?bcc=gputnam@gputnammusic.com&subject=K-KUT%20HUG%20Support"
              >
                reachus@gputnammusic.com
              </a>.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
