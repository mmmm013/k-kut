import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const repo = process.cwd();
const outDir = path.join(repo, "public/kks/fathers-day/review");
fs.mkdirSync(outDir, { recursive: true });

function duration(file) {
  return Number(execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nk=1:nw=1",
    file,
  ], { encoding: "utf8" }).trim());
}

function cut({ id, title, src, startPct, endPct, note }) {
  const full = path.join(repo, src);
  const d = duration(full);
  const start = Math.max(0, d * startPct);
  const end = Math.min(d - 0.25, d * endPct);
  const len = end - start;
  const out = path.join(outDir, `${id}.mp3`);

  execFileSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel", "error",
    "-ss", start.toFixed(3),
    "-to", end.toFixed(3),
    "-i", full,
    "-vn",
    "-af", `afade=t=in:st=0:d=0.08,afade=t=out:st=${Math.max(0.1, len - 0.35).toFixed(3)}:d=0.35`,
    "-ar", "44100",
    "-ac", "2",
    "-b:a", "192k",
    out,
  ]);

  return {
    kkId: id,
    title,
    audioUrl: `/kks/fathers-day/review/${id}.mp3`,
    source: src,
    startSeconds: Number(start.toFixed(3)),
    endSeconds: Number(end.toFixed(3)),
    durationSeconds: Number(len.toFixed(3)),
    note,
    status: "REVIEW_CANDIDATE_NOT_FINAL_APPROVED",
  };
}

const src = {
  til: "public/pix/fathers-day/source-audio/til-im-dyin-im-tryin-en.mp3",
  chair: "public/pix/fathers-day/source-audio/that-empty-chair-radio-edit-instro.mp3",
  haveTo: "public/pix/fathers-day/source-audio/have-to-duet-jade-aaron.wav",
  believe: "public/pix/fathers-day/source-audio/i-believe-in-you-abab-cab-out.mp3",
};

const kks = [
  cut({ id: "til-im-dyin-im-tryin-ch1", title: "Til I'm Dyin' I'm Tryin' — Chorus 1", src: src.til, startPct: 0.265, endPct: 0.42, note: "Grit / effort / keep-going Father’s Day feeling." }),
  cut({ id: "til-im-dyin-im-tryin-final-chorus-outro", title: "Til I'm Dyin' I'm Tryin' — Final Chorus + Outro", src: src.til, startPct: 0.705, endPct: 0.995, note: "Final resolve / perseverance close." }),

  cut({ id: "that-empty-chair-radio-edit-ch1", title: "That Empty Chair (Radio Edit) — Chorus 1", src: src.chair, startPct: 0.265, endPct: 0.42, note: "Remembrance / absence / grief support. Source available is INSTRO." }),
  cut({ id: "that-empty-chair-radio-edit-final-chorus-outro", title: "That Empty Chair (Radio Edit) — Final Chorus + Outro", src: src.chair, startPct: 0.705, endPct: 0.995, note: "Final remembrance close. Source available is INSTRO." }),

  cut({ id: "have-to-duet-ch1", title: "Have-To Duet — Chorus 1", src: src.haveTo, startPct: 0.265, endPct: 0.42, note: "Duty / devotion / have-to love." }),
  cut({ id: "have-to-duet-ch3-outro", title: "Have-To Duet — Chorus 3 + Outro", src: src.haveTo, startPct: 0.705, endPct: 0.995, note: "Final duty / devotion close." }),

  cut({ id: "believe-in-me-intro-v1", title: "Believe in Me — Intro + Verse 1", src: src.believe, startPct: 0.0, endPct: 0.19, note: "Belief / support / presence opening." }),
  cut({ id: "believe-in-me-ch1", title: "Believe in Me — Chorus 1", src: src.believe, startPct: 0.19, endPct: 0.32, note: "Belief / reassurance / support hook." }),
  cut({ id: "believe-in-me-v2", title: "Believe in Me — Verse 2", src: src.believe, startPct: 0.32, endPct: 0.46, note: "Second support / story section." }),
  cut({ id: "believe-in-me-ch2", title: "Believe in Me — Chorus 2", src: src.believe, startPct: 0.46, endPct: 0.58, note: "Second belief / reassurance hook." }),
  cut({ id: "believe-in-me-bridge", title: "Believe in Me — Bridge", src: src.believe, startPct: 0.58, endPct: 0.71, note: "Emotional turn / lift / commitment." }),
  cut({ id: "believe-in-me-final-chorus-outro", title: "Believe in Me — Final Chorus + Outro", src: src.believe, startPct: 0.71, endPct: 0.995, note: "Final belief / support / closing resolve." }),
];

fs.writeFileSync(
  path.join(repo, "data/kk-sets/fathers-day-review-kks.json"),
  JSON.stringify({
    setId: "fathers-day-review-kks",
    lane: "holiday_review_candidate",
    holiday: "Father’s Day",
    status: "REVIEW_CANDIDATES_NOT_PUBLIC_APPROVED",
    approvalRule: "No public holiday display unless at least 8 KKs are reviewed and explicitly approved.",
    count: kks.length,
    missing: ["Those Days These Days source audio still not located"],
    kks,
  }, null, 2)
);

const page = `const kks = ${JSON.stringify(kks, null, 2)};

export default function FathersDayKKReviewPage() {
  return (
    <main className="min-h-screen bg-[#130b06] text-[#fff7eb]">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <p className="mb-3 text-sm font-bold tracking-[0.35em] text-[#f3cf91]">GPM / K-KUT / ADMIN REVIEW</p>
        <h1 className="mb-4 text-4xl font-black md:text-6xl">Father’s Day KK Review</h1>
        <p className="mb-8 max-w-3xl leading-8 text-[#f7ead7]">
          {kks.length} playable review KKs. Review candidates only. Public display requires explicit approval of at least 8 KKs.
        </p>

        <div className="grid gap-5">
          {kks.map((kk, index) => (
            <article key={kk.kkId} className="rounded-3xl border border-[#8b633a] bg-[#2b1a10] p-5 shadow-2xl">
              <p className="mb-2 text-sm font-bold text-[#f3cf91]">KK {index + 1}</p>
              <h2 className="mb-3 text-2xl font-black">{kk.title}</h2>
              <audio controls preload="metadata" className="mb-4 w-full">
                <source src={kk.audioUrl} type="audio/mpeg" />
              </audio>
              <p className="mb-2 leading-7 text-[#f7ead7]">{kk.note}</p>
              <p className="text-sm text-[#d6a55f]">Source: {kk.source} · {kk.startSeconds}s–{kk.endSeconds}s</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
`;

fs.writeFileSync(path.join(repo, "app/admin/fathers-day-kk-review/page.tsx"), page);

console.log(`CAPTURED ${kks.length} PLAYABLE REVIEW KKs`);
for (const kk of kks) console.log(`${kk.kkId}: ${kk.audioUrl}`);
