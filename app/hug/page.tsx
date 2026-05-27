"use client";

import React, { useMemo, useState } from "react";
import { KkutFlowStepId, KkutStepMap } from "@/components/KkutStepMap";
import { realHugKuts } from "@/lib/hugRealKutManifest";

type HugKind = "thanks";

type KutCandidate = {
  id: string;
  label: string;
  fit: string;
  section: string;
  previewSrc: string;
};

const hugKinds: Array<{ id: HugKind; label: string; helper: string }> = [
  {
    id: "thanks",
    label: "Thank you",
    helper: "Appreciation, gratitude, recognition.",
  },
];

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
  const [selectedKut, setSelectedKut] = useState<KutCandidate | null>(null);

  const candidates = useMemo<KutCandidate[]>(() => {
    return kind === "thanks" ? [...realHugKuts.thanks] : [];
  }, [kind]);

  function chooseKind(nextKind: HugKind) {
    setKind(nextKind);
    setSelectedKut(null);
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
            Choose the kind of HUG. MC-BOT shows real pre-made kuts with working audio.
            Preview each one. Choose the kut that fits.
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
                Kind of HUG
              </p>
              <h2 className="mt-3 text-3xl font-black">
                What kind of HUG are you sending?
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {hugKinds.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseKind(item.id)}
                    className="rounded-3xl bg-[#F5E6C8] p-5 text-left text-[#1A120B]"
                  >
                    <p className="text-lg font-black">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-[#5A3515]">{item.helper}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "choose" && kind && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4A017]">
                8 KUT options
              </p>
              <h2 className="mt-3 text-3xl font-black">
                Preview the kuts. Then choose one.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#F5E6C8]/80">
                These are real pre-made KUTs with real MP3 audio.
              </p>

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
            </>
          )}

          {step === "send" && selectedKut && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4A017]">
                K-KUT private delivery
              </p>
              <h2 className="mt-3 text-3xl font-black">
                Selected HUG kut: {selectedKut.label}
              </h2>
              <p className="mt-4 max-w-3xl text-[#F5E6C8]/80">
                Choose this kut, request help choosing the right HUG, or buy a prepaid HUG as a gift.
              </p>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                <a
                  href={`mailto:reachus@gputnammusic.com?subject=K-KUT HUG — ${encodeURIComponent(selectedKut.label)}&body=I want to send this K-KUT HUG:%0A%0A${encodeURIComponent(selectedKut.label)}%0A%0APrice: $7.99%0A%0APlease send payment and delivery instructions.`}
                  className="rounded-3xl bg-[#F5E6C8] p-5 text-[#1A120B] shadow-2xl transition hover:-translate-y-1"
                >
                  <p className="text-sm font-black uppercase tracking-wide text-[#8A5A12]">
                    Fast send
                  </p>
                  <p className="mt-2 text-2xl font-black">Send this K-KUT</p>
                  <p className="mt-2 text-3xl font-black">$7.99</p>
                  <p className="mt-3 text-sm leading-6 text-[#5A3515]">
                    Pick this kut and send it privately.
                  </p>
                </a>

                <a
                  href={`mailto:reachus@gputnammusic.com?subject=Reviewed K-KUT HUG request&body=I want a reviewed K-KUT HUG.%0A%0ASelected kut candidate: ${encodeURIComponent(selectedKut.label)}%0A%0APrice: $24.99%0A%0APlease help match the right HUG before delivery.`}
                  className="rounded-3xl border border-[#D4A017] bg-[#D4A017] p-5 text-[#1A120B] shadow-2xl transition hover:-translate-y-1"
                >
                  <p className="text-sm font-black uppercase tracking-wide text-[#3A220F]">
                    Best help
                  </p>
                  <p className="mt-2 text-2xl font-black">MC-BOT reviewed HUG</p>
                  <p className="mt-2 text-3xl font-black">$24.99</p>
                  <p className="mt-3 text-sm leading-6 text-[#3A220F]">
                    Get help choosing the right kut for the moment.
                  </p>
                </a>

                <a
                  href="mailto:reachus@gputnammusic.com?subject=Gift a K-KUT HUG&body=I want to buy a prepaid K-KUT HUG as a gift.%0A%0AThis is a gift purchase, not a donation or sponsorship.%0A%0APlease send payment and gift instructions."
                  className="rounded-3xl border border-[#D4A017]/25 bg-[#1A120B] p-5 text-[#F5E6C8] shadow-2xl transition hover:-translate-y-1"
                >
                  <p className="text-sm font-black uppercase tracking-wide text-[#D4A017]">
                    Gift certificate
                  </p>
                  <p className="mt-2 text-2xl font-black">Gift a K-KUT HUG</p>
                  <p className="mt-2 text-3xl font-black">$7.99+</p>
                  <p className="mt-3 text-sm leading-6 text-[#F5E6C8]/80">
                    Buy a prepaid HUG for someone else.
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
