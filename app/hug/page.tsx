"use client";

import React, { useMemo, useState } from "react";
import { KkutFlowStepId, KkutStepMap } from "@/components/KkutStepMap";

type HugKind = "thanks" | "love" | "celebration" | "repair";

type KutCandidate = {
  id: string;
  label: string;
  fit: string;
  section: string;
  previewSrc?: string;
  fullTrackSrc?: string;
};

const hugKinds: Array<{ id: HugKind; label: string; helper: string }> = [
  { id: "thanks", label: "Thank you", helper: "Appreciation, gratitude, recognition." },
  { id: "love", label: "Love / comfort", helper: "Care, tenderness, support." },
  { id: "celebration", label: "Celebration", helper: "Birthdays, wins, milestones." },
  { id: "repair", label: "Repair / reconnect", helper: "Apology, peace, reconnection." },
];

const kutCandidatesByKind: Record<HugKind, KutCandidate[]> = {
  thanks: [
    { id: "thanks-01", label: "Warm thank-you kut", fit: "Best first choice for gratitude.", section: "Final chorus + outro" },
    { id: "thanks-02", label: "Simple appreciation kut", fit: "Clean, direct thank-you.", section: "Hook / refrain" },
    { id: "thanks-03", label: "Family support kut", fit: "For someone who showed up.", section: "Verse lift" },
    { id: "thanks-04", label: "Quiet thanks kut", fit: "Soft and personal.", section: "Outro" },
    { id: "thanks-05", label: "Big gratitude kut", fit: "For major help or sacrifice.", section: "Final chorus" },
    { id: "thanks-06", label: "Friendship thanks kut", fit: "Warm friend-to-friend send.", section: "Chorus" },
    { id: "thanks-07", label: "Encouraging thanks kut", fit: "Thanks plus support.", section: "Bridge to chorus" },
    { id: "thanks-08", label: "Close-family thank-you kut", fit: "Personal and meaningful.", section: "Final chorus + outro" },
  ],
  love: [
    { id: "love-01", label: "Tender comfort kut", fit: "Best first choice for care.", section: "Final chorus + outro" },
    { id: "love-02", label: "By-your-side kut", fit: "Support and closeness.", section: "Chorus" },
    { id: "love-03", label: "Soft love kut", fit: "Gentle private send.", section: "Outro" },
    { id: "love-04", label: "Encouragement kut", fit: "For someone going through it.", section: "Verse lift" },
    { id: "love-05", label: "Romantic kut", fit: "Partner / spouse.", section: "Final chorus" },
    { id: "love-06", label: "Family comfort kut", fit: "Parent, sibling, child.", section: "Hook" },
    { id: "love-07", label: "Missing-you kut", fit: "Distance or longing.", section: "Bridge" },
    { id: "love-08", label: "Deep care kut", fit: "Most emotional option.", section: "Final chorus + outro" },
  ],
  celebration: [
    { id: "celebration-01", label: "Birthday lift kut", fit: "Best first birthday choice.", section: "Final chorus + outro" },
    { id: "celebration-02", label: "Milestone kut", fit: "Big year, big win.", section: "Chorus" },
    { id: "celebration-03", label: "Party energy kut", fit: "Fun and bright.", section: "Hook" },
    { id: "celebration-04", label: "You did it kut", fit: "Achievement / congratulations.", section: "Final chorus" },
    { id: "celebration-05", label: "Family celebration kut", fit: "Group-safe celebration.", section: "Outro" },
    { id: "celebration-06", label: "Joyful send kut", fit: "Light, upbeat HUG.", section: "Verse to hook" },
    { id: "celebration-07", label: "Big night kut", fit: "Event or party moment.", section: "Chorus" },
    { id: "celebration-08", label: "Best-day kut", fit: "Highest emotional payoff.", section: "Final chorus + outro" },
  ],
  repair: [
    { id: "repair-01", label: "Gentle apology kut", fit: "Best first repair choice.", section: "Final chorus + outro" },
    { id: "repair-02", label: "Reconnect kut", fit: "Opening the door softly.", section: "Chorus" },
    { id: "repair-03", label: "Peace offering kut", fit: "Low-pressure send.", section: "Outro" },
    { id: "repair-04", label: "I hear you kut", fit: "Accountability and care.", section: "Verse lift" },
    { id: "repair-05", label: "New chapter kut", fit: "Repair plus hope.", section: "Bridge to chorus" },
    { id: "repair-06", label: "Soft reset kut", fit: "Gentle reconnection.", section: "Hook" },
    { id: "repair-07", label: "Tender repair kut", fit: "More emotional repair.", section: "Final chorus" },
    { id: "repair-08", label: "Healing kut", fit: "Most careful option.", section: "Final chorus + outro" },
  ],
};

function UserControlledAudio({
  src,
  label,
}: {
  src?: string;
  label: string;
}) {
  if (!src) {
    return (
      <div className="rounded-2xl border border-pink-200/30 bg-pink-200/10 p-4">
        <p className="text-sm font-black text-pink-100">{label}</p>
        <p className="mt-2 text-xs leading-5 text-neutral-300">
          Approved vocal/message-led audio source required here. Do not use an instrumental.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="mb-3 text-sm font-black">{label}</p>
      <audio controls preload="none" controlsList="nodownload" className="w-full">
        <source src={src} />
        Your browser does not support audio playback.
      </audio>
      <p className="mt-2 text-xs text-neutral-400">
        Audio starts only when you press play.
      </p>
    </div>
  );
}

export default function HugPage() {
  const [step, setStep] = useState<KkutFlowStepId>("start");
  const [kind, setKind] = useState<HugKind | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFullTrackFor, setShowFullTrackFor] = useState<string | null>(null);

  const candidates = useMemo(() => {
    return kind ? kutCandidatesByKind[kind] : [];
  }, [kind]);

  const activeKut = candidates[activeIndex];

  function chooseKind(nextKind: HugKind) {
    setKind(nextKind);
    setActiveIndex(0);
    setShowFullTrackFor(null);
    setStep("choose");
  }

  function nextKut() {
    setShowFullTrackFor(null);
    setActiveIndex((current) => Math.min(current + 1, candidates.length - 1));
  }

  function previousKut() {
    setShowFullTrackFor(null);
    setActiveIndex((current) => Math.max(current - 1, 0));
  }

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
            Pick the kind of HUG. Listen through the kut candidates in order. Choose the one that fits.
          </p>
        </div>

        <div className="mt-10">
          <KkutStepMap currentStep={step} onStepChange={setStep} />
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-8">
          {step === "start" && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-200">
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
                    className="rounded-3xl bg-white p-5 text-left text-neutral-950"
                  >
                    <p className="text-lg font-black">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">{item.helper}</p>
                  </button>
                ))}
              </div>

              <p className="mt-5 text-sm text-neutral-400">
                No audio plays on this step. First click chooses meaning only.
              </p>
            </>
          )}

          {step === "choose" && activeKut && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-200">
                Kut candidates
              </p>
              <h2 className="mt-3 text-3xl font-black">
                Listen to each kut in order.
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Start with the strongest suggested moment. Usually that is final chorus + outro.
                Choose any kut immediately, or hear the full track only when you ask for it.
              </p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-neutral-950 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-400">
                      Kut {activeIndex + 1} of {candidates.length}
                    </p>
                    <h3 className="mt-1 text-2xl font-black">{activeKut.label}</h3>
                    <p className="mt-2 text-sm text-neutral-300">{activeKut.fit}</p>
                    <p className="mt-2 text-sm font-black text-pink-200">
                      Section: {activeKut.section}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep("send")}
                    className="rounded-2xl bg-white px-5 py-4 font-black text-neutral-950"
                  >
                    Choose this kut
                  </button>
                </div>

                <div className="mt-5">
                  <UserControlledAudio
                    src={activeKut.previewSrc}
                    label="Preview this kut"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={previousKut}
                    disabled={activeIndex === 0}
                    className="rounded-2xl border border-white/10 px-5 py-3 font-black disabled:opacity-40"
                  >
                    Previous kut
                  </button>
                  <button
                    type="button"
                    onClick={nextKut}
                    disabled={activeIndex === candidates.length - 1}
                    className="rounded-2xl border border-white/10 px-5 py-3 font-black disabled:opacity-40"
                  >
                    Next kut
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setShowFullTrackFor(showFullTrackFor === activeKut.id ? null : activeKut.id)
                    }
                    className="rounded-2xl border border-white/10 px-5 py-3 font-black"
                  >
                    {showFullTrackFor === activeKut.id ? "Hide full track" : "Hear full track"}
                  </button>
                </div>

                {showFullTrackFor === activeKut.id && (
                  <div className="mt-5">
                    <UserControlledAudio
                      src={activeKut.fullTrackSrc}
                      label="Listen-only full track"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {candidates.map((candidate, index) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => {
                      setActiveIndex(index);
                      setShowFullTrackFor(null);
                    }}
                    className={[
                      "rounded-2xl border p-4 text-left",
                      index === activeIndex
                        ? "border-pink-200 bg-pink-200 text-neutral-950"
                        : "border-white/10 bg-neutral-900 text-white",
                    ].join(" ")}
                  >
                    <p className="text-xs font-black uppercase tracking-wide">
                      Kut {index + 1}
                    </p>
                    <p className="mt-1 font-black">{candidate.label}</p>
                    <p className="mt-1 text-xs opacity-75">{candidate.section}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "send" && activeKut && (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-200">
                Send privately
              </p>
              <h2 className="mt-3 text-3xl font-black">
                Selected: {activeKut.label}
              </h2>
              <p className="mt-4 text-neutral-300">
                Checkout opens only after the selected kut is approved for delivery.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
