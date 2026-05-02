"use client";

import { useState } from "react";

type Moment = {
  id: string;
  title: string;
  display_text?: string;
  audio_url?: string;
  mp3_url?: string;
  clip_url?: string;
};

const PAYMENT_LINKS = {
  hug: "https://buy.stripe.com/28EfZgdIO7Iuaq03tc4ow0m",
  mk: "https://buy.stripe.com/3cI28q48e2oa0Pq4xg4ow0i",
  kk: "https://buy.stripe.com/4gMaEW9sye6Scy8d3M4ow0j",
  kpd: "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",
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
    query: "gentle beautiful love heart care",
  },
];

const THANK_YOU_SOURCE_MOMENT = {
  id: "thank-you-source-preview",
  title: "Thank You — Source Preview",
  mk_title: "Thank You — Source Preview",
  display_text: "Thank You — Source Preview",
  audio_url: "/mothers-day/thank-you-source.mp3",
  mp3_url: "/mothers-day/thank-you-source.mp3",
  clip_url: "/mothers-day/thank-you-source.mp3",
};

export default function HomePage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");

  async function findMoments(_query: string, label: string) {
    setSelectedLabel(label);
    setLoading(false);
    setIndex(0);
    setMoments([THANK_YOU_SOURCE_MOMENT]);
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
          <p className="mt-4 rounded-2xl border border-[#d6a400]/25 bg-[#160d08] p-4 text-base leading-relaxed text-[#fff3cf]">
            A GPM HUG is a new kind of music gift: a real, human-made audio object built from curated K-KUT song sections.
            It is not AI, not a greeting card, and not a generic clip. It is part of the G Putnam Music invention family:
            K-KUT, K-UPID, and GPM HUGs.
          </p>
          <div className="mt-5 rounded-2xl border border-[#d6a400]/30 bg-[#0f0906] p-4">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ffd36a]">
              Hear the Mother’s Day source
            </p>
            <p className="mt-2 text-lg font-bold text-[#fff3cf]">
              Thank You — Source Preview
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#e8cf9f]">
              This is the Mother’s Day source being scripted into mVerse, contiguous Chorus, Verse, Outro, and bite-size HUG options.
            </p>
            <audio controls preload="none" className="mt-4 w-full">
              <source src="/mothers-day/thank-you-source.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
          <a
            href={PAYMENT_LINKS.hug}
            className="mt-5 inline-block rounded-2xl bg-[#d6a400] px-6 py-4 text-lg font-black text-[#160d08] hover:bg-[#f0bf28]"
          >
            ❤️ Order Mother’s Day HUG — $9.99
          </a>
          <p className="mt-4 text-sm leading-relaxed text-[#b99759]">
            One K-KUT per purchase per day. You may send more than one HUG, but each HUG must be a separate purchase so each gift honors one title, one song, and one recipient moment.
          </p>
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
                Thank You preview is ready.
              </h2>
              <p className="mb-5 text-[#e8cf9f]">
                Press play below. More scripted HUG sections are being
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
                {moment.display_text || moment.title}
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
