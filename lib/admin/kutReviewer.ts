export type ReviewerAction = "APPROVE" | "TRIM" | "HOLD" | "REJECT";

export type GovernedKutQueueItem = {
  id: string;
  kutId: string;
  title: string;
  startSec: number;
  storedEndSec: number;
  correctedStartSec: number;
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
  id: ["ii_key", "id", "review_id", "work_item_id", "qc_id"],
  kutId: ["ii_key", "kut_id", "ii_id", "source_kut_id", "track_id", "source_track_id"],
  title: ["parent_title", "display_title", "title", "source_title", "track_title"],
  reviewState: ["review_pack_state", "review_state", "correction.review_state"],
  boundaryState: ["approval_state", "boundary_prosecution_state", "correction.boundary_prosecution_state"],
  sourceAudioBucket: ["source_audio_bucket", "storage_bucket", "audio_bucket", "bucket"],
  sourceAudioPath: ["local_audio_path", "source_audio_path", "storage_object_path", "audio_object_path", "object_path", "captured_cc.source_audio_path"],
  publicRoute: ["public_route"],
  intentLane: ["intent_lane"],
  productFamily: ["product_family"],
  updatedAt: ["updated_at", "reviewed_at", "created_at"],
} as const;

const NUMBER_PATHS = {
  startSec: ["start_seconds", "capture_start_sec", "start_sec", "captured_cc.capture_start_sec"],
  storedEndSec: ["end_seconds", "stored_capture_end_sec", "capture_end_sec", "end_sec", "captured_cc.stored_capture_end_sec"],
  correctedStartSec: ["corrected_capture_start_sec", "correction.corrected_capture_start_sec"],
  correctedEndSec: ["corrected_capture_end_sec", "correction.corrected_capture_end_sec"],
  queueOrder: ["queue_order", "playable_rank"],
} as const;

function readPath(value: unknown, path: string): unknown {
  if (!value || typeof value !== "object") return undefined;
  let current: unknown = value;
  for (const segment of path.split(".")) {
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

// Release/materializer compatibility: never extend a confirmed endpoint past its stored authority.
export function clampNoTrespassEnd(startSec: number, storedEndSec: number, value: number): number {
  if (!Number.isFinite(value)) return storedEndSec;
  const low = Math.min(startSec, storedEndSec);
  const high = Math.max(startSec, storedEndSec);
  return Number(Math.min(high, Math.max(low, value)).toFixed(3));
}

// TPR candidate editing is intentionally broader. Historical locator boundaries are evidence,
// not authority. Gregory may move START/END anywhere inside the decoded LT-PIX source while listening.
export function clampTprStart(value: number, endSec: number): number {
  if (!Number.isFinite(value)) return 0;
  return Number(Math.max(0, Math.min(Math.max(0, endSec - 0.01), value)).toFixed(3));
}

export function clampTprEnd(startSec: number, maxSec: number, value: number): number {
  if (!Number.isFinite(value)) return Math.max(startSec + 0.01, maxSec);
  const high = Math.max(startSec + 0.01, maxSec);
  return Number(Math.min(high, Math.max(startSec + 0.01, value)).toFixed(3));
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
      if (!id || !kutId || startSec === null || storedEndSec === null || !sourceAudioPath) return null;

      const sourceAudioBucket = firstString(row, STRING_PATHS.sourceAudioBucket) || (sourceAudioPath.startsWith("current-ii/") ? "ii-delivery" : "tracks");
      const correctedStartCandidate = firstNumber(row, NUMBER_PATHS.correctedStartSec);
      const correctedEndCandidate = firstNumber(row, NUMBER_PATHS.correctedEndSec);
      const correctedStartSec = clampTprStart(correctedStartCandidate === null ? startSec : correctedStartCandidate, storedEndSec);
      const correctedEndSec = clampNoTrespassEnd(correctedStartSec, storedEndSec, correctedEndCandidate === null ? storedEndSec : correctedEndCandidate);

      return {
        id, kutId, title, startSec, storedEndSec, correctedStartSec, correctedEndSec,
        reviewState: firstString(row, STRING_PATHS.reviewState) || "PENDING_HUMAN_TPR",
        boundaryState: firstString(row, STRING_PATHS.boundaryState) || "TPR_CANDIDATE",
        sourceAudioBucket, sourceAudioPath,
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
      if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) return aTime - bTime;
      return a.startSec - b.startSec;
    });
}

export function isPendingReview(item: GovernedKutQueueItem): boolean {
  const review = item.reviewState.toUpperCase();
  const boundary = item.boundaryState.toUpperCase();
  if (review.includes("REJECT")) return false;
  if (review.includes("CONFIRMED") && boundary.includes("STRICT_LAST_VOCAL_NOTE_END_PASS")) return false;
  return review.includes("PENDING") || review.includes("HOLD") || review.includes("TPR") || boundary.includes("HOLD") || boundary.includes("EXCEPTION") || boundary.includes("TPR");
}

export function nextQueueIndexAfterDecision(currentIndex: number, queueLength: number): number {
  if (queueLength <= 1) return 0;
  return Math.min(currentIndex, queueLength - 2);
}
