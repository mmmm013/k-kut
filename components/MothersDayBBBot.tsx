"use client";

import { useMemo, useState } from "react";

type HugPick = {
  id: string;
  label: "Short KUT" | "HUG" | "Big HUG";
  price: "$4.99" | "$7.99" | "$12.99";
  title: string;
  description: string;
  audioUrl: string;
};

const picks: HugPick[] = [
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
  const [recipient, setRecipient] = useState("");
  const [feeling, setFeeling] = useState("");
  const [size, setSize] = useState<"Short KUT" | "HUG" | "Big HUG" | "">("");
  const [buying, setBuying] = useState("");
  const [error, setError] = useState("");

  const feelings = useMemo(
    () => ["Love", "Gratitude", "Warmth", "Tender", "Celebration"],
    []
  );

  const recommended = useMemo(() => {
    if (size) return picks.find((p) => p.label === size) || picks[1];
    if (feeling === "Celebration") return picks[2];
    if (feeling === "Tender") return picks[0];
    return picks[1];
  }, [feeling, size]);

  async function buyKk(kkId: string) {
    setError("");
    setBuying(kkId);

    try {
      window.localStorage.setItem("selectedMotherDayKk", kkId);
      window.localStorage.setItem("motherDayRecipient", recipient);
      window.localStorage.setItem("motherDayFeeling", feeling);

      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kk: kkId }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Checkout is not available.");
      }

      window.location.href = String(data.url).trim();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setBuying("");
    }
  }

  return (
    <section className="mt-10 rounded-3xl border border-[#f4b000] bg-[#0f0f0f] p-6 shadow-2xl">
      <p className="text-sm font-black tracking-[0.3em] text-[#f4b000]">
        BB-BOT IS HERE
      </p>

      <h2 className="mt-3 text-3xl font-black">Hi, I’m BB-BOT.</h2>

      <div className="mt-4 rounded-2xl border border-[#5b3b12] bg-[#211309] p-5">
        <p className="text-xl font-black text-[#f8ead0]">
          I’ll guide you one step at a time.
        </p>
        <p className="mt-3 leading-7 text-[#e4c89b]">
          Tell me who this is for, what feeling you want to send, and how big the
          HUG should feel. Then I’ll recommend the best option.
        </p>
      </div>

      <div className="mt-6 grid gap-5">
        <div className="rounded-2xl border border-[#3b2a14] bg-[#160d07] p-5">
          <p className="font-black text-[#f8ead0]">Step 1 — Who is this for?</p>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Mom, Grandma, Aunt Lisa..."
            className="mt-3 w-full rounded-xl border border-[#5b3b12] bg-black px-4 py-3 text-[#f8ead0] outline-none focus:border-[#f4b000]"
          />
        </div>

        <div className="rounded-2xl border border-[#3b2a14] bg-[#160d07] p-5">
          <p className="font-black text-[#f8ead0]">Step 2 — What feeling are you sending?</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {feelings.map((f) => (
              <button
                key={f}
                onClick={() => setFeeling(f)}
                className={`rounded-full border px-4 py-2 text-sm font-bold ${
                  feeling === f
                    ? "border-[#f4b000] bg-[#f4b000] text-black"
                    : "border-[#6f4b12] text-[#f4b000] hover:bg-[#f4b000] hover:text-black"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#3b2a14] bg-[#160d07] p-5">
          <p className="font-black text-[#f8ead0]">Step 3 — How big should the HUG feel?</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {picks.map((p) => (
              <button
                key={p.label}
                onClick={() => setSize(p.label)}
                className={`rounded-2xl border p-4 text-left ${
                  size === p.label
                    ? "border-[#f4b000] bg-[#f4b000] text-black"
                    : "border-[#5b3b12] bg-[#211309] text-[#e4c89b] hover:border-[#f4b000]"
                }`}
              >
                <span className="block text-lg font-black">{p.label}</span>
                <span className="mt-1 block text-sm font-bold">{p.price}</span>
                <span className="mt-2 block text-sm">{p.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-[#f4b000] bg-[#211309] p-5">
        <p className="text-sm font-black tracking-[0.22em] text-[#f4b000]">
          BB-BOT RECOMMENDS
        </p>

        <h3 className="mt-3 text-2xl font-black">
          {recommended.label}: {recommended.title}
        </h3>

        <p className="mt-2 text-[#e4c89b]">
          {recipient ? `For ${recipient}. ` : ""}
          {feeling ? `Best for ${feeling.toLowerCase()}. ` : ""}
          {recommended.description}
        </p>

        <audio
          className="mt-4 w-full"
          controls
          preload="metadata"
          src={recommended.audioUrl}
        />

        <button
          onClick={() => buyKk(recommended.id)}
          disabled={buying === recommended.id}
          className="mt-4 block w-full rounded-xl bg-[#f4b000] px-4 py-3 text-center font-black text-black hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {buying === recommended.id
            ? "Opening checkout..."
            : `Send this ${recommended.label} — ${recommended.price}`}
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-500 bg-red-950/40 p-4 text-red-100">
          {error}
        </div>
      ) : null}

      <p className="mt-5 text-sm text-[#a88350]">
        Want more control? Browse all Mother’s Day HUG options below.
      </p>
    </section>
  );
}
