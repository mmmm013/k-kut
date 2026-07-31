"use client";

import { useMemo, useState } from "react";
import intentFlow from "@/data/sentimeant/mc-bot-intent-flow-v001.json";

type FlowOption = {
  id: string;
  label: string;
  helper: string;
};

type FlowStep = {
  id: string;
  eyebrow: string;
  prompt: string;
  options: FlowOption[];
};

type AnswerMap = Record<string, FlowOption>;

const steps = intentFlow.steps as FlowStep[];

export default function SentimeantMcBotIntentReview() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});

  const complete = stepIndex >= steps.length;
  const currentStep = complete ? null : steps[stepIndex];

  const summary = useMemo(
    () =>
      steps
        .map((step) => ({
          step,
          answer: answers[step.id],
        }))
        .filter((item) => Boolean(item.answer)),
    [answers],
  );

  function choose(option: FlowOption) {
    if (!currentStep) return;

    setAnswers((current) => ({
      ...current,
      [currentStep.id]: option,
    }));
    setStepIndex((current) => Math.min(current + 1, steps.length));
  }

  function goBack() {
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function startOver() {
    setAnswers({});
    setStepIndex(0);
  }

  return (
    <section className="rounded-[2rem] border border-[#FFD54F]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-6 shadow-2xl sm:p-8 md:p-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            MC-BOT · Sentimeant review
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            What do you want the music to mean?
          </h1>
          <p className="mt-5 max-w-3xl text-base font-bold leading-7 text-[#EFEBE9] sm:text-lg sm:leading-8">
            MC-BOT guides one decision at a time. Your choices create customer-side metadata for later comparison with approved LT-PIX and KK evidence through MetaGrab Sets.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-300/35 bg-amber-950/25 px-5 py-4 text-sm font-black leading-6 text-amber-100">
          Review mode<br />
          No audio · No II assignment · No checkout
        </div>
      </div>

      <div className="mt-8 grid gap-2 sm:grid-cols-3">
        {steps.map((step, index) => {
          const active = index === stepIndex;
          const finished = Boolean(answers[step.id]);

          return (
            <div
              key={step.id}
              className={`rounded-xl border px-4 py-3 text-sm font-black ${
                active
                  ? "border-[#FFD54F] bg-[#FFD54F] text-black"
                  : finished
                    ? "border-emerald-400/40 bg-emerald-950/25 text-emerald-100"
                    : "border-[#8D6E63]/35 bg-black/25 text-[#BCAAA4]"
              }`}
            >
              {index + 1}. {step.eyebrow}
            </div>
          );
        })}
      </div>

      {!complete && currentStep ? (
        <div className="mt-8 rounded-[1.75rem] border border-[#8D6E63]/40 bg-black/25 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
            MC-BOT asks
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            {currentStep.prompt}
          </h2>
          <p className="mt-3 text-sm font-bold leading-6 text-[#BCAAA4]">
            Choose the closest answer. Exactly three directions are shown at a time.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {currentStep.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option)}
                className="min-h-40 rounded-[1.5rem] border border-[#FFD54F]/35 bg-[#120A06] p-5 text-left transition hover:border-[#FFD54F] hover:bg-[#211108] focus:outline-none focus:ring-4 focus:ring-[#FFD54F]/30"
              >
                <span className="block text-xl font-black text-[#FFF8E1]">
                  {option.label}
                </span>
                <span className="mt-3 block text-sm font-bold leading-6 text-[#D7CCC8]">
                  {option.helper}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-[1.75rem] border border-emerald-400/35 bg-emerald-950/20 p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">
            MC-BOT captured the direction
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            MGS direction ready for review
          </h2>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-emerald-100/85">
            This review stops before music matching. It does not select, name, approve, price, or deliver any II.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {summary.map(({ step, answer }) => (
              <article
                key={step.id}
                className="rounded-2xl border border-emerald-300/25 bg-black/25 p-5"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
                  {step.eyebrow}
                </p>
                <p className="mt-2 text-xl font-black text-white">
                  {answer.label}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="rounded-xl border border-[#FFD54F]/60 px-5 py-3 text-sm font-black text-[#FFD54F]"
          >
            Back one step
          </button>
        ) : null}

        {stepIndex > 0 ? (
          <button
            type="button"
            onClick={startOver}
            className="rounded-xl border border-[#8D6E63]/55 px-5 py-3 text-sm font-black text-[#D7CCC8]"
          >
            Start over
          </button>
        ) : null}
      </div>

      <p className="mt-7 border-t border-[#8D6E63]/30 pt-5 text-xs font-bold leading-6 text-[#BCAAA4]">
        Nothing entered here is saved or sent. Approved customer audio, inventory lookup, payment, fulfillment, and delivery remain blocked in this review branch.
      </p>
    </section>
  );
}
