import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const repo = process.cwd();

const outDir = path.join(repo, "public/kks/fathers-day/review");
fs.mkdirSync(outDir, { recursive: true });

const sources = {
  til: "public/pix/fathers-day/source-audio/til-im-dyin-im-tryin-en.mp3",
  chair: "public/pix/fathers-day/source-audio/that-empty-chair-radio-edit-instro.mp3",
  haveTo: "public/pix/fathers-day/source-audio/have-to-duet-jade-aaron.wav",
};

function duration(file) {
  const out = execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nk=1:nw=1",
    file,
  ], { encoding: "utf8" }).trim();

  return Number(out);
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

const kks = [
  cut({
    id: "til-im-dyin-im-tryin-ch1",
    title: "Til I'm Dyin' I'm Tryin' — Chorus 1",
    src: sources.til,
    startPct: 0.265,
    endPct: 0.42,
    note: "Candidate KK: grit, effort, keep-going Father’s Day feeling.",
  }),
  cut({
    id: "til-im-dyin-im-tryin-final-chorus-outro",
    title: "Til I'm Dyin' I'm Tryin' — Final Chorus + Outro",
    src: sources.til,
    startPct: 0.705,
    endPct: 0.995,
    note: "Candidate KK: final resolve / perseverance close.",
  }),

  cut({
    id: "that-empty-chair-radio-edit-ch1",
    title: "That Empty Chair (Radio Edit) — Chorus 1",
    src: sources.chair,
    startPct: 0.265,
    endPct: 0.42,
    note: "Candidate KK: remembrance / absence / grief support. Source available is INSTRO.",
  }),
  cut({
    id: "that-empty-chair-radio-edit-final-chorus-outro",
    title: "That Empty Chair (Radio Edit) — Final Chorus + Outro",
    src: sources.chair,
    startPct: 0.705,
    endPct: 0.995,
    note: "Candidate KK: final remembrance close. Source available is INSTRO.",
  }),

  cut({
    id: "have-to-duet-ch1",
    title: "Have-To Duet — Chorus 1",
    src: sources.haveTo,
    startPct: 0.265,
    endPct: 0.42,
    note: "Candidate KK: duty / devotion / have-to love.",
  }),
  cut({
    id: "have-to-duet-ch3-outro",
    title: "Have-To Duet — Chorus 3 + Outro",
    src: sources.haveTo,
    startPct: 0.705,
    endPct: 0.995,
    note: "Candidate KK: final duty / devotion close.",
  }),
];

const missing = [
  "Those Days These Days — Intro + Verse 1",
  "Those Days These Days — Chorus 1",
  "Those Days These Days — Bridge",
  "Those Days These Days — Verse 2",
  "Those Days These Days — Chorus 2 + Outro",
];

const manifest = {
  setId: "fathers-day-review-kks",
  lane: "holiday_review_candidate",
  holiday: "Father’s Day",
  status: "REVIEW_CANDIDATES_NOT_PUBLIC_APPROVED",
  approvalRule: "No public holiday display unless at least 8 KKs are reviewed and explicitly approved.",
  count: kks.length,
  missing,
  kks,
};

fs.writeFileSync(
  path.join(repo, "data/kk-sets/fathers-day-review-kks.json"),
  JSON.stringify(manifest, null, 2)
);

const page = `const kks = ${JSON.stringify(kks, null, 2)};
const missing = ${JSON.stringify(missing, null, 2)};

export default function FathersDayKKReviewPage() {
  return (
    <main className="min-h-screen bg-[#130b06] text-[#fff7eb]">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <p className="mb-3 text-sm font-bold tracking-[0.35em] text-[#f3cf91]">
          GPM / K-KUT / ADMIN REVIEW
        </p>

        <h1 className="mb-4 text-4xl font-black md:text-6xl">
          Father’s Day KK Review
        </h1>

        <p className="mb-8 max-w-3xl leading-8 text-[#f7ead7]">
          Review candidates only. These are not public-approved until you approve at least 8 KKs.
        </p>

        <div className="mb-8 rounded-3xl border border-[#8b633a] bg-[#2b1a10] p-5">
          <h2 className="mb-3 text-2xl font-black text-[#f3cf91]">
            Captured now: {kks.length}
          </h2>
          <p className="leading-7 text-[#f7ead7]">
            Missing source audio still needed for Those Days These Days before those requested KKs can be captured.
          </p>
        </div>

        <div className="grid gap-5">
          {kks.map((kk, index) => (
            <article key={kk.kkId} className="rounded-3xl border border-[#8b633a] bg-[#2b1a10] p-5 shadow-2xl">
              <p className="mb-2 text-sm font-bold text-[#f3cf91]">KK {index + 1}</p>
              <h2 className="mb-3 text-2xl font-black">{kk.title}</h2>
              <audio controls preload="metadata" className="mb-4 w-full">
                <source src={kk.audioUrl} type="audio/mpeg" />
              </audio>
              <p className="mb-2 leading-7 text-[#f7ead7]">{kk.note}</p>
              <p className="text-sm text-[#d6a55f]">
                Source: {kk.source} · {kk.startSeconds}s–{kk.endSeconds}s
              </p>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-3xl border border-[#8b633a] bg-[#2b1a10] p-5">
          <h2 className="mb-3 text-2xl font-black text-[#f3cf91]">
            Still missing
          </h2>
          <ul className="list-disc space-y-2 pl-6 text-[#f7ead7]">
            {missing.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </section>
      </section>
    </main>
  );
}
`;

fs.writeFileSync(path.join(repo, "app/admin/fathers-day-kk-review/page.tsx"), page);

console.log(`CAPTURED ${kks.length} REVIEW KKs`);
for (const kk of kks) console.log(`${kk.kkId}: ${kk.audioUrl}`);
console.log("MISSING Those Days These Days source audio.");
