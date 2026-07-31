export type ThemeId =
  | "comfort"
  | "celebrate"
  | "love"
  | "encourage"
  | "repair"
  | "friendship"
  | "remembrance";

export type Relationship =
  | "friend"
  | "partner"
  | "family"
  | "coworker"
  | "anyone";

export type Recommendation = {
  title: string;
  line: string;
};

export type SentimeantTheme = {
  id: ThemeId;
  label: string;
  icon: string;
  acknowledgment: string;
  prompt: string;
  mgsThemes: string[];
  keywords: [string, number][];
  recommendations: Recommendation[];
};

export type ThemeRanking = SentimeantTheme & {
  score: number;
  matches: string[];
};

export type ClassificationResult = {
  story: string;
  relationship: Relationship;
  relationshipLabel: string;
  startingFeelingId: string;
  startingFeelingLabel: string;
  expectedThemeIds: ThemeId[];
  rankings: ThemeRanking[];
  top: ThemeRanking;
  confidence: "high" | "medium" | "low";
  needsClarification: boolean;
  safetyHold: boolean;
  startingFeelingMismatch: boolean;
};

export const RELATIONSHIP_CHOICES: Array<{
  id: Relationship;
  label: string;
}>;

export const SENTIMEANT_THEMES: SentimeantTheme[];

export function normalizeSentimeantText(value: unknown): string;
export function inferRelationship(text: string): Relationship;
export function classifySituation(input: {
  text: string;
  relationship?: Relationship;
  startingFeelingId?: string;
}): ClassificationResult;
