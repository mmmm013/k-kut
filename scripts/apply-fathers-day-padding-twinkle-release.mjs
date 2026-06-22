import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const repo = process.cwd();

const manifestPath = "data/kk-sets/fathers-day-approval-display-kks.json";
const outDir = "public/kks/fathers-day/release";
const silenceDir = "public/kks/fathers-day/_system";

const twinkleCandidates = [
  "public/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3",
  "public/signatures/get-so-down-4m11-4m19-soft-signature.mp3",
  "public/kks/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
];

const twinklePath = twinkleCandidates.find((p) => fs.existsSync(p));

if (!twinklePath) {
  console.error("STOP: GPM Twinkle signature file not found.");
  console.error("Expected one of:");
  for (const p of twinkleCandidates) console.error(" - " + p);
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) {
  console.error("STOP: missing " + manifestPath);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(silenceDir, { recursive: true });

const leadSilence = path.join(silenceDir, "lead-padding-035.mp3");
const tailSilence = path.join(silenceDir, "tail-padding-075.mp3");

function makeSilence(file, seconds) {
  execFileSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel", "error",
    "-f", "lavfi",
    "-i", "anullsrc=r=44100:cl=stereo",
    "-t", String(seconds),
    "-b:a", "192k",
    file
  ]);
}

makeSilence(leadSilence, 0.35);
makeSilence(tailSilence, 0.75);

function validAudio(file) {
  try {
    const dur = execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=nk=1:nw=1",
      file
    ], { encoding: "utf8" }).trim();

    return Number(dur) > 0;
  } catch {
    return false;
  }
}

if (!validAudio(twinklePath)) {
  console.error("STOP: Twinkle exists but is not valid audio: " + twinklePath);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const sourceKks = Array.isArray(manifest.kks) ? manifest.kks : [];

const kks = sourceKks.filter((kk) => {
  const s = JSON.stringify(kk).toLowerCase();
  return kk.audioUrl && !s.includes("believe in me") && !s.includes("i believe in you") && !s.includes("abab");
});

if (!kks.length) {
  console.error("STOP: no Father’s Day KKs available for release wrapping.");
  process.exit(1);
}

const released = [];

for (const kk of kks) {
  const rawRel = kk.audioUrl.replace(/^\//, "");
  const rawPath = path.join(repo, "public", rawRel);

  if (!fs.existsSync(rawPath)) {
    console.error("STOP: missing raw KK audio: " + kk.audioUrl);
    process.exit(1);
  }

  if (!validAudio(rawPath)) {
    console.error("STOP: invalid raw KK audio: " + kk.audioUrl);
    process.exit(1);
  }

  const safeId = String(kk.kkId || path.basename(rawRel, path.extname(rawRel)))
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  const listPath = path.join(silenceDir, `${safeId}-concat.txt`);
  const releaseRel = `/kks/fathers-day/release/${safeId}-release.mp3`;
  const releasePath = path.join(repo, "public", releaseRel.replace(/^\//, ""));

  const items = [leadSilence, rawPath, tailSilence, twinklePath]
    .map((p) => `file '${path.resolve(p).replace(/'/g, "'\\''")}'`)
    .join("\n");

  fs.writeFileSync(listPath, items);

  execFileSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel", "error",
    "-f", "concat",
    "-safe", "0",
    "-i", listPath,
    "-vn",
    "-ar", "44100",
    "-ac", "2",
    "-b:a", "192k",
    releasePath
  ]);

  if (!validAudio(releasePath)) {
    console.error("STOP: failed release audio: " + releaseRel);
    process.exit(1);
  }

  released.push({
    ...kk,
    rawAudioUrl: kk.audioUrl,
    audioUrl: releaseRel,
    releaseAudioUrl: releaseRel,
    releaseTreatment: "lead padding + KK + tail padding + GPM Twinkle close",
    twinkleSource: "/" + twinklePath.replace(/^public\//, ""),
    status: "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE"
  });

  console.log("RELEASED", kk.title, "=>", releaseRel);
}

const finalKks = released.map((kk, i) => ({ ...kk, displayOrder: i + 1 }));

const groupCounts = {};
for (const kk of finalKks) {
  const g = kk.pixGroup || "Father’s Day";
  groupCounts[g] = (groupCounts[g] || 0) + 1;
}

const finalManifest = {
  ...manifest,
  status: "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
  rule: "No Father’s Day KK release without padding and GPM Twinkle close. Believe in Me skipped for now.",
  count: finalKks.length,
  groupCounts,
  twinkleSource: "/" + twinklePath.replace(/^public\//, ""),
  releaseTreatment: "lead padding + KK + tail padding + GPM Twinkle close",
  kks: finalKks
};

fs.writeFileSync(manifestPath, JSON.stringify(finalManifest, null, 2));
fs.writeFileSync("data/kk-sets/fathers-day-display-kks.json", JSON.stringify(finalManifest, null, 2));
fs.writeFileSync("data/kk-sets/fathers-day-review-kks.json", JSON.stringify(finalManifest, null, 2));

const page = `"use client";

import { useRef, useState } from "react";

const kks = ${JSON.stringify(finalKks, null, 2)};

export default function FathersDayPage() {
  const audioRefs = useRef([]);
  const [playingIndex, setPlayingIndex] = useState(null);

  function playKK(index) {
    const audio = audioRefs.current[index];
    if (!audio) return;

    audioRefs.current.forEach((a, i) => {
      if (a && i !== index) {
        a.pause();
        a.currentTime = 0;
      }
    });

    if (!audio.paused) {
      audio.pause();
      setPlayingIndex(null);
      return;
    }

    audio.currentTime = 0;
    audio.play();
    setPlayingIndex(index);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#130b06", color: "#fff7eb", fontFamily: "Arial, Helvetica, sans-serif", padding: 28 }}>
      <section style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ color: "#f3cf91", fontWeight: 900, letterSpacing: "0.28em", fontSize: 13, marginBottom: 14 }}>
          GPM / K-KUT
        </div>

        <h1 style={{ fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1, margin: "0 0 16px", fontWeight: 900 }}>
          Father’s Day HUGs
        </h1>

        <p style={{ fontSize: 22, lineHeight: 1.45, color: "#f3cf91", fontWeight: 900, marginBottom: 10 }}>
          Click any KK title to play the release-ready version.
        </p>

        <p style={{ fontSize: 18, lineHeight: 1.55, color: "#f7ead7", marginBottom: 24 }}>
          {kks.length} Father’s Day KKs live. Each release includes soft padding and the GPM Twinkle close.
        </p>

        {kks.map((kk, index) => (
          <article key={kk.audioUrl} style={{ border: playingIndex === index ? "2px solid #f3cf91" : "1px solid #8b633a", background: playingIndex === index ? "#3a2415" : "#2b1a10", borderRadius: 24, padding: 22, marginBottom: 18 }}>
            <div style={{ color: "#f3cf91", fontWeight: 900, fontSize: 14, marginBottom: 10 }}>
              KK {kk.displayOrder} · {kk.pixGroup || "Father’s Day"} · padded + Twinkle
            </div>

            <button type="button" onClick={() => playKK(index)} style={{ width: "100%", cursor: "pointer", textAlign: "left", border: "1px solid #d6a55f", background: "#1d1008", color: "#fff7eb", borderRadius: 18, padding: 18, fontSize: 26, lineHeight: 1.25, fontWeight: 900, marginBottom: 14 }}>
              {playingIndex === index ? "▶ Playing: " : "▶ Play: "}
              {kk.title}
            </button>

            <audio ref={(el) => { audioRefs.current[index] = el; }} controls preload="metadata" style={{ width: "100%", marginBottom: 14 }} onEnded={() => setPlayingIndex(null)}>
              <source src={kk.audioUrl} type="audio/mpeg" />
            </audio>

            <p style={{ fontSize: 15, lineHeight: 1.45, color: "#f3cf91" }}>
              Release treatment: soft padding + selected KK + GPM Twinkle close.
            </p>

            <a href={"/checkout?kk=" + encodeURIComponent(kk.kkId || kk.audioUrl)} style={{ display: "inline-block", background: "#f3cf91", color: "#130b06", fontWeight: 900, textDecoration: "none", borderRadius: 999, padding: "12px 18px" }}>
              Choose this KK
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
`;

for (const rel of [
  "app/fathers-day/page.tsx",
  "app/HUGs/page.tsx",
  "app/holiday/page.tsx",
  "app/admin/fathers-day-kk-review/page.tsx"
]) {
  fs.writeFileSync(rel, page);
  console.log("WROTE", rel);
}

fs.mkdirSync("reports", { recursive: true });
const twinkleReportPath = "/" + twinklePath.replace(/^public\//, "");

const reportText =
  "# Father’s Day Release — Padding + Twinkle Applied\\n\\n" +
  "Live release KK count: " + finalKks.length + "\\n\\n" +
  "Twinkle: " + twinkleReportPath + "\\n\\n" +
  finalKks.map((kk) =>
    `${kk.displayOrder}. [${kk.pixGroup || "Father’s Day"}] ${kk.title}\\n   - release: ${kk.audioUrl}\\n   - raw: ${kk.rawAudioUrl}`
  ).join("\\n");

fs.writeFileSync(
  "reports/fathers-day-release-padding-twinkle.md",
  reportText
);

console.log("FATHER'S DAY RELEASE KK COUNT:", finalKks.length);
console.log("TWINKLE:", "/" + twinklePath.replace(/^public\//, ""));
