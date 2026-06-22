import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const packetPath = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-packet-v1.json";
const colorPath = "data/brand/gpm-color-schema-v1.json";
const ssotPath = "data/audio-branding/gpmx-signature-audio-branding-ssot.json";

const outHtml = "review-sessions/processing/ukut-wo-002-boundary-confirmation-room-v1.html";
const outJson = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-room-v1.json";
const outMd = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-room-v1.md";

for (const p of [packetPath, colorPath, ssotPath]) {
  if (!fs.existsSync(p)) throw new Error(`Missing required source: ${p}`);
}

const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));
const color = JSON.parse(fs.readFileSync(colorPath, "utf8"));
const ssot = JSON.parse(fs.readFileSync(ssotPath, "utf8"));

if (packet.workOrderId !== "UKUT-WO-002") throw new Error("Boundary packet is not for UKUT-WO-002.");
if (packet.renderAudioNow !== false) throw new Error("Boundary packet must not render audio.");
if (packet.releaseReadyNow !== false) throw new Error("Boundary packet must not be release-ready.");

function toSeconds(t) {
  const [m, s] = String(t).split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
}

function sourceToRoomRelative(source) {
  let s = String(source || "");
  if (!s) return "";
  if (s.startsWith("/")) s = "public" + s;
  if (!s.startsWith("public/")) s = s.replace(/^\.?\//, "");
  return path.posix.join("../../", s).replaceAll(" ", "%20");
}

function findTwinkleCandidate(value, trail = []) {
  if (typeof value === "string") {
    const lowerTrail = trail.join(".").toLowerCase();
    const lowerValue = value.toLowerCase();
    const looksAudio = /\.(mp3|wav|m4a|aac|flac)$/i.test(value);
    if ((lowerTrail.includes("twinkle") || lowerValue.includes("twinkle")) && looksAudio) return value;
    return null;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const found = findTwinkleCandidate(value[i], [...trail, String(i)]);
      if (found) return found;
    }
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      const found = findTwinkleCandidate(v, [...trail, k]);
      if (found) return found;
    }
  }
  return null;
}

const twinkleSource = findTwinkleCandidate(ssot);
const twinkleRoomSrc = twinkleSource ? sourceToRoomRelative(twinkleSource) : null;

const audioSrc = sourceToRoomRelative(packet.sourceAudioFile);

const targets = packet.boundaryTargets.map((target) => ({
  ...target,
  startSeconds: toSeconds(target.proposedStart),
  endSeconds: toSeconds(target.proposedEnd)
}));

const room = {
  version: 2,
  role: "Playable boundary confirmation room for UKUT-WO-002 with GPM color schema and Twinkle gate",
  workOrderId: packet.workOrderId,
  sourceCandidateNumber: packet.sourceCandidateNumber,
  sourceAudioFile: packet.sourceAudioFile,
  roomPath: outHtml,

  gpmColorSchema: colorPath,
  gpmColorSchemaId: color.schemaId,
  signatureAudioBrandingSsot: ssotPath,
  twinkleRequiredBeforeRelease: true,
  twinkleAuditionSource: twinkleSource || null,
  twinkleAuditionAvailable: Boolean(twinkleSource),

  boundaryTargets: targets.map((t) => ({
    boundaryTargetId: t.boundaryTargetId,
    label: t.label,
    proposedStart: t.proposedStart,
    proposedEnd: t.proposedEnd,
    startSeconds: t.startSeconds,
    endSeconds: t.endSeconds,
    decisionOptions: ["confirm-boundary", "adjust-boundary", "reject-boundary"]
  })),

  renderAudioNow: false,
  audioProcessedNow: false,
  publicReadyNow: false,
  releaseReadyNow: false,
  outletReadyNow: false,
  releaseGateAllowedNow: false
};

fs.writeFileSync(outJson, JSON.stringify(room, null, 2) + "\n");

let md = "# UKUT-WO-002 Boundary Confirmation Room v1\n\n";
md += `Room: \`${outHtml}\`\n\n`;
md += `Source audio: \`${packet.sourceAudioFile}\`\n\n`;
md += `GPM Color Schema: \`${colorPath}\`\n\n`;
md += `GPMx Signature Audio Branding SSOT: \`${ssotPath}\`\n\n`;
md += "Twinkle / GPMx Signature Audio Branding is required before any release decision.\n\n";
md += "This is playable review only. No audio is rendered. No release state is created.\n\n";
for (const t of targets) {
  md += `## ${t.boundaryTargetId}\n\n`;
  md += `Label: ${t.label}\n\n`;
  md += `Proposed boundary: ${t.proposedStart}–${t.proposedEnd}\n\n`;
  md += "Decision options: confirm boundary, adjust boundary, reject boundary.\n\n";
}
fs.writeFileSync(outMd, md.trimEnd() + "\n");

const targetJson = JSON.stringify(targets);
const tokens = color.tokens;

const twinkleBlock = twinkleRoomSrc
  ? `<audio id="twinkleAudio" controls preload="metadata" src="${twinkleRoomSrc}"></audio>
     <p class="small">Twinkle audition source bound from SSOT: <code>${twinkleSource}</code></p>`
  : `<p class="danger">Twinkle required before release. No playable Twinkle file path was found in the SSOT, so this room blocks release until Twinkle is bound.</p>`;

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>UKUT-WO-002 Boundary Confirmation Room v1</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      color-scheme: dark;
      --gpm-black: ${tokens.gpmBlack};
      --gpm-deep-green: ${tokens.gpmDeepGreen};
      --gpm-green: ${tokens.gpmGreen};
      --gpm-light-green: ${tokens.gpmLightGreen};
      --gpm-gold: ${tokens.gpmGold};
      --gpm-warm-amber: ${tokens.gpmWarmAmber};
      --gpm-cream: ${tokens.gpmCream};
      --gpm-soft-white: ${tokens.gpmSoftWhite};
      --gpm-slate: ${tokens.gpmSlate};
      --gpm-line: ${tokens.gpmLine};
    }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--gpm-green) 18%, transparent), transparent 36rem),
        linear-gradient(135deg, var(--gpm-black), #050706 68%);
      color: var(--gpm-soft-white);
    }
    main { max-width: 1080px; margin: 0 auto; padding: 28px; }
    h1 { margin-bottom: 6px; color: var(--gpm-soft-white); }
    h2 { color: var(--gpm-gold); }
    .brandbar {
      display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
      border: 1px solid var(--gpm-line); border-radius: 18px; padding: 14px 16px;
      background: color-mix(in srgb, var(--gpm-deep-green) 42%, var(--gpm-black));
      box-shadow: 0 0 0 1px rgba(216,179,90,.14) inset;
      margin: 16px 0 20px;
    }
    .pill {
      border: 1px solid var(--gpm-gold);
      border-radius: 999px;
      padding: 6px 10px;
      color: var(--gpm-cream);
      background: rgba(0,0,0,.22);
      font-size: .9rem;
    }
    .status { padding: 14px 16px; border: 1px solid var(--gpm-line); border-radius: 14px; background: rgba(32,39,34,.86); margin: 18px 0; }
    .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); }
    .card { border: 1px solid var(--gpm-line); border-radius: 16px; padding: 18px; background: rgba(14,59,46,.56); }
    audio { width: 100%; margin: 18px 0; }
    button { cursor: pointer; border: 1px solid var(--gpm-gold); border-radius: 999px; background: var(--gpm-deep-green); color: var(--gpm-soft-white); padding: 10px 14px; margin: 4px 6px 4px 0; }
    button:hover { background: var(--gpm-green); }
    textarea, input { width: 100%; box-sizing: border-box; background: var(--gpm-black); color: var(--gpm-soft-white); border: 1px solid var(--gpm-line); border-radius: 10px; padding: 10px; margin-top: 8px; }
    code { color: var(--gpm-cream); }
    .danger { color: #ffb4b4; }
    .good { color: var(--gpm-light-green); }
    .small { color: var(--gpm-cream); font-size: 0.94rem; }
    pre { white-space: pre-wrap; background: rgba(0,0,0,.38); border: 1px solid var(--gpm-line); padding: 14px; border-radius: 12px; }
  </style>
</head>
<body>
<main>
  <h1>UKUT-WO-002 Boundary Confirmation Room</h1>
  <p class="small">Source candidate 10 · In processing · Boundary confirmation only</p>

  <section class="brandbar">
    <span class="pill">GPM-COLOR-SCHEMA-V1</span>
    <span class="pill">GPMx Processing Control</span>
    <span class="pill">Twinkle Required Before Release</span>
    <span class="pill">No Render / No Release State</span>
  </section>

  <section class="status">
    <strong class="good">Controls locked:</strong>
    no audio render · no public-ready state · no release-ready state · no outlet-ready state.
    <br />
    <span class="small">GPM Color Schema: <code>data/brand/gpm-color-schema-v1.json</code></span>
    <br />
    <span class="small">GPMx Signature Audio Branding SSOT: <code>data/audio-branding/gpmx-signature-audio-branding-ssot.json</code></span>
    <br />
    <span class="small">Source audio: <code>${packet.sourceAudioFile}</code></span>
  </section>

  <section class="status">
    <h2>Sonic Branding Gate</h2>
    <p><strong>Twinkle / GPMx Signature Audio Branding</strong> is mandatory before any release decision.</p>
    <p class="small">This page is still boundary review only. Twinkle is shown here as a required gate, not as release completion.</p>
    ${twinkleBlock}
  </section>

  <audio id="audio" controls preload="metadata" src="${audioSrc}"></audio>

  <section class="grid" id="targetGrid"></section>

  <section class="status">
    <h2>Decision capture</h2>
    <p class="small">Use this for human notes. Copy/paste the result into the next terminal step. This page does not write to disk.</p>
    <textarea id="notes" rows="10" placeholder="Example:
BT-001: confirm 0:00–0:04
BT-002: adjust end to 0:12.7 because ...
"></textarea>
    <button onclick="copyNotes()">Copy notes</button>
    <button onclick="clearNotes()">Clear</button>
  </section>

  <section class="status">
    <h2>Required after boundary confirmation</h2>
    <pre>exact-cut-or-recut
lead-tail-padding
slight-end-fade
twinkle-gpmx-signature-audio-branding
bti-bf-review
neutral-kut-canonicalization
processed-candidate-review
release-gate-or-recut-hold</pre>
  </section>
</main>

<script>
const audio = document.getElementById("audio");
const targets = ${targetJson};
let loop = null;
let timer = null;

function stopLoop() {
  loop = null;
  if (timer) clearInterval(timer);
  timer = null;
}

function playRange(start, end) {
  stopLoop();
  audio.currentTime = start;
  audio.play();
  timer = setInterval(() => {
    if (audio.currentTime >= end) {
      audio.pause();
      clearInterval(timer);
      timer = null;
    }
  }, 35);
}

function loopRange(start, end) {
  stopLoop();
  loop = { start, end };
  audio.currentTime = start;
  audio.play();
  timer = setInterval(() => {
    if (!loop) return;
    if (audio.currentTime >= loop.end) {
      audio.currentTime = loop.start;
      audio.play();
    }
  }, 35);
}

function addDecision(id, text) {
  const box = document.getElementById("notes");
  const prefix = box.value.trim() ? "\\n" : "";
  box.value += prefix + id + ": " + text;
  box.focus();
}

function copyNotes() {
  navigator.clipboard.writeText(document.getElementById("notes").value || "");
}

function clearNotes() {
  document.getElementById("notes").value = "";
}

const grid = document.getElementById("targetGrid");
for (const t of targets) {
  const card = document.createElement("section");
  card.className = "card";
  card.innerHTML = \`
    <h2>\${t.boundaryTargetId}</h2>
    <p><strong>\${t.label}</strong></p>
    <p>Proposed: <code>\${t.proposedStart}–\${t.proposedEnd}</code></p>
    <p class="small">\${t.humanNote || ""}</p>
    <button onclick="playRange(\${t.startSeconds}, \${t.endSeconds})">Play once</button>
    <button onclick="loopRange(\${t.startSeconds}, \${t.endSeconds})">Loop</button>
    <button onclick="stopLoop(); audio.pause()">Stop</button>
    <hr />
    <button onclick="addDecision('\${t.boundaryTargetId}', 'confirm boundary')">Confirm</button>
    <button onclick="addDecision('\${t.boundaryTargetId}', 'adjust boundary to ')">Adjust</button>
    <button onclick="addDecision('\${t.boundaryTargetId}', 'reject boundary because ')">Reject</button>
  \`;
  grid.appendChild(card);
}
</script>
</body>
</html>
`;

fs.writeFileSync(outHtml, html);
execFileSync(process.execPath, ["scripts/apply-ukut-wo-002-room-auto-advance-next-v1.mjs"], { stdio: "inherit" });

console.log("UKUT-WO-002 PLAYABLE BOUNDARY ROOM REBUILT WITH GPM COLOR + TWINKLE GATE");
console.log(outHtml);
console.log(outJson);
console.log(outMd);
console.log("Twinkle audition source:", twinkleSource || "NO PLAYABLE TWINKLE PATH FOUND IN SSOT; GATE STILL REQUIRED");
