export type ReviewerAction = "APPROVE" | "TRIM" | "HOLD" | "REJECT";

export type GovernedKutQueueItem = {
  id: string;
  kutId: string;
  title: string;
  startSec: number;
  storedEndSec: number;
  correctedEndSec: number;
  reviewState: string;
  boundaryState: string;
  sourceAudioBucket: string;
  sourceAudioPath: string;
  publicRoute: string | null;
  intentLane: string | null;
  productFamily: string | null;
  updatedAt: string | null;
  queueOrder: number | null;
};

type UnknownRecord = Record<string, unknown>;

const STRING_PATHS = {
  id: ["id", "review_id", "work_item_id", "qc_id"],
  kutId: ["kut_id", "ii_id", "source_kut_id", "track_id", "source_track_id"],
  title: ["display_title", "title", "source_title", "track_title"],
  reviewState: ["review_state", "correction.review_state"],
  boundaryState: [
    "boundary_prosecution_state",
    "correction.boundary_prosecution_state",
  ],
  sourceAudioBucket: [
    "source_audio_bucket",
    "storage_bucket",
    "audio_bucket",
    "bucket",
  ],
  sourceAudioPath: [
    "source_audio_path",
    "storage_object_path",
    "audio_object_path",
    "object_path",
    "captured_cc.source_audio_path",
  ],
  publicRoute: ["public_route"],
  intentLane: ["intent_lane"],
  productFamily: ["product_family"],
  updatedAt: ["updated_at", "reviewed_at", "created_at"],
} as const;

const NUMBER_PATHS = {
  startSec: ["capture_start_sec", "start_sec", "captured_cc.capture_start_sec"],
  storedEndSec: [
    "stored_capture_end_sec",
    "capture_end_sec",
    "end_sec",
    "captured_cc.stored_capture_end_sec",
  ],
  correctedEndSec: [
    "corrected_capture_end_sec",
    "correction.corrected_capture_end_sec",
  ],
  queueOrder: ["queue_order", "playable_rank"],
} as const;

function readPath(value: unknown, path: string): unknown {
  if (!value || typeof value !== "object") return undefined;
  const segments = path.split(".");
  let current: unknown = value;
  for (const segment of segments) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as UnknownRecord)[segment];
  }
  return current;
}

function firstString(record: unknown, paths: readonly string[]): string | null {
  for (const path of paths) {
    const found = readPath(record, path);
    if (typeof found === "string" && found.trim()) return found.trim();
    if (typeof found === "number" && Number.isFinite(found)) return String(found);
  }
  return null;
}

function firstNumber(record: unknown, paths: readonly string[]): number | null {
  for (const path of paths) {
    const found = readPath(record, path);
    if (typeof found === "number" && Number.isFinite(found)) return found;
    if (typeof found === "string") {
      const parsed = Number(found);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

export function clampNoTrespassEnd(startSec: number, storedEndSec: number, value: number): number {
  if (!Number.isFinite(value)) return storedEndSec;
  const low = Math.min(startSec, storedEndSec);
  const high = Math.max(startSec, storedEndSec);
  return Number(Math.min(high, Math.max(low, value)).toFixed(3));
}

export function normalizeGovernedQueueRows(rows: unknown[]): GovernedKutQueueItem[] {
  return rows
    .map((row) => {
      const id = firstString(row, STRING_PATHS.id);
      const kutId = firstString(row, STRING_PATHS.kutId) || id;
      const title = firstString(row, STRING_PATHS.title) || "Governed KUT";
      const startSec = firstNumber(row, NUMBER_PATHS.startSec);
      const storedEndSec = firstNumber(row, NUMBER_PATHS.storedEndSec);
      const sourceAudioPath = firstString(row, STRING_PATHS.sourceAudioPath);
      const queueOrder = firstNumber(row, NUMBER_PATHS.queueOrder);

      if (!id || !kutId || startSec === null || storedEndSec === null || !sourceAudioPath) {
        return null;
      }

      const sourceAudioBucket =
        firstString(row, STRING_PATHS.sourceAudioBucket) ||
        (sourceAudioPath.startsWith("current-ii/") ? "ii-delivery" : "tracks");
      const correctedEndCandidate = firstNumber(row, NUMBER_PATHS.correctedEndSec);
      const correctedEndSec = clampNoTrespassEnd(
        startSec,
        storedEndSec,
        correctedEndCandidate === null ? storedEndSec : correctedEndCandidate,
      );

      return {
        id,
        kutId,
        title,
        startSec,
        storedEndSec,
        correctedEndSec,
        reviewState: firstString(row, STRING_PATHS.reviewState) || "PENDING_LAST_VOCAL_NOTE_END_REVIEW",
        boundaryState: firstString(row, STRING_PATHS.boundaryState) || "HOLD",
        sourceAudioBucket,
        sourceAudioPath,
        publicRoute: firstString(row, STRING_PATHS.publicRoute),
        intentLane: firstString(row, STRING_PATHS.intentLane),
        productFamily: firstString(row, STRING_PATHS.productFamily),
        updatedAt: firstString(row, STRING_PATHS.updatedAt),
        queueOrder,
      } as GovernedKutQueueItem;
    })
    .filter((item): item is GovernedKutQueueItem => Boolean(item))
    .filter((item) => isPendingReview(item))
    .sort((a, b) => {
      const queueOrderDelta = (a.queueOrder ?? Number.MAX_SAFE_INTEGER) - (b.queueOrder ?? Number.MAX_SAFE_INTEGER);
      if (queueOrderDelta !== 0) return queueOrderDelta;
      const aTime = Date.parse(a.updatedAt || "");
      const bTime = Date.parse(b.updatedAt || "");
      if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
        return aTime - bTime;
      }
      return a.startSec - b.startSec;
    });
}

export function isPendingReview(item: GovernedKutQueueItem): boolean {
  const review = item.reviewState.toUpperCase();
  const boundary = item.boundaryState.toUpperCase();
  if (review.includes("REJECT")) return false;
  if (review.includes("CONFIRMED") && boundary.includes("STRICT_LAST_VOCAL_NOTE_END_PASS")) {
    return false;
  }
  return review.includes("PENDING") || review.includes("HOLD") || boundary.includes("HOLD") || boundary.includes("EXCEPTION");
}

export function mapDecisionToPatch(action: ReviewerAction, correctedEndSec: number) {
  if (action === "HOLD") {
    return {
      corrected_capture_end_sec: correctedEndSec,
      review_state: "HOLD",
      boundary_prosecution_state: "HOLD",
      listening_verified: false,
      post_vocal_audio_allowed: false,
      reviewer_action: "HOLD",
      reviewed_at: new Date().toISOString(),
    } as const;
  }

  if (action === "REJECT") {
    return {
      corrected_capture_end_sec: correctedEndSec,
      review_state: "REJECTED_LAST_VOCAL_NOTE_END",
      boundary_prosecution_state: "REJECT",
      listening_verified: true,
      post_vocal_audio_allowed: false,
      reviewer_action: "REJECT",
      reviewed_at: new Date().toISOString(),
    } as const;
  }

  return {
    corrected_capture_end_sec: correctedEndSec,
    review_state: "LAST_VOCAL_NOTE_END_CONFIRMED",
    boundary_prosecution_state: "STRICT_LAST_VOCAL_NOTE_END_PASS",
    listening_verified: true,
    post_vocal_audio_allowed: false,
    reviewer_action: action,
    reviewed_at: new Date().toISOString(),
  } as const;
}

export function nextQueueIndexAfterDecision(currentIndex: number, queueLength: number): number {
  if (queueLength <= 1) return 0;
  return Math.min(currentIndex, queueLength - 2);
}
