export const REVIEW_CANDIDATE_STATUS: "TEST_CANDIDATE_NOT_INVENTORY";

export type ReviewCandidate = {
  id: string;
  status: "TEST_CANDIDATE_NOT_INVENTORY";
  themeId: string;
  directionTitle: string;
  relationshipLabel: string;
  rank: number;
  title: string;
  fitLevel: string;
  summary: string;
  evidence: string[];
  concern: string;
  isInventory: false;
  kkOrKomboId: null;
  audioUrl: null;
  price: null;
};

export function buildReviewCandidates(input: {
  themeId: string;
  directionTitle: string;
  relationshipLabel: string;
  revision?: number;
}): ReviewCandidate[];

export function validateReviewCandidate(candidate: ReviewCandidate): boolean;
export function listReviewCandidateThemeIds(): string[];
