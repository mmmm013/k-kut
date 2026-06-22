import fs from "node:fs";
import path from "node:path";

const outJson = "data/audio-branding/gpmx-twinkle-source-discovery-v1.json";
const outMd = "data/audio-branding/gpmx-twinkle-source-discovery-v1.md";
const bindingJson = "data/audio-branding/gpmx-twinkle-source-binding-v1.json";
const bindingMd = "data/audio-branding/gpmx-twinkle-source-binding-v1.md";
const ssotPath = "data/audio-branding/gpmx-signature-audio-branding-ssot.json";

const preferredCanonical = "public/signature/sti/gpm-sti-twinkle-v001-vol0275.mp3";

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".next", "node_modules"].includes(entry.name)) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full, results);
    } else if (
      /twinkle/i.test(full) &&
      /\.(mp3|wav|m4a|aac|flac)$/i.test(full)
    ) {
      results.push(full.replaceAll("\\", "/").replace(/^\.\//, ""));
    }
  }

  return results;
}

const candidates = walk(".").sort();

const universalCandidates = candidates.filter((p) =>
  p.startsWith("public/signature/sti/") ||
  p.startsWith("public/mothers-day/signatures/") ||
  p.startsWith("public/audio-system/twinkle-half-volume/")
);

const preferredCandidate =
  candidates.includes(preferredCanonical)
    ? preferredCanonical
    : universalCandidates.find((p) => !p.includes(" 2."))
      || universalCandidates[0]
      || candidates.find((p) => !p.includes(" 2."))
      || candidates[0]
      || null;

const discovery = {
  version: 2,
  role: "GPMx Twinkle source discovery",
  signatureAudioBrandingSsot: ssotPath,
  candidateCount: candidates.length,
  candidates,
  universalCandidates,
  preferredCandidate,
  preferredCandidateIsSinglePath: preferredCandidate ? !preferredCandidate.includes("\n") : false,
  playableTwinkleFound: Boolean(preferredCandidate),
  releaseGateBlockedUntilTwinkleBound: true,
  discoveryBugFixed: "candidate splitting uses real newline/array walking; preferredCandidate must be one path only"
};

fs.writeFileSync(outJson, JSON.stringify(discovery, null, 2) + "\n");

let md = "# GPMx Twinkle Source Discovery v1\n\n";
md += `Candidate count: ${candidates.length}\n\n`;
md += `Playable Twinkle found: ${preferredCandidate ? "yes" : "no"}\n\n`;
md += `Preferred candidate: ${preferredCandidate ? "`" + preferredCandidate + "`" : "NONE"}\n\n`;
md += "## Universal-preferred candidates\n\n";
for (const c of universalCandidates.slice(0, 40)) md += `- \`${c}\`\n`;
fs.writeFileSync(outMd, md.trimEnd() + "\n");

const binding = {
  version: 1,
  role: "GPMx Twinkle source binding",
  bindingId: "GPMX-TWINKLE-SOURCE-BINDING-V1",
  signatureAudioBrandingSsot: ssotPath,
  canonicalTwinkleSource: preferredCandidate,
  canonicalTwinkleSourceExists: preferredCandidate ? fs.existsSync(preferredCandidate) : false,
  sourceClass: preferredCandidate?.startsWith("public/signature/sti/")
    ? "universal-sti-signature-source"
    : "candidate-source-needs-human-confirmation",
  requiredBeforeReleaseGate: true,
  requiredBeforeOutlet: true,
  appliesUniversally: true,
  productSpecific: false,
  publicReadyNow: false,
  releaseReadyNow: false,
  outletReadyNow: false
};

fs.writeFileSync(bindingJson, JSON.stringify(binding, null, 2) + "\n");

let bmd = "# GPMx Twinkle Source Binding v1\n\n";
bmd += `Canonical Twinkle source: \`${binding.canonicalTwinkleSource}\`\n\n`;
bmd += `Source class: ${binding.sourceClass}\n\n`;
bmd += "This binding is universal GPMx Signature Audio Branding, not BUG-specific and not product-specific.\n\n";
bmd += "Release Gate remains blocked unless Twinkle / GPMx Signature Audio Branding is applied.\n";
fs.writeFileSync(bindingMd, bmd);

// Bind into SSOT so the playable room can find it.
const ssot = JSON.parse(fs.readFileSync(ssotPath, "utf8"));
ssot.gpmxTwinkleSourceBinding = {
  version: 1,
  bindingId: "GPMX-TWINKLE-SOURCE-BINDING-V1",
  canonicalTwinkleSource: preferredCandidate,
  requiredBeforeReleaseGate: true,
  requiredBeforeOutlet: true,
  appliesUniversally: true,
  productSpecific: false
};
ssot.canonicalTwinkleSource = preferredCandidate;
fs.writeFileSync(ssotPath, JSON.stringify(ssot, null, 2) + "\n");

console.log("GPMx TWINKLE SOURCE DISCOVERY + BINDING BUILT");
console.log(JSON.stringify({
  candidateCount: candidates.length,
  preferredCandidate,
  canonicalTwinkleSourceExists: binding.canonicalTwinkleSourceExists,
  sourceClass: binding.sourceClass
}, null, 2));
