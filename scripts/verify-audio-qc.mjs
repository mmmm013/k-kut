#!/usr/bin/env node

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const LIMIT = Number(process.env.AUDIO_QC_LIMIT || process.argv[2] || 50);
const VERBOSE = process.env.AUDIO_QC_VERBOSE === "1";

const DISALLOWED_RE = /(instro|instrumental|mk-products|\/mks\/|mini|\.wav)/i;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

function failReasonForUrl(url) {
  const raw = String(url || "").trim();
  const lower = raw.toLowerCase();

  if (!raw) return "missing URL";
  if (!lower.startsWith("https://")) return "URL is not HTTPS";
  if (!lower.includes("/storage/v1/object/public/tracks/")) return "URL is not a public tracks object";
  if (!lower.includes(".mp3")) return "URL is not MP3";
  if (DISALLOWED_RE.test(lower)) return "URL is disallowed audio class";
  if (lower.includes("paste") || raw.includes("<") || raw.includes(">")) return "URL is placeholder-like";

  return null;
}

async function updateQc(kutId, patch) {
  const { error } = await supabase
    .from("k_kut_audio_qc")
    .update({ ...patch, checked_at: new Date().toISOString() })
    .eq("kut_id", kutId);

  if (error) throw error;
}

async function checkUrl(url) {
  const shapeFailure = failReasonForUrl(url);
  if (shapeFailure) {
    return {
      ok: false,
      status: null,
      contentType: null,
      note: shapeFailure,
    };
  }

  let res;
  try {
    res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
  } catch (_headError) {
    try {
      res = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-1023" },
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });
    } catch (getError) {
      return {
        ok: false,
        status: null,
        contentType: null,
        note: `HTTP fetch failed: ${getError instanceof Error ? getError.message : String(getError)}`,
      };
    }
  }

  const contentType = res.headers.get("content-type") || "";
  const okStatus = res.status >= 200 && res.status < 300;
  const okType = contentType.toLowerCase().startsWith("audio/") || contentType.toLowerCase().includes("mpeg");

  return {
    ok: okStatus && okType,
    status: res.status,
    contentType,
    note: okStatus ? (okType ? "verified playable by HTTP" : `bad content-type: ${contentType || "missing"}`) : `bad HTTP status: ${res.status}`,
  };
}

async function main() {
  const { data, error } = await supabase
    .from("k_kut_audio_qc")
    .select("kut_id, delivered_url_or_path, audio_status, storage_object_name")
    .eq("audio_status", "candidate")
    .order("checked_at", { ascending: true, nullsFirst: true })
    .limit(LIMIT);

  if (error) throw error;

  const rows = data || [];
  console.log(`Audio QC verifier: checking ${rows.length} candidate rows`);

  let playable = 0;
  let blocked = 0;
  let errored = 0;

  for (const row of rows) {
    try {
      const result = await checkUrl(row.delivered_url_or_path);

      if (result.ok) {
        await updateQc(row.kut_id, {
          audio_status: "playable",
          audio_verified_at: new Date().toISOString(),
          audio_http_status: result.status,
          audio_content_type: result.contentType || "audio/mpeg",
          notes: result.note,
        });
        playable += 1;
        console.log(VERBOSE ? `PLAYABLE ${row.kut_id} ${row.storage_object_name || ""}` : `PLAYABLE ${row.kut_id}`);
      } else {
        await updateQc(row.kut_id, {
          audio_status: "blocked",
          audio_verified_at: null,
          audio_http_status: result.status,
          audio_content_type: result.contentType,
          notes: result.note,
        });
        blocked += 1;
        console.log(`BLOCKED  ${row.kut_id} ${result.note}`);
      }
    } catch (e) {
      errored += 1;
      console.error(`ERROR    ${row.kut_id} ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log(JSON.stringify({ checked: rows.length, playable, blocked, errored }, null, 2));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.stack || e.message : e);
  process.exit(1);
});
