import assert from "node:assert/strict";
import test from "node:test";
import { buildLoveArenaRomanceInventory } from "../../scripts/lib/love-arena-romance-inventory.mjs";

function makeSeedCatalog(ltPixCount: number) {
  return {
    containers: [
      {
        seeds: Array.from({ length: ltPixCount }, (_, index) => {
          const n = String(index + 1).padStart(5, "0");
          const sha = `${n}`.repeat(13).slice(0, 64);
          return {
            parent_lt_pix_id: `LT-PIX-ALLPOSS-${n}`,
            preview_audio_url: `https://example.com/ii-delivery/LT-PIX-ALLPOSS-${n}.mp3`,
            preview_audio_sha256: sha,
            theme_tags: "romance_love",
          };
        }),
      },
    ],
  };
}

function makeLineInventory(count: number) {
  return {
    candidates: Array.from({ length: count }, (_, index) => ({
      type: index % 3 === 0 ? "LNDUO_CC" : index % 3 === 1 ? "LNTRIO_CC" : "RMST_CC",
      source_file: `source-${index + 1}.json`,
      start: index * 10,
      end: index * 10 + 9,
      duration_sec: 9,
      text: `line ${index + 1}`,
    })),
  };
}

test("buildLoveArenaRomanceInventory creates required minimum inventory counts", () => {
  const inventory = buildLoveArenaRomanceInventory({
    seedCatalog: makeSeedCatalog(51),
    lineInventory: makeLineInventory(100),
    generatedAt: "2026-09-08T00:00:00.000Z",
  });

  assert.equal(inventory.ltPixPool.length, 51);
  assert.equal(inventory.kkManifest.count, 255);
  assert.equal(inventory.mkManifest.count, 100);
  assert.equal(inventory.skManifest.count, 1020);
  assert.equal(inventory.totals.delivery_integrity_status, "PASS");
  assert.ok(inventory.kkManifest.records.every((row) => row.status === "TRIAGE"));
  assert.ok(inventory.kkManifest.records.every((row) => row.delivery_integrity.twinkle_required));
});

test("buildLoveArenaRomanceInventory enforces source-pool minimum", () => {
  assert.throws(() =>
    buildLoveArenaRomanceInventory({
      seedCatalog: makeSeedCatalog(49),
      lineInventory: makeLineInventory(100),
    }),
  );
});
