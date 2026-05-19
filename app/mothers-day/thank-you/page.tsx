"use client";

import { useRef, useState } from "react";
import MothersDayMCBot from "@/components/MothersDayMCBot";
import EofSignatureAudio from "@/components/EofSignatureAudio";

const kks = [
  {
    id: "thank-you-kk1",
    tier: "featured",
    title: "Thank You Kut 1",
    section: "Intro + V1A",
    priceTier: "premium",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk1.mp3",
  },
  {
    id: "thank-you-kk2",
    tier: "featured",
    title: "Thank You Kut 2",
    section: "V1C + V1D + Chorus 1",
    priceTier: "premium",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk2.mp3",
  },
  {
    id: "thank-you-kk3",
    tier: "section",
    title: "Thank You Kut 3",
    section: "Chorus 1",
    priceTier: "standard",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk3.mp3",
  },
  {
    id: "thank-you-kk4",
    tier: "featured",
    title: "Thank You Kut 4",
    section: "Intro through Chorus 1",
    priceTier: "premium",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk4.mp3",
  },
  {
    id: "thank-you-kk5",
    tier: "section",
    title: "Thank You Kut 5",
    section: "V2A",
    priceTier: "standard",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk5.mp3",
  },
  {
    id: "thank-you-kk6",
    tier: "featured",
    title: "Thank You Kut 6",
    section: "V2B through Outro",
    priceTier: "premium",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk6.mp3",
  },
  {
    id: "thank-you-kk7",
    tier: "featured",
    title: "Thank You Kut 7",
    section: "Chorus 2 through Outro",
    priceTier: "premium",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk7.mp3",
  },
  {
    id: "thank-you-sec-intro",
    tier: "section",
    title: "Intro",
    section: "Intro",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-intro.mp3",
  },
  {
    id: "thank-you-sec-v1a",
    tier: "section",
    title: "Verse 1A",
    section: "V1A",
    priceTier: "standard",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-v1a.mp3",
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
    title: "Thank You Chorus",
    section: "Chorus 1",
    priceTier: "standard",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-ch1.mp3",
  },
  {
    id: "thank-you-sec-v2a",
    tier: "section",
    title: "Verse 2A",
    section: "V2A",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-v2a.mp3",
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
    id: "thank-you-sec-outro",
    tier: "section",
    title: "Outro",
    section: "Outro",
    priceTier: "standard",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-outro.mp3",
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
    id: "thank-you-cc-002",
    tier: "cc",
    title: "Intro Lift",
    section: "Intro moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-002.mp3",
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
    id: "thank-you-cc-005",
    tier: "cc",
    title: "V1A Close",
    section: "V1A moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-005.mp3",
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
  {
    id: "thank-you-cc-022",
    tier: "cc",
    title: "Final Thank You",
    section: "Outro final moment",
    priceTier: "small",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-022.mp3",
  },
];



const bbBotSamples = [
  {
    label: "Short KUT",
    price: "$4.99",
    description: "A short, sweet audio moment from the song.",
    id: "thank-you-cc-022",
    title: "Just the Feeling",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-012.mp3",
  },
  {
    label: "HUG",
    price: "$7.99",
    description: "A fuller audio greeting with the heart of the song.",
    id: "thank-you-sec-ch1",
    title: "Thank You Chorus",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-ch1.mp3",
  },
  {
    label: "Big HUG",
    price: "$12.99",
    description: "A larger audio greeting with the strongest Mother’s Day arc.",
    id: "thank-you-kk7",
    title: "The Big Mother’s Day HUG",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk7.mp3",
  },
];

function priceForTier(priceTier: string) {
  if (priceTier === "small") return "$4.99";
  if (priceTier === "standard") return "$7.99";
  if (priceTier === "premium") return "$12.99";
  return "";
}

function publicTierName(tier: string) {
  if (tier === "cc") return "Short KUT";
  if (tier === "section") return "HUG";
  return "Big HUG";
}

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
            Send the world’s first Audio Greeting Card — a K-KUT HUG.
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#e4c89b]">
            Play the Mother’s Day song, choose the feeling you want to send, and let MC-BOT help you pick a Short KUT, HUG, or Big HUG.
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
              You can buy many K-KUTs, but each purchase is one K-KUT at a time. Choose a Short KUT, HUG, or Big HUG. Each purchase sends one real-audio greeting.
            </p>
          </div>
        </div>


        <MothersDayMCBot />

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
                {publicTierName(kk.tier)} · {priceForTier(kk.priceTier)}
              </p>

              <EofSignatureAudio src={kk.audioUrl} leadSeconds={3.0} />

              <a
                href={`/checkout?kk=${encodeURIComponent(kk.id)}`}
                className="mt-5 block rounded-xl border border-[#f4b000] px-5 py-3 text-center font-black text-[#f4b000] hover:bg-[#f4b000] hover:text-black"
              >
                Send this HUG
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
            This Mother’s Day program includes Short KUTs, HUGs, and Big HUGs: short emotional moments, fuller song sections, and larger signature audio greetings.
          </p>
          <p className="mt-3 leading-7 text-[#e4c89b]">
            Short KUTs are the smallest and lowest price. HUGs are fuller. Big HUGs are larger audio greetings with the strongest emotional arc.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-[#5b3b12] bg-[#211309] p-6">
          <h2 className="text-2xl font-black">What you are buying</h2>
          <p className="mt-3 leading-7 text-[#e4c89b]">
            A K-KUT is a selected emotional cut from the real song. No artificial
            final vocals. Only K-KUTs in this buyer flow. No internal/backend formats in this buyer
            flow.
          </p>
        </section>
      </section>
    </main>
  );
}
