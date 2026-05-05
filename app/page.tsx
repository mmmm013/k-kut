"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
    description: "Romance and love-centered HUG choices.",
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
    theme: "Apology / Come Back",
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
      "Seetwave",
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
    songs: ["Seets Like Mine", "Life New", "Love Renews", "Better Watch Out"],
  },
] as const;

type Family = (typeof families)[number];
type Category = (typeof categories)[number];

export default function HomePage() {
  function playBotVoice(clip: string = "welcome") {
    if (typeof window === "undefined") return;

    const audio = new Audio(`/voices/gp-bot/prompts/${clip}.m4a`);
    audio.volume = 0.95;
    audio.play().catch(() => {
      console.log("GP-BOT voice blocked until user taps:", clip);
    });
  }

  function speak(_text: string) {
    playBotVoice("welcome");
  }

  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("special-days");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("mothers-day");
  const [selectedSong, setSelectedSong] = useState<string>("Thank You");
  const [lastAction, setLastAction] = useState<string>("Pick a HUG kind.");

  const selectedFamily = useMemo<Family>(() => {
    return families.find((item) => item.id === selectedFamilyId) ?? families[0];
  }, [selectedFamilyId]);

  const familyCategories = useMemo<Category[]>(() => {
    return categories.filter((item) => item.family === selectedFamilyId);
  }, [selectedFamilyId]);

  const selectedCategory = useMemo<Category>(() => {
    return (
      categories.find((item) => item.slug === selectedCategorySlug) ??
      familyCategories[0] ??
      categories[0]
    );
  }, [selectedCategorySlug, familyCategories]);

  const botMessage = useMemo(() => {
    if (selectedCategory.liveHref) {
      return `${lastAction} This one is live. Press Start the HUG.`;
    }

    return `${lastAction} This one is coming soon. Try Mother’s Day to buy today.`;
  }, [lastAction, selectedCategory.liveHref]);

  function show(_text: string) {
    // No BOT guide. BB-BOT is visual guidance only.
  }

  function chooseFamily(familyId: string) {
    setSelectedFamilyId(familyId);
    const nextCategories = categories.filter((item) => item.family === familyId);
    const firstCategory = nextCategories[0];

    if (firstCategory) {
      setSelectedCategorySlug(firstCategory.slug);
      setSelectedSong(firstCategory.songs[0] ?? "");
      const family = families.find((item) => item.id === familyId);
      setLastAction(`You picked ${family?.title ?? "a HUG kind"}. Now pick one.`);
    }
  }

  function chooseCategory(category: Category) {
    setSelectedCategorySlug(category.slug);
    setSelectedSong(category.songs[0] ?? "");
    setLastAction(`You picked ${category.title}. Now pick a song.`);
  }

  return (
    <main className="min-h-screen bg-[#241105] text-[#fff7e8]">
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="rounded-[2rem] border border-amber-300/20 bg-[#3a1f0f] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">
              K-KUT HUGs
            </p>

            <div className="rounded-full border border-green-300/30 bg-green-400/10 px-4 py-2 text-sm font-black text-green-100">
              BB-BOT guide · GP-BOT voice
            </div>
          </div>

          <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_0.95fr] lg:items-start">
            <div>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">
                Send a historic audio greeting card.
              </h1>

              <p className="mt-5 max-w-2xl text-xl leading-8 text-amber-50/85">
                Pick a HUG kind first. Then BB-BOT shows one simple choice at a time.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-amber-300/30 bg-amber-300 p-5 text-[#2a180d] shadow-lg">
              <p className="text-sm font-black uppercase tracking-[0.18em]">
                BB-BOT
              </p>
              <p className="mt-2 text-2xl font-black leading-tight">{botMessage}</p>

              <button
                type="button"
                onClick={() => playBotVoice("welcome")}
                className="mt-4 rounded-2xl bg-[#2a180d] px-5 py-3 text-base font-black text-amber-100 transition hover:opacity-90"
              >
                Play GP-BOT
              </button>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-[1.5rem] border border-amber-300/25 bg-[#3a1f0f] p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
            Current action
          </p>
          <p className="mt-2 text-2xl font-black text-amber-50">{lastAction}</p>
          <p className="mt-2 text-base leading-7 text-amber-50/70">
            {selectedCategory.liveHref
              ? "This HUG is live. Use Start the HUG."
              : "This HUG is coming soon. Click Mother’s Day to buy today."}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-3xl font-black">Pick a HUG kind</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {families.map((family) => {
              const active = family.id === selectedFamily.id;

              return (
                <button
                  key={family.id}
                  type="button"
                  onClick={() => {
                    playBotVoice("pick-kind");
                    chooseFamily(family.id);
                  }}
                  className={`rounded-[1.5rem] border p-6 text-left transition ${
                    active
                      ? "border-amber-300 bg-amber-300 text-[#2a180d] shadow-xl"
                      : "border-amber-200/20 bg-[#3a1f0f] text-amber-50 hover:bg-white/10"
                  }`}
                >
                  <p
                    className={`text-xs font-black uppercase tracking-[0.18em] ${
                      active ? "text-[#2a180d]/70" : "text-amber-200"
                    }`}
                  >
                    Step 1
                  </p>

                  <h3 className="mt-2 text-2xl font-black">{family.title}</h3>

                  <p
                    className={`mt-3 text-sm leading-6 ${
                      active ? "text-[#2a180d]/75" : "text-amber-50/70"
                    }`}
                  >
                    {family.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-amber-200/20 bg-[#3a1f0f] p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Step 2
              </p>
              <h2 className="mt-2 text-4xl font-black">{selectedFamily.title}</h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-amber-50/75">
                Pick a HUG kind.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {familyCategories.map((category) => {
              const active = category.slug === selectedCategory.slug;

              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => {
                    playBotVoice(category.liveHref ? "live" : "coming-soon");
                    chooseCategory(category);
                  }}
                  className={`rounded-[1.5rem] border p-5 text-left transition ${
                    active
                      ? "border-amber-300 bg-amber-300 text-[#2a180d] shadow-xl"
                      : "border-amber-200/20 bg-black/20 text-amber-50 hover:bg-white/10"
                  }`}
                >
                  <p
                    className={`text-xs font-black uppercase tracking-[0.18em] ${
                      active ? "text-[#2a180d]/70" : "text-amber-200"
                    }`}
                  >
                    {category.theme}
                  </p>

                  <h3 className="mt-2 text-2xl font-black">{category.title}</h3>

                  <p
                    className={`mt-3 text-sm leading-6 ${
                      active ? "text-[#2a180d]/75" : "text-amber-50/70"
                    }`}
                  >
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-amber-200/20 bg-[#3a1f0f] p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Step 3
              </p>
              <h2 className="mt-2 text-4xl font-black">{selectedCategory.title}</h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-amber-50/75">
                Choose the song.
              </p>
            </div>

            {selectedCategory.liveHref ? (
              <Link
                href={selectedCategory.liveHref}
                className="rounded-2xl bg-amber-300 px-6 py-4 text-center text-lg font-black text-[#2a180d] shadow-lg transition hover:bg-amber-200"
              >
                Start the HUG
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  show("This HUG choice is coming soon.")
                }
                className="rounded-2xl border border-amber-200/25 px-6 py-4 text-center text-lg font-black text-amber-50 transition hover:bg-white/10"
              >
                Coming soon
              </button>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {selectedCategory.songs.map((song) => {
              const active = selectedSong === song;

              return (
                <button
                  key={song}
                  type="button"
                  onClick={() => {
                    playBotVoice("pick-song");
                    setSelectedSong(song);
                    setLastAction(`You picked ${song}.`);
                  }}
                  className={`rounded-2xl border px-5 py-4 text-left text-lg font-black transition ${
                    active
                      ? "border-amber-300 bg-amber-300 text-[#2a180d]"
                      : "border-amber-200/20 bg-black/20 text-amber-50 hover:bg-white/10"
                  }`}
                >
                  {song}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-black/20 p-5">
            <p className="text-lg leading-8 text-amber-50/80">
              {selectedCategory.liveHref
                ? "This path is live now. BB-BOT will guide the buyer through hearing options, choosing one HUG, and checkout."
                : "This HUG choice is coming soon."}
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
