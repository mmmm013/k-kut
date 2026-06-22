import fs from "node:fs";

const htmlPath = "review-sessions/processing/ukut-wo-002-boundary-confirmation-room-v1.html";
const jsonPath = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-room-v1.json";
const mdPath = "data/kut-inventory/processing/ukut-wo-002-boundary-confirmation-room-v1.md";

if (!fs.existsSync(htmlPath)) throw new Error(`Missing ${htmlPath}`);
if (!fs.existsSync(jsonPath)) throw new Error(`Missing ${jsonPath}`);

let html = fs.readFileSync(htmlPath, "utf8");

if (!html.includes("AUTO_ADVANCE_ENABLED")) {
  html = html.replace(
    ".card { border: 1px solid var(--gpm-line); border-radius: 16px; padding: 18px; background: rgba(14,59,46,.56); }",
    `.card { border: 1px solid var(--gpm-line); border-radius: 16px; padding: 18px; background: rgba(14,59,46,.56); }
    .card.active-target { outline: 3px solid var(--gpm-gold); box-shadow: 0 0 0 4px rgba(216,179,90,.16); }
    .card.completed-target { opacity: .72; }
    .navrow { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .bigbutton { font-weight: 800; padding: 12px 18px; }`
  );

  html = html.replace(
    '<section class="grid" id="targetGrid"></section>',
    `<section class="status" id="reviewFlowPanel">
    <h2>Review Flow</h2>
    <p><strong>Decision buttons auto-advance.</strong> Use Next only when you want manual control.</p>
    <p class="small">This page saves decisions in this browser only. Use “Copy terminal-safe save command” to write the decision file without pasting raw notes into zsh.</p>
    <div class="navrow">
      <button class="bigbutton" onclick="previousTarget()">Previous</button>
      <button class="bigbutton" onclick="nextTarget()">Next</button>
      <button class="bigbutton" onclick="copyTerminalSaveCommand()">Copy terminal-safe save command</button>
      <button onclick="resetDecisions()">Reset decisions</button>
    </div>
    <p id="activeTargetLabel" class="small"></p>
    <pre id="decisionSummary">No decisions yet.</pre>
  </section>

  <section class="grid" id="targetGrid"></section>`
  );

  html = html.replace(
    "</script>\n</body>",
    `
const AUTO_ADVANCE_ENABLED = true;
const STORAGE_KEY = "UKUT-WO-002-boundary-decisions-v1";
let activeTargetIndex = 0;
let decisions = {};

try {
  decisions = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
} catch {
  decisions = {};
}

function normalizeBoundaryText(text) {
  if (text.includes("adjust boundary to")) {
    const response = prompt("Enter adjusted boundary and reason:", text);
    return response || text;
  }
  if (text.includes("reject boundary because")) {
    const response = prompt("Enter reject reason:", text);
    return response || text;
  }
  return text;
}

function decisionTypeFromText(text) {
  if (text.startsWith("confirm boundary")) return "confirm-boundary";
  if (text.startsWith("adjust boundary")) return "adjust-boundary";
  if (text.startsWith("reject boundary")) return "reject-boundary";
  return "human-decision";
}

function saveDecision(id, text) {
  const finalText = normalizeBoundaryText(text);
  decisions[id] = {
    boundaryTargetId: id,
    decision: decisionTypeFromText(finalText),
    humanNote: finalText,
    decidedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions, null, 2));
  renderReviewFlow();

  if (AUTO_ADVANCE_ENABLED) {
    const idx = targets.findIndex(t => t.boundaryTargetId === id);
    if (idx >= 0 && idx < targets.length - 1) {
      activeTargetIndex = idx + 1;
      renderReviewFlow();
      scrollToActive();
    }
  }
  return finalText;
}

const originalAddDecision = addDecision;
addDecision = function(id, text) {
  const finalText = saveDecision(id, text);
  const box = document.getElementById("notes");
  const line = id + ": " + finalText;
  const lines = (box.value || "").split("\\n").filter(Boolean).filter(l => !l.startsWith(id + ":"));
  lines.push(line);
  box.value = lines.join("\\n");
  box.focus();
};

function nextTarget() {
  if (activeTargetIndex < targets.length - 1) activeTargetIndex += 1;
  renderReviewFlow();
  scrollToActive();
}

function previousTarget() {
  if (activeTargetIndex > 0) activeTargetIndex -= 1;
  renderReviewFlow();
  scrollToActive();
}

function scrollToActive() {
  const active = document.querySelector(".active-target");
  if (active) active.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetDecisions() {
  if (!confirm("Clear browser-saved boundary decisions for UKUT-WO-002?")) return;
  decisions = {};
  localStorage.removeItem(STORAGE_KEY);
  document.getElementById("notes").value = "";
  renderReviewFlow();
}

function renderReviewFlow() {
  const active = targets[activeTargetIndex];
  document.getElementById("activeTargetLabel").textContent =
    "Active target: " + active.boundaryTargetId + " — " + active.label;

  for (const card of document.querySelectorAll(".card")) {
    card.classList.remove("active-target", "completed-target");
  }

  for (const target of targets) {
    const h2s = Array.from(document.querySelectorAll(".card h2"));
    const h2 = h2s.find(x => x.textContent.trim() === target.boundaryTargetId);
    const card = h2 ? h2.closest(".card") : null;
    if (!card) continue;
    if (target.boundaryTargetId === active.boundaryTargetId) card.classList.add("active-target");
    if (decisions[target.boundaryTargetId]) card.classList.add("completed-target");
  }

  const summary = targets.map(t => {
    const d = decisions[t.boundaryTargetId];
    return d
      ? t.boundaryTargetId + ": " + d.humanNote
      : t.boundaryTargetId + ": pending";
  }).join("\\n");

  document.getElementById("decisionSummary").textContent = summary;
}

function buildDecisionPayload() {
  const bt001 = decisions["UKUT-WO-002-BT-001"] || {
    boundaryTargetId: "UKUT-WO-002-BT-001",
    decision: "pending-human-boundary-decision",
    humanNote: ""
  };

  const bt002 = decisions["UKUT-WO-002-BT-002"] || {
    boundaryTargetId: "UKUT-WO-002-BT-002",
    decision: "pending-human-boundary-decision",
    humanNote: ""
  };

  return {
    version: 1,
    role: "Human boundary decision record for UKUT-WO-002",
    workOrderId: "UKUT-WO-002",
    sourceCandidateNumber: 10,
    currentLane: "in-processing",
    decisions: [bt001, bt002],
    renderAudioNow: false,
    audioProcessedNow: false,
    publicReadyNow: false,
    releaseReadyNow: false,
    outletReadyNow: false,
    releaseGateAllowedNow: false,
    nextAllowedStep: Object.keys(decisions).length >= 2
      ? "exact-cut-or-recut-after-human-boundary-decisions"
      : "finish-boundary-decisions-before-render"
  };
}

function copyTerminalSaveCommand() {
  const payload = buildDecisionPayload();
  const json = JSON.stringify(payload, null, 2);
  const md = "# UKUT-WO-002 Boundary Human Decision v1\\\\n\\\\n"
    + payload.decisions.map(d => "## " + d.boundaryTargetId + "\\\\n\\\\nDecision: " + d.decision + "\\\\n\\\\nHuman note: " + (d.humanNote || "")).join("\\\\n\\\\n")
    + "\\\\n\\\\nNo audio rendered. No release-ready state created.\\\\n";

  const command =
\`cd /Users/gputnammusicllc/Documents/GitHub/k-kut
cat > data/kut-inventory/processing/ukut-wo-002-boundary-human-decision-v1.json <<'EOF_JSON'
\${json}
EOF_JSON
cat > data/kut-inventory/processing/ukut-wo-002-boundary-human-decision-v1.md <<'EOF_MD'
\${md}
EOF_MD
node scripts/audit-ukut-wo-002-boundary-human-decision-v1.mjs
\`;

  navigator.clipboard.writeText(command);
  alert("Copied terminal-safe save command. Paste that command into Terminal, not raw notes.");
}

renderReviewFlow();
</script>
</body>`
  );
}

fs.writeFileSync(htmlPath, html);

const room = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
room.autoAdvanceOnDecision = true;
room.manualNextButton = true;
room.terminalSafeSaveCommandButton = true;
room.doNotPasteRawNotesIntoTerminal = true;
room.reviewFlowStateStorage = "browser-localStorage";
room.renderAudioNow = false;
room.releaseReadyNow = false;
room.releaseGateAllowedNow = false;
fs.writeFileSync(jsonPath, JSON.stringify(room, null, 2) + "\n");

let md = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, "utf8") : "# UKUT-WO-002 Boundary Confirmation Room v1\n";
if (!md.includes("Auto-advance / Next control")) {
  md += `

## Auto-advance / Next control

Decision buttons now auto-advance to the next boundary target.

A manual Next button is available.

A terminal-safe save command button is available so raw notes do not get pasted into zsh.
`;
}
fs.writeFileSync(mdPath, md.trimEnd() + "\n");

console.log("UKUT-WO-002 ROOM PATCHED WITH AUTO-ADVANCE + NEXT + TERMINAL-SAFE SAVE COMMAND");
