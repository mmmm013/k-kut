"use client";

import { useMemo, useState } from "react";
import intentFlow from "@/data/sentimeant/mc-bot-intent-flow-v001.json";
import themeFitLaw from "@/data/sentimeant/nkk-blk-theme-fit-law-v001.json";

type Choice = {
  id: string;
  label: string;
  helper: string;
};

type StartingDirection = Choice & {
  theme_choices: string[];
};

type Theme = {
  id: string;
  label: string;
  meaning: string;
};

type Phase =
  | "expression"
  | "theme"
  | "tone"
  | "relationship"
  | "reflection"
  | "complete";

const startingDirections =
  intentFlow.starting_directions as StartingDirection[];
const toneChoices = intentFlow.tone_choices as Choice[];
const relationshipChoices = intentFlow.relationship_choices as Choice[];
const confirmationChoices = intentFlow.confirmation_choices as Choice[];
const themes = themeFitLaw.themes as Theme[];
const fitLevels = themeFitLaw.fit_levels as Array<{
  id: string;
  label: string;
  rule: string;
}>;

const phaseOrder: Phase[] = [
  "expression",
  "theme",
  "tone",
  "relationship",
  "reflection",
  "complete",
];

const phaseLabels: Record<Phase, string> = {
  expression: "Your words",
  theme: "Theme direction",
  tone: "Presentation",
  relationship: "Relationship",
  reflection: "MC-BOT reflects",
  complete: "MGS direction",
};

function findChoice<T extends { id: string }>(items: T[], id: string) {
  return items.find((item) => item.id === id) ?? null;
}

export default function SentimeantMcBotIntentReview() {
  const [phase, setPhase] = useState<Phase>("expression");
  const [expression, setExpression] = useState("");
  const [directionId, setDirectionId] = useState("");
  const [themeId, setThemeId] = useState("");
  const [toneId, setToneId] = useState("");
  const [relationshipId, setRelationshipId] = useState("");

  const direction = findChoice(startingDirections, directionId);
  const theme = findChoice(themes, themeId);
  const tone = findChoice(toneChoices, toneId);
  const relationship = findChoice(relationshipChoices, relationshipId);

  const availableThemes = useMemo(() => {
    if (!direction) return [];
    return direction.theme_choices
      .map((id) => findChoice(themes, id))
      .filter((item): item is Theme => Boolean(item));
  }, [direction]);

  const reflection = useMemo(() => {
    if (!theme || !tone || !relationship) return "";
    return `I hear that you want to express ${theme.label.toLowerCase()} for ${relationship.label.toLowerCase()}, with a ${tone.label.toLowerCase()} presentation.`;
  }, [relationship, theme, tone]);

  function chooseDirection(choice: StartingDirection) {
    setDirectionId(choice.id);
    setThemeId("");
    setPhase("theme");
  }

  function chooseTheme(choice: Theme) {
    setThemeId(choice.id);
    setPhase("tone");
  }

  function chooseTone(choice: Choice) {
    setToneId(choice.id);
    setPhase("relationship");
  }

  function chooseRelationship(choice: Choice) {
    setRelationshipId(choice.id);
    setPhase("reflection");
  }

  function confirm(choice: Choice) {
    if (choice.id === "confirmed") {
      setPhase("complete");
      return;
    }

    if (choice.id === "adjust_direction") {
      setThemeId("");
      setToneId("");
      setRelationshipId("");
      setPhase("theme");
      return;
    }

    startOver();
  }

  function startOver() {
    setExpression("");
    setDirectionId("");
    setThemeId("");
    setToneId("");
    setRelationshipId("");
    setPhase("expression");
  }

  function goBack() {
    const currentIndex = phaseOrder.indexOf(phase);
    if (currentIndex <= 0) return;
    setPhase(phaseOrder[currentIndex - 1]);
  }

  const phaseIndex = phaseOrder.indexOf(phase);

  return (
    <section className="rounded-[2rem] border border-[#FFD54F]/45 bg-gradient-to-br from-[#3A1F12] via-[#180D08] to-[#050302] p-6 shadow-2xl sm:p-8 md:p-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-[#FFD54F]">
            MC-BOT · Sentimeant dialog review
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Tell me what happened and what you want the music to do.
          </h1>
          <p className="mt-5 max-w-3xl text-base font-bold leading-7 text-[#EFEBE9] sm:text-lg sm:leading-8">
            MC-BOT listens, reflects the direction back, and asks you to confirm it. Later, that confirmed user-side MGS can be compared with verified NKK, BLK, KK, and KOMBO MetaGrab Sets.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-300/35 bg-amber-950/25 px-5 py-4 text-sm font-black leading-6 text-amber-100">
          Review mode<br />
          No audio · No II assignment · No checkout
        </div>
      </div>

      <div className="mt-8 grid gap-2 md:grid-cols-6">
        {phaseOrder.map((item, index) => {
          const active = item === phase;
          const finished = index < phaseIndex;

          return (
            <div
              key={item}
              className={`rounded-xl border px-3 py-3 text-center text-xs font-black ${
                active
                  ? "border-[#FFD54F] bg-[#FFD54F] text-black"
                  : finished
                    ? "border-emerald-400/40 bg-emerald-950/25 text-emerald-100"
                    : "border-[#8D6E63]/35 bg-black/25 text-[#BCAAA4]"
              }`}
            >
              {index + 1}. {phaseLabels[item]}
            </div>
          );
        })}
      </div>

      {phase === "expression" ? (
        <div className="mt-8 rounded-[1.75rem] border border-[#8D6E63]/40 bg-black/25 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
            You speak first
          </p>
          <label className="mt-3 block text-2xl font-black sm:text-3xl">
            What happened, and what should the other person feel or understand?
            <textarea
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              className="mt-5 min-h-32 w-full rounded-2xl border border-[#FFD54F]/35 bg-[#09070B] p-4 text-base font-bold leading-7 text-white outline-none focus:border-[#FFD54F] focus:ring-4 focus:ring-[#FFD54F]/20"
              placeholder="Example: My friend is discouraged. I want them to feel seen and strong enough to keep going."
            />
          </label>

          <p className="mt-5 text-sm font-bold leading-6 text-[#BCAAA4]">
            Choose the closest starting direction. Exactly three are shown.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {startingDirections.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => chooseDirection(choice)}
                className="min-h-36 rounded-[1.5rem] border border-[#FFD54F]/35 bg-[#120A06] p-5 text-left transition hover:border-[#FFD54F] hover:bg-[#211108] focus:outline-none focus:ring-4 focus:ring-[#FFD54F]/30"
              >
                <span className="block text-xl font-black text-[#FFF8E1]">
                  {choice.label}
                </span>
                <span className="mt-3 block text-sm font-bold leading-6 text-[#D7CCC8]">
                  {choice.helper}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {phase === "theme" ? (
        <div className="mt-8 rounded-[1.75rem] border border-[#8D6E63]/40 bg-black/25 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
            MC-BOT narrows the meaning
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            Which theme is closest to what you mean?
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {availableThemes.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => chooseTheme(choice)}
                className="min-h-40 rounded-[1.5rem] border border-[#FFD54F]/35 bg-[#120A06] p-5 text-left transition hover:border-[#FFD54F] hover:bg-[#211108] focus:outline-none focus:ring-4 focus:ring-[#FFD54F]/30"
              >
                <span className="block text-xl font-black text-[#FFF8E1]">
                  {choice.label}
                </span>
                <span className="mt-3 block text-sm font-bold leading-6 text-[#D7CCC8]">
                  {choice.meaning}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {phase === "tone" ? (
        <div className="mt-8 rounded-[1.75rem] border border-[#8D6E63]/40 bg-black/25 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
            MC-BOT asks about presentation
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            How should the music feel when they hear it?
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {toneChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => chooseTone(choice)}
                className="min-h-36 rounded-[1.5rem] border border-[#FFD54F]/35 bg-[#120A06] p-5 text-left transition hover:border-[#FFD54F] hover:bg-[#211108] focus:outline-none focus:ring-4 focus:ring-[#FFD54F]/30"
              >
                <span className="block text-xl font-black text-[#FFF8E1]">
                  {choice.label}
                </span>
                <span className="mt-3 block text-sm font-bold leading-6 text-[#D7CCC8]">
                  {choice.helper}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {phase === "relationship" ? (
        <div className="mt-8 rounded-[1.75rem] border border-[#8D6E63]/40 bg-black/25 p-5 sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD54F]">
            MC-BOT protects the point of view
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            Who is this for?
          </h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {relationshipChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => chooseRelationship(choice)}
                className="min-h-36 rounded-[1.5rem] border border-[#FFD54F]/35 bg-[#120A06] p-5 text-left transition hover:border-[#FFD54F] hover:bg-[#211108] focus:outline-none focus:ring-4 focus:ring-[#FFD54F]/30"
              >
                <span className="block text-xl font-black text-[#FFF8E1]">
                  {choice.label}
                </span>
                <span className="mt-3 block text-sm font-bold leading-6 text-[#D7CCC8]">
                  {choice.helper}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {phase === "reflection" ? (
        <div className="mt-8 rounded-[1.75rem] border border-sky-300/35 bg-sky-950/20 p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-200">
            MC-BOT reflects before matching
          </p>
          {expression.trim() ? (
            <blockquote className="mt-4 rounded-2xl border border-sky-300/20 bg-black/25 p-5 text-base font-bold leading-7 text-sky-50">
              “{expression.trim()}”
            </blockquote>
          ) : null}
          <p className="mt-5 text-2xl font-black leading-9 text-white">
            {reflection}
          </p>
          <p className="mt-3 text-sm font-bold leading-7 text-sky-100/80">
            No NKK, BLK, KK, or KOMBO has been searched or assigned. Confirm the meaning first.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {confirmationChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => confirm(choice)}
                className="min-h-32 rounded-[1.5rem] border border-sky-300/30 bg-black/25 p-5 text-left transition hover:border-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-300/20"
              >
                <span className="block text-lg font-black text-white">
                  {choice.label}
                </span>
                <span className="mt-3 block text-sm font-bold leading-6 text-sky-100/75">
                  {choice.helper}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {phase === "complete" ? (
        <div className="mt-8 rounded-[1.75rem] border border-emerald-400/35 bg-emerald-950/20 p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-200">
            Confirmed user-side direction
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Ready for later two-sided MGS comparison
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-emerald-300/25 bg-black/25 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
                Theme
              </p>
              <p className="mt-2 text-xl font-black text-white">
                {theme?.label}
              </p>
            </article>
            <article className="rounded-2xl border border-emerald-300/25 bg-black/25 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
                Presentation
              </p>
              <p className="mt-2 text-xl font-black text-white">
                {tone?.label}
              </p>
            </article>
            <article className="rounded-2xl border border-emerald-300/25 bg-black/25 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
                Relationship
              </p>
              <p className="mt-2 text-xl font-black text-white">
                {relationship?.label}
              </p>
            </article>
          </div>

          <div className="mt-7 rounded-2xl border border-amber-300/30 bg-amber-950/20 p-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">
              Future three-candidate format — no music loaded
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {["Strongest supported fit", "Distinct supported alternative", "Safe contrasting fit"].map(
                (label, index) => (
                  <article
                    key={label}
                    className="rounded-2xl border border-amber-300/20 bg-black/25 p-5"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-200">
                      Candidate slot {index + 1}
                    </p>
                    <p className="mt-2 text-lg font-black text-white">{label}</p>
                    <p className="mt-3 text-sm font-bold leading-6 text-amber-100/70">
                      Must show fit level, supporting evidence, actual audio-presentation evidence, and any concern or contradiction.
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setPhase("theme")}
              className="rounded-xl border border-emerald-300/40 px-5 py-3 text-sm font-black text-emerald-100"
            >
              Adjust the theme
            </button>
            <button
              type="button"
              onClick={() => setPhase("tone")}
              className="rounded-xl border border-emerald-300/40 px-5 py-3 text-sm font-black text-emerald-100"
            >
              Adjust presentation
            </button>
            <button
              type="button"
              onClick={startOver}
              className="rounded-xl border border-emerald-300/40 px-5 py-3 text-sm font-black text-emerald-100"
            >
              Explain it again
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {phaseIndex > 0 && phase !== "complete" ? (
          <button
            type="button"
            onClick={goBack}
            className="rounded-xl border border-[#FFD54F]/60 px-5 py-3 text-sm font-black text-[#FFD54F]"
          >
            Back one step
          </button>
        ) : null}
        {phaseIndex > 0 ? (
          <button
            type="button"
            onClick={startOver}
            className="rounded-xl border border-[#8D6E63]/55 px-5 py-3 text-sm font-black text-[#D7CCC8]"
          >
            Start over
          </button>
        ) : null}
      </div>

      <div className="mt-8 border-t border-[#8D6E63]/30 pt-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
          NKK / BLK theme-fit law
        </p>
        <p className="mt-3 max-w-4xl text-sm font-bold leading-7 text-[#D7CCC8]">
          Every NKK or BLK must be considered against all seven themes. Multiple supported themes are allowed. A theme needs at least three independent signals, and customer eligibility still requires actual audio-presentation and all hard product proof.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fitLevels.map((level) => (
            <article
              key={level.id}
              className="rounded-2xl border border-[#8D6E63]/35 bg-black/25 p-4"
            >
              <p className="font-black text-[#FFF8E1]">{level.label}</p>
              <p className="mt-2 text-xs font-bold leading-5 text-[#BCAAA4]">
                {level.rule}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-red-400/35 bg-red-950/25 p-5">
          <p className="font-black text-red-100">NO THEME FIT — HOLD</p>
          <p className="mt-2 text-sm font-bold leading-6 text-red-100/80">
            Any KK or KOMBO with no defensible theme fit is isolated from Sentimeant presentation. It is preserved for another valid use, later metadata improvement, or GD review. It is never forced into a theme.
          </p>
        </div>
      </div>

      <p className="mt-7 border-t border-[#8D6E63]/30 pt-5 text-xs font-bold leading-6 text-[#BCAAA4]">
        Nothing entered here is saved or sent. Approved customer audio, inventory lookup, payment, fulfillment, and delivery remain blocked in this review branch.
      </p>
    </section>
  );
}
