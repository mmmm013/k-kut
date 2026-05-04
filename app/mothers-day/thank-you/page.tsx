"use client";

import { useRef, useState } from "react";

const kks = [
  {
    id: "thank-you-kk1",
    title: "Thank You KK1",
    section: "Intro / Verse 1A",
    audioUrl: "/mothers-day/thank-you/kks/thank-you-kk1.mp3",
  },
  {
    id: "thank-you-kk2",
    title: "Thank You KK2",
    section: "V1C + V1D + Chorus 1",
    audioUrl: "/mothers-day/thank-you/kks/thank-you-kk2.mp3",
  },
  {
    id: "thank-you-kk3",
    title: "Thank You KK3",
    section: "Chorus 1 lift",
    audioUrl: "/mothers-day/thank-you/kks/thank-you-kk3.mp3",
  },
  {
    id: "thank-you-kk4",
    title: "Thank You KK4",
    section: "Intro through Chorus 1",
    audioUrl: "/mothers-day/thank-you/kks/thank-you-kk4.mp3",
  },
  {
    id: "thank-you-kk5",
    title: "Thank You KK5",
    section: "Verse 2A",
    audioUrl: "/mothers-day/thank-you/kks/thank-you-kk5.mp3",
  },
  {
    id: "thank-you-kk6",
    title: "Thank You KK6",
    section: "Verse 2B through Outro",
    audioUrl: "/mothers-day/thank-you/kks/thank-you-kk6.mp3",
  },
  {
    id: "thank-you-kk7",
    title: "Thank You KK7",
    section: "Chorus 2 through Outro",
    audioUrl: "/mothers-day/thank-you/kks/thank-you-kk7.mp3",
  },
];

export default function MothersDayThankYouPage() {
  const songRef = useRef<HTMLAudioElement | null>(null);
  const [started, setStarted] = useState(false);

  async function startSong() {
    if (!songRef.current) return;
    await songRef.current.play();
    setStarted(true);
  }

  return (
    <main className="min-h-screen bg-[#160d07] text-[#f8ead0]">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <a href="/" className="text-sm font-bold text-[#f4b000]">
          ← K-KUT
        </a>

        <div className="mt-12 rounded-3xl border border-[#6f4b12] bg-[#211309] p-8 shadow-2xl">
          <p className="text-sm tracking-[0.35em] text-[#c9a36a]">
            MOTHER&rsquo;S DAY THANK YOU
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            Listen first. Then choose the special part.
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#e4c89b]">
            Play the song and listen for the moments that feel personal,
            emotional, funny, loving, or unforgettable. Each featured K-KUT is one special cut from the song. More section cuts and smaller moment cuts are being added.
          </p>

          <div className="mt-8 rounded-2xl border border-[#4b3212] bg-[#0f0f0f] p-5">
            <button
              onClick={startSong}
              className="w-full rounded-xl bg-[#f4b000] px-6 py-4 text-lg font-black text-black hover:opacity-90"
            >
              {started ? "Song Playing" : "Tap to Play the Mother’s Day Song"}
            </button>

            <audio
              ref={songRef}
              className="mt-5 w-full"
              controls
              preload="metadata"
              src="/mothers-day/thank-you/song/thank-you-song.mp3"
            />

            <p className="mt-4 text-sm text-[#b9955e]">
              Browsers may block sound until you tap. Tap once and the song starts.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-[#4b3212] bg-[#160d07] p-5">
            <h2 className="text-2xl font-black text-[#f4b000]">
              Choose one K-KUT per purchase.
            </h2>
            <p className="mt-3 text-[#e4c89b]">
              You can buy many K-KUTs, but each purchase is one K-KUT at a time. Featured K-KUTs are shown now; smaller section and moment cuts are being added.
            </p>
          </div>
        </div>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          {kks.map((kk) => (
            <article
              key={kk.id}
              className="rounded-2xl border border-[#5b3b12] bg-[#111] p-5"
            >
              <p className="text-xs font-bold tracking-[0.25em] text-[#c9a36a]">
                {kk.id.toUpperCase()}
              </p>

              <h3 className="mt-3 text-2xl font-black">{kk.title}</h3>

              <p className="mt-2 text-[#e4c89b]">{kk.section}</p>

              <audio
                className="mt-5 w-full"
                controls
                preload="metadata"
                src={kk.audioUrl}
              />

              <a
                href={`/donate?kk=${encodeURIComponent(kk.id)}`}
                className="mt-5 block rounded-xl border border-[#f4b000] px-5 py-3 text-center font-black text-[#f4b000] hover:bg-[#f4b000] hover:text-black"
              >
                Buy this K-KUT
              </a>

              <p className="mt-3 text-xs text-[#a88350]">
                One K-KUT per purchase. Delivery by link. SMS delivery activates
                after phone setup is complete.
              </p>
            </article>
          ))}
        </section>


        <section className="mt-10 rounded-2xl border border-[#5b3b12] bg-[#111] p-6">
          <h2 className="text-2xl font-black text-[#f4b000]">
            More K-KUT options are being added.
          </h2>
          <p className="mt-3 leading-7 text-[#e4c89b]">
            This first launch set shows featured K-KUTs. The full Mother’s Day
            program will include more section cuts and smaller moment cuts:
            verses, chorus parts, endings, and 2–3 line emotional moments.
          </p>
          <p className="mt-3 leading-7 text-[#e4c89b]">
            Smaller K-KUTs will have a smaller price. Each purchase remains one
            K-KUT at a time.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-[#5b3b12] bg-[#211309] p-6">
          <h2 className="text-2xl font-black">What you are buying</h2>
          <p className="mt-3 leading-7 text-[#e4c89b]">
            A K-KUT is a selected emotional cut from the real song. No artificial
            final vocals. No mini-KUTs in this buyer flow. No mKs in this buyer
            flow.
          </p>
        </section>
      </section>
    </main>
  );
}
