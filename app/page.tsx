"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const ACTIVE_BOT = "gp-bot";

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


const families = [
  {
    id: "special-days",
    title: "Special Days",
    description: "Mother’s Day, Wedding, Anniversary, and Birthday.",
  },
  {
    id: "hard-feelings",
    title: "Hard Feelings",
    description: "Sorry, Reflection, Hurt, Cry, and Sorrow / Break Up.",
  },
  {
    id: "love-connection",
    title: "Love & Connection",
    description: "Romance and love-centered HUG paths.",
  },
  {
    id: "strength-hope",
    title: "Strength & Hope",
    description: "Hope, Self Esteem, Hang Tough, and Pride.",
  },
] as const;

const categories = [
  {
    slug: "mothers-day",
    family: "special-days",
    title: "Mother’s Day",
    theme: "Thank You",
    description: "For thanking Mom with a real audio HUG.",
    songs: ["Thank You"],
    liveHref: "/hug/mothers-day",
  },
  {
    slug: "wedding",
    family: "special-days",
    title: "Wedding",
    theme: "Forever & a Day",
    description: "For vows, forever, commitment, and celebration.",
    songs: ["Forever & a Day"],
  },
  {
    slug: "anniversary",
    family: "special-days",
    title: "Anniversary",
    theme: "Awesome Anniversary",
    description: "For celebrating years, loyalty, and love that lasted.",
    songs: ["Awesome Anniversary"],
  },
  {
    slug: "birthday",
    family: "special-days",
    title: "Birthday",
    theme: "Best Birthday",
    description: "For a personal birthday audio greeting.",
    songs: ["Best Birthday"],
  },
  {
    slug: "sorry",
    family: "hard-feelings",
    title: "Sorry",
    theme: "Apology",
    description: "For apology, regret, and trying to reconnect.",
    songs: ["I’m Sorry", "Come Back"],
  },
  {
    slug: "reflection",
    family: "hard-feelings",
    title: "Reflection",
    theme: "My Reality",
    description: "For looking inward and telling the truth.",
    songs: ["My Reality"],
  },
  {
    slug: "hurt",
    family: "hard-feelings",
    title: "Hurt",
    theme: "Pain / Change",
    description: "For heartbreak, disappointment, and emotional injury.",
    songs: ["Hurt Like This", "Changed Your Mind"],
  },
  {
    slug: "cry",
    family: "hard-feelings",
    title: "Cry",
    theme: "Tears / Memory",
    description: "For grief, tears, and memories that still hurt.",
    songs: ["Over Yesterday", "Torn Memories"],
  },
  {
    slug: "sorrow-breakup",
    family: "hard-feelings",
    title: "Sorrow / Break Up",
    theme: "Loss / Ending",
    description: "For endings, breakups, and emotional release.",
    songs: ["Baby We’re Through", "Last Time", "World of Words", "The New Sunset", "Life New"],
  },
  {
    slug: "romance",
    family: "love-connection",
    title: "Romance",
    theme: "Love Songs",
    description: "For falling in love, staying in love, and saying it clearly.",
    songs: [
      "Me in Love",
      "A Love Like That",
      "This Time It’s Love",
      "Curious Thing",
      "More Than a Feeling",
      "To Love Me",
      "Heartwave",
      "I Do Swear",
    ],
  },
  {
    slug: "hope",
    family: "strength-hope",
    title: "Hope",
    theme: "Believe / Keep Going",
    description: "For encouragement, faith, grit, and tomorrow.",
    songs: ["Believe It", "Bein’ Her Man", "Me n’ My Guitar"],
  },
  {
    slug: "self-esteem",
    family: "strength-hope",
    title: "Self Esteem",
    theme: "Worth / Fighter",
    description: "For confidence, courage, and personal strength.",
    songs: ["Comin’ True", "I Am a Fighter", "No Mystery", "Til I’m Dyin’ I’m Tryin’"],
  },
  {
    slug: "hang-tough",
    family: "strength-hope",
    title: "Hang Tough",
    theme: "Support / Endurance",
    description: "For someone who needs to keep standing.",
    songs: ["Hang On", "Tough People Do", "Imagine If", "Now, That’s Tough", "My Rock", "By Your Side"],
  },
  {
    slug: "pride",
    family: "strength-hope",
    title: "Pride",
    theme: "Identity / Renewal",
    description: "For pride, renewal, and standing tall.",
    songs: ["Hearts Like Mine", "Life New", "Love Renews", "Better Watch Out"],
  },
] as const;

type Step = 1 | 2 | 3 | 4;
type Family = (typeof families)[number];
type Category = (typeof categories)[number];

const stepLabels = [
  { step: 1, label: "Learn" },
  { step: 2, label: "Pick a HUG kind" },
  { step: 3, label: "Pick a song" },
  { step: 4, label: "Start the HUG" },
] as const;

export default function HomePage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("special-days");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("mothers-day");
  const [selectedSong, setSelectedSong] = useState<string>("Thank You");
  const [lastAction, setLastAction] = useState<string>(
    "Look below. Read Step 1. Then tap I understand — pick what this is for."
  );
  const [comingSoonNotice, setComingSoonNotice] = useState<string | null>(null);
const selectedFamily = useMemo<Family>(() => {
    return families.find((item) => item.id === selectedFamilyId) ?? families[0];
  }, [selectedFamilyId]);

  const familyCategories = useMemo<Category[]>(() => {
    return categories.filter((item) => item.family === selectedFamilyId);
  }, [selectedFamilyId]);

  const selectedCategory = useMemo<Category>(() => {
    return categories.find((item) => item.slug === selectedCategorySlug) ?? categories[0];
  }, [selectedCategorySlug]);

  const botMessage = useMemo(() => {
    if (step === 1) {
      return "Welcome. I’ll help you choose a HUG. Please read below first.";
    }

    if (step === 2) {
      return "Now pick the kind of message you want to send.";
    }

    if (step === 3) {
      return `You picked ${selectedCategory.title}. Now pick a song.`;
    }

    if (selectedCategory.liveHref) {
      return `You picked ${selectedSong}. This HUG is live. Start the HUG.`;
    }

    return `${selectedCategory.title} is coming soon. Try Mother’s Day to buy today.`;
  }, [step, selectedCategory, selectedSong]);

  function playBotVoice(clip: string = "welcome") {
    playOneAudio(`/voices/${ACTIVE_BOT}/prompts/${clip}.m4a`);
  }
  function chooseFamily(family: Family) {
    setSelectedFamilyId(family.id);

    const nextCategories = categories.filter((item) => item.family === family.id);
    const firstCategory = nextCategories[0];

    if (firstCategory) {
      setSelectedCategorySlug(firstCategory.slug);
      setSelectedSong(firstCategory.songs[0] ?? "");
    }

    playBotVoice("pick-kind");
    setLastAction(`You picked ${family.title}. Next: pick one HUG.`);
    setStep(3);
  }

  function chooseCategory(category: Category) {
    setSelectedCategorySlug(category.slug);
    setSelectedSong(category.songs[0] ?? "");
    playBotVoice(category.liveHref ? "live" : "coming-soon");

    if (!category.liveHref) {
      setComingSoonNotice(`${category.title} is coming soon. Try Mother’s Day to buy today.`);
    }

    setLastAction(
      category.liveHref
        ? `You picked ${category.title}. This one is live. Next: pick a song.`
        : `You picked ${category.title}. This one is coming soon. Try Mother’s Day to buy today.`
    );
    setStep(3);
  }

  function chooseSong(song: string) {
    setSelectedSong(song);
    playBotVoice("pick-song");
    setLastAction(`You picked ${song}. Next: start the HUG.`);
    setStep(4);
  }

  return (
    <main className="min-h-screen bg-[#241105] text-[#fff7e8]">
      <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        {comingSoonNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5">
            <section className="w-full max-w-md rounded-[2rem] border border-amber-300/30 bg-[#3a1f0f] p-6 text-center shadow-2xl">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Coming soon
              </p>
              <h2 className="mt-3 text-3xl font-black text-amber-50">
                This HUG is not ready yet.
              </h2>
              <p className="mt-4 text-lg leading-8 text-amber-50/80">
                {comingSoonNotice}
              </p>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setComingSoonNotice(null);
                    setSelectedFamilyId("special-days");
                    setSelectedCategorySlug("mothers-day");
                    setSelectedSong("Thank You");
                    setLastAction("Mother’s Day is live. Pick Thank You, then start the HUG.");
                    setStep(3);
                    playBotVoice("try-mothers-day");
                  }}
                  className="rounded-2xl bg-amber-300 px-6 py-4 text-lg font-black text-[#2a180d] transition hover:bg-amber-200"
                >
                  Try Mother’s Day
                </button>

                <button
                  type="button"
                  onClick={() => setComingSoonNotice(null)}
                  className="rounded-2xl border border-amber-200/25 px-6 py-4 text-lg font-black text-amber-50 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Coming soon popup */}

        <div className="rounded-[2rem] border border-amber-300/20 bg-[#3a1f0f] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
              K-KUT HUGs
            </p>
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
            Send a historic audio greeting card.
          </h1>

          <div className="mt-6 rounded-[1.5rem] border border-amber-300/30 bg-amber-300 p-5 text-[#2a180d] shadow-lg">
            <p className="text-sm font-black uppercase tracking-[0.18em]">
              BB-BOT
            </p>
            <p className="mt-2 text-2xl font-black leading-tight">{botMessage}</p>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => playBotVoice("welcome")}
                className="rounded-2xl bg-[#2a180d] px-5 py-3 text-base font-black text-amber-100 transition hover:opacity-90"
              >
                Play GP-BOT
              </button>
            </div>
          </div>

          <section className="mt-6 rounded-[1.5rem] border border-amber-300/25 bg-black/25 p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Current action
            </p>
            <h2 className="mt-2 text-3xl font-black text-amber-50">{lastAction}</h2>
            <p className="mt-3 text-lg leading-8 text-amber-50/80">
              Only the active area works. The other parts are locked until you finish this one.
            </p>
          </section>
          <div className="mt-6 rounded-2xl border border-amber-200/15 bg-black/20 p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Progress
            </p>
            <p className="mt-3 text-lg leading-8 text-amber-50/85">
              <span className="font-black text-amber-200">Active now:</span> {stepLabels.find((item) => item.step === step)?.label}.
              The other parts are locked until this part is done.
            </p>
            <div className="mt-4 space-y-2 text-base text-amber-50/60">
              {stepLabels.map((item) => (
                <p key={item.step} className={item.step === step ? "font-black text-amber-100" : ""}>
                  {item.step === step ? "♪" : "♩"} {item.label}
                  {item.step === step ? " — do this now" : " — locked"}
                </p>
              ))}
            </div>
          </div>

          {step === 1 && (
            <section className="mt-8 rounded-[2rem] border border-amber-300/25 bg-black/20 p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Read below first
              </p>

              <h2 className="mt-2 text-4xl font-black">
                Read Step 1 below.
              </h2>

              <div className="mt-5 grid gap-3 text-lg font-bold leading-8 text-amber-50/90">
                <p>♪ A HUG is an audio greeting card.</p>
                <p>♬ A HUG sends feeling through music.</p>
                <p>♫ A HUG can be sent by text, DM, social link, or email.</p>
              </div>

              <div className="mt-5 grid gap-4 text-xl leading-9 text-amber-50/90">
                <p>
                  A HUG is an audio greeting card.
                </p>

                <p>
                  It sends a real song moment with your message.
                </p>

                <p>
                  Send it by text, DM, social link, or email.
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-amber-300 p-5 text-[#2a180d]">
                <p className="text-sm font-black uppercase tracking-[0.18em]">
                  Say yes before moving on
                </p>
                <p className="mt-2 text-2xl font-black leading-8">
                  I understand: a HUG is a digital audio card that sends feeling through music.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  playBotVoice("pick-kind");
                  setLastAction("Good. Step 2 is unlocked. Pick what the HUG is for.");
                  setStep(2);
                }}
                className="mt-6 w-full rounded-2xl bg-amber-300 px-8 py-6 text-2xl font-black text-[#2a180d] shadow-lg transition hover:bg-amber-200"
              >
                I understand — pick what this is for
              </button>

              <div className="mt-4 text-center">
                <a
                  href="/hug/mothers-day"
                  className="text-sm font-black text-amber-200 underline underline-offset-4"
                >
                  I don’t understand — show me the demo
                </a>
              </div>

              <p className="mt-4 text-center text-base font-bold text-amber-50/65">
                This is required. The next part stays locked until you tap the button.
              </p>
            </section>
          )}

          {step === 2 && (
            <section className="mt-8 rounded-[2rem] border border-amber-300/25 bg-black/20 p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Pick what this is for
              </p>

              <h2 className="mt-2 text-4xl font-black">What is this for?</h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {families.map((family) => (
                  <button
                    key={family.id}
                    type="button"
                    onClick={() => chooseFamily(family)}
                    className="rounded-[1.5rem] border border-amber-200/20 bg-[#3a1f0f] p-6 text-left transition hover:bg-white/10"
                  >
                    <h3 className="text-2xl font-black">{family.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-amber-50/70">
                      {family.description}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="mt-8 rounded-[2rem] border border-amber-300/25 bg-black/20 p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Pick a song
              </p>

              <h2 className="mt-2 text-4xl font-black">{selectedFamily.title}</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {familyCategories.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => chooseCategory(category)}
                    className={`rounded-[1.5rem] border p-5 text-left transition ${
                      category.slug === selectedCategory.slug
                        ? "border-amber-300 bg-amber-300 text-[#2a180d]"
                        : "border-amber-200/20 bg-[#3a1f0f] text-amber-50 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.18em]">
                      {category.theme}
                    </p>
                    <h3 className="mt-2 text-2xl font-black">{category.title}</h3>
                    <p className="mt-3 text-sm leading-6 opacity-80">
                      {category.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                  Song choices
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {selectedCategory.songs.map((song) => (
                    <button
                      key={song}
                      type="button"
                      onClick={() => chooseSong(song)}
                      className="rounded-2xl border border-amber-200/20 bg-black/20 px-5 py-4 text-left text-lg font-black text-amber-50 transition hover:bg-white/10"
                    >
                      {song}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="mt-8 rounded-[2rem] border border-amber-300/25 bg-black/20 p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Start the HUG
              </p>

              <h2 className="mt-2 text-4xl font-black">{selectedSong}</h2>

              <p className="mt-4 text-lg leading-8 text-amber-50/80">
                {selectedCategory.liveHref
                  ? "This HUG is live. Start now."
                  : "This HUG is coming soon. Try Mother’s Day to buy today."}
              </p>

              {selectedCategory.liveHref ? (
                <Link
                  href={selectedCategory.liveHref}
                  onClick={() => playBotVoice("start-hug")}
                  className="mt-6 inline-block rounded-2xl bg-amber-300 px-8 py-5 text-xl font-black text-[#2a180d] shadow-lg transition hover:bg-amber-200"
                >
                  Start the HUG
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    playBotVoice("try-mothers-day");
                    setSelectedFamilyId("special-days");
                    setSelectedCategorySlug("mothers-day");
                    setSelectedSong("Thank You");
                    setLastAction("Mother’s Day is live. Pick Thank You, then start the HUG.");
                    setStep(3);
                  }}
                  className="mt-6 rounded-2xl bg-amber-300 px-8 py-5 text-xl font-black text-[#2a180d] shadow-lg transition hover:bg-amber-200"
                >
                  Try Mother’s Day
                </button>
              )}

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setLastAction("Go back and pick a different HUG kind.");
                    setStep(2);
                  }}
                  className="rounded-2xl border border-amber-200/25 px-6 py-4 text-lg font-black text-amber-50 transition hover:bg-white/10"
                >
                  Back
                </button>
              </div>
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
