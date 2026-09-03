import assert from "node:assert/strict";
import test from "node:test";
import {
  getApprovedLyricLines,
  getCompactApprovedLyricLines,
} from "../lib/approvedLyricHighlights.ts";

test("returns highlighted lyric lines for approved single-block K-KUTs", () => {
  assert.deepEqual(getApprovedLyricLines("comin_true_kk1"), [
    "I've been waiting like good luck,",
    "trying to keep the lights turned up",
    "While laying a little low",
    "Moving through it slow",
  ]);
});

test("returns contiguous lyric lines for approved KOMBOs", () => {
  assert.deepEqual(getApprovedLyricLines("comin_true_kombo1_2"), [
    "I've been waiting like good luck,",
    "trying to keep the lights turned up",
    "While laying a little low",
    "Moving through it slow",
    "There's just so long I can wait",
    "Only so much space and faith",
    "Time to make some room",
    "Let the flowers bloom",
  ]);
});

test("compacts long approved lyric highlights without dropping the ending", () => {
  assert.deepEqual(
    getCompactApprovedLyricLines(getApprovedLyricLines("comin_true_kombo1_5")),
    [
      "I've been waiting like good luck,",
      "trying to keep the lights turned up",
      "…",
      "I'm coming true",
      "Ooh",
    ],
  );
});

test("returns no highlight lines for unrelated inventory ids", () => {
  assert.deepEqual(getApprovedLyricLines("ii-romance-reuse-d3dfd13c-7421-4671-8261-0c735cb51f38"), []);
});
