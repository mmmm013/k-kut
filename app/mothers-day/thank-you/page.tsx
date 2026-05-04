"use client";

import { useRef, useState } from "react";

const kks = [
  {
    id: "thank-you-kk1",
    tier: "featured",
    title: "Thank You KK1",
    section: "Intro + V1A",
    priceTier: "premium",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk1.mp3",
  },
  {
    id: "thank-you-kk6",
    tier: "featured",
    title: "Thank You KK6",
    section: "V2B through Outro",
    priceTier: "premium",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk6.mp3",
  },
  {
    id: "thank-you-sec-v1c",
    tier: "section",
    title: "Verse 1C",
    section: "V1C",
    priceTier: "standard",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-v1c.mp3",
  },
  {
    id: "thank-you-sec-v1d",
    tier: "section",
    title: "Verse 1D",
    section: "V1D",
    priceTier: "standard",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-v1d.mp3",
  },
  {
    id: "thank-you-sec-ch1",
    tier: "section",
    title: "Chorus 1",
    section: "Chorus 1",
    priceTier: "standard",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-ch1.mp3",
  },
  {
    id: "thank-you-sec-v2b",
    tier: "section",
    title: "Verse 2B",
    section: "V2B",
    priceTier: "standard",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-v2b.mp3",
  },
  {
    id: "thank-you-sec-ch2",
    tier: "section",
    title: "Chorus 2",
    section: "Chorus 2",
    priceTier: "standard",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-ch2.mp3",
  },
  {
    id: "thank-you-cc-001",
    tier: "cc",
    title: "Opening Moment",
    section: "Intro moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-001.mp3",
  },
  {
    id: "thank-you-cc-003",
    tier: "cc",
    title: "V1A First Moment",
    section: "V1A moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-003.mp3",
  },
  {
    id: "thank-you-cc-004",
    tier: "cc",
    title: "V1A Second Moment",
    section: "V1A moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-004.mp3",
  },
  {
    id: "thank-you-cc-006",
    tier: "cc",
    title: "V1C First Moment",
    section: "V1C moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-006.mp3",
  },
  {
    id: "thank-you-cc-007",
    tier: "cc",
    title: "V1C Second Moment",
    section: "V1C moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-007.mp3",
  },
  {
    id: "thank-you-cc-008",
    tier: "cc",
    title: "V1D First Moment",
    section: "V1D moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-008.mp3",
  },
  {
    id: "thank-you-cc-009",
    tier: "cc",
    title: "V1D Second Moment",
    section: "V1D moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-009.mp3",
  },
  {
    id: "thank-you-cc-010",
    tier: "cc",
    title: "Chorus 1 Opening",
    section: "Chorus 1 moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-010.mp3",
  },
  {
    id: "thank-you-cc-011",
    tier: "cc",
    title: "Chorus 1 Middle",
    section: "Chorus 1 moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-011.mp3",
  },
  {
    id: "thank-you-cc-012",
    tier: "cc",
    title: "Chorus 1 Close",
    section: "Chorus 1 moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-012.mp3",
  },
  {
    id: "thank-you-cc-013",
    tier: "cc",
    title: "V2A Moment",
    section: "V2A moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-013.mp3",
  },
  {
    id: "thank-you-cc-014",
    tier: "cc",
    title: "V2B Opening",
    section: "V2B moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-014.mp3",
  },
  {
    id: "thank-you-cc-015",
    tier: "cc",
    title: "V2B Middle",
    section: "V2B moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-015.mp3",
  },
  {
    id: "thank-you-cc-016",
    tier: "cc",
    title: "V2B Close",
    section: "V2B moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-016.mp3",
  },
  {
    id: "thank-you-cc-017",
    tier: "cc",
    title: "Chorus 2 Opening",
    section: "Chorus 2 moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-017.mp3",
  },
  {
    id: "thank-you-cc-018",
    tier: "cc",
    title: "Chorus 2 Middle",
    section: "Chorus 2 moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-018.mp3",
  },
  {
    id: "thank-you-cc-019",
    tier: "cc",
    title: "Chorus 2 Close",
    section: "Chorus 2 moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-019.mp3",
  },
  {
    id: "thank-you-cc-020",
    tier: "cc",
    title: "Outro Opening",
    section: "Outro moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-020.mp3",
  },
  {
    id: "thank-you-cc-021",
    tier: "cc",
    title: "Outro Middle",
    section: "Outro moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-021.mp3",
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
              You can buy many K-KUTs, but each purchase is one K-KUT at a time. Choose from featured K-KUTs, full section cuts, and smaller 2–3 line moment cuts.
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

              <p className="mt-2 inline-block rounded-full border border-[#6f4b12] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#c9a36a]">
                {kk.tier} · {kk.priceTier}
              </p>

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
            This expanded Mother’s Day program includes featured K-KUTs, full section cuts, and smaller moment cuts: verses, chorus parts, endings, and 2–3 line emotional moments.
          </p>
          <p className="mt-3 leading-7 text-[#e4c89b]">
            Smaller K-KUTs have a smaller price tier. Each purchase remains one K-KUT at a time.
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
