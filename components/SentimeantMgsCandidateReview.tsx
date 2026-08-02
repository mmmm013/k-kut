"use client";

import { useMemo, useRef, useState } from "react";
import {
  buildReviewCandidates,
  REVIEW_CANDIDATE_STATUS,
} from "@/lib/sentimeant/mcBotReviewWorkflow.mjs";

type Props = {
  themeId: string;
  themeLabel: string;
  directionTitle: string;
  relationshipLabel: string;
  mgsThemes: string[];
  onRefineSentence: () => void;
  onChangeDirection: () => void;
};

type ReviewState = "ready" | "reviewing" | "no-fit" | "confirmed";

export default function SentimeantMgsCandidateReview({
  themeId,
  themeLabel,
  directionTitle,
  relationshipLabel,
  mgsThemes,
  onRefineSentence,
  onChangeDirection,
}: Props) {
  const [reviewState, setReviewState] = useState<ReviewState>("ready");
  const [revision, setRevision] = useState(0);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const reviewRef = useRef<HTMLDivElement>(null);

  const candidates = useMemo(
    () =>
      buildReviewCandidates({
        themeId,
        directionTitle,
        relationshipLabel,
        revision,
      }),
    [directionTitle, relationshipLabel, revision, themeId],
  );

  const selectedCandidate =
    candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null;

  function scrollToReview() {
    window.requestAnimationFrame(() => {
      reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function beginReview() {
    setReviewState("reviewing");
    setSelectedCandidateId("");
    scrollToReview();
  }

  function showDifferentCandidates() {
    setRevision((value) => value + 1);
    setSelectedCandidateId("");
    setReviewState("reviewing");
    scrollToReview();
  }

  if (reviewState === "ready") {
    return (
      <section className="mt-7 rounded-[1.5rem] border-2 border-[#9c624b]/35 bg-[#fffaf4] p-6 text-[#4b271c] shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a35539]">
          Next working step
        </p>
        <h3 className="mt-3 font-serif text-2xl font-black sm:text-3xl">
          Compare the confirmed direction with three explained test candidates.
        </h3>
        <p className="mt-3 max-w-4xl font-bold leading-7 text-[#76503f]">
          This tests the complete MGS conversation and refinement workflow. These
          records are not KKs, KOMBOs, IIs, audio, prices, or inventory. Real music
          remains blocked until today&apos;s revised MGS outputs are verified.
        </p>
        <button
          type="button"
          onClick={beginReview}
          className="mt-5 rounded-2xl bg-[#8f412e] px-6 py-4 text-base font-black text-white shadow-lg transition hover:bg-[#713020] focus:outline-none focus:ring-4 focus:ring-[#9c624b]/30"
        >
          Continue to MGS comparison
        </button>
      </section>
    );
  }

  if (reviewState === "no-fit") {
    return (
      <section
        className="mt-7 scroll-mt-28 rounded-[1.75rem] border-2 border-amber-700/35 bg-amber-50 p-6 text-amber-950 sm:p-8"
        ref={reviewRef}
      >
        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-800">
          No suitable test candidate
        </p>
        <h3 className="mt-3 font-serif text-3xl font-black">
          Do not force a match.
        </h3>
        <p className="mt-4 max-w-4xl font-bold leading-7">
          The user-side direction remains confirmed, but none of these three test
          profiles is acceptable. In the live governed system, unmatched KKs or
          KOMBOs remain outside presentation rather than being forced into a theme.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={showDifferentCandidates}
            className="rounded-2xl bg-[#8f412e] px-5 py-3 text-sm font-black text-white hover:bg-[#713020]"
          >
            Show three different candidates
          </button>
          <button
            type="button"
            onClick={onChangeDirection}
            className="rounded-2xl border border-amber-800/40 bg-white px-5 py-3 text-sm font-black"
          >
            Change the direction
          </button>
          <button
            type="button"
            onClick={onRefineSentence}
            className="rounded-2xl border border-amber-800/40 bg-white px-5 py-3 text-sm font-black"
          >
            Refine the sentence
          </button>
        </div>
      </section>
    );
  }

  if (reviewState === "confirmed" && selectedCandidate) {
    return (
      <section
        className="mt-7 scroll-mt-28 rounded-[1.75rem] border-2 border-emerald-700/35 bg-emerald-50 p-6 text-emerald-950 sm:p-8"
        ref={reviewRef}
      >
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800">
          Complete review workflow passed
        </p>
        <h3 className="mt-3 font-serif text-3xl font-black sm:text-4xl">
          {selectedCandidate.title}
        </h3>
        <p className="mt-4 max-w-4xl font-bold leading-7">
          The user confirmed a test match after classification, direction choice,
          MGS comparison, candidate explanation, and refinement controls.
        </p>
        <dl className="mt-6 grid gap-4 rounded-2xl border border-emerald-800/20 bg-white/70 p-5 md:grid-cols-2">
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">Relationship</dt>
            <dd className="mt-1 font-black">{relationshipLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">Direction</dt>
            <dd className="mt-1 font-black">{directionTitle}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">Public theme</dt>
            <dd className="mt-1 font-black">{themeLabel}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-[0.16em] text-emerald-800">MGS themes</dt>
            <dd className="mt-1 font-black">{mgsThemes.join(", ")}</dd>
          </div>
        </dl>
        <p className="mt-5 rounded-2xl border border-emerald-800/20 bg-white/70 p-4 text-sm font-black leading-6">
          Status: {REVIEW_CANDIDATE_STATUS}. No KK/KOMBO ID, audio URL, price,
          inventory approval, checkout, fulfillment, or delivery was created.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setReviewState("reviewing")}
            className="rounded-2xl bg-emerald-800 px-5 py-3 text-sm font-black text-white hover:bg-emerald-900"
          >
            Change the test candidate
          </button>
          <button
            type="button"
            onClick={showDifferentCandidates}
            className="rounded-2xl border border-emerald-800/30 bg-white px-5 py-3 text-sm font-black"
          >
            Show three different candidates
          </button>
          <button
            type="button"
            onClick={onRefineSentence}
            className="rounded-2xl border border-emerald-800/30 bg-white px-5 py-3 text-sm font-black"
          >
            Start a new sentence
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="mt-7 scroll-mt-28 rounded-[1.75rem] border border-[#d8b9a3] bg-[#fff7ed] p-6 text-[#4b271c] sm:p-8"
      ref={reviewRef}
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a35539]">
        Two-sided MGS workflow test
      </p>
      <h3 className="mt-3 font-serif text-3xl font-black sm:text-4xl">
        Which explained candidate comes closest?
      </h3>
      <p className="mt-3 max-w-4xl font-bold leading-7 text-[#76503f]">
        User side: {relationshipLabel} · {themeLabel} · {directionTitle}. Compare
        against {mgsThemes.join(", ")} evidence. Exactly three non-inventory test
        records are shown.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {candidates.map((candidate) => {
          const chosen = candidate.id === selectedCandidateId;
          return (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={chosen}
              onClick={() => setSelectedCandidateId(candidate.id)}
              className={`rounded-[1.5rem] border p-5 text-left transition focus:outline-none focus:ring-4 focus:ring-[#9c624b]/25 ${
                chosen
                  ? "border-[#8f412e] bg-[#f3d8c6] shadow-lg"
                  : "border-[#d6ae97] bg-white hover:-translate-y-1 hover:border-[#8f412e] hover:shadow-lg"
              }`}
            >
              <span className="text-xs font-black uppercase tracking-[0.15em] text-[#a35539]">
                {candidate.fitLevel}
              </span>
              <span className="mt-3 block font-serif text-2xl font-black text-[#4b271c]">
                {candidate.title}
              </span>
              <span className="mt-3 block text-sm font-bold leading-6 text-[#76503f]">
                {candidate.summary}
              </span>
              <span className="mt-4 block text-xs font-black uppercase tracking-[0.12em] text-[#8f412e]">
                Why it may fit
              </span>
              <span className="mt-2 block text-sm font-bold leading-6 text-[#76503f]">
                {candidate.evidence.join(" · ")}
              </span>
              <span className="mt-4 block text-xs font-black uppercase tracking-[0.12em] text-[#8f412e]">
                Concern
              </span>
              <span className="mt-2 block text-sm font-bold leading-6 text-[#76503f]">
                {candidate.concern}
              </span>
              <span className="mt-5 block text-sm font-black text-[#99472f]">
                {chosen ? "Candidate selected ✓" : "This comes closest →"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!selectedCandidate}
          onClick={() => setReviewState("confirmed")}
          className="rounded-2xl bg-[#8f412e] px-5 py-3 text-sm font-black text-white hover:bg-[#713020] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Confirm this test match
        </button>
        <button
          type="button"
          onClick={showDifferentCandidates}
          className="rounded-2xl border border-[#9c624b] bg-white px-5 py-3 text-sm font-black"
        >
          Show three different candidates
        </button>
        <button
          type="button"
          onClick={() => setReviewState("no-fit")}
          className="rounded-2xl border border-[#9c624b] bg-white px-5 py-3 text-sm font-black"
        >
          None of these fit
        </button>
        <button
          type="button"
          onClick={onChangeDirection}
          className="rounded-2xl border border-[#9c624b] bg-white px-5 py-3 text-sm font-black"
        >
          Change the direction
        </button>
      </div>
    </section>
  );
}
