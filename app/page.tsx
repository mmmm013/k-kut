"use client";

import { useEffect, useMemo, useState } from "react";

const ACTIVE_BOT = "gp-bot";
const WELCOME_KEY = "k-kut-gp-bot-founder-welcome-heard";
const MIN_KK_OPTIONS = 10;

type Purpose = {
  id: string;
  title: string;
  line: string;
  songs: Song[];
};

type Song = {
  id: string;
  title: string;
  line: string;
  kk: KKOption[];
};

type KKOption = {
  id: string;
  title: string;
  line: string;
  audio?: string;
};

const PURPOSES: Purpose[] = [
  {
    id: "love",
    title: "Love",
    line: "For romance, devotion, and heart-forward messages.",
    songs: [
      {
        id: "a-love-like-that",
        title: "A Love Like That",
        line: "For a warm, direct love message.",
        kk: [
          {
            id: "love-1",
            title: "Soft opening",
            line: "A gentle first feeling.",
          },
          {
            id: "love-2",
            title: "Full-heart chorus",
            line: "The strongest love moment.",
          },
          {
            id: "love-3",
            title: "Lasting close",
            line: "A tender ending to send.",
          },
        ],
      },
    ],
  },
  {
    id: "gratitude",
    title: "Gratitude",
    line: "For thanks, appreciation, and honoring someone.",
    songs: [
      {
        id: "thank-you",
        title: "Thank You",
        line: "For appreciation that needs to feel real.",
        kk: [
          {
            id: "thanks-1",
            title: "Opening thanks",
            line: "A clear first thank-you.",
            audio: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-opening.mp3",
          },
          {
            id: "thanks-2",
            title: "Chorus thanks",
            line: "The biggest emotional lift.",
            audio: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-chorus.mp3",
          },
          {
            id: "thanks-3",
            title: "Closing thanks",
            line: "A softer final feeling.",
            audio: "/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-outro.mp3",
          },
        ],
      },
    ],
  },
  {
    id: "hard-feelings",
    title: "Hard Feelings",
    line: "For apology, loss, hurt, truth, and repair.",
    songs: [
      {
        id: "hurt-like-this",
        title: "Hurt Like This",
        line: "For heartbreak, disappointment, and emotional injury.",
        kk: [
          {
            id: "hurt-1",
            title: "Quiet hurt",
            line: "A restrained emotional opening.",
          },
          {
            id: "hurt-2",
            title: "Truth moment",
            line: "A direct feeling without over-explaining.",
          },
          {
            id: "hurt-3",
            title: "Release",
            line: "A closing moment for letting go.",
          },
        ],
      },
      {
        id: "changed-your-mind",
        title: "Changed Your Mind",
        line: "For regret, distance, and unresolved emotion.",
        kk: [
          {
            id: "changed-1",
            title: "Question",
            line: "A searching first moment.",
          },
          {
            id: "changed-2",
            title: "Realization",
            line: "The emotional center.",
          },
          {
            id: "changed-3",
            title: "Aftermath",
            line: "A reflective ending.",
          },
        ],
      },
    ],
  },
  {
    id: "celebration",
    title: "Celebration",
    line: "For birthdays, anniversaries, milestones, and joy.",
    songs: [
      {
        id: "awesome-anniversary",
        title: "Awesome Anniversary",
        line: "For celebration with heart.",
        kk: [
          {
            id: "aa-1",
            title: "Bright start",
            line: "A joyful first lift.",
          },
          {
            id: "aa-2",
            title: "Big chorus",
            line: "The celebration moment.",
          },
          {
            id: "aa-3",
            title: "Warm finish",
            line: "A final smile.",
          },
        ],
      },
    ],
  },
  {
    id: "comfort",
    title: "Comfort",
    line: "For care, support, healing, and presence.",
    songs: [
      {
        id: "time-keeps-on-moving",
        title: "Time Keeps On Movin’",
        line: "For encouragement and staying with someone.",
        kk: [
          {
            id: "tkom-1",
            title: "Steady opening",
            line: "A calm first message.",
          },
          {
            id: "tkom-2",
            title: "Hold on",
            line: "A stronger support moment.",
          },
          {
            id: "tkom-3",
            title: "Keep going",
            line: "A hopeful close.",
          },
        ],
      },
    ],
  },
];

function buildKKOptions(song: Song): KKOption[] {
  const base = [...song.kk];

  const optionNames = [
    "Opening feeling",
    "Soft lift",
    "Clear message",
    "Heart moment",
    "Strongest hook",
    "Gentle turn",
    "Deep feeling",
    "Warm close",
    "Lasting echo",
    "Best send",
  ];

  while (base.length < MIN_KK_OPTIONS) {
    const next = base.length + 1;
    base.push({
      id: `${song.id}-kk-${next}`,
      title: optionNames[next - 1] ?? `KK Option ${next}`,
      line: `A prepared K-KUT option for “${song.title}.”`,
    });
  }

  return base.slice(0, Math.max(MIN_KK_OPTIONS, base.length));
}

function stopAllAudio() {
  if (typeof document === "undefined") return;

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
  audio.volume = 0.95;

  const stopHandler = () => {
    audio.pause();
    audio.currentTime = 0;
  };

  window.addEventListener("k-kut-stop-audio", stopHandler, { once: true });

  audio.currentTime = 0;
  audio.play().catch(() => {
    console.log("Audio blocked until user taps:", src);
  });
}

export default function Home() {
  const [screen, setScreen] = useState<"welcome" | "purpose" | "song" | "kk" | "confirm" | "buy">("welcome");
  const [purposeId, setPurposeId] = useState<string>("");
  const [songId, setSongId] = useState<string>("");
  const [kkId, setKkId] = useState<string>("");
  const [hasHeardWelcome, setHasHeardWelcome] = useState(false);

  useEffect(() => {
    setHasHeardWelcome(window.localStorage.getItem(WELCOME_KEY) === "yes");
  }, []);

  const purpose = useMemo(
    () => PURPOSES.find((item) => item.id === purposeId) ?? null,
    [purposeId]
  );

  const song = useMemo(
    () => purpose?.songs.find((item) => item.id === songId) ?? null,
    [purpose, songId]
  );

  const kkOptions = useMemo(
    () => (song ? buildKKOptions(song) : []),
    [song]
  );

  const kk = useMemo(
    () => kkOptions.find((item) => item.id === kkId) ?? null,
    [kkOptions, kkId]
  );

  function playBotVoice(clip: string = "welcome") {
    if (clip === "welcome" && typeof window !== "undefined") {
      window.localStorage.setItem(WELCOME_KEY, "yes");
      setHasHeardWelcome(true);
    }

    playOneAudio(`/voices/${ACTIVE_BOT}/prompts/${clip}.m4a`);
  }

  function startFlow() {
    setScreen("purpose");
    playBotVoice("pick-kind");
  }

  function choosePurpose(nextPurpose: Purpose) {
    setPurposeId(nextPurpose.id);
    setSongId("");
    setKkId("");
    setScreen("song");
    playBotVoice("pick-song");
  }

  function chooseSong(nextSong: Song) {
    setSongId(nextSong.id);
    setKkId("");
    stopAllAudio();
    setScreen("kk");
  }

  function chooseKK(nextKK: KKOption) {
    setKkId(nextKK.id);
    stopAllAudio();
    setScreen("confirm");
  }

  function playKK(nextKK: KKOption) {
    if (nextKK.audio) {
      playOneAudio(nextKK.audio);
      return;
    }

    stopAllAudio();
  }

  function goBack() {
    stopAllAudio();

    if (screen === "buy") setScreen("confirm");
    else if (screen === "confirm") setScreen("kk");
    else if (screen === "kk") setScreen("song");
    else if (screen === "song") setScreen("purpose");
    else if (screen === "purpose") setScreen("welcome");
  }

  const label =
    screen === "welcome"
      ? "Welcome"
      : screen === "purpose"
        ? "Pick what this is for"
        : screen === "song"
          ? "Pick a song"
          : screen === "kk"
            ? "Choose a KK option"
            : screen === "confirm"
              ? "Confirm"
              : "Buy / send";

  return (
    <main className="min-h-screen bg-[#2a1207] px-5 py-6 text-amber-50 sm:px-8">
      <section className="mx-auto max-w-3xl">
        <a href="/hug/mothers-day" className="text-sm font-bold text-amber-200 underline underline-offset-4">
          I don’t understand — show me the demo
        </a>

        <header className="mt-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            K-KUT HUG
          </p>
          <h1 className="mt-3 text-5xl font-black leading-tight sm:text-6xl">
            Send a historic audio greeting card.
          </h1>
          <p className="mt-4 text-xl font-bold leading-8 text-amber-50/75">
            {label}
          </p>
        </header>

        <section className="mt-8 rounded-[2rem] border border-amber-300/25 bg-[#3a1f0f] p-6 shadow-2xl sm:p-8">
          {screen === "welcome" && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Please read below first
              </p>

              <h2 className="mt-3 text-3xl font-black leading-tight">
                A HUG is a digital audio card that sends feeling through music.
              </h2>

              <div className="mt-6 grid gap-3 text-lg font-bold leading-8 text-amber-50/90">
                <p>♪ A HUG is an audio greeting card.</p>
                <p>♬ A HUG sends feeling through music.</p>
                <p>♫ A HUG can be sent by text, DM, social link, or email.</p>
              </div>

              <button
                type="button"
                onClick={() => playBotVoice("welcome")}
                className="mt-6 rounded-2xl bg-black/40 px-6 py-4 text-base font-black text-amber-100 transition hover:bg-black/60"
              >
                {hasHeardWelcome ? "Replay Founder Welcome" : "Play Founder Welcome"}
              </button>

              <button
                type="button"
                onClick={startFlow}
                className="mt-6 w-full rounded-2xl bg-amber-300 px-8 py-6 text-2xl font-black text-[#2a180d] shadow-lg transition hover:bg-amber-200"
              >
                I understand — pick what this is for
              </button>
            </div>
          )}

          {screen === "purpose" && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                One question
              </p>
              <h2 className="mt-3 text-4xl font-black">What is this HUG for?</h2>

              <div className="mt-6 grid gap-3">
                {PURPOSES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => choosePurpose(item)}
                    className="rounded-2xl border border-amber-300/25 bg-black/20 p-5 text-left transition hover:bg-amber-300 hover:text-[#2a180d]"
                  >
                    <span className="text-2xl font-black">{item.title}</span>
                    <span className="mt-2 block text-base font-bold opacity-80">{item.line}</span>
                  </button>
                ))}
              </div>

              <button type="button" onClick={goBack} className="mt-6 rounded-2xl border border-amber-200/25 px-6 py-4 font-black">
                Back
              </button>
            </div>
          )}

          {screen === "song" && purpose && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                {purpose.title}
              </p>
              <h2 className="mt-3 text-4xl font-black">Pick a song.</h2>

              <div className="mt-6 grid gap-3">
                {purpose.songs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseSong(item)}
                    className="rounded-2xl border border-amber-300/25 bg-black/20 p-5 text-left transition hover:bg-amber-300 hover:text-[#2a180d]"
                  >
                    <span className="text-2xl font-black">{item.title}</span>
                    <span className="mt-2 block text-base font-bold opacity-80">{item.line}</span>
                  </button>
                ))}
              </div>

              <button type="button" onClick={goBack} className="mt-6 rounded-2xl border border-amber-200/25 px-6 py-4 font-black">
                Back
              </button>
            </div>
          )}

          {screen === "kk" && song && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                {song.title}
              </p>
              <h2 className="mt-3 text-4xl font-black">Choose your K-KUT moment.</h2>
              <p className="mt-4 text-lg font-bold leading-8 text-amber-50/80">
                Listen to the options below and choose the one that feels right.
              </p>
              <p className="mt-3 text-base font-bold leading-7 text-amber-50/65">
                Song: {song.title}
                {purpose ? ` · Feeling: ${purpose.title}` : ""}
              </p>

              <div className="mt-6 grid gap-3">
                {kkOptions.map((item, index) => (
                  <div key={item.id} className="rounded-2xl border border-amber-300/25 bg-black/20 p-5">
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
                      K-KUT Option {index + 1}
                    </p>
                    <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
                    <p className="mt-2 text-base font-bold text-amber-50/75">{item.line}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => playKK(item)}
                        className="rounded-xl bg-black/40 px-5 py-3 font-black text-amber-100"
                      >
                        Play option
                      </button>

                      <button
                        type="button"
                        onClick={() => chooseKK(item)}
                        className="rounded-xl bg-amber-300 px-5 py-3 font-black text-[#2a180d]"
                      >
                        Choose this HUG
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={goBack} className="mt-6 rounded-2xl border border-amber-200/25 px-6 py-4 font-black">
                Back
              </button>
            </div>
          )}

          {screen === "confirm" && purpose && song && kk && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Confirm
              </p>
              <h2 className="mt-3 text-4xl font-black">Is this the one?</h2>

              <div className="mt-6 rounded-2xl bg-amber-300 p-5 text-[#2a180d]">
                <p className="font-black">{purpose.title}</p>
                <p className="mt-2 text-3xl font-black">{song.title}</p>
                <p className="mt-2 text-xl font-black">{kk.title}</p>
                <p className="mt-2 text-base font-bold">{kk.line}</p>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playBotVoice("checkout");
                    setScreen("buy");
                  }}
                  className="rounded-2xl bg-amber-300 px-8 py-6 text-2xl font-black text-[#2a180d]"
                >
                  Continue to buy / send
                </button>

                <button type="button" onClick={goBack} className="rounded-2xl border border-amber-200/25 px-6 py-4 font-black">
                  Hear options again
                </button>
              </div>
            </div>
          )}

          {screen === "buy" && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Buy / send
              </p>
              <h2 className="mt-3 text-4xl font-black">Checkout is the final step.</h2>
              <p className="mt-4 text-lg font-bold leading-8 text-amber-50/80">
                After checkout, G Putnam Music prepares your playable HUG link. SMS updates are not promised until Twilio approval is complete.
              </p>

              <a
                href="/hug/mothers-day"
                className="mt-6 block rounded-2xl bg-amber-300 px-8 py-6 text-center text-2xl font-black text-[#2a180d]"
              >
                Continue to live Mother’s Day checkout
              </a>

              <button type="button" onClick={goBack} className="mt-4 rounded-2xl border border-amber-200/25 px-6 py-4 font-black">
                Back
              </button>
            </div>
          )}
        </section>

        <footer className="mt-6 rounded-2xl border border-amber-300 bg-amber-300 p-4 text-center text-[#2a180d]">
          <p className="text-sm font-bold leading-6 text-[#2a180d]/80">
            A HUG uses a focused song moment. For full tracks, artists, and more music, visit{" "}
            <a
              href="https://www.gputnammusic.com"
              target="_blank"
              rel="noreferrer"
              className="font-black text-[#2a180d] underline underline-offset-4"
            >
              G Putnam Music
            </a>.
          </p>
        </footer>
      </section>
    </main>
  );
}
