"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SentimeantMgsCandidateReview from "@/components/SentimeantMgsCandidateReview";
import {
  classifySituation,
  RELATIONSHIP_CHOICES,
  SENTIMEANT_THEMES,
  type Relationship,
  type ThemeId,
} from "@/lib/sentimeant/mcBotThemeEngine.mjs";

type Props = {
  initialFeelingId?: string;
  initialFeelingLabel?: string;
};

export default function SentimeantMcBotIntentReview({
  initialFeelingId = "",
  initialFeelingLabel = "",
}: Props) {
  const [relationship, setRelationship] = useState<Relationship>("anyone");
  const [story, setStory] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [manualThemeId, setManualThemeId] = useState<ThemeId | null>(null);
  const [selectedDirection, setSelectedDirection] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const result = useMemo(
    () =>
      classifySituation({
        text: story,
        relationship,
        startingFeelingId: initialFeelingId,
      }),
    [initialFeelingId, relationship, story],
  );

  const activeTheme = manualThemeId
    ? result.rankings.find((theme) => theme.id === manualThemeId) ?? result.top
    : result.top;

  const needsClarification = submitted && !manualThemeId && result.needsClarification;

  useEffect(() => {
    if (!submitted) return;
    window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [manualThemeId, submitted]);

  function resetResult() {
    setSubmitted(false);
    setManualThemeId(null);
    setSelectedDirection("");
  }

  function submitStory() {
    if (!story.trim()) return;
    setManualThemeId(null);
    setSelectedDirection("");
    setSubmitted(true);
  }

  function refineSentence() {
    setSubmitted(false);
    setManualThemeId(null);
    setSelectedDirection("");
    window.requestAnimationFrame(() => {
      document.getElementById("sentimeant-story")?.focus();
    });
  }

  function startOver() {
    setRelationship("anyone");
    setStory("");
    setSubmitted(false);
    setManualThemeId(null);
    setSelectedDirection("");
  }

  return (
    <section className="rounded-[2rem] border border-[#d8b9a3] bg-[#fffaf4] p-5 text-[#3b241b] shadow-xl sm:p-8 md:p-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#a35539]">
            MC-BOT · Guided start
          </p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-black leading-tight text-[#4b271c] sm:text-6xl">
            Tell me what happened in one sentence.
          </h1>
          <p className="mt-5 max-w-3xl text-base font-bold leading-7 text-[#684334] sm:text-lg sm:leading-8">
            I will identify the closest emotional direction, ask one clarifying
            question only when needed, and show three directions. After you choose
            one, the review continues through MGS comparison, candidate refinement,
            and final confirmation.
          </p>
        </div>

        <div className="rounded-2xl border border-[#d6ae97] bg-[#f8e7da] px-5 py-4 text-sm font-black leading-6 text-[#6f3827]">
          Complete review workflow
          <br />
          No audio · No II assignment · No checkout
        </div>
      </div>

      {initialFeelingLabel ? (
        <div className="mt-7 rounded-2xl border border-[#d8b9a3] bg-[#f6dfcf] p-4 text-sm font-bold leading-6 text-[#6f4938]">
          You began with: <strong>{initialFeelingLabel}</strong>. Your sentence
          remains the stronger evidence; MC-BOT may identify a closer direction.
        </div>
      ) : null}

      <section className="mt-7 rounded-[1.75rem] border border-[#d8b9a3] bg-white/80 p-5 sm:p-7">
        <h2 className="font-serif text-2xl font-black text-[#4b271c] sm:text-3xl">
          1. Who is this for?
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {RELATIONSHIP_CHOICES.map((choice) => {
            const active = relationship === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setRelationship(choice.id);
                  resetResult();
                }}
                className={`rounded-full border px-5 py-3 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-[#9c624b]/25 ${
                  active
                    ? "border-[#8f412e] bg-[#8f412e] text-white"
                    : "border-[#c9977d] bg-[#fffaf4] text-[#653827] hover:bg-[#f3d8c6]"
                }`}
              >
                {choice.label}
              </button>
            );
          })}
        </div>

        <label className="mt-7 block" htmlFor="sentimeant-story">
          <span className="font-serif text-2xl font-black text-[#4b271c] sm:text-3xl">
            2. What happened?
          </span>
          <span className="mt-2 block text-sm font-bold text-[#76503f]">
            One ordinary sentence is enough.
          </span>
          <textarea
            id="sentimeant-story"
            value={story}
            onChange={(event) => {
              setStory(event.target.value);
              resetResult();
            }}
            className="mt-4 min-h-32 w-full rounded-2xl border-2 border-[#c9977d] bg-white p-4 text-base font-bold leading-7 text-[#35180f] outline-none focus:border-[#8f412e] focus:ring-4 focus:ring-[#9c624b]/20"
            placeholder="Example: My wife is mad at me."
          />
        </label>

        <button
          type="button"
          onClick={submitStory}
          disabled={!story.trim()}
          className="mt-5 rounded-2xl bg-[#8f412e] px-7 py-4 text-base font-black text-white shadow-lg transition hover:bg-[#713020] disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-4 focus:ring-[#9c624b]/30"
        >
          Find the right feeling
        </button>
      </section>

      {submitted ? (
        <div className="scroll-mt-28" ref={resultRef}>
          {result.safetyHold ? (
            <section className="mt-7 rounded-[1.75rem] border-2 border-red-700 bg-red-50 p-6 text-red-950 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-red-800">
                Human safety first
              </p>
              <h2 className="mt-3 font-serif text-3xl font-black">
                This should not continue as a sales flow.
              </h2>
              <p className="mt-4 font-bold leading-7">
                Sent-i-Meants will not recommend or test a product match from this
                message. Reach a trusted person who can be physically present and
                contact local emergency services when immediate danger exists.
              </p>
              <button
                type="button"
                onClick={startOver}
                className="mt-5 rounded-2xl border border-red-800/40 bg-white px-5 py-3 text-sm font-black"
              >
                Clear this message
              </button>
            </section>
          ) : needsClarification ? (
            <section className="mt-7 rounded-[1.75rem] border border-[#d8b9a3] bg-[#fff7ed] p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#a35539]">
                One quick question
              </p>
              <h2 className="mt-3 font-serif text-3xl font-black text-[#4b271c] sm:text-4xl">
                What would help most right now?
              </h2>
              <p className="mt-3 font-bold leading-7 text-[#76503f]">
                Your sentence could reasonably point in more than one direction.
                Choose the closest one.
              </p>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {result.rankings.slice(0, 3).map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setManualThemeId(theme.id);
                      setSelectedDirection("");
                    }}
                    className="rounded-[1.5rem] border border-[#c9977d] bg-white p-5 text-left transition hover:-translate-y-1 hover:border-[#8f412e] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#9c624b]/25"
                  >
                    <span className="text-3xl" aria-hidden="true">
                      {theme.icon}
                    </span>
                    <span className="mt-3 block font-serif text-xl font-black text-[#4b271c]">
                      {theme.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="mt-7 rounded-[1.75rem] border border-[#d8b9a3] bg-[#fff7ed] p-6 sm:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-[#a35539]">
                    Closest emotional direction · {result.confidence} confidence
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-4xl" aria-hidden="true">
                      {activeTheme.icon}
                    </span>
                    <h2 className="font-serif text-3xl font-black text-[#4b271c] sm:text-5xl">
                      {activeTheme.label}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={refineSentence}
                  className="rounded-full border border-[#9c624b] px-4 py-2 text-sm font-black text-[#653827] hover:bg-[#f5dfd0]"
                >
                  Refine the sentence
                </button>
              </div>

              <blockquote className="mt-6 rounded-2xl border border-[#d8b9a3] bg-white p-5 font-bold leading-7 text-[#5e392b]">
                “{story.trim()}”
              </blockquote>

              {result.startingFeelingMismatch && !manualThemeId ? (
                <p className="mt-5 rounded-2xl border border-[#d9a96f] bg-[#fff1d7] p-4 font-bold leading-7 text-[#6f3b1f]">
                  You began with {result.startingFeelingLabel}, but your sentence
                  sounds closer to {activeTheme.label}. MC-BOT followed your words.
                </p>
              ) : null}

              <p className="mt-6 text-xl font-black leading-8 text-[#4b271c]">
                {activeTheme.acknowledgment}
              </p>
              <p className="mt-2 font-bold leading-7 text-[#76503f]">
                {activeTheme.prompt}
              </p>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {activeTheme.recommendations.map((direction) => {
                  const chosen = selectedDirection === direction.title;
                  return (
                    <button
                      key={direction.title}
                      type="button"
                      aria-pressed={chosen}
                      onClick={() => setSelectedDirection(direction.title)}
                      className={`rounded-[1.5rem] border p-5 text-left transition focus:outline-none focus:ring-4 focus:ring-[#9c624b]/25 ${
                        chosen
                          ? "border-[#8f412e] bg-[#f3d8c6] shadow-lg"
                          : "border-[#d6ae97] bg-white hover:-translate-y-1 hover:border-[#8f412e] hover:shadow-lg"
                      }`}
                    >
                      <span className="font-serif text-xl font-black text-[#4b271c]">
                        {direction.title}
                      </span>
                      <span className="mt-3 block text-sm font-bold leading-6 text-[#76503f]">
                        {direction.line}
                      </span>
                      <span className="mt-5 block text-sm font-black text-[#99472f]">
                        {chosen ? "Direction selected ✓" : "Use this direction →"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDirection ? (
                <>
                  <div className="mt-7 rounded-[1.5rem] border-2 border-emerald-700/35 bg-emerald-50 p-6 text-emerald-950">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800">
                      User-side direction confirmed
                    </p>
                    <h3 className="mt-3 font-serif text-2xl font-black sm:text-3xl">
                      {selectedDirection}
                    </h3>
                    <p className="mt-3 font-bold leading-7">
                      Relationship: {result.relationshipLabel}
                      <br />
                      Public direction: {activeTheme.label}
                      <br />
                      MGS themes: {activeTheme.mgsThemes.join(", ")}
                    </p>
                  </div>

                  <SentimeantMgsCandidateReview
                    themeId={activeTheme.id}
                    themeLabel={activeTheme.label}
                    directionTitle={selectedDirection}
                    relationshipLabel={result.relationshipLabel}
                    mgsThemes={activeTheme.mgsThemes}
                    onRefineSentence={refineSentence}
                    onChangeDirection={() => setSelectedDirection("")}
                  />
                </>
              ) : null}
            </section>
          )}
        </div>
      ) : null}

      <section className="mt-7 rounded-[1.5rem] border border-[#d8b9a3] bg-[#f8e7da] p-5 text-sm font-bold leading-7 text-[#76503f]">
        <p className="font-black text-[#5b3023]">Governed theme map</p>
        <p className="mt-2">
          {SENTIMEANT_THEMES.map((theme) => theme.label).join(" · ")}
        </p>
        <p className="mt-3">
          Test candidates exercise the workflow only. Real NKK/BLK theme fits and
          every child KK/KOMBO require independent evidence. Anything without a
          defensible match remains <strong>NO THEME FIT — HOLD</strong>.
        </p>
      </section>

      <button
        type="button"
        onClick={startOver}
        className="mt-6 rounded-full border border-[#9c624b] px-5 py-3 text-sm font-black text-[#653827] hover:bg-[#f5dfd0]"
      >
        Start over
      </button>
    </section>
  );
}
