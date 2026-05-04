"use client";

import { useMemo, useState } from "react";

type Pick = {
  id: string;
  label: "Short KUT" | "HUG" | "Big HUG";
  price: "$4.99" | "$7.99" | "$12.99";
  title: string;
  description: string;
  audioUrl: string;
};

const picks: Pick[] = [
  {
    id: "thank-you-cc-012",
    label: "Short KUT",
    price: "$4.99",
    title: "Just the Feeling",
    description: "A short, sweet audio moment from the song.",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-cc-012.mp3",
  },
  {
    id: "thank-you-sec-ch1",
    label: "HUG",
    price: "$7.99",
    title: "Thank You Chorus",
    description: "A fuller audio greeting with the heart of the song.",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-sec-ch1.mp3",
  },
  {
    id: "thank-you-kk7",
    label: "Big HUG",
    price: "$12.99",
    title: "The Big Mother’s Day HUG",
    description: "A larger audio greeting with the strongest Mother’s Day arc.",
    audioUrl: "/mothers-day/thank-you/kks-expanded/thank-you-kk7.mp3",
  },
];

export default function MothersDayBBBot() {
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState("");

  const feelings = useMemo(
    () => ["Love", "Gratitude", "Warmth", "Tender", "Celebration"],
    []
  );

  async function buyKk(kkId: string) {
    setError("");
    setBuying(kkId);

    try {
      window.localStorage.setItem("selectedMotherDayKk", kkId);

      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kk: kkId }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Checkout is not available.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setBuying(null);
    }
  }

  return (
    <section className="mt-10 rounded-3xl border border-[#f4b000] bg-[#0f0f0f] p-6 shadow-2xl">
      <p className="text-sm font-black tracking-[0.3em] text-[#f4b000]">
        BB-BOT HELPER
      </p>

      <h2 className="mt-3 text-3xl font-black">Not sure what to send?</h2>

      <p className="mt-3 max-w-3xl leading-7 text-[#e4c89b]">
        BB-BOT can help you choose the size of your audio greeting. Start with a
        feeling, then try one sample of each: Short KUT, HUG, and Big HUG.
      </p>

      <div className="mt-6">
        <p className="font-bold text-[#f8ead0]">What feeling are you sending?</p>

        <div className="mt-3 flex flex-wrap gap-3">
          {feelings.map((feeling) => (
            <button
              key={feeling}
              onClick={() => setSelectedFeeling(feeling)}
              className={`rounded-full border px-4 py-2 text-sm font-bold ${
                selectedFeeling === feeling
                  ? "border-[#f4b000] bg-[#f4b000] text-black"
                  : "border-[#6f4b12] text-[#f4b000] hover:bg-[#f4b000] hover:text-black"
              }`}
            >
              {feeling}
            </button>
          ))}
        </div>
      </div>

      {selectedFeeling ? (
        <p className="mt-5 rounded-xl border border-[#5b3b12] bg-[#211309] p-4 text-[#e4c89b]">
          BB-BOT says: for <strong>{selectedFeeling}</strong>, try these three
          sizes and pick the one that feels right.
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {picks.map((pick) => (
          <article
            key={pick.id}
            className="rounded-2xl border border-[#5b3b12] bg-[#211309] p-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c9a36a]">
              {pick.label} · {pick.price}
            </p>

            <h3 className="mt-3 text-xl font-black">{pick.title}</h3>

            <p className="mt-2 text-sm leading-6 text-[#e4c89b]">
              {pick.description}
            </p>

            <audio
              className="mt-4 w-full"
              controls
              preload="metadata"
              src={pick.audioUrl}
            />

            <button
              onClick={() => buyKk(pick.id)}
              disabled={buying === pick.id}
              className="mt-4 block w-full rounded-xl bg-[#f4b000] px-4 py-3 text-center font-black text-black hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
            >
              {buying === pick.id ? "Opening checkout..." : `Send this ${pick.label}`}
            </button>
          </article>
        ))}
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-500 bg-red-950/40 p-4 text-red-100">
          {error}
        </div>
      ) : null}

      <p className="mt-5 text-sm text-[#a88350]">
        Want more choices? Browse all Mother’s Day HUG options below.
      </p>
    </section>
  );
}
