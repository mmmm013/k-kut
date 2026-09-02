import assert from "node:assert/strict";
import test from "node:test";
import {
  INITIAL_HTB_STATE,
  reduceHtbState,
} from "../../lib/landing/htbMachine.ts";

test("transitions from intro to chooser and allows hover preview", () => {
  const chooser = reduceHtbState(INITIAL_HTB_STATE, { type: "INTRO_COMPLETE" });
  assert.equal(chooser.stage, "CHOOSER_IDLE");

  const hover = reduceHtbState(chooser, { type: "HOVER_MODE", mode: "TUG" });
  assert.equal(hover.stage, "CHOOSER_HOVER_PREVIEW");
  assert.equal(hover.previewMode, "TUG");

  const clear = reduceHtbState(hover, { type: "CLEAR_HOVER" });
  assert.equal(clear.stage, "CHOOSER_IDLE");
  assert.equal(clear.previewMode, null);
});

test("select mode and open composer", () => {
  const chooser = reduceHtbState(INITIAL_HTB_STATE, { type: "INTRO_SKIPPED" });
  const selected = reduceHtbState(chooser, { type: "SELECT_MODE", mode: "BUG" });

  assert.equal(selected.stage, "MODE_SELECTED");
  assert.equal(selected.selectedMode, "BUG");

  const composer = reduceHtbState(selected, { type: "OPEN_COMPOSER" });
  assert.equal(composer.stage, "COMPOSER_ACTIVE");
  assert.equal(composer.selectedMode, "BUG");
});
