"use client";

import { useState } from "react";

export default function BBBotDemo() {
  const [step, setStep] = useState(1);
  const [feeling, setFeeling] = useState<string | null>(null);

  const selectFeeling = (f: string) => {
    setFeeling(f);
    setStep(2);
  };

  return (
    <div className="border border-[#D4A017]/30 rounded p-6 bg-[#0E0E0E]">

      <h3 className="text-lg font-semibold text-[#D4A017]">
        BB BOT — Guided Flow
      </h3>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="mt-4">
          <p className="text-[#E8CFA8]">
            What feeling are you looking for?
          </p>

          <div className="mt-4 flex gap-3 flex-wrap">
            {["Romance", "Heart", "Apology", "Gratitude"].map((f) => (
              <button
                key={f}
                onClick={() => selectFeeling(f)}
                className="px-4 py-2 border border-[#D4A017] rounded text-[#D4A017] hover:bg-[#D4A017]/10"
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="mt-4">
          <p className="text-[#E8CFA8]">
            Got it — <span className="text-[#D4A017]">{feeling}</span>.
            Choose your tone:
          </p>

          <div className="mt-4 space-y-2">
            {["Soft", "Cinematic", "Intimate"].map((opt) => (
              <div
                key={opt}
                className="p-3 border border-[#333] rounded"
              >
                Option — {opt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SAFETY / EXPERIENCE FILTER */}
      <div className="mt-6 text-xs text-[#777]">
        GP Experience: Love. Care. Share.
      </div>

    </div>
  );
}