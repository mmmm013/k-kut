"use client";

import React, { useMemo, useState } from "react";
import { KkutFlowStepId, KkutStepMap } from "@/components/KkutStepMap";
import { realHugKuts } from "@/lib/hugRealKutManifest";

type HugKind = "thanks" | "comfort" | "celebration" | "reconnect";
type HugNeed = "appreciation" | "support" | "celebrate" | "repair";
type HugMoment = "everyday" | "family" | "friend" | "special";
type HugTone = "warm" | "gentle" | "bright" | "deep";

type KutCandidate = {
  id: string;
  label: string;
  fit: string;
  section: string;
  previewSrc: string;
};

const kinds: Array<{ id: HugKind; label: string; helper: string; live: boolean }> = [
  { id: "thanks", label: "Thank you", helper: "Gratitude, appreciation, recognition.", live: true },
  { id: "comfort", label: "Love / comfort", helper: "Care, support, reassurance.", live: false },
  { id: "celebration", label: "Celebration", helper: "Joy, pride, milestone.", live: false },
  { id: "reconnect", label: "Repair / reconnect", helper: "Apology, healing, reaching back.", live: false },
];

const needs: Array<{ id: HugNeed; label: string }> = [
  { id: "appreciation", label: "Say thank you" },
  { id: "support", label: "Offer support" },
  { id: "celebrate", label: "Celebrate them" },
  { id: "repair", label: "Reconnect" },
];

const moments: Array<{ id: HugMoment; label: string }> = [
  { id: "everyday", label: "Everyday moment" },
  { id: "family", label: "Family" },
  { id: "friend", label: "Friend" },
  { id: "special", label: "Special occasion" },
];

const tones: Array<{ id: HugTone; label: string }> = [
  { id: "warm", label: "Warm" },
  { id: "gentle", label: "Gentle" },
  { id: "bright", label: "Bright" },
  { id: "deep", label: "Deep" },
];

const paymentLinks = {
  hug: process.env.NEXT_PUBLIC_KKUT_HUG_PAYMENT_URL || "",
  reviewed: process.env.NEXT_PUBLIC_KKUT_REVIEWED_HUG_PAYMENT_URL || "",
};

function KutAudio({ src }: { src: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-[#D4A017]/25 bg-[#24180F] p-4">
      <p className="mb-3 text-sm font-black text-[#F5E6C8]">Preview this kut</p>
      <audio controls preload="none" controlsList="nodownload" className="w-full">
        <source src={src} />
        Your browser does not support audio playback.
      </audio>
      <p className="mt-2 text-xs text-[#F5E6C8]/60">
        Audio starts only when you press play.
      </p>
    </div>
  );
}

export default function HugPage() {
  const [step, setStep] = useState<KkutFlowStepId>("start");
  const [kind, setKind] = useState<HugKind | null>(null);
  const [need, setNeed] = useState<HugNeed | null>(null);
  const [moment, setMoment] = useState<HugMoment | null>(null);
  const [tone, setTone] = useState<HugTone | null>(null);
  const [selectedKut, setSelectedKut] = useState<KutCandidate | null>(null);

  const candidates = useMemo<KutCandidate[]>(() => {
    return kind === "thanks" ? [...realHugKuts.thanks] : [];
  }, [kind]);

  const selectedKind = kinds.find((item) => item.id === kind);
  const selectedNeed = needs.find((item) => item.id === need);
  const selectedMoment = moments.find((item) => item.id === moment);
  const selectedTone = tones.find((item) => item.id === tone);

  function chooseKind(nextKind: HugKind) {
    setKind(nextKind);
    setNeed(null);
    setMoment(null);
    setTone(null);
    setSelectedKut(null);
    setStep("need");
  }

  function chooseNeed(nextNeed: HugNeed) {
    setNeed(nextNeed);
    setStep("moment");
  }

  function chooseMoment(nextMoment: HugMoment) {
    setMoment(nextMoment);
    setStep("feel");
  }

  function chooseTone(nextTone: HugTone) {
    setTone(nextTone);
    setStep("choose");
  }

  function selectKut(kut: KutCandidate) {
    setSelectedKut(kut);
    setStep("send");
  }

  return (
    <main className="min-h-screen bg-[#1A120B] text-[#F5E6C8]">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4A017]">
            K-KUT by G Putnam Music
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            Send a private music HUG.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#F5E6C8]/80">
            Follow six simple steps. Preview real pre-made kuts. Choose one and send privately.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-black uppercase tracking-wide text-[#F5E6C8]/70">
            <span className="rounded-full border border-[#D4A017]/25 px-3 py-2">Simple</span>
            <span className="rounded-full border border-[#D4A017]/25 px-3 py-2">Easy</span>
            <span className="rounded-full border border-[#D4A017]/25 px-3 py-2">Accurate</span>
            <span className="rounded-full border border-[#D4A017]/25 px-3 py-2">Quick</span>
          </div>
        </div>

        <div className="mt-10">
          <KkutStepMap currentStep={step} onStepChange={setStep} />
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#D4A017]/25 bg-[#24180F] p-6 shadow-2xl sm:p-8">
          {step === "start" && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4A017]">
                Step 1 of 6 • Kind of HUG
              </p>
              <h2 className="mt-3 text-3xl font-black">
                What kind of HUG are you sending?
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kinds.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseKind(item.id)}
                    className="rounded-3xl bg-[#F5E6C8] p-5 text-left text-[#1A120B]"
                  >
                    <p className="text-lg font-black">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-[#5A3515]">{item.helper}</p>
                    {!item.live && (
                      <p className="mt-3 text-xs font-black uppercase tracking-wide text-[#8A5A12]">
                        Reviewed HUG path
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "need" && kind && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4A017]">
                Step 2 of 6 • Message
              </p>
              <h2 className="mt-3 text-3xl font-black">What should it say?</h2>
              <p className="mt-3 text-sm text-[#F5E6C8]/70">
                Selected kind: {selectedKind?.label}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {needs.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseNeed(item.id)}
                    className="rounded-3xl bg-[#F5E6C8] p-5 text-left font-black text-[#1A120B]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "moment" && need && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4A017]">
                Step 3 of 6 • Occasion
              </p>
              <h2 className="mt-3 text-3xl font-black">What is the occasion?</h2>
              <p className="mt-3 text-sm text-[#F5E6C8]/70">
                Message: {selectedNeed?.label}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {moments.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseMoment(item.id)}
                    className="rounded-3xl bg-[#F5E6C8] p-5 text-left font-black text-[#1A120B]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "feel" && moment && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4A017]">
                Step 4 of 6 • Tone
              </p>
              <h2 className="mt-3 text-3xl font-black">What tone fits?</h2>
              <p className="mt-3 text-sm text-[#F5E6C8]/70">
                Occasion: {selectedMoment?.label}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tones.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseTone(item.id)}
                    className="rounded-3xl bg-[#F5E6C8] p-5 text-left font-black text-[#1A120B]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "choose" && kind && tone && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4A017]">
                Step 5 of 6 • Choose
              </p>
              <h2 className="mt-3 text-3xl font-black">
                Preview the kuts. Then choose one.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#F5E6C8]/80">
                Tone: {selectedTone?.label}. Audio is user-controlled. No autoplay.
              </p>

              {kind === "thanks" ? (
                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                  {candidates.map((kut, index) => (
                    <article
                      key={kut.id}
                      className="rounded-3xl border border-[#D4A017]/25 bg-[#1A120B] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wide text-[#D4A017]">
                            Kut {index + 1} of 8
                          </p>
                          <h3 className="mt-2 text-2xl font-black">{kut.label}</h3>
                          <p className="mt-2 text-sm text-[#F5E6C8]/80">{kut.fit}</p>
                          <p className="mt-2 text-sm font-black text-[#D4A017]">
                            Section: {kut.section}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectKut(kut)}
                          className="rounded-2xl bg-[#F5E6C8] px-5 py-4 font-black text-[#1A120B]"
                        >
                          Choose this kut
                        </button>
                      </div>
                      <KutAudio src={kut.previewSrc} />
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-3xl border border-[#D4A017]/25 bg-[#1A120B] p-6">
                  <h3 className="text-2xl font-black">Use MC-BOT reviewed HUG.</h3>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-[#F5E6C8]/80">
                    This HUG kind needs guided matching tonight. No fake kut list is shown.
                    Continue to reviewed checkout for help choosing the right HUG.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep("send")}
                    className="mt-6 rounded-2xl bg-[#D4A017] px-5 py-4 font-black text-[#1A120B]"
                  >
                    Continue to send
                  </button>
                </div>
              )}
            </>
          )}

          {step === "send" && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4A017]">
                Step 6 of 6 • Send
              </p>
              <h2 className="mt-3 text-3xl font-black">
                {selectedKut ? `Selected kut: ${selectedKut.label}` : "Send with MC-BOT reviewed help"}
              </h2>
              <p className="mt-4 max-w-3xl text-[#F5E6C8]/80">
                Review your path, then choose checkout.
              </p>

              <div className="mt-6 rounded-3xl border border-[#D4A017]/25 bg-[#1A120B] p-5 text-sm leading-7 text-[#F5E6C8]/80">
                <p><strong className="text-[#D4A017]">Kind:</strong> {selectedKind?.label || "Not selected"}</p>
                <p><strong className="text-[#D4A017]">Message:</strong> {selectedNeed?.label || "Not selected"}</p>
                <p><strong className="text-[#D4A017]">Occasion:</strong> {selectedMoment?.label || "Not selected"}</p>
                <p><strong className="text-[#D4A017]">Tone:</strong> {selectedTone?.label || "Not selected"}</p>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {selectedKut && (
                  <a
                    href={paymentLinks.hug}
                    className="rounded-3xl bg-[#F5E6C8] p-5 text-[#1A120B] shadow-2xl transition hover:-translate-y-1"
                  >
                    <p className="text-sm font-black uppercase tracking-wide text-[#8A5A12]">
                      Fast send
                    </p>
                    <p className="mt-2 text-2xl font-black">Send this K-KUT</p>
                    <p className="mt-2 text-3xl font-black">$9.99</p>
                    <p className="mt-3 text-sm leading-6 text-[#5A3515]">
                      Pick this kut and send it privately.
                    </p>
                  </a>
                )}

                <a
                  href={paymentLinks.reviewed}
                  className="rounded-3xl border border-[#D4A017] bg-[#D4A017] p-5 text-[#1A120B] shadow-2xl transition hover:-translate-y-1"
                >
                  <p className="text-sm font-black uppercase tracking-wide text-[#3A220F]">
                    Paid guidance
                  </p>
                  <p className="mt-2 text-2xl font-black">MC-BOT reviewed HUG</p>
                  <p className="mt-2 text-3xl font-black">$24.99</p>
                  <p className="mt-3 text-sm leading-6 text-[#3A220F]">
                    Paid help choosing the right kut for the moment.
                  </p>
                </a>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 rounded-[2rem] border border-[#D4A017]/25 bg-[#1A120B] p-5 text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#D4A017]">
            K-KUT • HUGs • kuts • MC-BOT
          </p>
          <p className="mt-3 text-sm leading-6 text-[#F5E6C8]/60">
            A G Putnam Music private audio-gift experience. No autoplay. No hidden audio. You control the preview and the send.
          </p>
        </div>
      </section>
    </main>
  );
}
