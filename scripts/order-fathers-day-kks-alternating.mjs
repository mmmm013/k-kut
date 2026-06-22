import fs from "fs";
import path from "path";

const repo = process.cwd();

const reviewManifestPath = path.join(repo, "data/kk-sets/fathers-day-review-kks.json");
const outManifestPath = path.join(repo, "data/kk-sets/fathers-day-display-kks.json");
const outPagePath = path.join(repo, "app/admin/fathers-day-kk-review/page.tsx");

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;

  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    const st = fs.statSync(p);

    if (st.isDirectory()) {
      walk(p, acc);
    } else if (/\.(mp3|wav|m4a|aif|aiff|flac)$/i.test(item)) {
      acc.push(p);
    }
  }

  return acc;
}

function pixGroupFromId(id = "") {
  const s = id.toLowerCase();

  if (s.includes("til-im-dyin") || s.includes("dyin") || s.includes("tryin")) return "Til I'm Dyin' I'm Tryin'";
  if (s.includes("empty-chair") || s.includes("chair")) return "That Empty Chair";
  if (s.includes("have-to") || s.includes("have_to")) return "Have-To Duet";
  if (s.includes("believe")) return "Believe in Me";
  if (s.includes("those-days") || s.includes("these-days")) return "Those Days These Days";
  if (s.includes("thank-you")) return "Thank You";

  return "Other / Existing";
}

function titleFromFile(file) {
  const base = path.basename(file).replace(/\.(mp3|wav|m4a|aif|aiff|flac)$/i, "");
  return base
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.length ? w[0].toUpperCase() + w.slice(1) : w)
    .join(" ");
}

const existingAudioFiles = walk(path.join(repo, "public/kks/fathers-day"));

const existingFromAudio = existingAudioFiles.map((file) => {
  const rel = path.relative(path.join(repo, "public"), file);
  const audioUrl = "/" + rel.split(path.sep).join("/");
  const kkId = path.basename(file).replace(/\.(mp3|wav|m4a|aif|aiff|flac)$/i, "");

  return {
    kkId,
    title: titleFromFile(file),
    audioUrl,
    source: "existing-public-fathers-day-audio",
    pixGroup: pixGroupFromId(kkId),
    status: "EXISTING_FATHERS_DAY_AUDIO",
  };
});

const reviewManifest = fs.existsSync(reviewManifestPath)
  ? JSON.parse(fs.readFileSync(reviewManifestPath, "utf8"))
  : { kks: [] };

const reviewKks = (reviewManifest.kks || []).map((kk) => ({
  ...kk,
  pixGroup: kk.pixGroup || pixGroupFromId(kk.kkId || kk.title || kk.audioUrl),
}));

const byAudioUrl = new Map();

for (const kk of existingFromAudio) {
  byAudioUrl.set(kk.audioUrl, kk);
}

for (const kk of reviewKks) {
  byAudioUrl.set(kk.audioUrl, {
    ...kk,
    pixGroup: kk.pixGroup || pixGroupFromId(kk.kkId || kk.title || kk.audioUrl),
  });
}

const all = [...byAudioUrl.values()];

const groups = new Map();

for (const kk of all) {
  const g = kk.pixGroup || "Other / Existing";
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push(kk);
}

for (const arr of groups.values()) {
  arr.sort((a, b) => String(a.kkId).localeCompare(String(b.kkId)));
}

const ordered = [];
let lastGroup = null;

while ([...groups.values()].some((arr) => arr.length)) {
  const candidates = [...groups.entries()]
    .filter(([g, arr]) => arr.length && g !== lastGroup)
    .sort((a, b) => b[1].length - a[1].length);

  let chosen;

  if (candidates.length) {
    chosen = candidates[0];
  } else {
    chosen = [...groups.entries()]
      .filter(([g, arr]) => arr.length)
      .sort((a, b) => b[1].length - a[1].length)[0];
  }

  const [group, arr] = chosen;
  const kk = arr.shift();

  ordered.push({
    displayOrder: ordered.length + 1,
    ...kk,
    pixGroup: group,
  });

  lastGroup = group;
}

const violations = [];

for (let i = 1; i < ordered.length; i++) {
  if (ordered[i].pixGroup === ordered[i - 1].pixGroup) {
    violations.push({
      index: i + 1,
      previous: ordered[i - 1].kkId,
      current: ordered[i].kkId,
      pixGroup: ordered[i].pixGroup,
    });
  }
}

const manifest = {
  setId: "fathers-day-display-kks",
  lane: "holiday_fathers_day",
  holiday: "Father’s Day",
  status: ordered.length >= 8 ? "READY_FOR_USER_REVIEW_APPROVAL" : "NOT_ENOUGH_KKS",
  rule: "Alternated so no PIX has 2 concurrent KKs when possible.",
  count: ordered.length,
  adjacentSamePixViolations: violations,
  kks: ordered,
};

fs.writeFileSync(outManifestPath, JSON.stringify(manifest, null, 2));

const page = `const kks = ${JSON.stringify(ordered, null, 2)};
const violations = ${JSON.stringify(violations, null, 2)};

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

        <p className="mb-4 max-w-3xl leading-8 text-[#f7ead7]">
          {kks.length} playable Father’s Day KK options. Ordered to alternate PIX sources so the same PIX does not appear twice in a row whenever possible.
        </p>

        {violations.length > 0 ? (
          <p className="mb-8 rounded-2xl border border-[#d6a55f] bg-[#2b1a10] p-4 text-[#f7ead7]">
            {violations.length} same-PIX adjacency remains because the available mix could not fully alternate.
          </p>
        ) : (
          <p className="mb-8 rounded-2xl border border-[#d6a55f] bg-[#2b1a10] p-4 text-[#f7ead7]">
            PASS: no same-PIX back-to-back order.
          </p>
        )}

        <div className="grid gap-5">
          {kks.map((kk) => (
            <article key={kk.audioUrl} className="rounded-3xl border border-[#8b633a] bg-[#2b1a10] p-5 shadow-2xl">
              <p className="mb-2 text-sm font-bold text-[#f3cf91]">
                KK {kk.displayOrder} · {kk.pixGroup}
              </p>

              <h2 className="mb-3 text-2xl font-black">
                {kk.title}
              </h2>

              <audio controls preload="metadata" className="mb-4 w-full">
                <source src={kk.audioUrl} type="audio/mpeg" />
              </audio>

              {kk.note ? (
                <p className="mb-2 leading-7 text-[#f7ead7]">{kk.note}</p>
              ) : null}

              <p className="text-sm text-[#d6a55f]">
                {kk.audioUrl}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
`;

fs.writeFileSync(outPagePath, page);

console.log("FATHER'S DAY COMBINED KK COUNT:", ordered.length);
console.log("SAME-PIX BACK-TO-BACK VIOLATIONS:", violations.length);

for (const kk of ordered) {
  console.log(`${kk.displayOrder}. [${kk.pixGroup}] ${kk.kkId} ${kk.audioUrl}`);
}
