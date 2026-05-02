"use client";

import { useEffect, useState } from "react";

type HugRecord = {
  id?: string;
  audio_url?: string;
  mp3_url?: string;
  clip_url?: string;
  delivery_note?: string;
  message?: string;
  sender_name?: string;
  recipient_name?: string;
  remaining_forwards?: number;
};

type HugResponse = {
  id: string;
  status: "ok" | "not_found" | "unavailable" | "error";
  hug?: HugRecord;
  error?: string;
};

export default function HugPage({ params }: { params: { id: string } }) {
  const [payload, setPayload] = useState<HugResponse | null>(null);

  useEffect(() => {
    fetch(`/api/hug/${params.id}`)
      .then((res) => res.json())
      .then(setPayload)
      .catch((error) =>
        setPayload({
          id: params.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unable to load HUG.",
        })
      );
  }, [params.id]);

  if (!payload) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#160d08] px-6 text-[#fff3cf]">
        <p className="text-lg">Loading your GPM HUG…</p>
      </main>
    );
  }

  if (payload.status !== "ok" || !payload.hug) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#160d08] px-6 text-[#fff3cf]">
        <section className="max-w-xl rounded-3xl border border-[#d6a400]/40 bg-[#24180f] p-8 text-center shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#ffd36a]">
            GPM HUG
          </p>
          <h1 className="mt-4 text-3xl font-black">This HUG is not ready yet.</h1>
          <p className="mt-4 text-[#e8cf9f]">
            {payload.error || "The HUG link could not be loaded."}
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-full bg-[#d6a400] px-6 py-3 font-black text-[#160d08] hover:bg-[#f0bf28]"
          >
            Back to K-KUT
          </a>
        </section>
      </main>
    );
  }

  const hug = payload.hug;
  const audioUrl = hug.audio_url || hug.mp3_url || hug.clip_url || "";
  const note = hug.delivery_note || hug.message || "Someone sent you a real-audio GPM HUG.";
  const sender = hug.sender_name || "Someone";
  const recipient = hug.recipient_name || "you";

  return (
    <main className="min-h-screen bg-[#160d08] px-6 py-12 text-[#fff3cf]">
      <section className="mx-auto max-w-2xl rounded-3xl border border-[#d6a400]/40 bg-[#24180f] p-8 text-center shadow-2xl">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#ffd36a]">
          You received a GPM HUG
        </p>

        <h1 className="mt-4 text-4xl font-black">
          💛 {recipient}, this is for you.
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-[#e8cf9f]">
          {sender} sent you a real-audio K-KUT HUG.
        </p>

        {audioUrl ? (
          <audio controls preload="metadata" className="mt-8 w-full">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <div className="mt-8 rounded-2xl border border-[#d6a400]/30 bg-[#160d08] p-5 text-[#ffd36a]">
            Audio is being prepared for this HUG.
          </div>
        )}

        <p className="mt-8 rounded-2xl border border-[#d6a400]/25 bg-[#160d08] p-5 text-lg leading-relaxed text-[#fff3cf]">
          {note}
        </p>

        {typeof hug.remaining_forwards === "number" && (
          <p className="mt-4 text-sm text-[#b99759]">
            Remaining forwards: {hug.remaining_forwards}
          </p>
        )}

        <p className="mt-8 text-sm leading-relaxed text-[#b99759]">
          A GPM HUG is a real, human-made audio gift object. No download required.
          Just press play.
        </p>
      </section>
    </main>
  );
}
