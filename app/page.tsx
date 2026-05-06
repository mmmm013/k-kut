"use client";

import { useEffect, useMemo, useState } from "react";

const ACTIVE_BOT = "gp-bot";
const WELCOME_KEY = "k-kut-gp-bot-founder-welcome-heard";
const MIN_KK_OPTIONS = 10;
const STRIPE_URL = "https://buy.stripe.com/14AeVcawC9QCaq04xg4ow0p";

type Purpose = {
  id: string;
  title: string;
  line: string;
};

type ChoiceType = {
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
  },
  {
    id: "gratitude",
    title: "Gratitude",
    line: "For thanks, appreciation, and honoring someone.",
  },
  {
    id: "hard-feelings",
    title: "Hard Feelings",
    line: "For apology, loss, hurt, truth, and repair.",
  },
  {
    id: "celebration",
    title: "Celebration",
    line: "For birthdays, anniversaries, milestones, and joy.",
  },
  {
    id: "comfort",
    title: "Comfort",
    line: "For care, support, healing, and presence.",
  },
];

const SONGS = {
  loveLikeThat: {
    id: "a-love-like-that",
    title: "A Love Like That",
    line: "For a warm, direct love message.",
    kk: [
      { id: "love-1", title: "Soft opening", line: "A gentle first feeling." },
      { id: "love-2", title: "Full-heart chorus", line: "The strongest love moment." },
      { id: "love-3", title: "Lasting close", line: "A tender ending to send." },
    ],
  },
  thankYou: {
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
  hurtLikeThis: {
    id: "hurt-like-this",
    title: "Hurt Like This",
    line: "For heartbreak, disappointment, and emotional injury.",
    kk: [
      { id: "hurt-1", title: "Quiet hurt", line: "A restrained emotional opening." },
      { id: "hurt-2", title: "Truth moment", line: "A direct feeling without over-explaining." },
      { id: "hurt-3", title: "Release", line: "A closing moment for letting go." },
    ],
  },
  changedYourMind: {
    id: "changed-your-mind",
    title: "Changed Your Mind",
    line: "For regret, distance, and unresolved emotion.",
    kk: [
      { id: "changed-1", title: "Question", line: "A searching first moment." },
      { id: "changed-2", title: "Realization", line: "The emotional center." },
      { id: "changed-3", title: "Aftermath", line: "A reflective ending." },
    ],
  },
  awesomeAnniversary: {
    id: "awesome-anniversary",
    title: "Awesome Anniversary",
    line: "For celebration with heart.",
    kk: [
      { id: "aa-1", title: "Bright start", line: "A joyful first lift." },
      { id: "aa-2", title: "Big chorus", line: "The celebration moment." },
      { id: "aa-3", title: "Warm finish", line: "A final smile." },
    ],
  },
  timeKeeps: {
    id: "time-keeps-on-moving",
    title: "Time Keeps On Movin’",
    line: "For encouragement and staying with someone.",
    kk: [
      { id: "tkom-1", title: "Steady opening", line: "A calm first message." },
      { id: "tkom-2", title: "Hold on", line: "A stronger support moment." },
      { id: "tkom-3", title: "Keep going", line: "A hopeful close." },
    ],
  },
} satisfies Record<string, Song>;

const CHOICE_TYPES: Record<string, ChoiceType[]> = {
  love: [
    { id: "romance", title: "Romance", line: "For love, attraction, and closeness.", songs: [SONGS.loveLikeThat] },
    { id: "devotion", title: "Devotion", line: "For lasting commitment and care.", songs: [SONGS.loveLikeThat] },
    { id: "missing-you", title: "Missing You", line: "For distance, longing, and return.", songs: [SONGS.loveLikeThat] },
    { id: "big-heart", title: "Big Heart", line: "For open, generous love.", songs: [SONGS.loveLikeThat] },
  ],
  gratitude: [
    { id: "thank-you", title: "Thank You", line: "For direct thanks.", songs: [SONGS.thankYou] },
    { id: "appreciation", title: "Appreciation", line: "For honoring what someone means.", songs: [SONGS.thankYou] },
    { id: "mothers-day", title: "Mother’s Day", line: "For mom, mother figures, and gratitude.", songs: [SONGS.thankYou] },
    { id: "tribute", title: "Tribute", line: "For respect, honor, and remembrance.", songs: [SONGS.thankYou] },
  ],
  "hard-feelings": [
    { id: "apology", title: "Apology", line: "For regret and repair.", songs: [SONGS.hurtLikeThis, SONGS.changedYourMind] },
    { id: "my-reality", title: "My Reality", line: "For reflection and telling the truth.", songs: [SONGS.changedYourMind, SONGS.hurtLikeThis] },
    { id: "pain-change", title: "Pain / Change", line: "For heartbreak, disappointment, and emotional injury.", songs: [SONGS.hurtLikeThis] },
    { id: "tears-memory", title: "Tears / Memory", line: "For grief, tears, and memories that still hurt.", songs: [SONGS.hurtLikeThis, SONGS.changedYourMind] },
    { id: "loss-ending", title: "Loss / Ending", line: "For endings, breakups, and release.", songs: [SONGS.changedYourMind, SONGS.hurtLikeThis] },
  ],
  celebration: [
    { id: "anniversary", title: "Anniversary", line: "For lasting love and milestones.", songs: [SONGS.awesomeAnniversary] },
    { id: "birthday", title: "Birthday", line: "For joy, thanks, and being remembered.", songs: [SONGS.awesomeAnniversary] },
    { id: "milestone", title: "Milestone", line: "For big life moments.", songs: [SONGS.awesomeAnniversary] },
    { id: "congratulations", title: "Congratulations", line: "For pride and celebration.", songs: [SONGS.awesomeAnniversary] },
  ],
  comfort: [
    { id: "support", title: "Support", line: "For standing beside someone.", songs: [SONGS.timeKeeps] },
    { id: "healing", title: "Healing", line: "For care during a hard moment.", songs: [SONGS.timeKeeps] },
    { id: "hope", title: "Hope", line: "For encouragement and forward motion.", songs: [SONGS.timeKeeps] },
    { id: "presence", title: "Presence", line: "For saying, I am here.", songs: [SONGS.timeKeeps] },
  ],
};

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
      title: optionNames[next - 1] ?? `K-KUT Option ${next}`,
      line: `A K-KUT moment for “${song.title}.”`,
    });
  }

  return base;
}

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


export default function Home() {
  const [screen, setScreen] = useState<"welcome" | "purpose" | "type" | "song" | "kk" | "confirm" | "buy">("welcome");
  const [purposeId, setPurposeId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [songId, setSongId] = useState("");
  const [kkId, setKkId] = useState("");
  const [hasHeardWelcome, setHasHeardWelcome] = useState(false);

  useEffect(() => {
    setHasHeardWelcome(window.localStorage.getItem(WELCOME_KEY) === "yes");
  }, []);

  const purpose = useMemo(
    () => PURPOSES.find((item) => item.id === purposeId) ?? null,
    [purposeId]
  );

  const typeChoices = useMemo(
    () => (purpose ? CHOICE_TYPES[purpose.id] ?? [] : []),
    [purpose]
  );

  const choiceType = useMemo(
    () => typeChoices.find((item) => item.id === typeId) ?? null,
    [typeChoices, typeId]
  );

  const song = useMemo(
    () => choiceType?.songs.find((item) => item.id === songId) ?? null,
    [choiceType, songId]
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
    stopAllAudio();
    setPurposeId(nextPurpose.id);
    setTypeId("");
    setSongId("");
    setKkId("");
    setScreen("type");
  }

  function chooseType(nextType: ChoiceType) {
    stopAllAudio();
    setTypeId(nextType.id);
    setSongId("");
    setKkId("");
    setScreen("song");
  }

  function chooseSong(nextSong: Song) {
    stopAllAudio();
    setSongId(nextSong.id);
    setKkId("");
    setScreen("kk");
  }

  function chooseKK(nextKK: KKOption) {
    stopAllAudio();
    setKkId(nextKK.id);
    setScreen("confirm");
  }

  function playKK(nextKK: KKOption) {
    if (!nextKK.audio) {
      stopAllAudio();
      return;
    }

    playOneAudio(nextKK.audio);
  }

  function goBack() {
    stopAllAudio();

    if (screen === "buy") setScreen("confirm");
    else if (screen === "confirm") setScreen("kk");
    else if (screen === "kk") setScreen("song");
    else if (screen === "song") setScreen("type");
    else if (screen === "type") setScreen("purpose");
    else if (screen === "purpose") setScreen("welcome");
  }

  const label =
    screen === "welcome"
      ? "Welcome"
      : screen === "purpose"
        ? "Pick what this is for"
        : screen === "type"
          ? "Refine the choice"
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
                One step at a time
              </p>

              <h2 className="mt-3 text-3xl font-black leading-tight">
                I’ll guide you through one clear step at a time. A HUG is a digital audio card that sends feeling through music.
              </h2>

              <p className="mt-5 rounded-2xl bg-black/25 p-4 text-base font-bold leading-7 text-amber-50/80">
                Mother’s Day is the live HUG checkout today. Other guided paths help you explore and refine what you want.
              </p>

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
                I understand — start
              </button>

              <a
                href="/hug/mothers-day"
                className="mt-4 block w-full rounded-2xl border border-amber-300 bg-[#f6c453] px-8 py-5 text-center text-xl font-black text-[#2a180d] shadow-lg transition hover:bg-amber-200"
              >
                Buy live Mother’s Day HUG now
              </a>
            </div>
          )}

          {screen === "purpose" && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                One question
              </p>
              <h2 className="mt-3 text-4xl font-black">Let’s start broad. Choose what this HUG is for.</h2>

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

          {screen === "type" && purpose && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                {purpose.title}
              </p>
              <h2 className="mt-3 text-4xl font-black">Choose the smaller type.</h2>
              <p className="mt-4 text-lg font-bold leading-8 text-amber-50/80">
                This narrows the choices before you pick a song.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {typeChoices.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseType(item)}
                    className="rounded-2xl border border-amber-300/25 bg-black/20 p-5 text-left transition hover:bg-amber-300 hover:text-[#2a180d]"
                  >
                    <span className="text-xl font-black">{item.title}</span>
                    <span className="mt-2 block text-sm font-bold opacity-80">{item.line}</span>
                  </button>
                ))}
              </div>

              <button type="button" onClick={goBack} className="mt-6 rounded-2xl border border-amber-200/25 px-6 py-4 font-black">
                Back
              </button>
            </div>
          )}

          {screen === "song" && purpose && choiceType && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                {purpose.title} · {choiceType.title}
              </p>
              <h2 className="mt-3 text-4xl font-black">Now pick a fitting song.</h2>
              <p className="mt-4 text-lg font-bold leading-8 text-amber-50/80">
                Choose the song that fits this message best.
              </p>

              <div className="mt-6 grid gap-3">
                {choiceType.songs.map((item) => (
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

          {screen === "kk" && purpose && choiceType && song && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                {choiceType.title} · {song.title}
              </p>
              <h2 className="mt-3 text-4xl font-black">Now choose your K-KUT moment.</h2>
              <p className="mt-4 text-lg font-bold leading-8 text-amber-50/80">
                Listen to the options below. Choose the one that feels right.
              </p>
              <p className="mt-3 text-base font-bold leading-7 text-amber-50/65">
                Song: {song.title} · Feeling: {purpose.title} · Type: {choiceType.title}
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
                      {item.audio ? (
                        <button
                          type="button"
                          onClick={() => playKK(item)}
                          className="rounded-xl bg-black/40 px-5 py-3 font-black text-amber-100"
                        >
                          Play
                        </button>
                      ) : (
                        <p className="rounded-xl border border-amber-300/20 bg-black/20 px-5 py-3 text-center text-sm font-black text-amber-100/70">
                          Preview loading
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => chooseKK(item)}
                        className="rounded-xl bg-amber-300 px-5 py-3 font-black text-[#2a180d]"
                      >
                        Choose this one
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

          {screen === "confirm" && purpose && choiceType && song && kk && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Confirm
              </p>
              <h2 className="mt-3 text-4xl font-black">Review your HUG. Is this the one?</h2>

              <div className="mt-6 rounded-2xl bg-amber-300 p-5 text-[#2a180d]">
                <p className="font-black">Purpose: {purpose.title}</p>
                <p className="mt-2 font-black">Type: {choiceType.title}</p>
                <p className="mt-2 text-3xl font-black">Song: {song.title}</p>
                <p className="mt-2 text-xl font-black">K-KUT moment: {kk.title}</p>
                <p className="mt-2 text-base font-bold">{kk.line}</p>
              </div>

              <p className="mt-5 text-lg font-bold leading-8 text-amber-50/80">
                This order includes one selected HUG.
              </p>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() => {
                    stopAllAudio();
                    setScreen("buy");
                  }}
                  className="rounded-2xl bg-amber-300 px-8 py-6 text-2xl font-black text-[#2a180d]"
                >
                  Continue to checkout
                </button>

                <button type="button" onClick={goBack} className="rounded-2xl border border-amber-200/25 px-6 py-4 font-black">
                  Hear options again
                </button>
              </div>
            </div>
          )}

          {screen === "buy" && purpose && choiceType && song && kk && (
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Checkout
              </p>
              <h2 className="mt-3 text-4xl font-black">Final step. Buy this HUG.</h2>
              <p className="mt-4 text-lg font-bold leading-8 text-amber-50/80">
                You selected one purpose, one feeling type, one song, and one K-KUT moment.
              </p>
              <p className="mt-3 text-lg font-bold leading-8 text-amber-50/80">
                After checkout, G Putnam Music prepares your playable HUG link.
              </p>

              <a
                href={STRIPE_URL}
                className="mt-6 block rounded-2xl bg-amber-300 px-8 py-6 text-center text-2xl font-black text-[#2a180d]"
              >
                Continue to checkout
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
