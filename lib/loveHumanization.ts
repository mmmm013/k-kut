import rawLoveHumanization from "@/data/hugz/love-humanization-v001.json";

export type LoveChoice = {
  id: string;
  label: string;
  detail: string;
};

export type LovePathStep = {
  id: string;
  prompt: string;
  choices: [LoveChoice, LoveChoice, LoveChoice];
};

export type LoveSelection = {
  stepId: string;
  choiceId: string;
  label: string;
};

type LoveFamily = {
  id: string;
  label: string;
  human_promise: string;
  match_tokens: string[];
  level_names: string[];
};

type MgsEvidence = {
  dimension: string;
  tags: string[];
  source: string;
};

export type LoveReviewCandidate = {
  candidate_id: string;
  title: string;
  status: string;
  preview_url: string;
  public_checkout_allowed: boolean;
  supported_family_ids: string[];
  match_choice_ids: string[];
  mgs_evidence: MgsEvidence[];
  exclusions: string[];
  note: string;
};

type LoveHumanizationData = {
  system: string;
  version: string;
  status: string;
  theme_anchor: "LOVE";
  public_checkout_allowed: false;
  rules: {
    choices_per_set: 3;
    minimum_mgs_dimensions_per_music_candidate: number;
    match_broadly_rank_narrowly: boolean;
    stay_inside_theme: boolean;
    unsupported_semantic_assignment_allowed: false;
    local_playback_volume_steps: 8;
    delivered_audio_gain_changes_allowed: false;
    public_release_requires_separate_dp: true;
  };
  mgs_dimensions: string[];
  families: LoveFamily[];
  path_steps: {
    direction: Omit<LovePathStep, "id">;
    scene_by_direction: Record<string, Omit<LovePathStep, "id">>;
    tone: Omit<LovePathStep, "id">;
    intensity: Omit<LovePathStep, "id">;
    directness: Omit<LovePathStep, "id">;
  };
  review_candidates: LoveReviewCandidate[];
};

export type LoveLevel = {
  id: string;
  familyId: string;
  familyLabel: string;
  familyPromise: string;
  levelNumber: number;
  familyLevel: number;
  label: string;
  score: number;
};

export const loveHumanization = rawLoveHumanization as LoveHumanizationData;

const LINEAR_STEPS = ["tone", "intensity", "directness"] as const;

function asTriad(choices: LoveChoice[]): [LoveChoice, LoveChoice, LoveChoice] {
  if (choices.length !== 3) {
    throw new Error(`LOVE path requires exactly three choices; received ${choices.length}`);
  }

  return choices as [LoveChoice, LoveChoice, LoveChoice];
}

export function getNextLoveStep(selections: LoveSelection[]): LovePathStep | null {
  const selected = new Map(selections.map((entry) => [entry.stepId, entry.choiceId]));

  if (!selected.has("direction")) {
    return {
      id: "direction",
      prompt: loveHumanization.path_steps.direction.prompt,
      choices: asTriad(loveHumanization.path_steps.direction.choices),
    };
  }

  if (!selected.has("scene")) {
    const direction = selected.get("direction") ?? "";
    const scene = loveHumanization.path_steps.scene_by_direction[direction];

    if (!scene) {
      throw new Error(`No LOVE scene triad is defined for direction ${direction}`);
    }

    return {
      id: "scene",
      prompt: scene.prompt,
      choices: asTriad(scene.choices),
    };
  }

  for (const stepId of LINEAR_STEPS) {
    if (selected.has(stepId)) continue;

    const step = loveHumanization.path_steps[stepId];
    return {
      id: stepId,
      prompt: step.prompt,
      choices: asTriad(step.choices),
    };
  }

  return null;
}

export function flattenLoveLevels(): LoveLevel[] {
  const levels: LoveLevel[] = [];

  loveHumanization.families.forEach((family, familyIndex) => {
    family.level_names.forEach((label, levelIndex) => {
      const levelNumber = familyIndex * 10 + levelIndex + 1;
      levels.push({
        id: `LOVE-${String(levelNumber).padStart(3, "0")}`,
        familyId: family.id,
        familyLabel: family.label,
        familyPromise: family.human_promise,
        levelNumber,
        familyLevel: levelIndex + 1,
        label,
        score: 0,
      });
    });
  });

  return levels;
}

function targetIntensity(choiceIds: Set<string>) {
  if (choiceIds.has("gentle")) return 3;
  if (choiceIds.has("deep")) return 9;
  return 6;
}

function directnessAdjustment(level: LoveLevel, choiceIds: Set<string>) {
  if (choiceIds.has("through-actions")) {
    return level.familyLevel <= 6 ? 4 : 0;
  }

  if (choiceIds.has("full-declaration")) {
    return level.familyLevel >= 7 ? 5 : -2;
  }

  return level.familyLevel >= 4 && level.familyLevel <= 8 ? 3 : 0;
}

export function rankLoveLevels(selections: LoveSelection[], limit = 3): LoveLevel[] {
  const choiceIds = new Set(selections.map((entry) => entry.choiceId));
  const desiredIntensity = targetIntensity(choiceIds);

  const scored = flattenLoveLevels()
    .map((level) => {
      const family = loveHumanization.families.find((entry) => entry.id === level.familyId);
      const tokenMatches = family?.match_tokens.filter((token) => choiceIds.has(token)).length ?? 0;
      const intensityFit = Math.max(0, 7 - Math.abs(level.familyLevel - desiredIntensity));
      const score = tokenMatches * 9 + intensityFit + directnessAdjustment(level, choiceIds);
      return { ...level, score };
    })
    .sort((a, b) => b.score - a.score || a.levelNumber - b.levelNumber);

  const selected: LoveLevel[] = [];
  const usedFamilies = new Set<string>();

  for (const level of scored) {
    if (usedFamilies.has(level.familyId)) continue;
    selected.push(level);
    usedFamilies.add(level.familyId);
    if (selected.length === limit) return selected;
  }

  for (const level of scored) {
    if (selected.some((entry) => entry.id === level.id)) continue;
    selected.push(level);
    if (selected.length === limit) break;
  }

  return selected;
}

export function getLoveLevel(levelId: string): LoveLevel | null {
  return flattenLoveLevels().find((level) => level.id === levelId) ?? null;
}

export function getAdjacentLoveLevels(levelId: string): LoveLevel[] {
  const all = flattenLoveLevels();
  const selected = all.find((level) => level.id === levelId);
  if (!selected) return [];

  const familyLevels = all.filter((level) => level.familyId === selected.familyId);
  const index = familyLevels.findIndex((level) => level.id === selected.id);
  const start = Math.max(0, Math.min(index - 1, familyLevels.length - 3));
  return familyLevels.slice(start, start + 3);
}

export function rankLoveReviewCandidates(
  selections: LoveSelection[],
  focusedFamilyId?: string,
): Array<LoveReviewCandidate & { score: number; evidenceComplete: boolean }> {
  const choiceIds = new Set(selections.map((entry) => entry.choiceId));
  const minimumDimensions = loveHumanization.rules.minimum_mgs_dimensions_per_music_candidate;

  return loveHumanization.review_candidates
    .map((candidate) => {
      const evidenceDimensions = new Set(candidate.mgs_evidence.map((entry) => entry.dimension));
      const evidenceComplete = evidenceDimensions.size >= minimumDimensions;
      const choiceMatches = candidate.match_choice_ids.filter((choiceId) => choiceIds.has(choiceId)).length;
      const familyMatch = focusedFamilyId && candidate.supported_family_ids.includes(focusedFamilyId) ? 8 : 0;
      return {
        ...candidate,
        score: choiceMatches * 2 + familyMatch,
        evidenceComplete,
      };
    })
    .filter((candidate) => candidate.evidenceComplete && candidate.score >= 8)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
}

export function summarizeLovePath(selections: LoveSelection[]) {
  return selections.map((selection) => selection.label).join(" → ");
}
