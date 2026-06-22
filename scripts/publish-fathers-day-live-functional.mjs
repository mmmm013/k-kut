import fs from "fs";
import path from "path";

const repo = process.cwd();
const manifestPath = path.join(repo, "data/kk-sets/fathers-day-approval-display-kks.json");

if (!fs.existsSync(manifestPath)) {
  throw new Error("STOP: missing data/kk-sets/fathers-day-approval-display-kks.json");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const kks = manifest.kks || [];

if (kks.length < 8) {
  throw new Error(`STOP: only ${kks.length} KKs. Public Father’s Day requires at least 8 approved KKs.`);
}

for (const kk of kks) {
  const filePath = path.join(repo, "public", kk.audioUrl.replace(/^\//, ""));
  if (!fs.existsSync(filePath)) {
    throw new Error(`STOP: missing audio file for ${kk.kkId}: ${kk.audioUrl}`);
  }
}

const page = `"use client";

import { useRef, useState } from "react";

const kks = ${JSON.stringify(kks, null, 2)};

export default function FathersDayLivePage() {
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
    <main
      style={{
        minHeight: "100vh",
        background: "#120905",
        color: "#fff7eb",
        fontFamily: "Arial, Helvetica, sans-serif",
        padding: "28px",
      }}
    >
      <section style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <header style={{ marginBottom: "28px" }}>
          <div
            style={{
              color: "#f3cf91",
              fontWeight: 900,
              letterSpacing: "0.3em",
              fontSize: "13px",
              marginBottom: "14px",
            }}
          >
            GPM / K-KUT
          </div>

          <h1
            style={{
              fontSize: "clamp(44px, 7vw, 76px)",
              lineHeight: 1,
              margin: "0 0 16px",
              fontWeight: 900,
            }}
          >
            Father’s Day HUGs
          </h1>

          <p
            style={{
              fontSize: "24px",
              lineHeight: 1.35,
              color: "#f3cf91",
              fontWeight: 900,
              margin: "0 0 12px",
            }}
          >
            Click a KK title to hear the music moment.
          </p>

          <p
            style={{
              fontSize: "18px",
              lineHeight: 1.55,
              color: "#f7ead7",
              margin: "0 0 24px",
              maxWidth: "820px",
            }}
          >
            Approved Father’s Day KKs. Choose by feeling: respect, strength,
            steadiness, legacy, hope, gratitude, remembrance, and keep-going love.
          </p>
        </header>

        <section
          style={{
            border: "1px solid #8b633a",
            background: "#2b1a10",
            borderRadius: "24px",
            padding: "22px",
            marginBottom: "24px",
            boxShadow: "0 18px 44px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              color: "#f3cf91",
              fontWeight: 900,
              fontSize: "14px",
              letterSpacing: "0.18em",
              marginBottom: "10px",
            }}
          >
            FATHER’S DAY APPROVED SET
          </div>

          <p style={{ fontSize: "18px", lineHeight: 1.55, margin: 0 }}>
            {kks.length} approved KK options. Holiday is its own separate lane.
            Theme match only. No holiday ownership. No junk duplicates.
          </p>
        </section>

        <section>
          {kks.map((kk, index) => (
            <article
              key={kk.audioUrl}
              style={{
                border: playingIndex === index ? "2px solid #f3cf91" : "1px solid #8b633a",
                background: playingIndex === index ? "#3a2415" : "#2b1a10",
                borderRadius: "24px",
                padding: "22px",
                marginBottom: "18px",
                boxShadow: "0 18px 44px rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  color: "#f3cf91",
                  fontWeight: 900,
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              >
                KK {kk.displayOrder} · {kk.pixGroup}
              </div>

              <button
                type="button"
                onClick={() => playKK(index)}
                style={{
                  width: "100%",
                  display: "block",
                  cursor: "pointer",
                  textAlign: "left",
                  border: "1px solid #d6a55f",
                  background: "#1d1008",
                  color: "#fff7eb",
                  borderRadius: "18px",
                  padding: "18px",
                  fontSize: "26px",
                  lineHeight: 1.25,
                  fontWeight: 900,
                  marginBottom: "14px",
                }}
              >
                {playingIndex === index ? "▶ Playing: " : "▶ Play: "}
                {kk.title}
              </button>

              <audio
                ref={(el) => {
                  audioRefs.current[index] = el;
                }}
                controls
                preload="metadata"
                style={{ width: "100%", marginBottom: "14px" }}
                onEnded={() => setPlayingIndex(null)}
              >
                <source src={kk.audioUrl} type="audio/mpeg" />
              </audio>

              {kk.note ? (
                <p
                  style={{
                    fontSize: "17px",
                    lineHeight: 1.5,
                    color: "#f7ead7",
                    margin: "0 0 14px",
                  }}
                >
                  {kk.note}
                </p>
              ) : null}

              <a
                href={"/checkout?kk=" + encodeURIComponent(kk.kkId)}
                style={{
                  display: "inline-block",
                  background: "#f3cf91",
                  color: "#130b06",
                  fontWeight: 900,
                  textDecoration: "none",
                  borderRadius: "999px",
                  padding: "12px 18px",
                }}
              >
                Choose this KK
              </a>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
`;

const targets = [
  "app/fathers-day/page.tsx",
  "app/HUGs/page.tsx",
  "app/holiday/page.tsx",
  "app/admin/fathers-day-kk-review/page.tsx",
];

for (const target of targets) {
  const full = path.join(repo, target);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, page);
  console.log("WROTE", target);
}

console.log("PUBLISHED FATHER'S DAY KK COUNT:", kks.length);
