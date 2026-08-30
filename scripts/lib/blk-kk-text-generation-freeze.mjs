import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const freezePath = path.join(repoRoot, "config/blk-kk-text-generation-freeze.v1.json");

export function readBlkKkTextGenerationFreeze() {
  return JSON.parse(fs.readFileSync(freezePath, "utf8"));
}

export function assertBlkKkMassGenerationAllowed(scriptUrl = import.meta.url) {
  const freeze = readBlkKkTextGenerationFreeze();
  if (freeze.status !== "ACTIVE_OWNER_AUTHORIZED_FREEZE") return;

  const scriptPath = fileURLToPath(scriptUrl);
  const relativeScript = path.relative(repoRoot, scriptPath).replaceAll(path.sep, "/");
  const error = new Error(
    [
      "STOP: owner-authorized mass BLK/KK text-generation freeze is active.",
      `Blocked script: ${relativeScript}`,
      "Allowed work: source inventory, complete lyric capture, human structural listening, per-LT-PIX worksheets, audits, and governance review.",
      "Unlock requires all four prerequisites to be owner-locked plus separate authorization to lift the freeze."
    ].join("\n")
  );
  error.name = "BlkKkTextGenerationFreezeError";
  throw error;
}
