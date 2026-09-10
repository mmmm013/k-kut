import crypto from "node:crypto";

export const DEFAULT_STL_MIX_TYPE = "FM_LT_PIX";
export const DEFAULT_STL_SOURCE_SYSTEM = "STL";
export const STL_QUARANTINE_REASON_CODES = [
  "MISSING_TRACK_KEY",
  "NO_WAV_MATCH",
  "AMBIGUOUS_WAV_MATCH",
  "DUP_REGISTRY",
  "INCOMPLETE_LINEAGE",
];

function trimText(value, max = 260) {
  return String(value ?? "").trim().slice(0, max);
}

function validIso(value) {
  const text = trimText(value, 80);
  if (!text) return "";
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function parseStlCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const current = text[i];
    const next = text[i + 1];
    if (current === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
    } else if (current === '"') {
      quoted = !quoted;
    } else if (current === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((current === "\n" || current === "\r") && !quoted) {
      if (current === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((value) => String(value).trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += current;
    }
  }

  if (quoted) {
    throw new Error("CSV ended inside a quoted field");
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((value) => String(value).trim())) rows.push(row);
  }

  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((key, index) => [key, values[index] || ""])));
}

export function classifyStlTrack(trackName, album) {
  const value = `${trimText(trackName).toLowerCase()} ${trimText(album).toLowerCase()}`;
  if (/\b(instro|instrumental|instro only)\b/.test(value)) return "IN_PIX_CANDIDATE";
  if (/\bcover\b/.test(value)) return "HOLD_RIGHTS_OR_MASTER_VERIFICATION";
  return "VOCAL_LT_PIX_CANDIDATE";
}

export function normalizeStlPlaylistMetadata(input = {}, fileName = "", now = new Date()) {
  const sourceName = trimText(input.sourceName || input.source_name || fileName || "stl-playlist.csv");
  const playlistName = trimText(input.playlistName || input.playlist_name || sourceName.replace(/\.[^.]+$/, "") || "STL Playlist");
  const mixType = trimText(input.mixType || input.mix_type, 120) || DEFAULT_STL_MIX_TYPE;
  const lane = trimText(input.lane, 120) || mixType;
  const sourceSystem = trimText(input.sourceSystem || input.source_system, 40) || DEFAULT_STL_SOURCE_SYSTEM;
  const snapshotTs = validIso(input.snapshotTs || input.snapshot_ts) || now.toISOString();

  return {
    sourceName,
    playlistName,
    mixType,
    lane,
    sourceSystem,
    snapshotTs,
  };
}

function firstNonEmpty(row, keys) {
  for (const key of keys) {
    const value = trimText(row?.[key]);
    if (value) return value;
  }
  return "";
}

export function buildStlImportRecords(text, metadata) {
  return parseStlCsv(text.replace(/^\uFEFF/, ""))
    .map((row, index) => {
      const stlId = trimText(row["Track ID"], 160);
      const trackName = trimText(row["Track name"]);
      return {
        item_ordinal: index + 1,
        disco_track_id: stlId,
        stl_id: stlId,
        track_key: firstNonEmpty(row, ["Track key", "Track Key", "track_key", "trackKey", "TrackKey"]),
        track_name: trackName,
        album: trimText(row.Album),
        artist: trimText(row.Artist),
        isrc: trimText(row.ISRC, 160),
        classification: classifyStlTrack(trackName, row.Album),
        mix_type: metadata.mixType,
        lane: metadata.lane,
        source_system: metadata.sourceSystem,
        snapshot_ts: metadata.snapshotTs,
        raw_row: row,
      };
    })
    .filter((record) => record.disco_track_id && record.track_name);
}

export function buildStlImportSummary(records) {
  return Object.fromEntries(
    ["VOCAL_LT_PIX_CANDIDATE", "IN_PIX_CANDIDATE", "HOLD_RIGHTS_OR_MASTER_VERIFICATION"].map((state) => [
      state,
      records.filter((record) => record.classification === state).length,
    ]),
  );
}

export function sha256Text(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

export function buildStlSsotIngestionSql({ csvText, fileName = "", metadata: metadataInput = {} }) {
  const metadata = normalizeStlPlaylistMetadata(metadataInput, fileName);
  const records = buildStlImportRecords(csvText, metadata);
  const totals = buildStlImportSummary(records);
  const sourceSha256 = sha256Text(csvText.replace(/^\uFEFF/, ""));
  const values = records
    .map((record) => `(
  ${record.item_ordinal},
  ${sqlLiteral(record.disco_track_id)},
  ${sqlLiteral(record.stl_id)},
  ${record.track_key ? sqlLiteral(record.track_key) : "null"},
  ${sqlLiteral(record.track_name)},
  ${record.album ? sqlLiteral(record.album) : "null"},
  ${record.artist ? sqlLiteral(record.artist) : "null"},
  ${record.isrc ? sqlLiteral(record.isrc) : "null"},
  ${sqlLiteral(record.classification)},
  ${sqlJson(record.raw_row)}
)`)
    .join(",\n");

  return `-- STL -> SSOT ingestion package
-- Source: ${metadata.sourceName}
-- Snapshot: ${metadata.snapshotTs}
-- Mix: ${metadata.mixType}
-- Lane: ${metadata.lane}
begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';

create temp table tmp_gpm_stl_incoming_records (
  item_ordinal integer not null,
  disco_track_id text not null,
  stl_id text not null,
  track_key text,
  track_name text not null,
  album text,
  artist text,
  isrc text,
  classification text not null,
  raw_row jsonb not null
) on commit drop;

insert into tmp_gpm_stl_incoming_records (
  item_ordinal, disco_track_id, stl_id, track_key, track_name, album, artist, isrc, classification, raw_row
)
values
${values || "  (1, '__EMPTY__', '__EMPTY__', null, '__EMPTY__', null, null, null, 'HOLD_RIGHTS_OR_MASTER_VERIFICATION', '{}'::jsonb)"};

with upserted_import as (
  insert into public.gpm_stl_playlist_imports (source_name, source_sha256, totals)
  values (${sqlLiteral(metadata.sourceName)}, ${sqlLiteral(sourceSha256)}, ${sqlJson(totals)})
  on conflict (source_sha256) do update
  set source_name = excluded.source_name,
      totals = excluded.totals
  returning id
), resolved_import as (
  select id from upserted_import
  union all
  select id from public.gpm_stl_playlist_imports where source_sha256 = ${sqlLiteral(sourceSha256)}
  limit 1
)
insert into public.gpm_stl_track_registry (
  disco_track_id, track_name, album, artist, isrc, classification, source_import_id, last_seen_at
)
select
  incoming.disco_track_id,
  incoming.track_name,
  incoming.album,
  incoming.artist,
  incoming.isrc,
  incoming.classification,
  resolved_import.id,
  ${sqlLiteral(metadata.snapshotTs)}::timestamptz
from tmp_gpm_stl_incoming_records incoming
cross join resolved_import
where incoming.disco_track_id <> '__EMPTY__'
on conflict (disco_track_id) do update
set track_name = excluded.track_name,
    album = excluded.album,
    artist = excluded.artist,
    isrc = excluded.isrc,
    classification = excluded.classification,
    source_import_id = excluded.source_import_id,
    last_seen_at = excluded.last_seen_at;

with resolved_import as (
  select id from public.gpm_stl_playlist_imports where source_sha256 = ${sqlLiteral(sourceSha256)} limit 1
), upserted_playlist as (
  insert into public.gpm_stl_playlists (
    source_import_id, source_name, source_system, playlist_name, mix_type, lane, snapshot_ts, playlist_payload
  )
  select
    resolved_import.id,
    ${sqlLiteral(metadata.sourceName)},
    ${sqlLiteral(metadata.sourceSystem)},
    ${sqlLiteral(metadata.playlistName)},
    ${sqlLiteral(metadata.mixType)},
    ${sqlLiteral(metadata.lane)},
    ${sqlLiteral(metadata.snapshotTs)}::timestamptz,
    ${sqlJson({ source_name: metadata.sourceName, generated_by: "scripts/build-stl-ssot-ingestion-package.mjs" })}
  from resolved_import
  on conflict (source_import_id, playlist_name, mix_type, lane, snapshot_ts) do update
  set source_name = excluded.source_name,
      source_system = excluded.source_system,
      playlist_payload = excluded.playlist_payload
  returning id
), resolved_playlist as (
  select id from upserted_playlist
  union all
  select id
  from public.gpm_stl_playlists
  where source_import_id = (select id from resolved_import)
    and playlist_name = ${sqlLiteral(metadata.playlistName)}
    and mix_type = ${sqlLiteral(metadata.mixType)}
    and lane = ${sqlLiteral(metadata.lane)}
    and snapshot_ts = ${sqlLiteral(metadata.snapshotTs)}::timestamptz
  limit 1
)
insert into public.gpm_stl_playlist_items (
  playlist_id, source_import_id, item_ordinal, disco_track_id, stl_id, track_key, track_name, album, artist, isrc, item_payload
)
select
  resolved_playlist.id,
  (select id from public.gpm_stl_playlist_imports where source_sha256 = ${sqlLiteral(sourceSha256)} limit 1),
  incoming.item_ordinal,
  incoming.disco_track_id,
  incoming.stl_id,
  incoming.track_key,
  incoming.track_name,
  incoming.album,
  incoming.artist,
  incoming.isrc,
  incoming.raw_row
from tmp_gpm_stl_incoming_records incoming
cross join resolved_playlist
where incoming.disco_track_id <> '__EMPTY__'
on conflict (playlist_id, item_ordinal, stl_id) do update
set disco_track_id = excluded.disco_track_id,
    track_key = excluded.track_key,
    track_name = excluded.track_name,
    album = excluded.album,
    artist = excluded.artist,
    isrc = excluded.isrc,
    item_payload = excluded.item_payload,
    updated_at = now();

select * from public.gpm_stl_reconcile_playlist_snapshot((
  select id
  from public.gpm_stl_playlists
  where source_import_id = (select id from public.gpm_stl_playlist_imports where source_sha256 = ${sqlLiteral(sourceSha256)} limit 1)
    and playlist_name = ${sqlLiteral(metadata.playlistName)}
    and mix_type = ${sqlLiteral(metadata.mixType)}
    and lane = ${sqlLiteral(metadata.lane)}
    and snapshot_ts = ${sqlLiteral(metadata.snapshotTs)}::timestamptz
  limit 1
));

select * from public.gpm_stl_promote_playlist_snapshot((
  select id
  from public.gpm_stl_playlists
  where source_import_id = (select id from public.gpm_stl_playlist_imports where source_sha256 = ${sqlLiteral(sourceSha256)} limit 1)
    and playlist_name = ${sqlLiteral(metadata.playlistName)}
    and mix_type = ${sqlLiteral(metadata.mixType)}
    and lane = ${sqlLiteral(metadata.lane)}
    and snapshot_ts = ${sqlLiteral(metadata.snapshotTs)}::timestamptz
  limit 1
));

select * from public.gpm_stl_refresh_user_publication_views();

select * from public.gpm_stl_playlist_pipeline_report((
  select id
  from public.gpm_stl_playlists
  where source_import_id = (select id from public.gpm_stl_playlist_imports where source_sha256 = ${sqlLiteral(sourceSha256)} limit 1)
    and playlist_name = ${sqlLiteral(metadata.playlistName)}
    and mix_type = ${sqlLiteral(metadata.mixType)}
    and lane = ${sqlLiteral(metadata.lane)}
    and snapshot_ts = ${sqlLiteral(metadata.snapshotTs)}::timestamptz
  limit 1
));

select reason_code, count(*) as total
from public.gpm_stl_ingest_quarantine
where playlist_id = (
  select id
  from public.gpm_stl_playlists
  where source_import_id = (select id from public.gpm_stl_playlist_imports where source_sha256 = ${sqlLiteral(sourceSha256)} limit 1)
    and playlist_name = ${sqlLiteral(metadata.playlistName)}
    and mix_type = ${sqlLiteral(metadata.mixType)}
    and lane = ${sqlLiteral(metadata.lane)}
    and snapshot_ts = ${sqlLiteral(metadata.snapshotTs)}::timestamptz
  limit 1
)
group by reason_code
order by reason_code;

commit;
`;
}
