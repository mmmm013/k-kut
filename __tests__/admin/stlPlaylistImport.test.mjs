import assert from "node:assert/strict";
import test from "node:test";
import {
  buildStlImportRecords,
  buildStlSsotIngestionSql,
  normalizeStlPlaylistMetadata,
  parseStlCsv,
} from "../../scripts/lib/stl-playlist-import.mjs";

const SAMPLE_CSV = `Track ID,Track name,Album,Artist,ISRC,Track key
111,Alpha Song,Alpha Album,Artist A,ISRC111,TRACK_ALPHA
222,Bravo Instro,Instrumental Album,Artist B,ISRC222,TRACK_BRAVO
`;

test("normalizes playlist metadata with mix, lane, snapshot, and source system defaults", () => {
  const metadata = normalizeStlPlaylistMetadata(
    { sourceName: "Newest STL.csv", snapshotTs: "2026-09-10T18:47:00Z" },
    "Newest STL.csv",
  );

  assert.equal(metadata.sourceName, "Newest STL.csv");
  assert.equal(metadata.playlistName, "Newest STL");
  assert.equal(metadata.mixType, "FM_LT_PIX");
  assert.equal(metadata.lane, "FM_LT_PIX");
  assert.equal(metadata.sourceSystem, "STL");
  assert.equal(metadata.snapshotTs, "2026-09-10T18:47:00.000Z");
});

test("parses STL csv rows and captures track_key without guessing storage columns", () => {
  const metadata = normalizeStlPlaylistMetadata({ mixType: "FM_LT_PIX", lane: "FM_LT_PIX" }, "sample.csv");
  const rows = parseStlCsv(SAMPLE_CSV);
  const records = buildStlImportRecords(SAMPLE_CSV, metadata);

  assert.equal(rows.length, 2);
  assert.equal(records.length, 2);
  assert.equal(records[0].track_key, "TRACK_ALPHA");
  assert.equal(records[0].classification, "VOCAL_LT_PIX_CANDIDATE");
  assert.equal(records[1].classification, "IN_PIX_CANDIDATE");
  assert.ok(!Object.prototype.hasOwnProperty.call(records[0], "sb_bucket"));
  assert.ok(!Object.prototype.hasOwnProperty.call(records[0], "sb_object_path"));
});

test("builds a deterministic SQL package with reconcile, promotion, and quarantine reporting", () => {
  const sql = buildStlSsotIngestionSql({
    csvText: SAMPLE_CSV,
    fileName: "Newest STL.csv",
    metadata: {
      sourceName: "Newest STL.csv",
      playlistName: "Newest STL Batch",
      mixType: "FM_LT_PIX",
      lane: "FM_LT_PIX",
      snapshotTs: "2026-09-10T18:47:00Z",
      sourceSystem: "STL",
    },
  });

  assert.match(sql, /insert into public\.gpm_stl_playlists/i);
  assert.match(sql, /insert into public\.gpm_stl_playlist_items/i);
  assert.match(sql, /gpm_stl_reconcile_playlist_snapshot/i);
  assert.match(sql, /gpm_stl_promote_playlist_snapshot/i);
  assert.match(sql, /gpm_stl_refresh_user_publication_views/i);
  assert.match(sql, /select reason_code, count\(\*\) as total/i);
});
