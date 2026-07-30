import standard from "@/data/kkr/mgs-nkk-matching-standard-v001.json";

export type MgsDimension = keyof typeof standard.dimensions;
export type MgsEvidenceType = "lyric" | "vocal" | "audio" | "user";

export type MgsEvidence = {
  type: MgsEvidenceType;
  detail: string;
  confidence: number;
};

export type MgsProfile = {
  originalUserLanguage: string;
  dimensions: Partial<Record<MgsDimension, readonly string[]>>;
  intensity?: number;
  valence?: number;
  exclusions?: readonly string[];
  evidence: readonly MgsEvidence[];
  userConfirmed: boolean;
};

export type MgsCandidate = {
  id: string;
  sourceFamily: string;
  titleContentAgreement: boolean;
  dimensions: Partial<Record<MgsDimension, readonly string[]>>;
  intensity?: number;
  valence?: number;
  evidence: readonly MgsEvidence[];
  hardGatesPassed: boolean;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const normalized = (value: string) =>
  value.trim().toLowerCase().replace(/[\s-]+/g, "_");

export function normalizeMgsTerm(term: string) {
  const key = normalized(term);
  const aliases = standard.aliases as Record<string, Partial<Record<MgsDimension, string>>>;
  if (aliases[key]) return aliases[key];

  for (const [dimension, values] of Object.entries(standard.dimensions)) {
    if ((values as readonly string[]).includes(key)) {
      return { [dimension]: key } as Partial<Record<MgsDimension, string>>;
    }
  }
  return null;
}

export function validateMgsProfile(profile: MgsProfile) {
  const holds: string[] = [];
  if (!profile.originalUserLanguage.trim()) holds.push("missing_original_user_language");
  if (!profile.userConfirmed) holds.push("pending_user_authority");
  if (profile.intensity !== undefined && (profile.intensity < 0 || profile.intensity > 100)) {
    holds.push("intensity_out_of_range");
  }
  if (profile.valence !== undefined && (profile.valence < -100 || profile.valence > 100)) {
    holds.push("valence_out_of_range");
  }
  for (const [dimension, terms] of Object.entries(profile.dimensions)) {
    const allowed = (standard.dimensions as Record<string, readonly string[]>)[dimension] || [];
    for (const term of terms || []) {
      if (!allowed.includes(normalized(term))) holds.push(`unknown_unmapped_term:${dimension}:${term}`);
    }
  }
  return { pass: holds.length === 0, holds };
}

const overlap = (wanted: readonly string[] = [], offered: readonly string[] = []) => {
  const offeredSet = new Set(offered.map(normalized));
  return wanted.length === 0
    ? 0
    : wanted.map(normalized).filter((term) => offeredSet.has(term)).length / wanted.length;
};

export function scoreMgsCandidate(profile: MgsProfile, candidate: MgsCandidate) {
  const holds: string[] = [];
  if (!candidate.hardGatesPassed) holds.push("hard_gate_failed");
  if (!candidate.titleContentAgreement) holds.push("title_content_disagreement");

  const excluded = new Set((profile.exclusions || []).map(normalized));
  const candidateTerms = Object.values(candidate.dimensions).flat().map(normalized);
  if (candidateTerms.some((term) => excluded.has(term))) holds.push("user_exclusion_matched");

  const core =
    (overlap(profile.dimensions.core_feeling, candidate.dimensions.core_feeling) +
      overlap(profile.dimensions.social_condition, candidate.dimensions.social_condition)) /
    2;
  const desired = overlap(profile.dimensions.desired_effect, candidate.dimensions.desired_effect);
  const vocal = overlap(profile.dimensions.vocal_character, candidate.dimensions.vocal_character);
  const relationship =
    (overlap(profile.dimensions.interpersonal_stance, candidate.dimensions.interpersonal_stance) +
      overlap(profile.dimensions.interpretation, candidate.dimensions.interpretation)) /
    2;
  const energy = overlap(profile.dimensions.energy, candidate.dimensions.energy);
  const intensity =
    profile.intensity === undefined || candidate.intensity === undefined
      ? 0
      : 1 - Math.abs(clamp(profile.intensity, 0, 100) - clamp(candidate.intensity, 0, 100)) / 100;
  const evidenceConfidence =
    candidate.evidence.length === 0
      ? 0
      : candidate.evidence.reduce((sum, item) => sum + clamp(item.confidence, 0, 100), 0) /
        candidate.evidence.length /
        100;

  const score =
    core * 20 +
    desired * 15 +
    evidenceConfidence * 15 +
    vocal * 10 +
    relationship * 5 +
    ((energy + intensity) / 2) * 5 +
    (profile.userConfirmed ? 30 : 0);

  return {
    candidateId: candidate.id,
    score: holds.length ? 0 : Number(score.toFixed(3)),
    holds,
    eligible: holds.length === 0,
  };
}

export function diversityRerank<T extends { score: number; sourceFamily: string }>(rows: readonly T[]) {
  const familyCounts = new Map<string, number>();
  return [...rows]
    .sort((a, b) => b.score - a.score)
    .map((row) => {
      const seen = familyCounts.get(row.sourceFamily) || 0;
      familyCounts.set(row.sourceFamily, seen + 1);
      return { ...row, diversityAdjustedScore: Number((row.score - seen * 7.5).toFixed(3)) };
    })
    .sort((a, b) => b.diversityAdjustedScore - a.diversityAdjustedScore);
}

export const KKR_MGS_NKK_STANDARD = standard;
