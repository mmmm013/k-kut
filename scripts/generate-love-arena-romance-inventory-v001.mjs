import { execFileSync } from "node:child_process";
import { assertBlkKkMassGenerationAllowed } from "./lib/blk-kk-text-generation-freeze.mjs";

assertBlkKkMassGenerationAllowed(import.meta.url);

function run(script, args = []) {
  execFileSync("node", [script, ...args], { stdio: "inherit" });
}

run("scripts/materialize-ii-delivery-bookend-twinkle.mjs", ["--love-arena-romance"]);
