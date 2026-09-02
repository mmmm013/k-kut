import assert from "node:assert/strict";
import test from "node:test";
import {
  MODE_COMPOSER_PROMPT,
  MODE_HELPER_INTENT,
  selectModeToComposer,
  type TierMode,
} from "../../lib/landing/htbMachine.ts";

const MODES: TierMode[] = ["HUG", "TUG", "BUG"];

test("each tier opens matching composer mode guidance", () => {
  for (const mode of MODES) {
    const composerState = selectModeToComposer(mode);
    assert.equal(composerState.stage, "COMPOSER_ACTIVE");
    assert.equal(composerState.selectedMode, mode);
    assert.ok(MODE_COMPOSER_PROMPT[mode].length > 0);
    assert.ok(MODE_HELPER_INTENT[mode].length > 0);
  }
});
