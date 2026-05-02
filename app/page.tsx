"use client";

import { useState } from "react";

type Moment = {
  id: string;
  title: string;
  mk_title?: string;
  display_text?: string;
  audio_url?: string;
  mp3_url?: string;
  clip_url?: string;
};

const PAYMENT_LINKS = {
  hug: "https://buy.stripe.com/28EfZgdIO7Iuaq03tc4ow0m",
  vocalNote: "https://buy.stripe.com/aFabJ0bAG0g27dO1l44ow0l",
};

const PRESETS = [
  {
    key: "thank-you-mom",
    label: "❤️ Thank You, Mom",
    query: "mother love care heart family thank you",
  },
  {
    key: "miss-you",
    label: "🤍 I Miss You",
    query: "miss you mother home love heart",
  },
  {
    key: "just-for-you",
    label: "🌸 Just For You",
    query: "gentle beautiful love heart care mother",
  },
];

export default function HomePage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");

  async function findMoments(query: string, label: string) {
    setLoading(true);
    setSelectedLabel(label);
    setIndex(0);

    try {
      const res = await fetch(`/api/bot/moments?q=${encodeURIComponent(query)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setMoments(json.moments || []);
    } catch {
      setMoments([]);
    } finally {
      setLoading(false);
    }
  }

  const moment = moments[index];
  const audioUrl = moment?.audio_url || moment?.mp3_url || moment?.clip_url;

  return (
    <main className="min-h-screen bg-[#160d08] text-[#fff3d6]">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-12">
        <p className="mb-4 text-sm font-semibold tracking-[0.25em] text-[#d6a400]">
          K-KUT · REAL AUDIO MOMENTS
        </p>

        <h1 className="mb-5 text-5xl font-bold leading-tight md:text-7xl">
          <span className="block text-2xl font-black tracking-[0.18em] text-[#ffd36a] sm:text-3xl">
            FIND THE RIGHT WORDS!
          </span>
          <span className="mt-4 block">
            Be there when you can’t.
          </span>
          <span className="mt-4 block text-2xl font-bold text-[#f4c04a] sm:text-3xl">
            Send Mom something she has never, ever received: a GPM HUG for Mother’s Day.
          </span>
        </h1>

        <p className="mb-8 max-w-2xl text-xl leading-relaxed text-[#e8cf9f]">
          Send a real song moment that says what you feel. No AI. No fake
          samples. Just GPMx source audio, ready to send.
        </p>

        <div className="mb-8 rounded-3xl border border-[#d6a400]/40 bg-[#24180f] p-6 shadow-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#ffd36a]">
            Mother’s Day HUG
          </p>
          <p className="mt-3 text-2xl font-black text-[#fff3cf]">
            Order the HUG now. The curated Thank You audio is being scripted.
          </p>
          <p className="mt-3 text-base leading-relaxed text-[#e8cf9f]">
            This is a real-audio K-KUT gift built for Mother’s Day. No generic mini-KUTs. No wrong-song fallback.
            Your HUG order reserves the Mother’s Day delivery flow.
          </p>
          <a
            href={PAYMENT_LINKS.hug}
            className="mt-5 inline-block rounded-2xl bg-[#d6a400] px-6 py-4 text-lg font-black text-[#160d08] hover:bg-[#f0bf28]"
          >
            ❤️ Order Mother’s Day HUG — $9.99
          </a>
        </div>


        <div className="mb-10 grid gap-3 md:grid-cols-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              onClick={() => findMoments(preset.query, preset.label)}
              className="rounded-2xl border border-[#d6a400] bg-[#24150d] px-5 py-4 text-left text-lg font-semibold text-[#ffd36a] hover:bg-[#332014]"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <section className="rounded-3xl border border-[#6b4a15] bg-[#21140d] p-6 shadow-xl">
          {!selectedLabel && (
            <div>
              <h2 className="mb-2 text-2xl font-bold text-[#ffd36a]">
                Choose what you need to say.
              </h2>
              <p className="text-[#e8cf9f]">
                BB will find a real K-KUT moment for Mom.
              </p>
            </div>
          )}

          {loading && (
            <p className="text-lg text-[#ffd36a]">Finding the moment…</p>
          )}

          {!loading && selectedLabel && moments.length === 0 && (
            <div>
              <h2 className="mb-2 text-2xl font-bold text-[#ffd36a]">
                No match yet.
              </h2>
              <p className="mb-5 text-[#e8cf9f]">
                Try another Mother’s Day path while more moments are being
                reviewed.
              </p>
            </div>
          )}

          {!loading && moment && (
            <div>
              <p className="mb-2 text-sm font-semibold text-[#d6a400]">
                {selectedLabel}
              </p>

              <h2 className="mb-4 text-2xl font-bold text-[#ffd36a]">
                {moment.display_text || moment.mk_title || moment.title}
              </h2>

              {audioUrl ? (
                <audio controls className="mb-6 w-full" src={audioUrl}>
                  Your browser does not support audio.
                </audio>
              ) : (
                <p className="mb-6 text-red-300">Audio unavailable.</p>
              )}

              <div className="flex flex-wrap gap-3">
                <a
                  href={PAYMENT_LINKS.hug}
                  className="rounded-xl bg-[#d6a400] px-5 py-3 font-bold text-[#160d08] hover:bg-[#f0bf28]"
                >
                  ❤️ Send this to Mom — $9.99
                </a>

                <button
                  onClick={() => setIndex((index + 1) % moments.length)}
                  className="rounded-xl border border-[#d6a400] px-5 py-3 font-bold text-[#ffd36a] hover:bg-[#332014]"
                >
                  Try another
                </button>

                <a
                  href={PAYMENT_LINKS.vocalNote}
                  className="rounded-xl border border-[#6b4a15] px-5 py-3 font-bold text-[#e8cf9f] hover:bg-[#332014]"
                >
                  Add Vocal Note
                </a>
              </div>
            </div>
          )}
        </section>

        <p className="mt-8 text-sm text-[#b99759]">
          Mother’s Day HUGs are curated K-KUT gifts. No generic mini-KUTs are shown in this holiday flow.
          Thank You inventory is being scripted for Verse 1, Verse 2, Chorus 3, Outro, and bite-size HUG options.
        </p>
      </section>
    </main>
  );
}
