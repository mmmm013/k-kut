import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { assertBlkKkMassGenerationAllowed } from "./lib/blk-kk-text-generation-freeze.mjs";

assertBlkKkMassGenerationAllowed(import.meta.url);

function run(script, args = []) {
  execFileSync("node", [script, ...args], { stdio: "inherit" });
}

if (!fs.existsSync("data/gpmc-sensory/batch-scale/pix-kk-batch-source-catalog.json")) {
  run("scripts/discover-pix-kk-batch-source-catalog.mjs");
}

run("scripts/generate-pix-kk-batch-01-internal-candidates.mjs");
run("scripts/build-line-cc-inventory.mjs");
run("scripts/materialize-ii-delivery-bookend-twinkle.mjs", ["--love-arena-romance"]);
