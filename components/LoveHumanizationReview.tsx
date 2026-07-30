'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getAdjacentLoveLevels,
  getNextLoveStep,
  loveHumanization,
  rankLoveLevels,
  rankLoveReviewCandidates,
  summarizeLovePath,
  type LoveLevel,
  type LoveSelection,
} from "@/lib/loveHumanization";

const SOURCE_PAGE = "/hugz/love-review";

function eventSessionId(ref: React.MutableRefObject<string>) {
  if (ref.current) return ref.current;

  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 12);

  ref.current = `love_hugz_${Date.now()}_${randomPart}`;
  return ref.current;
}

export default function LoveHumanizationReview() {
  const [selections, setSelections] = useState<LoveSelection[]>([]);
  const [focusedLevelId, setFocusedLevelId] = useState<string>("");
  const [volumeStep, setVolumeStep] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const sessionIdRef = useRef("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const nextStep = useMemo(() => getNextLoveStep(selections), [selections]);
  const rankedLevels = useMemo(() => rankLoveLevels(selections, 3), [selections]);
  const focusedLevel = useMemo(
    () => rankedLevels.find((level) => level.id === focusedLevelId) ?? null,
    [focusedLevelId, rankedLevels],
  );
  const depthLevels = useMemo(
    () => (focusedLevelId ? getAdjacentLoveLevels(focusedLevelId) : []),
    [focusedLevelId],
  );
  const activeFamilyId = focusedLevel?.familyId ?? rankedLevels[0]?.familyId;
  const reviewCandidates = useMemo(
    () => rankLoveReviewCandidates(selections, activeFamilyId),
    [activeFamilyId, selections],
  );
  const candidate = reviewCandidates[0] ?? null;

  const postEvent = (eventType: string, metadata: Record<string, unknown> = {}) => {
    const sessionId = eventSessionId(sessionIdRef);

    void fetch("/api/4pe/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: eventType,
        session_id: sessionId,
        source_page: SOURCE_PAGE,
        product_family: "K-KUT HUGz",
        sentiment_product_type: "LOVE",
        interpreted_feeling: summarizeLovePath(selections),
        selected_hug_id: candidate?.candidate_id ?? "",
        selected_hug_title: candidate?.title ?? "",
        metadata: {
          review_only: true,
          theme_anchor: loveHumanization.theme_anchor,
          path: selections,
          focused_level_id: focusedLevelId,
          ...metadata,
        },
      }),
    }).catch(() => {
      // Review UX must remain usable when capture is unavailable.
    });
  };

  useEffect(() => {
    postEvent("page_view", {
      system: loveHumanization.system,
      version: loveHumanization.version,
    });
    // The first page-view event should run once for this review session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volumeStep / loveHumanization.rules.local_playback_volume_steps;
    audio.muted = volumeStep === 0;
  }, [volumeStep, candidate?.candidate_id]);

  useEffect(() => {
    setIsPlaying(false);
    audioRef.current?.pause();
  }, [candidate?.candidate_id]);

  const choosePathOption = (stepId: string, choiceId: string, label: string) => {
    const nextSelections = [
      ...selections.filter((selection) => selection.stepId !== stepId),
      { stepId, choiceId, label },
    ];

    setSelections(nextSelections);
    setFocusedLevelId("");
    postEvent("option_selected", {
      decision_type: "love_path_choice",
      step_id: stepId,
      choice_id: choiceId,
      choice_label: label,
      resulting_path: nextSelections,
    });
  };

  const chooseLevel = (level: LoveLevel) => {
    setFocusedLevelId(level.id);
    postEvent("option_selected", {
      decision_type: "love_level_focus",
      love_level_id: level.id,
      love_level_label: level.label,
      love_family_id: level.familyId,
      love_family_label: level.familyLabel,
    });
  };

  const goBack = () => {
    if (focusedLevelId) {
      setFocusedLevelId("");
      return;
    }

    setSelections((current) => current.slice(0, -1));
  };

  const restart = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setFocusedLevelId("");
    setSelections([]);
    postEvent("option_selected", { decision_type: "love_path_restart" });
  };

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !candidate) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
        postEvent("option_previewed", {
          candidate_id: candidate.candidate_id,
          volume_step: volumeStep,
          volume_fraction: `${volumeStep}/8`,
        });
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#09070B] text-white">
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="rounded-[2rem] border border-[#FFD54F]/45 bg-[#120A06] p-5 shadow-2xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
              ADMIN REVIEW · LOVE HUGz HUMANIZATION V001
            </p>
            <span className="rounded-full border border-[#FF8A65]/60 bg-[#2A0F0A] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#FFAB91]">
              No public checkout
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Find the kind of love you actually mean.
          </h1>
          <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-[#D7CCC8] sm:text-lg">
            LOVE stays locked as the theme. Every screen offers exactly three human directions. Each answer narrows the next three instead of wandering into another sentiment.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#8D6E63]/45 bg-black/25 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFD54F]">Hidden coverage</p>
              <p className="mt-2 text-2xl font-black">100 LOVE levels</p>
            </div>
            <div className="rounded-2xl border border-[#8D6E63]/45 bg-black/25 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFD54F]">Public choice load</p>
              <p className="mt-2 text-2xl font-black">3 at a time</p>
            </div>
            <div className="rounded-2xl border border-[#8D6E63]/45 bg-black/25 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#FFD54F]">Music evidence gate</p>
              <p className="mt-2 text-2xl font-black">3 MGS dimensions</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] border border-[#8D6E63]/45 bg-[#120A06] p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">Theme anchor</p>
              <p className="mt-1 text-2xl font-black">LOVE</p>
            </div>
            <div className="flex gap-2">
              {(selections.length > 0 || focusedLevelId) && (
                <button
                  type="button"
                  onClick={goBack}
                  className="rounded-xl border border-[#FFD54F]/55 px-4 py-2 text-sm font-black text-[#FFD54F]"
                >
                  Back one decision
                </button>
              )}
              {(selections.length > 0 || focusedLevelId) && (
                <button
                  type="button"
                  onClick={restart}
                  className="rounded-xl border border-white/25 px-4 py-2 text-sm font-black text-white"
                >
                  Restart LOVE path
                </button>
              )}
            </div>
          </div>

          {selections.length > 0 && (
            <div className="mt-5 rounded-2xl border border-[#FFD54F]/25 bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#BCAAA4]">Current human direction</p>
              <p className="mt-2 font-black leading-6 text-[#EFEBE9]">{summarizeLovePath(selections)}</p>
            </div>
          )}

          {nextStep ? (
            <div className="mt-7">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FFD54F]">
                Decision {selections.length + 1}
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">{nextStep.prompt}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {nextStep.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => choosePathOption(nextStep.id, choice.id, choice.label)}
                    className="min-h-44 rounded-[1.5rem] border border-[#8D6E63]/55 bg-[#09070B] p-5 text-left transition hover:border-[#FFD54F] hover:bg-[#1A100B] focus:outline-none focus:ring-2 focus:ring-[#FFD54F]"
                  >
                    <span className="text-xl font-black text-white">{choice.label}</span>
                    <span className="mt-3 block text-sm font-bold leading-6 text-[#BCAAA4]">{choice.detail}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : !focusedLevelId ? (
            <div className="mt-7">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FFD54F]">Next three LOVE positions</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">Which one sounds most like what you mean?</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {rankedLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => chooseLevel(level)}
                    className="min-h-52 rounded-[1.5rem] border border-[#8D6E63]/55 bg-[#09070B] p-5 text-left transition hover:border-[#FFD54F] hover:bg-[#1A100B] focus:outline-none focus:ring-2 focus:ring-[#FFD54F]"
                  >
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-[#FFD54F]">{level.id} · {level.familyLabel}</span>
                    <span className="mt-3 block text-2xl font-black text-white">{level.label}</span>
                    <span className="mt-3 block text-sm font-bold leading-6 text-[#BCAAA4]">{level.familyPromise}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-7">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FFD54F]">Deepen without drifting</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">Choose the closest level inside {depthLevels[0]?.familyLabel}.</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {depthLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => chooseLevel(level)}
                    aria-pressed={focusedLevelId === level.id}
                    className={`min-h-48 rounded-[1.5rem] border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-[#FFD54F] ${
                      focusedLevelId === level.id
                        ? "border-[#FFD54F] bg-[#2A1A08]"
                        : "border-[#8D6E63]/55 bg-[#09070B] hover:border-[#FFD54F] hover:bg-[#1A100B]"
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-[#FFD54F]">{level.id} · level {level.familyLevel}/10</span>
                    <span className="mt-3 block text-2xl font-black text-white">{level.label}</span>
                    <span className="mt-3 block text-sm font-bold leading-6 text-[#BCAAA4]">{level.familyPromise}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!nextStep && focusedLevelId && (
          <section className="mt-6 rounded-[2rem] border border-[#FFD54F]/35 bg-[#120A06] p-5 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">MGS-scoured music review</p>
            {candidate ? (
              <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div>
                  <h2 className="text-3xl font-black">Current candidate: {candidate.title}</h2>
                  <p className="mt-3 text-sm font-bold leading-6 text-[#D7CCC8]">
                    This candidate is shown only because it has evidence from three different MGS dimensions and overlaps the active LOVE path. It is not publicly released by this implementation.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {candidate.mgs_evidence.map((evidence) => (
                      <div key={evidence.dimension} className="rounded-2xl border border-[#8D6E63]/45 bg-black/25 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#FFD54F]">{evidence.dimension}</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-[#EFEBE9]">{evidence.tags.join(" · ")}</p>
                        <p className="mt-2 text-xs font-bold text-[#8D6E63]">{evidence.source}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#FF8A65]/45 bg-[#2A0F0A] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#FFAB91]">Excluded paths</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#FFCCBC]">{candidate.exclusions.join(" · ")}</p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[#8D6E63]/45 bg-[#09070B] p-5">
                  <audio
                    ref={audioRef}
                    src={candidate.preview_url}
                    preload="metadata"
                    onEnded={() => setIsPlaying(false)}
                  />
                  <button
                    type="button"
                    onClick={toggleAudio}
                    className="w-full rounded-xl bg-[#FFD54F] px-5 py-4 text-base font-black text-black"
                  >
                    {isPlaying ? "Pause review audio" : "Play review audio"}
                  </button>

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor="love-review-volume" className="text-sm font-black text-white">Local listening volume</label>
                      <span className="rounded-full border border-[#FFD54F]/45 px-3 py-1 text-sm font-black text-[#FFD54F]">{volumeStep}/8</span>
                    </div>
                    <input
                      id="love-review-volume"
                      type="range"
                      min={0}
                      max={8}
                      step={1}
                      value={volumeStep}
                      onChange={(event) => setVolumeStep(Number(event.target.value))}
                      className="mt-4 w-full accent-[#FFD54F]"
                    />
                    <div className="mt-2 flex justify-between text-[10px] font-black text-[#8D6E63]" aria-hidden="true">
                      {Array.from({ length: 9 }, (_, index) => (
                        <span key={index}>{index}</span>
                      ))}
                    </div>
                    <p className="mt-4 text-xs font-bold leading-5 text-[#BCAAA4]">
                      This changes only this listener's browser playback. It does not alter source audio, the stored II, delivery audio, Twinkle, or SHA.
                    </p>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/15 bg-white/5 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#BCAAA4]">ADMIN note</p>
                    <p className="mt-2 text-sm font-bold leading-6 text-[#EFEBE9]">{candidate.note}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[1.5rem] border border-[#FF8A65]/45 bg-[#2A0F0A] p-5">
                <h2 className="text-2xl font-black text-white">No exact music candidate passed this path.</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-[#FFCCBC]">
                  Do not substitute a merely similar song. Continue scouring KKs, BLKs, and KOMBOs across MGS evidence until at least three independent dimensions support the same LOVE direction.
                </p>
              </div>
            )}
          </section>
        )}

        <section className="mt-6 rounded-[2rem] border border-[#8D6E63]/45 bg-[#120A06] p-5 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">ADMIN decision trace</p>
          <div className="mt-4 space-y-2">
            {selections.length === 0 ? (
              <p className="text-sm font-bold text-[#BCAAA4]">No path decisions yet.</p>
            ) : (
              selections.map((selection, index) => (
                <div key={`${selection.stepId}-${selection.choiceId}`} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold">
                  DP {index + 1}: {selection.stepId} → {selection.label}
                </div>
              ))
            )}
            {focusedLevelId && (
              <div className="rounded-xl border border-[#FFD54F]/30 bg-[#2A1A08] px-4 py-3 text-sm font-black text-[#FFD54F]">
                LOVE position focus → {focusedLevelId}
              </div>
            )}
          </div>
          <p className="mt-5 text-xs font-bold leading-5 text-[#8D6E63]">
            This branch records review decisions but does not enact a public product, price, checkout, deployment, BLK boundary, KK boundary, KOMBO, or final-II release.
          </p>
        </section>
      </section>
    </main>
  );
}
