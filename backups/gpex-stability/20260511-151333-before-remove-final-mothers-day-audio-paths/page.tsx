"use client";

const HUG_SAMPLE_KUTS = [
  {
    kind: "Chorus KUT",
    label: "Hear a chorus-sized HUG sample.",
    audio: "/hug/samples/chorus-kut-sample.mp3",
  },
  {
    kind: "Verse KUT",
    label: "Hear a verse-sized HUG sample.",
    audio: "/hug/samples/verse-kut-sample.mp3",
  },
  {
    kind: "Bridge KUT",
    label: "Hear a bridge-style HUG sample.",
    audio: "/hug/samples/bridge-kut-sample.mp3",
  },
  {
    kind: "Hook KUT",
    label: "Hear a hook-style HUG sample.",
    audio: "/hug/samples/hook-kut-sample.mp3",
  },
  {
    kind: "Phrase KUT",
    label: "Hear a phrase-sized HUG sample.",
    audio: "/hug/samples/phrase-kut-sample.mp3",
  },
  {
    kind: "Word KUT",
    label: "Hear a word-sized HUG sample.",
    audio: "/hug/samples/word-kut-sample.mp3",
  },
  {
    kind: "Exclamation KUT",
    label: "Hear an expressive HUG sample.",
    audio: "/hug/samples/exclamation-kut-sample.mp3",
  },
  {
    kind: "Singer Moment KUT",
    label: "Hear a singer-moment HUG sample.",
    audio: "/hug/samples/singer-moment-kut-sample.mp3",
  },
] as const;



const KUT_OPTION_TYPES = [
  "Chorus",
  "Verse",
  "Bridge",
  "Hook",
  "Phrase",
  "Word",
  "Exclamation",
  "Singer laugh",
];



import Link from "next/link";
import { AssuranceLink, AssurancePermissionBlock } from "@/components/gpex/AssuranceLink";
import { useEffect, useMemo, useState } from "react";

type Stage =
  | "splash"
  | "cover"
  | "step1"
  | "step2"
  | "step3"
  | "recap"
  | "options"
  | "backcover";

const STAGES: Stage[] = ["splash", "cover", "step1", "step2", "step3", "recap", "options", "backcover"];

// PUBLIC BUYER RULE:
 // /hug is buyer-facing.
 // Visible guide identity = MC-BOT / BB-BOT / K-KUT BOT.
 // GP-BOT may power internal systems, but GP-BOT must not be the public buyer-facing character.
 // Splash/Cover must not fall back to short GP-BOT prompt audio, because this is the hook point.
const BOT_AUDIO: Record<Stage, string> = {
  splash: "/voices/gp-bot/hug-flow/01-splash-hook.m4a",
  cover: "/voices/gp-bot/hug-flow/02-cover-hook.m4a",
  step1: "/audio/kleigh/guide-final/07-choose-feel.m4a",
  step2: "/audio/kleigh/guide-final/24-press-play.m4a",
  step3: "/audio/kleigh/guide-final/03-best-hug.m4a",
  recap: "/audio/kleigh/guide-final/31-try-one-feeling.m4a",
  options: "/audio/kleigh/guide-final/22-one-hug-per-order.m4a",
  backcover: "/audio/kleigh/guide-final/28-start-hug.m4a",
};

const BOT_SCRIPTS: Record<Stage, string> = {
  splash:
    "Welcome to K-KUT HUG. This is a new way to send a feeling through real music and your own words. Not a card. Not a download. Not a playlist. A HUG is a private music moment chosen for someone, because sometimes words alone are not enough. K-KUT BOT walks this through one page at a time. First, choose the feeling. Then hear the HUG options. Then add your words and choose how to send it. After you send the first HUG, you may already know who needs the second. Press start, and K-KUT BOT begins.",
  cover:
    "Here is what makes this different. You are not just picking a song. You are choosing a feeling, hearing real music moments, and sending one as a private HUG. It can say thank you, I love you, I miss you, I’m sorry, I’m proud of you, or I’m here with you. This has not been shared like this before. The first HUG starts now. The second HUG can be for the same person, or for someone else who needs a moment too. Next is Step 1. Choose the feeling.",
  step1: "Step 1. Choose the feeling you want to send.",
  step2: "Step 2. Choose the HUG intent that feels closest.",
  step3: "Step 3. Add your words and delivery details.",
  recap: "Review complete. These are the steps you finished.",
  options: "Choose the delivery option: email, text-ready link, or DM/social link.",
  backcover: "Back cover. Your HUG is ready to move through the 4PE process.",
};

const FEELINGS = [
  { id: "thank-you", label: "Thank you", body: "For gratitude that needs more than plain words." },
  { id: "love", label: "Love", body: "For closeness, devotion, care, or a private emotional moment." },
  { id: "support", label: "Support", body: "For encouragement, comfort, strength, or being there from a distance." },
  { id: "repair", label: "Sorry / repair", body: "For apology, repair, longing, or a feeling that is hard to say directly." },
  { id: "miss-you", label: "I miss you", body: "For distance, memory, longing, or wanting someone to feel remembered." },
  { id: "proud", label: "I’m proud of you", body: "For recognition, celebration, belief, and emotional encouragement." },
];

const HUG_OPTIONS = [
  {
    id: "big-heart",
    label: "Big Heart HUG",
    body: "Warm, strong, and emotional.",
    audio: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-chorus.mp3",
  },
  {
    id: "gentle",
    label: "Gentle HUG",
    body: "Soft, close, and tender.",
    audio: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-opening.mp3",
  },
  {
    id: "peaceful",
    label: "Peaceful HUG",
    body: "Calm, reflective, and complete.",
    audio: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-outro.mp3",
  },
];

let activeAudio: HTMLAudioElement | null = null;

function stopAllAudio() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }

  document.querySelectorAll("audio").forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}

function playBot(src: string) {
  stopAllAudio();

  const audio = new Audio(src);
  activeAudio = audio;
  audio.volume = 0.95;
  audio.currentTime = 0;

  audio.play().catch(() => {
    console.log("BOT vocal blocked until user interaction:", src);
  });
}


function stageNumber(stage: Stage) {
  return STAGES.indexOf(stage) + 1;
}

function nextStage(stage: Stage): Stage {
  return STAGES[Math.min(STAGES.indexOf(stage) + 1, STAGES.length - 1)];
}

function prevStage(stage: Stage): Stage {
  return STAGES[Math.max(STAGES.indexOf(stage) - 1, 0)];
}

export default function HugPage() {
  const [stage, setStage] = useState<Stage>("splash");
  const [selectedFeeling, setSelectedFeeling] = useState(FEELINGS[0]);
  const [selectedHug, setSelectedHug] = useState(HUG_OPTIONS[0]);
  const [recipient, setRecipient] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [social, setSocial] = useState("");
  const [note, setNote] = useState(
    "I picked this K-KUT HUG for you because words alone did not feel like enough."
  );

  const botText = useMemo(() => {
    if (stage === "splash") return "Welcome to K-KUT HUG. This is new, emotional, BOT-led, and built around real music plus your own words.";
    if (stage === "cover") return "This has not been shared like this before. You are not just picking a song — you are sending a private HUG.";
    if (stage === "step1") return "Step 1. Choose the feeling you want to send.";
    if (stage === "step2") return "Step 2. Choose the HUG intent that feels closest.";
    if (stage === "step3") return "Step 3. Add your words and delivery details.";
    if (stage === "recap") return "Review complete. These are the steps you finished.";
    if (stage === "options") return "Choose the delivery option: email, text-ready link, or DM/social link.";
    return "Back cover. Your HUG is ready to move through the 4PE process.";
  }, [stage, selectedFeeling.label]);

  useEffect(() => {
    const src = BOT_AUDIO[stage];

    const timer = window.setTimeout(() => {
      playBot(src);
    }, 1000);

    const unlock = () => playBot(src);

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [stage]);


  function go(stageName: Stage) {
    stopAllAudio();
    setStage(stageName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function continueNext() {
    go(nextStage(stage));
  }

  function goBack() {
    go(prevStage(stage));
  }

  return (
    <main className="min-h-screen bg-[#140904] px-5 py-8 text-amber-50">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-amber-200/15 bg-[#2a1308] shadow-2xl">
        <header className="flex items-center justify-between border-b border-amber-200/10 bg-black/25 px-5 py-4">
          

          <div className="rounded-full bg-amber-300 px-4 py-2 text-sm font-black text-[#211004]">
            Page {stageNumber(stage)} of {STAGES.length}
          </div>
        </header>

        <section className="p-6 md:p-10">
          <section className="mb-8 rounded-3xl bg-amber-300 p-5 text-[#211004]">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.3em]">K-KUT BOT</p>
            <p className="text-xl font-black leading-snug">{botText}</p>
          </section>

          {stage === "splash" && (
            <Page title="K-KUT HUG" eyebrow="">
              <p className="max-w-2xl text-2xl font-black leading-snug text-amber-100">
                Send the right feeling through music and words.
              </p>
              <p className="mt-5 max-w-2xl text-lg font-bold text-amber-100/75">
                One page. One BOT vocal. One action. Then the next page opens.
              </p>
              <PrimaryButton onClick={continueNext}>Begin</PrimaryButton>
            </Page>
          )}

          {stage === "cover" && (
            <Page title="What can a HUG send?">
            <div className="rounded-2xl bg-amber-300 px-6 py-4 text-sm font-black leading-relaxed text-[#211004]">
              All HUG music options come from broadcast-ready, ASCAP-registered GPM tracks.
              A HUG can carry the part of a real performance that best matches the feeling.
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {HUG_SAMPLE_KUTS.map((sample, index) => (
                <div key={sample.lane} className="rounded-2xl border border-amber-200/15 bg-[#1f0d05] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">
                    {index === 6 ? "Short promo listen" : sample.lane}
                  </p>
                  <p className="mt-2 text-lg font-black text-amber-100">{sample.type}</p>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-amber-100/70">{sample.label}</p>
                  <audio controls preload="none" src={sample.audio} className="mt-4 w-full" />
                </div>
              ))}
            </div>

            <button
              onClick={nextStage}
              className="mt-8 rounded-2xl bg-amber-300 px-8 py-4 text-lg font-black text-[#211004]"
            >
              Continue
            </button>
          </Page>
          )}

          {stage === "step1" && (
            <Page title="Step 1 — Choose the feeling" eyebrow="Page 1 / Step 1">
              <section className="mb-5 rounded-3xl bg-amber-300 p-5 text-[#211004]">
                <p className="text-xs font-black uppercase tracking-[0.3em]">Permission promise</p>
                <p className="mt-3 text-lg font-black leading-snug">
                  We’ll use email or cell only for this HUG transaction. No spam. No hidden use.
                </p>
                <Link href="/gpex/assurance" className="mt-3 inline-block text-sm font-black underline underline-offset-4">
                  View GPEx Assurance
                </Link>
              </section>

              <AssurancePermissionBlock />

              <div className="grid gap-4 md:grid-cols-2">
                {FEELINGS.map((feeling) => (
                  <button
                    key={feeling.id}
                    type="button"
                    onClick={() => {
                      setSelectedFeeling(feeling);
                      go("step2");
                    }}
                    className="rounded-3xl border border-amber-200/15 bg-[#1f0d05] p-5 text-left transition hover:border-amber-300 hover:bg-[#2d1609]"
                  >
                    <p className="text-xl font-black text-amber-100">{feeling.label}</p>
                    <p className="mt-2 text-sm font-bold leading-relaxed text-amber-100/70">{feeling.body}</p>
                  </button>
                ))}
              </div>
            </Page>
          )}

          {stage === "step2" && (
            <Page title="Step 2 — Hear the HUG options" eyebrow="Page 2 / Step 2">
              <p className="mb-5 text-lg font-bold text-amber-100/75">
                Selected feeling: <span className="text-amber-200">{selectedFeeling.label}</span>
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                {HUG_OPTIONS.map((hug) => (
                  <article key={hug.id} className="rounded-3xl border border-amber-200/15 bg-[#1f0d05] p-5">
                    <p className="text-xl font-black text-amber-100">{hug.label}</p>
                    <p className="mt-2 min-h-12 text-sm font-bold leading-relaxed text-amber-100/70">{hug.body}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHug(hug);
                        go("step3");
                      }}
                      className="mt-4 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-black text-[#211004]"
                    >
                      Choose this HUG
                    </button>
                  </article>
                ))}
              </div>

              <button
                type="button"
                onClick={goBack}
                className="mt-5 rounded-2xl border border-amber-200/20 px-5 py-3 text-sm font-black text-amber-100"
              >
                Back to Step 1
              </button>
            </Page>
          )}

          {stage === "step3" && (
            <Page title="Step 3 — Add words and recipient details" eyebrow="Page 3 / Step 3">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Recipient name" value={recipient} onChange={setRecipient} placeholder="Who receives this HUG?" />
                <Input label="Email / login identity" value={email} onChange={setEmail} placeholder="recipient@email.com" />
                <Input label="Cell number" value={phone} onChange={setPhone} placeholder="Text-ready link now; SMS after approval" />
                <Input label="DM / social handle or page" value={social} onChange={setSocial} placeholder="@handle or profile link" />
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-black text-amber-200">Your note</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="mt-2 min-h-32 w-full rounded-2xl border border-amber-200/20 bg-white px-4 py-3 text-base font-bold text-[#211004] outline-none"
                />
              </label>

              <NavButtons onBack={goBack} onNext={continueNext} nextLabel="Review completed steps" />
            </Page>
          )}

          {stage === "recap" && (
            <Page title="Steps completed" eyebrow="Progress recap">
              <div className="grid gap-4 md:grid-cols-3">
                <RecapCard n="1" title="Feeling chosen" value={selectedFeeling.label} />
                <RecapCard n="2" title="HUG selected" value={selectedHug.label} />
                <RecapCard n="3" title="Words added" value={note ? "Ready" : "Needs note"} />
              </div>

              <div className="mt-8 rounded-3xl border border-amber-200/15 bg-[#1f0d05] p-6">
                <p className="text-6xl">🙂 ✅ → 🎵 ✅ → 💬 ✅ → 🎁</p>
                <p className="mt-4 text-lg font-black text-amber-100">
                  You chose the feeling, heard the options, added your words, and prepared the HUG.
                </p>
              </div>

              <NavButtons onBack={goBack} onNext={continueNext} nextLabel="Choose delivery option" />
            </Page>
          )}

          {stage === "options" && (
            <Page title="Buyer options" eyebrow="Delivery options">
              <div className="grid gap-4 md:grid-cols-3">
                <OptionCard title="Email" body="Use the email as the local login / delivery identity." />
                <OptionCard title="Text-ready link" body="Use the cell number now for a copyable link. Direct SMS follows carrier approval." />
                <OptionCard title="DM / social" body="Copy the private HUG link and send it through a social page, handle, or DM." />
              </div>

              <button
                type="button"
                onClick={continueNext}
                className="mt-6 rounded-2xl bg-amber-300 px-6 py-4 text-base font-black text-[#211004]"
              >
                Finish HUG path
              </button>

              <button
                type="button"
                onClick={goBack}
                className="ml-0 mt-3 rounded-2xl border border-amber-200/20 px-6 py-4 text-base font-black text-amber-100 md:ml-3"
              >
                Back
              </button>
            </Page>
          )}

          {stage === "backcover" && (
            <Page title="4PE finish" eyebrow="Back cover / Oven slide">
              <div className="rounded-[2rem] border border-amber-200/15 bg-[#1f0d05] p-8">
                <p className="text-7xl">🥣 → 🔥 → 🍞</p>
                <h2 className="mt-6 text-3xl font-black text-amber-100">Review complete.</h2>
                <p className="mt-4 max-w-2xl text-lg font-bold leading-relaxed text-amber-100/75">
                  The feeling went into the 4PE process. The HUG came out as a usable private music-and-words delivery.
                </p>
                <p className="mt-4 text-xl font-black text-amber-200">Calm the process; calm the results.</p>
              </div>

              <button
                type="button"
                onClick={() => go("splash")}
                className="mt-6 rounded-2xl bg-amber-300 px-6 py-4 text-base font-black text-[#211004]"
              >
                Start another HUG
              </button>
            </Page>
          )}
        </section>
        <footer className="mt-8 flex flex-wrap gap-4 text-xs font-black text-amber-100/60">
          <a className="underline underline-offset-4" href="/gpex/assurance">GPEx Assurance</a>
          <a className="underline underline-offset-4" href="/privacy">Privacy</a>
          <a className="underline underline-offset-4" href="/terms">Terms</a>
        </footer>
      </section>
    </main>
  );
}

function Page({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-amber-200/15 bg-[#351a0b] p-6 md:p-8">
      <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-300">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">{title}</h1>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="mt-8 rounded-2xl bg-amber-300 px-7 py-4 text-lg font-black text-[#211004]">
      {children}
    </button>
  );
}

function NavButtons({ onBack, onNext, nextLabel }: { onBack: () => void; onNext: () => void; nextLabel: string }) {
  return (
    <div className="mt-8 flex flex-col gap-3 md:flex-row">
      <button type="button" onClick={onBack} className="rounded-2xl border border-amber-200/20 px-6 py-4 text-base font-black text-amber-100">
        Back
      </button>
      <button type="button" onClick={onNext} className="rounded-2xl bg-amber-300 px-6 py-4 text-base font-black text-[#211004]">
        {nextLabel}
      </button>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-amber-200">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-amber-200/20 bg-white px-4 py-3 text-base font-bold text-[#211004] outline-none"
      />
    </label>
  );
}

function RecapCard({ n, title, value }: { n: string; title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-amber-200/15 bg-[#1f0d05] p-5">
      <p className="text-4xl font-black text-amber-300">✓ {n}</p>
      <p className="mt-3 text-xl font-black text-amber-100">{title}</p>
      <p className="mt-2 text-sm font-bold text-amber-100/70">{value}</p>
    </div>
  );
}

function OptionCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-amber-200/15 bg-[#1f0d05] p-5">
      <p className="text-xl font-black text-amber-100">{title}</p>
      <p className="mt-2 text-sm font-bold leading-relaxed text-amber-100/70">{body}</p>
    </div>
  );
}
