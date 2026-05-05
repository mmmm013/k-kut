"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const categories = [
  {
    slug: "mothers-day",
    group: "Special Days",
    title: "Mother’s Day",
    theme: "Thank You",
    description: "For thanking Mom with a real audio HUG.",
    songs: ["Thank You"],
    liveHref: "/hug/mothers-day",
  },
  {
    slug: "wedding",
    group: "Special Days",
    title: "Wedding",
    theme: "Forever & a Day",
    description: "For vows, forever, commitment, and celebration.",
    songs: ["Forever & a Day"],
  },
  {
    slug: "anniversary",
    group: "Special Days",
    title: "Anniversary",
    theme: "Awesome Anniversary",
    description: "For celebrating years, loyalty, and love that lasted.",
    songs: ["Awesome Anniversary"],
  },
  {
    slug: "birthday",
    group: "Special Days",
    title: "Birthday",
    theme: "Best Birthday",
    description: "For a personal birthday audio greeting.",
    songs: ["Best Birthday"],
  },
  {
    slug: "sorry",
    group: "Hard Feelings",
    title: "Sorry",
    theme: "Apology / Come Back",
    description: "For apology, regret, and trying to reconnect.",
    songs: ["I’m Sorry", "Come Back"],
  },
  {
    slug: "reflection",
    group: "Hard Feelings",
    title: "Reflection",
    theme: "My Reality",
    description: "For looking inward and telling the truth.",
    songs: ["My Reality"],
  },
  {
    slug: "hurt",
    group: "Hard Feelings",
    title: "Hurt",
    theme: "Pain / Change",
    description: "For heartbreak, disappointment, and emotional injury.",
    songs: ["Hurt Like This", "Changed Your Mind"],
  },
  {
    slug: "cry",
    group: "Hard Feelings",
    title: "Cry",
    theme: "Tears / Memory",
    description: "For grief, tears, and memories that still hurt.",
    songs: ["Over Yesterday", "Torn Memories"],
  },
  {
    slug: "romance",
    group: "Love & Connection",
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
    group: "Strength & Hope",
    title: "Hope",
    theme: "Believe / Keep Going",
    description: "For encouragement, faith, grit, and tomorrow.",
    songs: ["Believe It", "Bein’ Her Man", "Me n’ My Guitar"],
  },
  {
    slug: "self-esteem",
    group: "Strength & Hope",
    title: "Self Esteem",
    theme: "Worth / Fighter",
    description: "For confidence, courage, and personal strength.",
    songs: ["Comin’ True", "I Am a Fighter", "No Mystery", "Til I’m Dyin’ I’m Tryin’"],
  },
  {
    slug: "hang-tough",
    group: "Strength & Hope",
    title: "Hang Tough",
    theme: "Support / Endurance",
    description: "For someone who needs to keep standing.",
    songs: ["Hang On", "Tough People Do", "Imagine If", "Now, That’s Tough", "My Rock", "By Your Side"],
  },
  {
    slug: "pride",
    group: "Strength & Hope",
    title: "Pride",
    theme: "Identity / Renewal",
    description: "For pride, renewal, and standing tall.",
    songs: ["Hearts Like Mine", "Life New", "Love Renews", "Better Watch Out"],
  },
  {
    slug: "sorrow-breakup",
    group: "Hard Feelings",
    title: "Sorrow / Break Up",
    theme: "Loss / Ending",
    description: "For endings, breakups, and emotional release.",
    songs: ["Baby We’re Through", "Last Time", "World of Words", "The New Sunset", "Life New"],
  },
] as const;

type Category = (typeof categories)[number];

export default function HomePage() {
  const [selectedSlug, setSelectedSlug] = useState<string>("mothers-day");
  const [selectedSong, setSelectedSong] = useState<string>("Thank You");

  const selected = useMemo<Category>(() => {
    return categories.find((item) => item.slug === selectedSlug) ?? categories[0];
  }, [selectedSlug]);

  const groups = useMemo(() => {
    return Array.from(new Set(categories.map((item) => item.group)));
  }, []);

  const botMessage = useMemo(() => {
    if (!selectedSong) {
      return `Choose a moment. I’ll show only the right songs for that kind of HUG.`;
    }

    if (selected.liveHref) {
      return `You chose ${selected.title}: ${selectedSong}. This HUG activity is ready. Start the guided HUG wizard.`;
    }

    return `You chose ${selected.title}: ${selectedSong}. This catalog path is selected. Audio demos can be connected next.`;
  }, [selected, selectedSong]);

  function speak(text: string) {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    speak(botMessage);
  }, [botMessage]);

  function chooseCategory(category: Category) {
    setSelectedSlug(category.slug);
    setSelectedSong(category.songs[0] ?? "");
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
              BB-BOT active
            </div>
          </div>

          <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">
                Send a real audio greeting gift.
              </h1>

              <p className="mt-5 max-w-2xl text-xl leading-8 text-amber-50/85">
                Choose the kind of moment. BB-BOT shows only the right options,
                one step at a time.
              </p>

              <div className="mt-7 rounded-[1.5rem] border border-amber-300/30 bg-amber-300 p-5 text-[#2a180d] shadow-lg">
                <p className="text-sm font-black uppercase tracking-[0.18em]">
                  BB-BOT
                </p>
                <p className="mt-2 text-2xl font-black leading-tight">{botMessage}</p>

                <button
                  type="button"
                  onClick={() => speak(botMessage)}
                  className="mt-4 rounded-2xl bg-[#2a180d] px-5 py-3 text-base font-black text-amber-100 transition hover:opacity-90"
                >
                  Hear BB-BOT
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-amber-200/20 bg-black/20 p-5">
              <h2 className="text-2xl font-black">How it works</h2>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-white/5 p-4 text-lg">
                  1. Choose the moment.
                </div>
                <div className="rounded-2xl bg-white/5 p-4 text-lg">
                  2. Pick the message or song path.
                </div>
                <div className="rounded-2xl bg-white/5 p-4 text-lg">
                  3. Hear HUG options.
                </div>
                <div className="rounded-2xl bg-white/5 p-4 text-lg">
                  4. Choose one and checkout.
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-amber-50/65">
                One HUG per order. Additional HUGs are separate purchases.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-3xl font-black">Choose a moment</h2>

          <div className="mt-5 space-y-8">
            {groups.map((group) => (
              <div key={group}>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                  {group}
                </p>

                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {categories
                    .filter((category) => category.group === group)
                    .map((category) => {
                      const active = category.slug === selected.slug;

                      return (
                        <button
                          key={category.slug}
                          type="button"
                          onClick={() => chooseCategory(category)}
                          className={`rounded-[1.5rem] border p-5 text-left transition ${
                            active
                              ? "border-amber-300 bg-amber-300 text-[#2a180d] shadow-xl"
                              : "border-amber-200/20 bg-[#3a1f0f] text-amber-50 hover:bg-white/10"
                          }`}
                        >
                          <p className={`text-xs font-black uppercase tracking-[0.18em] ${
                            active ? "text-[#2a180d]/70" : "text-amber-200"
                          }`}>
                            {category.theme}
                          </p>

                          <h3 className="mt-2 text-2xl font-black">{category.title}</h3>

                          <p className={`mt-3 text-sm leading-6 ${
                            active ? "text-[#2a180d]/75" : "text-amber-50/70"
                          }`}>
                            {category.description}
                          </p>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-amber-200/20 bg-[#3a1f0f] p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Selected moment
              </p>
              <h2 className="mt-2 text-4xl font-black">{selected.title}</h2>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-amber-50/75">
                {selected.description}
              </p>
            </div>

            {selected.liveHref ? (
              <Link
                href={selected.liveHref}
                className="rounded-2xl bg-amber-300 px-6 py-4 text-center text-lg font-black text-[#2a180d] shadow-lg transition hover:bg-amber-200"
              >
                Start guided HUG
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  speak("This HUG category is selected. Audio demo wiring comes next.")
                }
                className="rounded-2xl border border-amber-200/25 px-6 py-4 text-center text-lg font-black text-amber-50 transition hover:bg-white/10"
              >
                Category selected
              </button>
            )}
          </div>

          <div className="mt-6">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
              Choose a message path
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selected.songs.map((song) => {
                const active = selectedSong === song;

                return (
                  <button
                    key={song}
                    type="button"
                    onClick={() => setSelectedSong(song)}
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
          </div>

          {selected.liveHref ? (
            <div className="mt-6 rounded-2xl bg-black/20 p-5">
              <p className="text-lg leading-8 text-amber-50/80">
                Mother’s Day is live now. BB-BOT will guide the buyer through
                choosing the feeling, hearing options, choosing one HUG, and checkout.
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-black/20 p-5">
              <p className="text-lg leading-8 text-amber-50/80">
                This HUG category is staged in the catalog. Next step is connecting
                approved audio demos and a matching checkout path.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
