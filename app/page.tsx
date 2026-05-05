"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const ACTIVE_BOT = "gp-bot";

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
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [slowHelpOpen, setSlowHelpOpen] = useState<boolean>(false);

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
      return "Welcome. I’ll help you choose a HUG. Read below first.";
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
    if (typeof window === "undefined") return;

    const audio = new Audio(`/voices/${ACTIVE_BOT}/prompts/${clip}.m4a`);
    audio.volume = 0.95;
    audio.play().catch(() => {
      console.log("GP-BOT voice blocked until user taps:", clip);
    });
  }

  const stepHelpText =
    step === 1
      ? "A HUG is an audio greeting card. It sends a real song moment with your message. Tap: I understand — pick what this is for."
      : step === 2
        ? "Pick what this HUG is for. Choose one kind, like Special Days."
        : step === 3
          ? "Pick one song. If you want to buy today, choose Mother’s Day and Thank You."
          : "Start the HUG if this choice is live. If not, try Mother’s Day.";

  useEffect(() => {
    setHelpOpen(false);
    setSlowHelpOpen(false);

    const helpTimer = window.setTimeout(() => {
      setHelpOpen(true);
    }, 5000);

    const slowTimer = window.setTimeout(() => {
      setSlowHelpOpen(true);
    }, 12000);

    return () => {
      window.clearTimeout(helpTimer);
      window.clearTimeout(slowTimer);
    };
  }, [step, selectedFamilyId, selectedCategorySlug, selectedSong]);

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
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#3a1f0f] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
              K-KUT HUGs
            </p>

            <div className="rounded-full border border-green-300/30 bg-green-400/10 px-4 py-2 text-sm font-black text-green-100">
              BB-BOT guide · GP-BOT voice
            </div>
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
              Only the active step works. The next steps are locked until you finish this one.
            </p>
          </section>

          <section className="mt-6 rounded-[1.5rem] border border-amber-300/25 bg-[#3a1f0f] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                  BB-BOT help
                </p>
                <p className="mt-2 text-lg font-bold text-amber-50/80">
                  Stuck or not sure?
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setHelpOpen(true);
                  playBotVoice(step === 1 ? "welcome" : "pick-one");
                }}
                className="rounded-2xl bg-amber-300 px-5 py-3 text-base font-black text-[#2a180d] transition hover:bg-amber-200"
              >
                I don’t understand
              </button>
            </div>

            {(helpOpen || slowHelpOpen) && (
              <div className="mt-4 rounded-2xl bg-amber-300 p-5 text-[#2a180d]">
                <p className="text-sm font-black uppercase tracking-[0.18em]">
                  Need help?
                </p>
                <p className="mt-2 text-xl font-black leading-8">
                  {stepHelpText}
                </p>

                {slowHelpOpen && (
                  <p className="mt-3 text-base font-bold leading-7">
                    Start with the yellow action button. It is the only button that moves this step forward.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setHelpOpen(false);
                    setSlowHelpOpen(false);
                  }}
                  className="mt-4 rounded-xl bg-[#2a180d] px-4 py-2 text-sm font-black text-amber-100"
                >
                  Got it
                </button>
              </div>
            )}
          </section>

          <div className="mt-6 rounded-2xl border border-amber-200/15 bg-black/20 p-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Progress
            </p>
            <p className="mt-3 text-lg leading-8 text-amber-50/85">
              <span className="font-black text-amber-200">Active:</span> Step {step}.
              The other steps are locked until this step is done.
            </p>
            <div className="mt-4 space-y-2 text-base text-amber-50/60">
              {stepLabels.map((item) => (
                <p key={item.step} className={item.step === step ? "font-black text-amber-100" : ""}>
                  Step {item.step}: {item.label}
                  {item.step === step ? " — do this now" : " — locked"}
                </p>
              ))}
            </div>
          </div>

          {step === 1 && (
            <section className="mt-8 rounded-[2rem] border border-amber-300/25 bg-black/20 p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Active Step 1 · Required Learn
              </p>

              <h2 className="mt-2 text-4xl font-black">
                Read Step 1 below.
              </h2>

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

              <p className="mt-4 text-center text-base font-bold text-amber-50/65">
                This is required. The next step stays locked until you tap the button.
              </p>
            </section>
          )}

          {step === 2 && (
            <section className="mt-8 rounded-[2rem] border border-amber-300/25 bg-black/20 p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Step 2 · Pick a HUG kind
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
                Step 3 · Pick a song
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
                Step 4 · Start the HUG
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
        </div>
      </section>
    </main>
  );
}
