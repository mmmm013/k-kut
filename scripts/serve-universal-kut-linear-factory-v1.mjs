import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execFileSync } from "node:child_process";

const PORT = 4177;

const workOrdersPath = "data/kut-inventory/processing/universal-kut-processing-work-orders-v1.json";
const decisionsDir = "data/kut-inventory/processing/factory-decisions";
const decisionPath = `${decisionsDir}/universal-kut-linear-factory-decisions-v1.json`;
const decisionMdPath = `${decisionsDir}/universal-kut-linear-factory-decisions-v1.md`;

fs.mkdirSync(decisionsDir, { recursive: true });

const allWorkOrders = JSON.parse(fs.readFileSync(workOrdersPath, "utf8")).workOrders || [];
const startAfter = "UKUT-WO-002";
const startIndex = allWorkOrders.findIndex((w) => w.workOrderId === startAfter);
const queue = allWorkOrders.slice(startIndex + 1).map((w) => ({
  workOrderId: w.workOrderId,
  sourceCandidateNumber: w.sourceCandidateNumber,
  sourceAudioFile: w.sourceAudioFile,
  candidateRoleHint: w.candidateRoleHint || "",
  sourceNotes: w.sourceNotes || ""
}));

let state = {
  version: 1,
  role: "Universal KUT linear factory decisions",
  factoryMode: true,
  flow: "play-accept-or-adjust-auto-next",
  approveDoesNotMeanRelease: true,
  currentIndex: 0,
  decisions: [],
  renderAudioNow: false,
  publicReadyNow: false,
  releaseReadyNow: false,
  outletReadyNow: false,
  releaseGateAllowedNow: false
};

if (fs.existsSync(decisionPath)) {
  try {
    const saved = JSON.parse(fs.readFileSync(decisionPath, "utf8"));
    state = { ...state, ...saved };
  } catch {}
}

function saveState() {
  const approvedForProcessing = state.decisions
    .filter((d) => d.decision === "accept-for-processing")
    .map((d) => d.workOrderId);

  const needsAdjust = state.decisions
    .filter((d) => d.decision === "adjust")
    .map((d) => d.workOrderId);

  const payload = {
    ...state,
    laneSummary: {
      approvedForProcessing,
      needsAdjust,
      hold: [],
      reject: []
    },
    nextSystemStep: "process-accepted-and-adjusted-items-with-padding-fade-twinkle-and-review"
  };

  fs.writeFileSync(decisionPath, JSON.stringify(payload, null, 2) + "\n");

  let md = "# Universal KUT Linear Factory Decisions v1\n\n";
  md += "Linear review only: PLAY → ACCEPT or ADJUST → next.\n\n";
  md += "ACCEPT means processing-only, not release-ready.\n\n";
  md += "## Decisions\n\n";
  for (const d of payload.decisions) {
    md += `- ${d.workOrderId} / source ${d.sourceCandidateNumber}: ${d.decision}`;
    if (d.note) md += ` — ${d.note}`;
    if (d.cutEndSeconds) md += ` — cut/end: ${d.cutEndSeconds}`;
    md += "\n";
  }
  md += "\n## Controls\n\nNo release-ready state. No public-ready state. No Release Gate.\n";
  fs.writeFileSync(decisionMdPath, md);
}

function sendJson(res, data) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function audioPathFromUrl(urlPath) {
  const raw = decodeURIComponent(urlPath.replace(/^\/audio\//, ""));
  const safe = path.normalize(raw).replace(/^(\.\.[/\\])+/, "");
  return safe;
}

function serveAudio(req, res) {
  const p = audioPathFromUrl(new URL(req.url, "http://localhost").pathname);
  if (!fs.existsSync(p)) {
    res.writeHead(404);
    res.end("Audio not found");
    return;
  }

  res.writeHead(200, { "Content-Type": "audio/mpeg" });
  fs.createReadStream(p).pipe(res);
}

function currentCandidate() {
  return queue[state.currentIndex] || null;
}

function page() {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Linear KUT Factory</title>
<style>
body { margin:0; font-family:system-ui,-apple-system,Segoe UI,sans-serif; background:#07100c; color:#f8f5ec; }
main { max-width:960px; margin:0 auto; padding:28px; }
.card { background:#0e3b2e; border:2px solid #456052; border-radius:18px; padding:22px; margin:18px 0; }
.active { border:4px solid #d8b35a; }
h1,h2 { color:#d8b35a; }
audio { width:100%; margin:18px 0; }
button { font-size:18px; font-weight:900; padding:14px 20px; border-radius:999px; border:2px solid #d8b35a; background:#0e3b2e; color:#f8f5ec; cursor:pointer; margin:6px; }
button.accept { background:#1f7a4d; }
button.adjust { background:#7a4d1f; }
button.finish { background:#1f5f7a; }
input, textarea { width:100%; box-sizing:border-box; background:#050807; color:#f8f5ec; border:1px solid #456052; border-radius:12px; padding:12px; margin:8px 0; font-size:16px; }
pre { background:#050807; border:1px solid #456052; border-radius:12px; padding:14px; white-space:pre-wrap; }
.small { color:#f3ead7; }
</style>
</head>
<body>
<main>
<h1>Linear KUT Factory</h1>
<div class="card">
  <strong>Simple path:</strong> Play → Accept or Adjust → next. No reject. Button clicks write directly to disk.
  <p class="small">ACCEPT means processing-only, not release-ready.</p>
</div>

<div class="card active">
  <h2 id="title">Loading…</h2>
  <p id="hint"></p>
  <p id="notes" class="small"></p>
  <audio id="audio" controls></audio>

  <div id="adjustBox" style="display:none">
    <h3>Adjustment</h3>
    <input id="cutEnd" placeholder="Stop/end time, example: 0:13 or 13" />
    <textarea id="adjustNote" rows="3" placeholder="Adjustment note"></textarea>
    <button class="adjust" onclick="saveAdjust()">SAVE ADJUSTMENT + NEXT</button>
  </div>

  <div id="mainButtons">
    <button class="accept" onclick="accept()">ACCEPT + NEXT</button>
    <button class="adjust" onclick="showAdjust()">ADJUST</button>
    <button onclick="previous()">PREVIOUS</button>
  </div>
  <div id="finishOnly" style="display:none">
    <button class="finish" onclick="finish()">FINISH / SAVE LANES</button>
  </div>
</div>

<div class="card">
  <h2>Saved decisions</h2>
  <pre id="summary"></pre>
</div>
</main>

<script>
async function api(path, data) {
  const res = await fetch(path, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined
  });
  return await res.json();
}

async function load() {
  const data = await api("/state");
  const c = data.current;

  if (!c) {
    document.getElementById("title").textContent = "QUEUE COMPLETE";
    document.getElementById("hint").textContent = "Click FINISH / SAVE LANES. No more candidate decisions are needed.";
    document.getElementById("notes").textContent = "";
    document.getElementById("audio").style.display = "none";
    document.getElementById("mainButtons").style.display = "none";
    document.getElementById("finishOnly").style.display = "block";
  } else {
    document.getElementById("title").textContent = c.workOrderId + " · Source candidate " + c.sourceCandidateNumber;
    document.getElementById("hint").textContent = c.candidateRoleHint || "";
    document.getElementById("notes").textContent = c.sourceNotes || "";
    document.getElementById("audio").style.display = "block";
    document.getElementById("mainButtons").style.display = "block";
    document.getElementById("finishOnly").style.display = "none";
    document.getElementById("audio").src = "/audio/" + encodeURIComponent(c.sourceAudioFile);
  }

  const approved = (data.laneSummary?.approvedForProcessing || []).map(d =>
    "APPROVED: " + d.workOrderId + (d.note ? " — " + d.note : "")
  );

  const adjust = (data.laneSummary?.needsAdjust || []).map(d =>
    "ADJUST: " + d.workOrderId + (d.cutEndSeconds ? " — end " + d.cutEndSeconds : "") + (d.note ? " — " + d.note : "")
  );

  document.getElementById("summary").textContent =
    [
      "APPROVED FOR PROCESSING",
      approved.length ? approved.join("\\n") : "(none)",
      "",
      "ADJUST / RECUT LANE",
      adjust.length ? adjust.join("\\n") : "(none)",
      "",
      "Next: process accepted + adjusted lanes with padding, slight end fade, Twinkle, then review."
    ].join("\\n");

  document.getElementById("adjustBox").style.display = "none";
}

async function accept() {
  await api("/accept", {});
  await load();
}

function showAdjust() {
  document.getElementById("adjustBox").style.display = "block";
  document.getElementById("cutEnd").focus();
}

async function saveAdjust() {
  const cutEndSeconds = document.getElementById("cutEnd").value;
  const note = document.getElementById("adjustNote").value;
  await api("/adjust", { cutEndSeconds, note });
  await load();
}

async function previous() {
  await api("/previous", {});
  await load();
}

async function finish() {
  const data = await api("/finish", {});
  alert("Saved decisions to:\\n" + data.decisionPath);
  await load();
}

load();
</script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(page());
    return;
  }

  if (url.pathname.startsWith("/audio/")) {
    serveAudio(req, res);
    return;
  }

  if (url.pathname === "/state") {
    const approvedForProcessing = state.decisions.filter((d) => d.decision === "accept-for-processing");
    const needsAdjust = state.decisions.filter((d) => d.decision === "adjust");

    sendJson(res, {
      current: currentCandidate(),
      currentIndex: state.currentIndex,
      queueLength: queue.length,
      decisions: state.decisions,
      queueComplete: !currentCandidate(),
      laneSummary: {
        approvedForProcessing,
        needsAdjust,
        hold: [],
        reject: []
      }
    });
    return;
  }

  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      const data = body ? JSON.parse(body) : {};
      const c = currentCandidate();

      if (url.pathname === "/accept" && c) {
        state.decisions = state.decisions.filter((d) => d.workOrderId !== c.workOrderId);
        state.decisions.push({
          workOrderId: c.workOrderId,
          sourceCandidateNumber: c.sourceCandidateNumber,
          sourceAudioFile: c.sourceAudioFile,
          decision: "accept-for-processing",
          approveMeans: "processing-only-not-release",
          note: data.note || "",
          renderAudioNow: false,
          releaseReadyNow: false,
          releaseGateAllowedNow: false
        });
        state.currentIndex += 1;
        saveState();
        sendJson(res, { ok: true });
        return;
      }

      if (url.pathname === "/adjust" && c) {
        state.decisions = state.decisions.filter((d) => d.workOrderId !== c.workOrderId);
        state.decisions.push({
          workOrderId: c.workOrderId,
          sourceCandidateNumber: c.sourceCandidateNumber,
          sourceAudioFile: c.sourceAudioFile,
          decision: "adjust",
          cutEndSeconds: data.cutEndSeconds || "",
          note: data.note || "",
          nextLane: "recut-or-adjust-queue",
          renderAudioNow: false,
          releaseReadyNow: false,
          releaseGateAllowedNow: false
        });
        state.currentIndex += 1;
        saveState();
        sendJson(res, { ok: true });
        return;
      }

      if (url.pathname === "/previous") {
        state.currentIndex = Math.max(0, state.currentIndex - 1);
        saveState();
        sendJson(res, { ok: true });
        return;
      }

      if (url.pathname === "/finish") {
        saveState();
        sendJson(res, { ok: true, decisionPath, decisionMdPath });
        return;
      }

      res.writeHead(404);
      res.end("Not found");
    });
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Linear KUT Factory running at ${url}`);
  try {
    execFileSync("open", [url]);
  } catch {}
});
