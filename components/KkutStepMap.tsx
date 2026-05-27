"use client";

import React from "react";

export type KkutFlowStepId = "start" | "need" | "moment" | "feel" | "choose" | "send";

export const KKUT_FLOW_STEPS: Array<{ id: KkutFlowStepId; label: string; helper: string }> = [
  { id: "start", label: "Start", helper: "What are HUGs?" },
  { id: "need", label: "Need", helper: "What should it say?" },
  { id: "moment", label: "Moment", helper: "What is the occasion?" },
  { id: "feel", label: "Feel", helper: "What tone fits?" },
  { id: "choose", label: "Choose", helper: "Hear and select." },
  { id: "send", label: "Send", helper: "Review, pay, deliver." },
];

export function KkutStepMap({
  currentStep,
  onStepChange,
}: {
  currentStep: KkutFlowStepId;
  onStepChange?: (step: KkutFlowStepId) => void;
}) {
  const currentIndex = KKUT_FLOW_STEPS.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="K-KUT HUG progress" className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {KKUT_FLOW_STEPS.map((step, index) => {
          const active = step.id === currentStep;
          const done = index < currentIndex;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange?.(step.id)}
              className={[
                "rounded-2xl border p-3 text-left transition",
                active
                  ? "border-pink-200 bg-pink-200 text-neutral-950"
                  : done
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 bg-neutral-900 text-neutral-300",
              ].join(" ")}
              aria-current={active ? "step" : undefined}
            >
              <div className="text-xs font-black uppercase tracking-wide">{index + 1}. {step.label}</div>
              <div className="mt-1 text-xs opacity-80">{step.helper}</div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
