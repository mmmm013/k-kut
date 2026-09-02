"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";
import { useEffect, useReducer } from "react";
import HtbCard from "./HtbCard";
import BugMascot from "./mascots/BugMascot";
import HugMascot from "./mascots/HugMascot";
import TugMascot from "./mascots/TugMascot";
import {
  INITIAL_HTB_STATE,
  MODE_COMPOSER_PROMPT,
  MODE_HELPER_INTENT,
  reduceHtbState,
  type TierMode,
} from "@/lib/landing/htbMachine";

const INTRO_MS = 2300;
const REDUCED_INTRO_MS = 500;
const COMPOSER_DELAY_MS = 240;
const MODES: TierMode[] = ["HUG", "TUG", "BUG"];

function emitLandingEvent(eventName: string, mode?: TierMode) {
  try {
    track(eventName, mode ? { mode } : undefined);
  } catch {
    // TODO: keep no-op analytics fallback.
  }
}

export default function HtbHero({
  headline = "Send the Sent-i-Meant.",
}: {
  headline?: string;
}) {
  const [state, dispatch] = useReducer(reduceHtbState, INITIAL_HTB_STATE);
  const isChooserState =
    state.stage === "CHOOSER_IDLE" || state.stage === "CHOOSER_HOVER_PREVIEW";
  const selectedMode = state.selectedMode;

  useEffect(() => {
    emitLandingEvent("landing_intro_shown");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setTimeout(
      () => dispatch({ type: "INTRO_COMPLETE" }),
      media.matches ? REDUCED_INTRO_MS : INTRO_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.stage !== "MODE_SELECTED" || !state.selectedMode) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: "OPEN_COMPOSER" });
      emitLandingEvent("landing_composer_opened", state.selectedMode || undefined);
    }, COMPOSER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [state.stage, state.selectedMode]);

  const handleSelect = (mode: TierMode) => {
    dispatch({ type: "SELECT_MODE", mode });
    emitLandingEvent("landing_tier_selected", mode);
  };

  const handlePreview = (mode: TierMode) => {
    dispatch({ type: "HOVER_MODE", mode });
    emitLandingEvent("landing_tier_hovered", mode);
  };

  return (
    <header className="rounded-[2.25rem] border border-[#FFD54F]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-7 shadow-2xl md:p-12">
      <p className="text-xs font-black uppercase tracking-[0.42em] text-[#FFD54F]">
        G Putnam Music · K-KUT
      </p>

      {state.stage === "WILD_INTRO" ? (
        <div className="mt-5 rounded-3xl border border-[#FFD54F]/40 bg-black/30 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black leading-tight text-[#FFF8E1] md:text-5xl">{headline}</h1>
              <p className="mt-3 text-sm font-bold text-[#EFEBE9]">Warming up HUG, TUG, and BUG.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "INTRO_SKIPPED" });
                emitLandingEvent("landing_intro_skipped");
              }}
              className="rounded-xl border border-[#FFD54F]/70 px-4 py-2 text-sm font-black text-[#FFD54F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD54F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120A06]"
            >
              Skip animation
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <HugMascot isPreview />
            <TugMascot isPreview />
            <BugMascot isPreview />
          </div>
        </div>
      ) : null}

      {isChooserState ? (
        <section
          className="mt-5"
          onKeyDown={(event) => {
            if (event.key === "1") handleSelect("HUG");
            if (event.key === "2") handleSelect("TUG");
            if (event.key === "3") handleSelect("BUG");
          }}
        >
          <h1 className="text-3xl font-black leading-tight text-[#FFF8E1] md:text-5xl">What do you want to send?</h1>
          <p className="mt-4 text-lg font-black text-[#EFEBE9]">Do you want a HUG, TUG, or BUG?</p>
          <div role="listbox" aria-label="Choose HUG TUG or BUG" className="mt-5 grid gap-4 md:grid-cols-3">
            {MODES.map((mode) => (
              <HtbCard
                key={mode}
                mode={mode}
                isPreview={state.previewMode === mode}
                isFocused={state.previewMode === mode}
                onSelect={handleSelect}
                onPreview={handlePreview}
                onPreviewEnd={() => dispatch({ type: "CLEAR_HOVER" })}
              />
            ))}
          </div>
        </section>
      ) : null}

      {state.stage === "MODE_SELECTED" || state.stage === "COMPOSER_ACTIVE" ? (
        <section
          className={`mt-6 rounded-3xl border border-[#FFD54F]/40 bg-black/35 p-6 transition-all duration-300 motion-reduce:duration-150 ${
            state.stage === "MODE_SELECTED" ? "opacity-70" : "opacity-100"
          }`}
          aria-live="polite"
        >
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">Composer mode</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-[#FFF8E1] md:text-5xl">
            {selectedMode ? MODE_COMPOSER_PROMPT[selectedMode] : ""}
          </h1>
          <p className="mt-4 text-base font-bold text-[#EFEBE9]">
            {selectedMode ? MODE_HELPER_INTENT[selectedMode] : ""}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={selectedMode ? `/find?mode=${selectedMode.toLowerCase()}` : "/find"}
              className="rounded-2xl bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#160A05]"
            >
              Open Composer
            </Link>
            <button
              type="button"
              onClick={() => dispatch({ type: "RESET_CHOOSER" })}
              className="rounded-2xl border border-[#FFD54F]/70 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#FFD54F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD54F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#120A06]"
            >
              Pick a different tier
            </button>
          </div>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/hug"
          className="rounded-2xl bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#160A05]"
        >
          See all offers
        </Link>
        <Link
          href="/find"
          className="rounded-2xl border border-[#FFD54F]/70 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#FFD54F]"
        >
          Find the right moment
        </Link>
      </div>
    </header>
  );
}
