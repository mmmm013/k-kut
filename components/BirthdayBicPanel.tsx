"use client";

import React, { useMemo, useState } from "react";
import { customerFacingReceiptLine } from "@/lib/customerDisplay";

const birthdayOptions = [
  {
    id: "bright",
    name: "Bright Birthday",
    tone: "Happy, clean, upbeat.",
    bestFor: "Friend, sibling, coworker, general birthday.",
    state: "Playable",
    type: "kk",
    priceCents: 799,
  },
  {
    id: "sweet",
    name: "Sweet Birthday",
    tone: "Warm, loving, sincere.",
    bestFor: "Partner, parent, child, close family.",
    state: "Playable",
    type: "kk",
    priceCents: 799,
  },
  {
    id: "milestone",
    name: "Milestone Birthday",
    tone: "Celebratory, meaningful, reflective.",
    bestFor: "30th, 40th, 50th, 60th, and big-year birthdays.",
    state: "Review required",
    type: "kk",
    priceCents: 1299,
  },
  {
    id: "party",
    name: "Birthday Party Lift",
    tone: "Fun, lively, celebration energy.",
    bestFor: "Group sends, parties, and event messages.",
    state: "Selectable",
    type: "mk",
    priceCents: 499,
  },
];

function dollars(priceCents: number) {
  return `$${(priceCents / 100).toFixed(2)}`;
}

function StatusPill({ state }: { state: string }) {
  return <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">{state}</span>;
}

export default function BirthdayBicPanel() {
  const [selected, setSelected] = useState(birthdayOptions[0]);
  const [audioArmed, setAudioArmed] = useState(false);
  const receipt = useMemo(() => customerFacingReceiptLine(selected), [selected]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-200">Birthday HUGs</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight">Send a birthday kut that fits the person.</h1>
      <p className="mt-4 max-w-3xl leading-7 text-neutral-300">
        Choose one birthday tone, hear one safe sample, then send privately or request review.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        {birthdayOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              setSelected(option);
              setAudioArmed(false);
            }}
            className={[
              "rounded-3xl border p-5 text-left transition hover:-translate-y-1",
              selected.id === option.id ? "border-pink-200 bg-pink-200 text-neutral-950" : "border-white/10 bg-neutral-900 text-white",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black">{option.name}</h2>
              <StatusPill state={option.state} />
            </div>
            <p className="mt-3 text-sm opacity-80">{option.tone}</p>
            <p className="mt-3 text-xs leading-5 opacity-70">Best for: {option.bestFor}</p>
            <p className="mt-4 text-2xl font-black">{dollars(option.priceCents)}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl bg-neutral-950 p-5">
          <h2 className="text-xl font-black">One-step birthday flow</h2>
          <div className="mt-5 space-y-3 text-sm text-neutral-300">
            <p><strong className="text-white">1.</strong> Choose birthday tone.</p>
            <p><strong className="text-white">2.</strong> Hear only the selected sample.</p>
            <p><strong className="text-white">3.</strong> Choose this birthday kut or request review.</p>
            <p><strong className="text-white">4.</strong> Pay only when checkout is open.</p>
          </div>

          <div className="mt-5 min-h-36 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-black">Selected sample</p>
            <p className="mt-1 text-xs text-neutral-400">
              Audio loads only after tap. This space is reserved so the page does not jump.
            </p>
            {!audioArmed ? (
              <button
                type="button"
                onClick={() => setAudioArmed(true)}
                className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-black text-neutral-950"
              >
                Hear selected sample
              </button>
            ) : (
              <div className="mt-4 rounded-2xl bg-neutral-900 p-4 text-sm text-neutral-300">
                Connect approved birthday audio source here. Do not preload bulk audio.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 text-neutral-950">
          <h2 className="text-xl font-black">Receipt display</h2>
          <p className="mt-3 text-sm text-neutral-600">
            Customer-facing receipts use tracks for PIX and kuts for everything else.
          </p>
          <div className="mt-5 rounded-2xl bg-neutral-100 p-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-neutral-200 pb-3">
              <span className="font-black">Item</span>
              <span>{receipt.name}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-neutral-200 py-3">
              <span className="font-black">Description</span>
              <span className="text-right">{receipt.description}</span>
            </div>
            <div className="flex justify-between gap-4 pt-3">
              <span className="font-black">Price</span>
              <span>{dollars(receipt.priceCents)}</span>
            </div>
          </div>
          <button type="button" className="mt-5 w-full rounded-2xl bg-neutral-950 px-4 py-3 font-black text-white">
            Choose this birthday kut
          </button>
        </div>
      </div>
    </section>
  );
}
