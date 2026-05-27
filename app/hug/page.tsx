"use client";

import React, { useState } from "react";
import { KkutFlowStepId, KkutStepMap } from "@/components/KkutStepMap";

export default function HugPage() {
  const [step, setStep] = useState<KkutFlowStepId>("start");

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-200">
            K-KUT HUGs
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            HUGs are private music moments you can send as personal audio keepsakes.
          </h1>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            Start with one need. K-KUT will keep the path simple, easy, accurate, and quick.
          </p>
        </div>

        <div className="mt-10">
          <KkutStepMap currentStep={step} onStepChange={setStep} />
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-200">
            Current step
          </p>
          <h2 className="mt-3 text-3xl font-black">
            {step === "start" && "What kind of HUG are you sending?"}
            {step === "need" && "What should it say?"}
            {step === "moment" && "What is the occasion?"}
            {step === "feel" && "What tone fits?"}
            {step === "choose" && "Hear and choose one kut."}
            {step === "send" && "Review, pay, and deliver privately."}
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Thank you", "Love / comfort", "Celebration", "Repair / reconnect"].map((label) => (
              <button
                key={label}
                type="button"
                className="rounded-2xl bg-white px-4 py-4 font-black text-neutral-950"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
