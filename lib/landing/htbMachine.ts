export type TierMode = "HUG" | "TUG" | "BUG";

export type HtbStage =
  | "WILD_INTRO"
  | "CHOOSER_IDLE"
  | "CHOOSER_HOVER_PREVIEW"
  | "MODE_SELECTED"
  | "COMPOSER_ACTIVE";

export type HtbState = {
  stage: HtbStage;
  selectedMode: TierMode | null;
  previewMode: TierMode | null;
};

export type HtbEvent =
  | { type: "INTRO_COMPLETE" }
  | { type: "INTRO_SKIPPED" }
  | { type: "RESET_CHOOSER" }
  | { type: "HOVER_MODE"; mode: TierMode }
  | { type: "CLEAR_HOVER" }
  | { type: "SELECT_MODE"; mode: TierMode }
  | { type: "OPEN_COMPOSER" };

export const INITIAL_HTB_STATE: HtbState = {
  stage: "WILD_INTRO",
  selectedMode: null,
  previewMode: null,
};

export const MODE_COMPOSER_PROMPT: Record<TierMode, string> = {
  HUG: "Who do you want to HUG?",
  TUG: "Who do you want to TUG to convince?",
  BUG: "Who do you want to BUG to remind, pester, or test?",
};

export const MODE_HELPER_INTENT: Record<TierMode, string> = {
  HUG: "HUG another",
  TUG: "TUG another to convince",
  BUG: "BUG to remind/pester/feel out/test",
};

export function reduceHtbState(state: HtbState, event: HtbEvent): HtbState {
  switch (event.type) {
    case "INTRO_COMPLETE":
    case "INTRO_SKIPPED": {
      if (state.stage !== "WILD_INTRO") return state;
      return { ...state, stage: "CHOOSER_IDLE" };
    }
    case "RESET_CHOOSER": {
      return { stage: "CHOOSER_IDLE", selectedMode: null, previewMode: null };
    }
    case "HOVER_MODE": {
      if (state.stage !== "CHOOSER_IDLE" && state.stage !== "CHOOSER_HOVER_PREVIEW") {
        return state;
      }
      return { ...state, stage: "CHOOSER_HOVER_PREVIEW", previewMode: event.mode };
    }
    case "CLEAR_HOVER": {
      if (state.stage !== "CHOOSER_HOVER_PREVIEW") return state;
      return { ...state, stage: "CHOOSER_IDLE", previewMode: null };
    }
    case "SELECT_MODE": {
      if (
        state.stage !== "CHOOSER_IDLE" &&
        state.stage !== "CHOOSER_HOVER_PREVIEW" &&
        state.stage !== "MODE_SELECTED"
      ) {
        return state;
      }

      return { stage: "MODE_SELECTED", selectedMode: event.mode, previewMode: null };
    }
    case "OPEN_COMPOSER": {
      if (state.stage !== "MODE_SELECTED" || !state.selectedMode) return state;
      return { ...state, stage: "COMPOSER_ACTIVE" };
    }
    default:
      return state;
  }
}

export function selectModeToComposer(mode: TierMode): HtbState {
  return reduceHtbState(
    reduceHtbState(
      { stage: "CHOOSER_IDLE", selectedMode: null, previewMode: null },
      { type: "SELECT_MODE", mode },
    ),
    { type: "OPEN_COMPOSER" },
  );
}
