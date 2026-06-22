import fs from "node:fs";
import path from "node:path";

const workOrdersPath = "data/kut-inventory/processing/universal-kut-processing-work-orders-v1.json";
const decisionPath = "data/kut-inventory/processing/ukut-wo-002-boundary-human-decision-v1.json";
const draftsPath = "data/kut-inventory/processing/ukut-wo-002-exact-cut-drafts-v1.json";
const colorPath = "data/brand/gpm-color-schema-v1.json";
const twinkleBindingPath = "data/audio-branding/gpmx-twinkle-source-binding-v1.json";

const outHtml = "review-sessions/processing/universal-kut-processing-factory-room-v1.html";
const outJson = "data/kut-inventory/processing/universal-kut-processing-factory-room-v1.json";
const outMd = "data/kut-inventory/processing/universal-kut-processing-factory-room-v1.md";

for (const p of [workOrdersPath, decisionPath, draftsPath, colorPath]) {
  if (!fs.existsSync(p)) throw new Error(`Missing ${p}`);
}

const workOrders = JSON.parse(fs.readFileSync(workOrdersPath, "utf8")).workOrders || [];
const decision = JSON.parse(fs.readFileSync(decisionPath, "utf8"));
const drafts = JSON.parse(fs.readFileSync(draftsPath, "utf8"));
const color = JSON.parse(fs.readFileSync(colorPath, "utf8"));
const twinkle = fs.existsSync(twinkleBindingPath)
  ? JSON.parse(fs.readFileSync(twinkleBindingPath, "utf8"))
  : null;

const completedWorkOrderId = "UKUT-WO-002";
const completedIndex = workOrders.findIndex((w) => w.workOrderId === completedWorkOrderId);
const queue = workOrders.slice(Math.max(completedIndex + 1, 0));

function rel(src) {
  if (!src) return "";
  let s = String(src);
  if (s.startsWith("/")) s = "public" + s;
  return path.posix.join("../../", s).replaceAll(" ", "%20");
}

const queueData = queue.map((w) => ({
  workOrderId: w.workOrderId,
  sourceCandidateNumber: w.sourceCandidateNumber,
  sourceAudioFile: w.sourceAudioFile,
  sourceAudioSrc: rel(w.sourceAudioFile),
  candidateRoleHint: w.candidateRoleHint || "",
  sourceNotes: w.sourceNotes || ""
}));

const factory = {
  version: 4,
  role: "Universal KUT processing factory workbench",
  runtimeSafeDataBlock: true,
  factoryMode: true,
  activeWorkbenchMode: true,
  completedReviewSet: completedWorkOrderId,
  activeQueue: queueData,
  firstActiveWorkOrderId: queueData[0]?.workOrderId || null,
  gpmColorSchema: colorPath,
  twinkleBinding: twinkle?.canonicalTwinkleSource || null,
  plainDecisionButtonsRequired: true,
  decisionButtons: [
    "APPROVE FOR PROCESSING",
    "NEEDS RECUT / ADJUST",
    "HOLD",
    "REJECT"
  ],
  approveDoesNotMeanRelease: true,
  approveMeans: "approve-for-processing-review-only",
  terminalRawNotesForbidden: true,
  oldDraftPlayersAreNotDecisionTargets: true,
  activeCandidateHasOwnDecisionControls: true,
  autoAdvanceAfterDecision: true,
  recutAdjustOpensRequiredForm: true,
  finishSaveRequiredAtEndOfQueue: true,
  renderAudioNow: false,
  publicReadyNow: false,
  releaseReadyNow: false,
  outletReadyNow: false,
  releaseGateAllowedNow: false
};

fs.writeFileSync(outJson, JSON.stringify(factory, null, 2) + "\n");

let md = "# Universal KUT Processing Factory Workbench v4\n\n";
md += "Runtime-safe workbench.\n\n";
md += "Plain decision language is required.\n\n";
md += "APPROVE means approve for processing only. It does not mean release-ready.\n\n";
md += "NEEDS RECUT / ADJUST opens a required recut form and then advances.\n\n";
md += "End of queue shows FINISH / SAVE FACTORY DECISIONS.\n\n";
md += `Completed review set: ${completedWorkOrderId}\n\n`;
md += `First active work order: ${factory.firstActiveWorkOrderId || "none"}\n`;
fs.writeFileSync(outMd, md.trimEnd() + "\n");

const tokens = color.tokens;
const decisions = decision.decisions || [];

const proofCards = (drafts.drafts || []).map((d) => [
  '<section class="card proof-card">',
  `<h3>${d.boundaryTargetId}</h3>`,
  `<p><strong>${d.label}</strong></p>`,
  `<p>Adjusted proof draft: <code>${d.startSeconds}–${d.endSeconds}s</code></p>`,
  `<audio controls preload="metadata" src="${rel(d.outputPath)}"></audio>`,
  `<p class="small">${d.humanNote}</p>`,
  "</section>"
].join("\n")).join("\n");

const htmlParts = [];

htmlParts.push(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Universal KUT Processing Factory Workbench</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
:root {
  color-scheme: dark;
  --gpm-black: ${tokens.gpmBlack};
  --gpm-deep-green: ${tokens.gpmDeepGreen};
  --gpm-green: ${tokens.gpmGreen};
  --gpm-light-green: ${tokens.gpmLightGreen};
  --gpm-gold: ${tokens.gpmGold};
  --gpm-cream: ${tokens.gpmCream};
  --gpm-soft-white: ${tokens.gpmSoftWhite};
  --gpm-line: ${tokens.gpmLine};
}
body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, sans-serif; background: var(--gpm-black); color: var(--gpm-soft-white); }
main { max-width: 1120px; margin: 0 auto; padding: 28px; }
h1 { margin-bottom: 6px; }
h2, h3 { color: var(--gpm-gold); }
.status, .card, .workbench { border: 1px solid var(--gpm-line); border-radius: 16px; padding: 18px; background: rgba(14,59,46,.50); margin: 18px 0; }
.workbench { outline: 4px solid var(--gpm-gold); background: rgba(14,59,46,.78); }
.eyebrow { color: var(--gpm-light-green); font-weight: 900; letter-spacing: .08em; }
.grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
audio { width: 100%; margin: 12px 0; }
button { cursor: pointer; border: 1px solid var(--gpm-gold); border-radius: 999px; background: var(--gpm-deep-green); color: var(--gpm-soft-white); padding: 10px 14px; margin: 4px 6px 4px 0; }
button:hover { background: var(--gpm-green); }
button.approve { background: #1F7A4D; font-weight: 1000; }
button.reject { background: #5B1F1F; font-weight: 1000; }
button.hold { background: #5B4A1F; font-weight: 1000; }
button.recut { background: #604020; font-weight: 1000; }
.bigbutton { font-weight: 1000; padding: 12px 18px; }
.small { color: var(--gpm-cream); }
code { color: var(--gpm-cream); }
.navrow { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
pre { white-space: pre-wrap; background: rgba(0,0,0,.35); border: 1px solid var(--gpm-line); border-radius: 12px; padding: 12px; }
textarea, input { width: 100%; box-sizing: border-box; margin: 10px 0; border-radius: 12px; border: 1px solid var(--gpm-line); background: rgba(0,0,0,.38); color: var(--gpm-soft-white); padding: 12px; }
.collapsed { display: none; }
.notice { color: var(--gpm-light-green); font-weight: 900; }
.error { color: #ffb4b4; font-weight: 900; }
</style>
</head>
<body>
<main>
<h1>Universal KUT Processing Factory Workbench</h1>
<p class="small">One active target at a time. APPROVE / HOLD / REJECT / NEEDS RECUT.</p>

<section class="status">
  <h2>Factory Rule</h2>
  <p><strong>You review. The system advances.</strong></p>
  <p><strong>APPROVE = approve for processing only.</strong> It does not mean release-ready, public-ready, or outlet-ready.</p>
  <p class="small">Twinkle binding: <code>${twinkle?.canonicalTwinkleSource || "pending"}</code></p>
</section>

<section class="status" id="proofGate">
  <h2>Completed Proof Drafts — UKUT-WO-002</h2>
  <p>These two players are proof only. They are not the active decision target.</p>
  <div class="grid">
${proofCards}
  </div>
  <button class="bigbutton" onclick="closeProofDrafts()">Close proof drafts and continue factory</button>
</section>

<section class="workbench" id="activeWorkbench">
  <p class="eyebrow">ACTIVE WORKBENCH TARGET</p>
  <h2 id="activeTitle">Loading candidate…</h2>
  <p><strong id="activeHint"></strong></p>
  <p class="small" id="activeNotes"></p>
  <audio id="activeAudio" controls preload="metadata"></audio>

  <h3 id="decisionTitle">Decision</h3>
  <p class="small">These buttons apply ONLY to the active candidate above.</p>

  <div class="navrow" id="decisionButtons">
    <button class="approve bigbutton" onclick="approveActive()">APPROVE FOR PROCESSING</button>
    <button class="recut bigbutton" onclick="openRecutPanel()">NEEDS RECUT / ADJUST</button>
    <button class="hold bigbutton" onclick="holdActive()">HOLD</button>
    <button class="reject bigbutton" onclick="rejectActive()">REJECT</button>
  </div>

  <textarea id="decisionNote" rows="4" placeholder="Optional note. Example: Stop at :13. Then approve."></textarea>

  <section id="recutPanel" class="status collapsed">
    <h3>Recut / Adjust instruction</h3>
    <p class="small">Saving this instruction automatically moves to the next candidate.</p>
    <input id="recutStart" placeholder="Start time, if changing. Example: 0:00" />
    <input id="recutEnd" placeholder="Stop/end time. Example: 0:13" />
    <textarea id="recutReason" rows="3" placeholder="Reason. Example: stop at :13; tail after that is not needed."></textarea>
    <button class="recut bigbutton" onclick="saveRecutAndAdvance()">SAVE RECUT / ADJUST AND GO NEXT</button>
  </section>

  <section id="finishPanel" class="status collapsed">
    <h3>Factory queue complete</h3>
    <p class="notice">All visible candidates have decisions. Save the factory decisions to split into APPROVED, RECUT, HOLD, and REJECT lanes.</p>
    <button class="approve bigbutton" onclick="finishFactory()">FINISH / SAVE FACTORY DECISIONS</button>
  </section>

  <div class="navrow">
    <button onclick="nextCandidate()">NEXT CANDIDATE</button>
    <button onclick="previousCandidate()">PREVIOUS</button>
    <button onclick="copyFactorySaveCommand()">COPY TERMINAL-SAFE SAVE COMMAND</button>
    <button onclick="resetFactorySession()">RESET FACTORY SESSION</button>
  </div>

  <pre id="decisionSummary">No decision recorded yet.</pre>
</section>

<section class="status">
  <h2>Recorded UKUT-WO-002 Decisions</h2>
  <pre>${decisions.map((d) => `${d.boundaryTargetId}: ${d.decision} — ${d.humanNote}`).join("\n")}</pre>
</section>`);

htmlParts.push(`<script id="queue-data" type="application/json">${JSON.stringify(queueData)}</script>`);

htmlParts.push(`<script>
(function () {
  const queueEl = document.getElementById("queue-data");
  const QUEUE = JSON.parse(queueEl.textContent || "[]");
  const STORAGE_KEY = "universal-kut-factory-workbench-v4";
  let state;

  try {
    state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"index":0,"decisions":[],"finished":false}');
  } catch {
    state = { index: 0, decisions: [], finished: false };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state, null, 2));
  }

  function activeCandidate() {
    return QUEUE[state.index] || null;
  }

  function closeProofDrafts() {
    document.getElementById("proofGate").classList.add("collapsed");
    document.getElementById("activeWorkbench").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function setDecision(record) {
    state.decisions = state.decisions.filter(function (d) { return d.workOrderId !== record.workOrderId; });
    state.decisions.push(record);
    saveState();
  }

  function baseDecision(decision) {
    const c = activeCandidate();
    const note = document.getElementById("decisionNote").value || "";
    return {
      workOrderId: c.workOrderId,
      sourceCandidateNumber: c.sourceCandidateNumber,
      sourceAudioFile: c.sourceAudioFile,
      decision: decision,
      note: note,
      decidedAt: new Date().toISOString(),
      approveMeans: decision === "approve-for-processing" ? "processing-only-not-release" : null,
      renderAudioNow: false,
      releaseReadyNow: false,
      releaseGateAllowedNow: false
    };
  }

  function advanceOrFinish() {
    if (state.index < QUEUE.length - 1) {
      state.index += 1;
      state.finished = false;
    } else {
      state.finished = true;
    }
    saveState();
    renderActiveCandidate();
    document.getElementById("activeWorkbench").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function approveActive() {
    if (!activeCandidate()) return;
    setDecision(baseDecision("approve-for-processing"));
    advanceOrFinish();
  }

  function holdActive() {
    if (!activeCandidate()) return;
    setDecision(baseDecision("hold"));
    advanceOrFinish();
  }

  function rejectActive() {
    if (!activeCandidate()) return;
    setDecision(baseDecision("reject"));
    advanceOrFinish();
  }

  function openRecutPanel() {
    document.getElementById("recutPanel").classList.remove("collapsed");
    document.getElementById("recutEnd").focus();
  }

  function saveRecutAndAdvance() {
    const c = activeCandidate();
    if (!c) return;

    const recutStart = document.getElementById("recutStart").value || "";
    const recutEnd = document.getElementById("recutEnd").value || "";
    const recutReason = document.getElementById("recutReason").value || document.getElementById("decisionNote").value || "";

    if (!recutEnd && !recutReason) {
      alert("Add a stop time or recut reason first.");
      return;
    }

    const record = baseDecision("needs-recut-adjust");
    record.recutStart = recutStart;
    record.recutEnd = recutEnd;
    record.recutReason = recutReason;
    record.recutLane = true;
    record.nextLane = "recut-or-adjust-queue";
    record.approveMeans = null;

    setDecision(record);
    document.getElementById("recutPanel").classList.add("collapsed");
    advanceOrFinish();
  }

  function nextCandidate() {
    if (state.index < QUEUE.length - 1) {
      state.index += 1;
      state.finished = false;
      saveState();
      renderActiveCandidate();
    }
  }

  function previousCandidate() {
    if (state.index > 0) {
      state.index -= 1;
      state.finished = false;
      saveState();
      renderActiveCandidate();
    }
  }

  function resetFactorySession() {
    if (!confirm("Reset this browser factory session?")) return;
    state = { index: 0, decisions: [], finished: false };
    saveState();
    renderActiveCandidate();
  }

  function buildFactoryPayload() {
    return {
      version: 2,
      role: "Factory decisions for universal KUT processing queue",
      factoryMode: true,
      approveDoesNotMeanRelease: true,
      decisions: state.decisions,
      renderAudioNow: false,
      releaseReadyNow: false,
      releaseGateAllowedNow: false,
      nextSystemStep: "process-approved-items-and-recut-adjust-items-by-lane"
    };
  }

  function copyFactorySaveCommand() {
    const payload = buildFactoryPayload();
    const json = JSON.stringify(payload, null, 2);
    const command = [
      "cd /Users/gputnammusicllc/Documents/GitHub/k-kut",
      "mkdir -p data/kut-inventory/processing/factory-decisions",
      "cat > data/kut-inventory/processing/factory-decisions/universal-kut-factory-decisions-v1.json <<'EOF_JSON'",
      json,
      "EOF_JSON",
      "echo \\"Saved factory decisions. APPROVE means processing-only, not release.\\""
    ].join("\\n");

    navigator.clipboard.writeText(command);
    alert("Copied terminal-safe factory save command.");
  }

  function finishFactory() {
    if (!state.decisions.length) {
      alert("No decisions recorded yet.");
      return;
    }
    state.finished = true;
    saveState();
    renderActiveCandidate();
    copyFactorySaveCommand();
  }

  function renderSummary() {
    const lines = state.decisions.length
      ? state.decisions.map(function (d) {
          const extra = d.decision === "needs-recut-adjust"
            ? " | recut " + (d.recutStart || "same start") + " → " + (d.recutEnd || "needs end") + " | " + (d.recutReason || "")
            : (d.note ? " — " + d.note : "");
          return d.workOrderId + ": " + d.decision + extra;
        })
      : ["No decision recorded yet."];
    document.getElementById("decisionSummary").textContent = lines.join("\\n");
  }

  function renderActiveCandidate() {
    const c = activeCandidate();
    const done = state.finished || !c;

    document.getElementById("recutPanel").classList.add("collapsed");

    if (done) {
      document.getElementById("activeTitle").textContent = "QUEUE REVIEW COMPLETE";
      document.getElementById("activeHint").textContent = "Finish and save factory decisions.";
      document.getElementById("activeNotes").textContent = "Use FINISH / SAVE FACTORY DECISIONS. No release state is created.";
      document.getElementById("activeAudio").removeAttribute("src");
      document.getElementById("decisionTitle").textContent = "Finish factory session";
      document.getElementById("decisionButtons").classList.add("collapsed");
      document.getElementById("finishPanel").classList.remove("collapsed");
      renderSummary();
      return;
    }

    document.getElementById("decisionButtons").classList.remove("collapsed");
    document.getElementById("finishPanel").classList.add("collapsed");

    document.getElementById("activeTitle").textContent = c.workOrderId + " · Source candidate " + c.sourceCandidateNumber;
    document.getElementById("activeHint").textContent = c.candidateRoleHint || "Candidate";
    document.getElementById("activeNotes").textContent = c.sourceNotes || "";
    document.getElementById("activeAudio").src = c.sourceAudioSrc;
    document.getElementById("decisionTitle").textContent = "Decision for " + c.workOrderId;
    document.getElementById("decisionNote").value = "";
    document.getElementById("recutStart").value = "";
    document.getElementById("recutEnd").value = "";
    document.getElementById("recutReason").value = "";
    renderSummary();
  }

  window.closeProofDrafts = closeProofDrafts;
  window.approveActive = approveActive;
  window.holdActive = holdActive;
  window.rejectActive = rejectActive;
  window.openRecutPanel = openRecutPanel;
  window.saveRecutAndAdvance = saveRecutAndAdvance;
  window.nextCandidate = nextCandidate;
  window.previousCandidate = previousCandidate;
  window.copyFactorySaveCommand = copyFactorySaveCommand;
  window.resetFactorySession = resetFactorySession;
  window.finishFactory = finishFactory;

  renderActiveCandidate();
})();
</script>
</main>
</body>
</html>`);

const html = htmlParts.join("\n");
fs.mkdirSync(path.dirname(outHtml), { recursive: true });
fs.writeFileSync(outHtml, html);

console.log("UNIVERSAL KUT PROCESSING FACTORY WORKBENCH BUILT RUNTIME-SAFE");
console.log(outHtml);
console.log(JSON.stringify({
  firstActiveWorkOrderId: factory.firstActiveWorkOrderId,
  queueCount: queueData.length,
  runtimeSafeDataBlock: true
}, null, 2));
