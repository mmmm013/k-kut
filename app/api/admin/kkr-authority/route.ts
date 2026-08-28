import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const CANDIDATES = [
  { title: "A LOVE LIKE THAT", id: "d3dfd13c-7421-4671-8261-0c735cb51f38" },
  { title: "YOUR HEART POUNDIN’", id: "1f016b4a-f85d-4945-b881-2e0f571e6a49" },
] as const;

const LYRIC_KEYS = ["canonical_lyrics", "full_lyrics", "lyrics", "lyric_text"];
const BLK_KEYS = ["sequential_blks", "blk_map", "lyric_blocks", "blocks", "blks"];
const VTP_KEYS = ["vtp_pairs", "vtps", "vocal_transition_points"];
const INTP_KEYS = ["intp_pairs", "intps", "instrumental_transition_points"];
const HASH_KEYS = ["audio_sha256", "sha256", "source_sha256", "ssot_sha256"];

function findEvidence(value: unknown, keys: string[]): unknown {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const found = record[key];
    if (typeof found === "string" && found.trim()) return found;
    if (Array.isArray(found) && found.length) return found;
    if (found && typeof found === "object" && Object.keys(found as object).length) return found;
  }
  for (const child of Object.values(record)) {
    const found = findEvidence(child, keys);
    if (found) return found;
  }
  return null;
}

function authorized(request: NextRequest) {
  const expected = process.env.ADMIN_PREVIEW_TOKEN?.trim();
  const supplied =
    request.headers.get("x-admin-token")?.trim() ||
    request.nextUrl.searchParams.get("token")?.trim();
  return Boolean(expected && supplied && supplied === expected);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();

  if (!url || !key) {
    return NextResponse.json(
      { error: "server_supabase_connection_not_configured" },
      { status: 503 },
    );
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const ids = CANDIDATES.map((candidate) => candidate.id);

  const [{ data: tracks, error: tracksError }, { data: qc, error: qcError }] =
    await Promise.all([
      supabase.from("tracks").select("*").in("id", ids),
      supabase.from("k_kut_audio_qc").select("*").in("kut_id", ids),
    ]);

  if (tracksError) {
    return NextResponse.json(
      { error: "tracks_read_failed", detail: tracksError.message },
      { status: 502 },
    );
  }

  const trackRows = tracks ?? [];
  const qcRows = qcError ? [] : qc ?? [];

  const results = CANDIDATES.map((candidate) => {
    const track = trackRows.find((row) => String(row.id) === candidate.id) ?? null;
    const audioQc = qcRows.filter((row) => String(row.kut_id) === candidate.id);
    const combined = { track, audio_qc: audioQc };

    const evidence = {
      ssot_audio_sha256: findEvidence(combined, HASH_KEYS),
      canonical_lyrics: findEvidence(combined, LYRIC_KEYS),
      sequential_blks: findEvidence(combined, BLK_KEYS),
      exact_vtp_pairs: findEvidence(combined, VTP_KEYS),
      exact_intp_pairs: findEvidence(combined, INTP_KEYS),
    };
    const missing = Object.entries(evidence)
      .filter(([, value]) => !value)
      .map(([field]) => field);

    return {
      ...candidate,
      track_found: Boolean(track),
      audio_qc_rows: audioQc.length,
      evidence,
      missing,
      machine_join_status: track && missing.length === 0 ? "COMPLETE" : "TRIAGE",
      owner_listening_approval: "REQUIRED",
      stage_write_performed: false,
    };
  });

  return NextResponse.json({
    runner: "durable-kkr-supabase-runner-v1",
    source: "server-to-server Supabase connection",
    read_only: true,
    login_required_for_owner: false,
    results,
  });
}
