import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const repo = process.cwd();
const outDir = path.join(repo, "public", "kks", "fathers-day", "review");
const dataDir = path.join(repo, "data", "kk-sets");
const pageDir = path.join(repo, "app", "admin", "fathers-day-kk-review");

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(pageDir, { recursive: true });

const AUDIO_EXT = /\.(mp3|wav|m4a|aac|aiff|aif|flac)$/i;

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if ([".next", "node_modules", ".git"].includes(item)) continue;
      walk(p, acc);
    } else if (AUDIO_EXT.test(item)) {
      acc.push(p);
    }
  }
  return acc;
}

const audioFiles = [
  ...walk(path.join(repo, "public")),
  ...walk(path.join(repo, "data")),
].filter((p, idx, arr) => arr.indexOf(p) === idx);

function score(file, terms) {
  const s = file.toLowerCase().replace(/[^a-z0-9]+/g, " ");
  let total = 0;
  for (const t of terms) {
    if (s.includes(t.toLowerCase())) total += 10;
  }
  return total;
}

function pickSource(label, requiredTerms, preferredTerms = []) {
  const ranked = audioFiles
    .map((file) => ({
      file,
      score: score(file, requiredTerms) + score(file, preferredTerms),
    }))
    .filter((x) => x.score >= requiredTerms.length * 10)
    .sort((a, b) => b.score - a.score || a.file.length - b.file.length);

  if (!ranked.length) {
    console.log(`MISSING SOURCE: ${label}`);
    return null;
  }

  console.log(`SOURCE ${label}: ${path.relative(repo, ranked[0].file)}`);
  return ranked[0].file;
}

function durationSeconds(file) {
  const out = execFileSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nk=1:nw=1",
    file,
  ], { encoding: "utf8" }).trim();

  const n = Number(out);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Bad duration for ${file}: ${out}`);
  return n;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function timeRange(dur, section) {
  const minEndPad = 1.0;

  const ranges = {
    "intro-v1": [0.00, 0.265],
    "v1": [0.095, 0.265],
    "ch1": [0.265, 0.420],
    "bridge": [0.535, 0.675],
    "v2": [0.420, 0.535],
    "ch2-outro": [0.675, 1.000],
    "final-chorus-outro": [0.705, 1.000],
    "ch3-outro": [0.705, 1.000],
  };

  const r = ranges[section];
  if (!r) throw new Error(`Unknown section ${section}`);

  let start = dur * r[0];
  let end = dur * r[1];

  if (section === "intro-v1") start = 0;
  if (section === "final-chorus-outro" || section === "ch2-outro" || section === "ch3-outro") end = dur - 0.25;

  start = clamp(start, 0, Math.max(0, dur - 8));
  end = clamp(end, start + 8, dur - minEndPad);

  return { start, end };
}

function fmt(n) {
  return n.toFixed(3);
}

function capture({ source, kkId, title, section, note }) {
  const dur = durationSeconds(source);
  const { start, end } = timeRange(dur, section);
  const outFile = path.join(outDir, `${kkId}.mp3`);
  const publicPath = `/kks/fathers-day/review/${kkId}.mp3`;

  execFileSync("ffmpeg", [
    "-y",
    "-hide_banner",
    "-loglevel", "error",
    "-ss", fmt(start),
    "-to", fmt(end),
    "-i", source,
    "-vn",
    "-af", "afade=t=in:st=0:d=0.08,afade=t=out:st=" + fmt(Math.max(0.1, end - start - 0.35)) + ":d=0.35",
    "-ar", "44100",
    "-ac", "2",
    "-b:a", "192k",
    outFile,
  ]);

  console.log(`CAPTURED ${kkId}: ${fmt(start)}–${fmt(end)} ${publicPath}`);

  return {
    kkId,
    title,
    section,
    source: path.relative(repo, source),
    audioUrl: publicPath,
    startSeconds: Number(fmt(start)),
    endSeconds: Number(fmt(end)),
    durationSeconds: Number(fmt(end - start)),
    note,
    status: "REVIEW_CANDIDATE_NOT_FINAL_APPROVED",
  };
}

const sources = {
  til: pickSource("Til I'm Dyin' I'm Tryin'", ["til", "dyin"], ["tryin"]),
  those: pickSource("Those Days These Days", ["those", "days"], ["these"]),
  chair: pickSource("That Empty Chair Radio Edit", ["empty", "chair"], ["radio", "edit"]),
  haveTo: pickSource("Have-To Duet", ["have", "to"], ["duet"]),
};

const requests = [
  {
    src: "til",
    kkId: "til-im-dyin-im-tryin-ch1",
    title: "Til I'm Dyin' I'm Tryin' — Chorus 1",
    section: "ch1",
    note: "Father’s Day candidate: grit / keep-going / effort.",
  },
  {
    src: "til",
    kkId: "til-im-dyin-im-tryin-final-chorus-outro",
    title: "Til I'm Dyin' I'm Tryin' — Final Chorus + Outro",
    section: "final-chorus-outro",
    note: "Father’s Day candidate: final resolve / perseverance.",
  },

  {
    src: "those",
    kkId: "those-days-these-days-intro-v1",
    title: "Those Days These Days — Intro + Verse 1",
    section: "intro-v1",
    note: "Father’s Day candidate: memory / time / reflection.",
  },
  {
    src: "those",
    kkId: "those-days-these-days-ch1",
    title: "Those Days These Days — Chorus 1",
    section: "ch1",
    note: "Father’s Day candidate: memory / gratitude / past-to-present.",
  },
  {
    src: "those",
    kkId: "those-days-these-days-bridge",
    title: "Those Days These Days — Bridge",
    section: "bridge",
    note: "Father’s Day candidate: turn / realization / emotional pivot.",
  },
  {
    src: "those",
    kkId: "those-days-these-days-v2",
    title: "Those Days These Days — Verse 2",
    section: "v2",
    note: "Father’s Day candidate: second memory/detail section.",
  },
  {
    src: "those",
    kkId: "those-days-these-days-ch2-outro",
    title: "Those Days These Days — Chorus 2 + Outro",
    section: "ch2-outro",
    note: "Father’s Day candidate: closing memory / legacy / send-off.",
  },

  {
    src: "chair",
    kkId: "that-empty-chair-radio-edit-ch1",
    title: "That Empty Chair (Radio Edit) — Chorus 1",
    section: "ch1",
    note: "Father’s Day candidate: after repeated Verse 1a / Verse 1b; grief / remembrance / absence.",
  },
  {
    src: "chair",
    kkId: "that-empty-chair-radio-edit-final-chorus-outro",
    title: "That Empty Chair (Radio Edit) — Final Chorus + Outro",
    section: "final-chorus-outro",
    note: "Father’s Day candidate: final grief / remembrance / closing impact.",
  },

  {
    src: "haveTo",
    kkId: "have-to-duet-ch1",
    title: "Have-To Duet — Chorus 1",
    section: "ch1",
    note: "Father’s Day candidate: duty / devotion / have-to love.",
  },
  {
    src: "haveTo",
    kkId: "have-to-duet-ch3-outro",
    title: "Have-To Duet — Chorus 3 + Outro",
    section: "ch3-outro",
    note: "Father’s Day candidate: final duty/devotion close.",
  },
];

const captured = [];

for (const req of requests) {
  const source = sources[req.src];
  if (!source) {
    console.log(`SKIPPED ${req.kkId}: source missing`);
    continue;
  }

  try {
    captured.push(capture({ ...req, source }));
  } catch (e) {
    console.log(`FAILED ${req.kkId}: ${e.message}`);
  }
}

const manifest = {
  setId: "fathers-day-review-kks",
  lane: "holiday_review_candidate",
  holiday: "Father’s Day",
  status: "REVIEW_CANDIDATES_NOT_PUBLIC_APPROVED",
  approvalRule: "No public holiday display unless at least 8 KKs are reviewed and explicitly approved.",
  count: captured.length,
  kks: captured,
};

fs.writeFileSync(
  path.join(dataDir, "fathers-day-review-kks.json"),
  JSON.stringify(manifest, null, 2)
);

const cards = captured.map((k) => `{
  kkId: ${JSON.stringify(k.kkId)},
  title: ${JSON.stringify(k.title)},
  audioUrl: ${JSON.stringify(k.audioUrl)},
  note: ${JSON.stringify(k.note)},
  source: ${JSON.stringify(k.source)},
  startSeconds: ${k.startSeconds},
  endSeconds: ${k.endSeconds},
}`).join(",\n");

const page = `const kks = [
${cards}
];

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
          Review candidates only. No holiday public display unless at least 8 KKs
          are explicitly approved.
        </p>

        <div className="grid gap-5">
          {kks.map((kk, index) => (
            <article
              key={kk.kkId}
              className="rounded-3xl border border-[#8b633a] bg-[#2b1a10] p-5 shadow-2xl"
            >
              <p className="mb-2 text-sm font-bold text-[#f3cf91]">
                KK {index + 1}
              </p>

              <h2 className="mb-3 text-2xl font-black">
                {kk.title}
              </h2>

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
      </section>
    </main>
  );
}
`;

fs.writeFileSync(path.join(pageDir, "page.tsx"), page);

console.log("");
console.log(`CAPTURE COMPLETE: ${captured.length} review KKs`);
console.log("Manifest: data/kk-sets/fathers-day-review-kks.json");
console.log("Review page: /admin/fathers-day-kk-review");

if (captured.length < 8) {
  console.log("");
  console.log("WARNING: fewer than 8 KKs captured. Do not public-display Father’s Day.");
}
