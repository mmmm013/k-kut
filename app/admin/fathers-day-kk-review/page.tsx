"use client";

import { useRef, useState } from "react";

const kks = [
  {
    "displayOrder": 1,
    "kkId": "thank-you-sec-br",
    "title": "Thank You — Bridge",
    "audioUrl": "/kks/fathers-day/release/thank-you-sec-br-release.mp3",
    "pixGroup": "Thank You",
    "note": "gratitude turn / emotional pivot",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "rawAudioUrl": "/kks/thank-you/kks-expanded/thank-you-sec-br.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/thank-you-sec-br-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  },
  {
    "displayOrder": 2,
    "kkId": "thank-you-sec-ch1",
    "title": "Thank You — Chorus 1",
    "audioUrl": "/kks/fathers-day/release/thank-you-sec-ch1-release.mp3",
    "pixGroup": "Thank You",
    "note": "clear gratitude hook",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "rawAudioUrl": "/kks/thank-you/kks-expanded/thank-you-sec-ch1.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/thank-you-sec-ch1-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  },
  {
    "displayOrder": 3,
    "kkId": "thank-you-sec-ch2",
    "title": "Thank You — Chorus 2",
    "audioUrl": "/kks/fathers-day/release/thank-you-sec-ch2-release.mp3",
    "pixGroup": "Thank You",
    "note": "strong gratitude return",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "rawAudioUrl": "/kks/thank-you/kks-expanded/thank-you-sec-ch2.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/thank-you-sec-ch2-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  },
  {
    "displayOrder": 4,
    "kkId": "thank-you-sec-intro",
    "title": "Thank You — Intro",
    "audioUrl": "/kks/fathers-day/release/thank-you-sec-intro-release.mp3",
    "pixGroup": "Thank You",
    "note": "opening gratitude / setup",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "rawAudioUrl": "/kks/thank-you/kks-expanded/thank-you-sec-intro.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/thank-you-sec-intro-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  },
  {
    "displayOrder": 5,
    "kkId": "thank-you-sec-outro",
    "title": "Thank You — Outro",
    "audioUrl": "/kks/fathers-day/release/thank-you-sec-outro-release.mp3",
    "pixGroup": "Thank You",
    "note": "gratitude close / send-off",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "rawAudioUrl": "/kks/thank-you/kks-expanded/thank-you-sec-outro.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/thank-you-sec-outro-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  },
  {
    "displayOrder": 6,
    "kkId": "thank-you-sec-prech1",
    "title": "Thank You — Pre-Chorus 1",
    "audioUrl": "/kks/fathers-day/release/thank-you-sec-prech1-release.mp3",
    "pixGroup": "Thank You",
    "note": "lift into gratitude hook",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "rawAudioUrl": "/kks/thank-you/kks-expanded/thank-you-sec-prech1.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/thank-you-sec-prech1-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  },
  {
    "displayOrder": 7,
    "kkId": "thank-you-sec-v1a",
    "title": "Thank You — Verse 1A",
    "audioUrl": "/kks/fathers-day/release/thank-you-sec-v1a-release.mp3",
    "pixGroup": "Thank You",
    "note": "specific gratitude / first verse setup",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "rawAudioUrl": "/kks/thank-you/kks-expanded/thank-you-sec-v1a.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/thank-you-sec-v1a-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  },
  {
    "displayOrder": 8,
    "kkId": "have-to-duet-ch1",
    "title": "Have-To Duet — Chorus 1",
    "audioUrl": "/kks/fathers-day/release/have-to-duet-ch1-release.mp3",
    "source": "public/pix/fathers-day/source-audio/have-to-duet-jade-aaron.wav",
    "startSeconds": 58.389,
    "endSeconds": 92.541,
    "durationSeconds": 34.152,
    "note": "Duty / devotion / have-to love.",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "pixGroup": "Have-To Duet",
    "rawAudioUrl": "/kks/fathers-day/review/have-to-duet-ch1.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/have-to-duet-ch1-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  },
  {
    "displayOrder": 9,
    "kkId": "thank-you-sec-v1b",
    "title": "Thank You — Verse 1B",
    "audioUrl": "/kks/fathers-day/release/thank-you-sec-v1b-release.mp3",
    "pixGroup": "Thank You",
    "note": "specific gratitude / first verse continuation",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "rawAudioUrl": "/kks/thank-you/kks-expanded/thank-you-sec-v1b.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/thank-you-sec-v1b-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  },
  {
    "displayOrder": 10,
    "kkId": "thank-you-sec-v2a",
    "title": "Thank You — Verse 2A",
    "audioUrl": "/kks/fathers-day/release/thank-you-sec-v2a-release.mp3",
    "pixGroup": "Thank You",
    "note": "second gratitude detail",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "rawAudioUrl": "/kks/thank-you/kks-expanded/thank-you-sec-v2a.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/thank-you-sec-v2a-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  },
  {
    "displayOrder": 11,
    "kkId": "have-to-duet-ch3-outro",
    "title": "Have-To Duet — Chorus 3 + Outro",
    "audioUrl": "/kks/fathers-day/release/have-to-duet-ch3-outro-release.mp3",
    "source": "public/pix/fathers-day/source-audio/have-to-duet-jade-aaron.wav",
    "startSeconds": 155.336,
    "endSeconds": 219.234,
    "durationSeconds": 63.897,
    "note": "Final duty / devotion close.",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "pixGroup": "Have-To Duet",
    "rawAudioUrl": "/kks/fathers-day/review/have-to-duet-ch3-outro.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/have-to-duet-ch3-outro-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  },
  {
    "displayOrder": 12,
    "kkId": "thank-you-sec-v2b",
    "title": "Thank You — Verse 2B",
    "audioUrl": "/kks/fathers-day/release/thank-you-sec-v2b-release.mp3",
    "pixGroup": "Thank You",
    "note": "second gratitude continuation",
    "status": "FATHERS_DAY_RELEASE_READY_WITH_PADDING_TWINKLE",
    "rawAudioUrl": "/kks/thank-you/kks-expanded/thank-you-sec-v2b.mp3",
    "releaseAudioUrl": "/kks/fathers-day/release/thank-you-sec-v2b-release.mp3",
    "releaseTreatment": "lead padding + KK + tail padding + GPM Twinkle close",
    "twinkleSource": "/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"
  }
];

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
        <div style={{ color: "#f3cf91", fontWeight: 900, letterSpacing: "0.28em", fontSize: 13, marginBottom: 14 }}>GPM / K-KUT</div>

        <h1 style={{ fontSize: "clamp(42px, 7vw, 72px)", lineHeight: 1, margin: "0 0 16px", fontWeight: 900 }}>
          Father’s Day HUGs
        </h1>

        <p style={{ fontSize: 22, lineHeight: 1.45, color: "#f3cf91", fontWeight: 900, marginBottom: 10 }}>
          Click any KK title to play it.
        </p>

        <p style={{ fontSize: 18, lineHeight: 1.55, color: "#f7ead7", marginBottom: 24 }}>
          {kks.length} Father’s Day KKs live. Retracted for source safety: Believe in Me, Til I’m Dyin’ I’m Tryin’, and That Empty Chair.
        </p>

        {kks.map((kk, index) => (
          <article key={kk.audioUrl} style={{ border: playingIndex === index ? "2px solid #f3cf91" : "1px solid #8b633a", background: playingIndex === index ? "#3a2415" : "#2b1a10", borderRadius: 24, padding: 22, marginBottom: 18 }}>
            <div style={{ color: "#f3cf91", fontWeight: 900, fontSize: 14, marginBottom: 10 }}>
              KK {kk.displayOrder} · {kk.pixGroup || "Father’s Day"}
            </div>

            <button type="button" onClick={() => playKK(index)} style={{ width: "100%", cursor: "pointer", textAlign: "left", border: "1px solid #d6a55f", background: "#1d1008", color: "#fff7eb", borderRadius: 18, padding: 18, fontSize: 26, lineHeight: 1.25, fontWeight: 900, marginBottom: 14 }}>
              {playingIndex === index ? "▶ Playing: " : "▶ Play: "}
              {kk.title}
            </button>

            <audio ref={(el) => { audioRefs.current[index] = el; }} controls preload="metadata" style={{ width: "100%", marginBottom: 14 }} onEnded={() => setPlayingIndex(null)}>
              <source src={kk.audioUrl} type="audio/mpeg" />
            </audio>

            <a href={"/checkout?kk=" + encodeURIComponent(kk.kkId || kk.audioUrl)} style={{ display: "inline-block", background: "#f3cf91", color: "#130b06", fontWeight: 900, textDecoration: "none", borderRadius: 999, padding: "12px 18px" }}>
              Choose this KK
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}
