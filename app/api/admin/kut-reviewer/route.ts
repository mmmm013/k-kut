import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  currentIiPrivateAudio,
  findCurrentIiPrivateAudioByReviewId,
} from "@/lib/currentIiPrivateAudio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DecisionAction = "APPROVE" | "TRIM" | "HOLD" | "REJECT";

type QueueItem = {
  kutId: string;
  iiId: string;
  reviewId: string;
  title: string;
  authorityState: string;
  storageObjectPath: string;
  sourceSha256: string;
  capturedStartSec: number;
  capturedEndSec: number;
  correctedEndSec: number;
  vtpEndSec: number | null;
  reviewState: string | null;
  boundaryProsecutionState: string | null;
  notes: string | null;
  trackEvidence: {
    canonicalLyrics: boolean;
    sequentialBlks: boolean;
    exactVtpPairs: boolean;
  };
  provenance: {
    trackId: string;
    sourcePath: string;
    storageObjectName: string | null;
    deliveredUrlOrPath: string | null;
  };
};

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

const END_EPSILON = 0.001;

function jsonPrivate(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
}

function unauthorized() {
  return jsonPrivate({ error: "not_found" }, 404);
}

function authorized(request: NextRequest) {
  const expected = process.env.ADMIN_PREVIEW_TOKEN?.trim();
  const supplied =
    request.headers.get("x-admin-token")?.trim() ||
    request.nextUrl.searchParams.get("token")?.trim();
  return Boolean(expected && supplied && supplied === expected);
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function readFinite(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = Number(row[key]);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function findEvidence(value: unknown, keys: string[]): unknown {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const found = record[key];
    if (typeof found === "string" && found.trim()) return found;
    if (Array.isArray(found) && found.length) return found;
    if (
      found &&
      typeof found === "object" &&
      Object.keys(found as Record<string, unknown>).length
    ) {
      return found;
    }
  }
  for (const child of Object.values(record)) {
    const found = findEvidence(child, keys);
    if (found) return found;
  }
  return null;
}

function collectVtpEnds(value: unknown, acc: number[]) {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const item of value) collectVtpEnds(item, acc);
    return;
  }
  if (typeof value !== "object") return;

  const row = value as Record<string, unknown>;
  const end = readFinite(row, [
    "end_sec",
    "capture_end_sec",
    "vtp_end_sec",
    "end",
    "stop_sec",
  ]);
  if (end !== null) acc.push(end);

  for (const child of Object.values(row)) collectVtpEnds(child, acc);
}

function inferVtpEnd(
  capturedEndSec: number,
  qcRow: Record<string, unknown>,
  trackRow: Record<string, unknown> | null,
) {
  const direct = readFinite(qcRow, ["vtp_end_sec", "vocal_transition_end_sec"]);
  if (direct !== null) return direct;

  const vtpEvidence =
    findEvidence(qcRow, ["vtp_pairs", "vtps", "vocal_transition_points"]) ||
    findEvidence(trackRow, ["vtp_pairs", "vtps", "vocal_transition_points"]);

  const ends: number[] = [];
  collectVtpEnds(vtpEvidence, ends);
  if (!ends.length) return null;

  const sorted = [...new Set(ends)].sort((a, b) => a - b);
  const candidate = sorted.find((value) => value + END_EPSILON >= capturedEndSec);
  return candidate ?? sorted[sorted.length - 1] ?? null;
}

function resolvedTitle(trackRow: Record<string, unknown> | null, fallback: string) {
  const values = [trackRow?.display_title, trackRow?.title, fallback];
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "Untitled";
}

function toQueueItem(
  qcRow: Record<string, unknown>,
  trackRow: Record<string, unknown> | null,
): QueueItem | null {
  const kutId = String(qcRow.kut_id || "").trim();
  if (!kutId) return null;

  const privateAudio = findCurrentIiPrivateAudioByReviewId(kutId);
  if (!privateAudio?.owner_review_enabled) return null;

  const capturedStartSec =
    readFinite(qcRow, ["capture_start_sec", "start_sec", "start_time_sec"]) ?? 0;
  const capturedEndSec = readFinite(qcRow, [
    "stored_capture_end_sec",
    "capture_end_sec",
    "end_sec",
    "end_time_sec",
  ]);
  if (capturedEndSec === null || capturedEndSec <= capturedStartSec) return null;

  const correctedEndSec =
    readFinite(qcRow, ["corrected_capture_end_sec", "trimmed_capture_end_sec"]) ??
    capturedEndSec;

  const vtpEndSec = inferVtpEnd(capturedEndSec, qcRow, trackRow);

  const canonicalLyrics = Boolean(
    findEvidence(trackRow, ["canonical_lyrics", "full_lyrics", "lyrics", "lyric_text"]),
  );
  const sequentialBlks = Boolean(
    findEvidence(trackRow, ["sequential_blks", "blk_map", "lyric_blocks", "blocks", "blks"]),
  );
  const exactVtpPairs = Boolean(
    findEvidence(trackRow, ["vtp_pairs", "vtps", "vocal_transition_points"]),
  );

  return {
    kutId,
    iiId: privateAudio.ii_id,
    reviewId: privateAudio.review_id,
    title: resolvedTitle(trackRow, privateAudio.title),
    authorityState: privateAudio.authority_state,
    storageObjectPath: privateAudio.storage_object_path,
    sourceSha256: privateAudio.sha256,
    capturedStartSec,
    capturedEndSec,
    correctedEndSec,
    vtpEndSec,
    reviewState: String(qcRow.review_state || "").trim() || null,
    boundaryProsecutionState:
      String(qcRow.boundary_prosecution_state || "").trim() || null,
    notes: typeof qcRow.notes === "string" ? qcRow.notes : null,
    trackEvidence: {
      canonicalLyrics,
      sequentialBlks,
      exactVtpPairs,
    },
    provenance: {
      trackId: String(trackRow?.id || kutId),
      sourcePath: privateAudio.storage_object_path,
      storageObjectName:
        typeof qcRow.storage_object_name === "string" ? qcRow.storage_object_name : null,
      deliveredUrlOrPath:
        typeof qcRow.delivered_url_or_path === "string"
          ? qcRow.delivered_url_or_path
          : null,
    },
  };
}

function isQueueCandidate(item: QueueItem) {
  return !(
    item.reviewState === "LAST_VOCAL_NOTE_END_CONFIRMED" &&
    item.boundaryProsecutionState === "STRICT_LAST_VOCAL_NOTE_END_PASS"
  );
}

function decisionPatch(action: DecisionAction, capturedEndSec: number, proposedEndSec: number) {
  if (action === "APPROVE") {
    return {
      review_state: "LAST_VOCAL_NOTE_END_CONFIRMED",
      boundary_prosecution_state: "STRICT_LAST_VOCAL_NOTE_END_PASS",
      corrected_capture_end_sec: capturedEndSec,
      listening_verified: true,
      post_vocal_audio_allowed: false,
    };
  }

  if (action === "TRIM") {
    return {
      review_state: "LAST_VOCAL_NOTE_END_CONFIRMED",
      boundary_prosecution_state: "STRICT_LAST_VOCAL_NOTE_END_PASS",
      corrected_capture_end_sec: proposedEndSec,
      listening_verified: true,
      post_vocal_audio_allowed: false,
    };
  }

  return {
    review_state: "HOLD",
    boundary_prosecution_state: "HOLD",
    listening_verified: false,
    post_vocal_audio_allowed: false,
  };
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return unauthorized();

  const supabase = createServiceClient();
  if (!supabase) {
    return jsonPrivate({ error: "server_supabase_connection_not_configured" }, 503);
  }

  const { data: qcRows, error: qcError } = await supabase
    .from("k_kut_audio_qc")
    .select("*")
    .order("checked_at", { ascending: true, nullsFirst: true })
    .limit(400);

  if (qcError) {
    return jsonPrivate({ error: "queue_read_failed", detail: qcError.message }, 502);
  }

  const rows = (qcRows ?? []) as Record<string, unknown>[];
  const ids = [...new Set(rows.map((row) => String(row.kut_id || "").trim()).filter(Boolean))];

  const trackMap = new Map<string, Record<string, unknown>>();
  if (ids.length > 0) {
    const { data: tracks, error: tracksError } = await supabase
      .from("tracks")
      .select("*")
      .in("id", ids);

    if (tracksError) {
      return jsonPrivate({ error: "track_read_failed", detail: tracksError.message }, 502);
    }

    for (const row of (tracks ?? []) as Record<string, unknown>[]) {
      const id = String(row.id || "").trim();
      if (id) trackMap.set(id, row);
    }
  }

  const queue = rows
    .map((qcRow) => toQueueItem(qcRow, trackMap.get(String(qcRow.kut_id || "").trim()) ?? null))
    .filter((item): item is QueueItem => Boolean(item))
    .filter(isQueueCandidate);

  return jsonPrivate({
    queue,
    total: queue.length,
    source_bucket: currentIiPrivateAudio.bucket,
    now: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return unauthorized();

  const supabase = createServiceClient();
  if (!supabase) {
    return jsonPrivate({ error: "server_supabase_connection_not_configured" }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonPrivate({ error: "invalid_json" }, 400);
  }

  const kutId = String(body.kutId || "").trim();
  const action = String(body.action || "").trim().toUpperCase() as DecisionAction;
  const proposedEndSec = Number(body.proposedEndSec);
  const capturedStartSec = Number(body.capturedStartSec);
  const capturedEndSec = Number(body.capturedEndSec);
  const vtpEndSec = body.vtpEndSec === null ? null : Number(body.vtpEndSec);
  const lastVocalConfirmed = body.lastVocalConfirmed === true;
  const reviewerNote = String(body.reviewerNote || "").trim();

  if (!kutId || !["APPROVE", "TRIM", "HOLD", "REJECT"].includes(action)) {
    return jsonPrivate({ error: "invalid_request" }, 400);
  }

  if (!Number.isFinite(capturedStartSec) || !Number.isFinite(capturedEndSec)) {
    return jsonPrivate({ error: "invalid_capture_bounds" }, 400);
  }

  if ((action === "APPROVE" || action === "TRIM") && !lastVocalConfirmed) {
    return jsonPrivate(
      { error: "last_vocal_note_confirmation_required" },
      422,
    );
  }

  if (!Number.isFinite(proposedEndSec) || proposedEndSec <= capturedStartSec) {
    return jsonPrivate({ error: "invalid_proposed_end" }, 422);
  }

  if (vtpEndSec !== null && Number.isFinite(vtpEndSec) && proposedEndSec > vtpEndSec + END_EPSILON) {
    return jsonPrivate(
      {
        error: "end_exceeds_vtp_end",
        detail: `END ${proposedEndSec.toFixed(3)} exceeds VTP-END ${vtpEndSec.toFixed(3)}.`,
      },
      422,
    );
  }

  if (action === "APPROVE" && Math.abs(proposedEndSec - capturedEndSec) > 0.01) {
    return jsonPrivate({ error: "approve_requires_captured_end", detail: "Use TRIM when changing END." }, 422);
  }

  if (action === "TRIM" && proposedEndSec >= capturedEndSec - 0.001) {
    return jsonPrivate({ error: "trim_requires_shorter_end" }, 422);
  }

  const { data: row, error: rowError } = await supabase
    .from("k_kut_audio_qc")
    .select("kut_id, notes")
    .eq("kut_id", kutId)
    .maybeSingle();

  if (rowError || !row) {
    return jsonPrivate(
      { error: "queue_item_not_found", detail: rowError?.message || "missing row" },
      404,
    );
  }

  const now = new Date().toISOString();
  const payload = {
    tool: "admin-kut-reviewer-v1",
    decided_at: now,
    action,
    captured_start_sec: capturedStartSec,
    captured_end_sec: capturedEndSec,
    proposed_end_sec: proposedEndSec,
    vtp_end_sec: vtpEndSec,
    last_vocal_note_confirmed: lastVocalConfirmed,
    reviewer_note: reviewerNote || null,
    trim_override_applied: action === "TRIM",
    preserve_captured_cc_input: true,
  };

  const notesPrefix = typeof row.notes === "string" && row.notes.trim() ? `${row.notes.trim()}\n` : "";
  const patch = {
    ...decisionPatch(action, capturedEndSec, proposedEndSec),
    reviewed_at: now,
    checked_at: now,
    notes: `${notesPrefix}[admin-kut-reviewer] ${JSON.stringify(payload)}`,
  };

  const { error: updateError } = await supabase
    .from("k_kut_audio_qc")
    .update(patch)
    .eq("kut_id", kutId);

  if (updateError) {
    return jsonPrivate(
      { error: "decision_persist_failed", detail: updateError.message },
      502,
    );
  }

  return jsonPrivate({ ok: true, action, kutId, reviewed_at: now });
}
