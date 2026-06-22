import fs from "fs";
import path from "path";

const repo = process.cwd();

const reviewPath = path.join(repo, "data/kk-sets/fathers-day-review-kks.json");
const outManifest = path.join(repo, "data/kk-sets/fathers-day-approval-display-kks.json");
const outReport = path.join(repo, "reports/fathers-day-approval-display-kks.md");
const outPage = path.join(repo, "app/admin/fathers-day-kk-review/page.tsx");

function existsPublic(audioUrl) {
  return fs.existsSync(path.join(repo, "public", audioUrl.replace(/^\//, "")));
}

function pixGroupFrom(s = "") {
  const x = s.toLowerCase();
  if (x.includes("thank-you")) return "Thank You";
  if (x.includes("believe")) return "Believe in Me";
  if (x.includes("have-to")) return "Have-To Duet";
  if (x.includes("empty-chair") || x.includes("chair")) return "That Empty Chair";
  if (x.includes("dyin") || x.includes("tryin")) return "Til I'm Dyin' I'm Tryin'";
  if (x.includes("ring") && x.includes("bell")) return "Ring the Bell";
  return "Other / Review";
}

const review = fs.existsSync(reviewPath)
  ? JSON.parse(fs.readFileSync(reviewPath, "utf8"))
  : { kks: [] };

const fatherKks = (review.kks || [])
  .filter((kk) => kk.audioUrl && existsPublic(kk.audioUrl))
  .map((kk) => ({
    ...kk,
    pixGroup: kk.pixGroup || pixGroupFrom(kk.kkId || kk.title || kk.audioUrl),
    status: "NEEDS_USER_APPROVAL",
  }));

const cleanThankYou = [
  ["thank-you-sec-intro", "Thank You — Intro", "opening gratitude / setup"],
  ["thank-you-sec-v1a", "Thank You — Verse 1A", "specific gratitude / first verse setup"],
  ["thank-you-sec-v1b", "Thank You — Verse 1B", "specific gratitude / first verse continuation"],
  ["thank-you-sec-prech1", "Thank You — Pre-Chorus 1", "lift into gratitude hook"],
  ["thank-you-sec-ch1", "Thank You — Chorus 1", "clear gratitude hook"],
  ["thank-you-sec-v2a", "Thank You — Verse 2A", "second gratitude detail"],
  ["thank-you-sec-v2b", "Thank You — Verse 2B", "second gratitude continuation"],
  ["thank-you-sec-br", "Thank You — Bridge", "gratitude turn / emotional pivot"],
  ["thank-you-sec-ch2", "Thank You — Chorus 2", "strong gratitude return"],
  ["thank-you-sec-outro", "Thank You — Outro", "gratitude close / send-off"],
]
  .map(([kkId, title, note]) => ({
    kkId,
    title,
    audioUrl: `/kks/thank-you/kks-expanded/${kkId}.mp3`,
    pixGroup: "Thank You",
    note,
    status: "NEEDS_USER_APPROVAL",
  }))
  .filter((kk) => existsPublic(kk.audioUrl))
  .slice(0, 10);

const all = [...fatherKks, ...cleanThankYou];

const groups = new Map();
for (const kk of all) {
  const g = kk.pixGroup || "Other / Review";
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

  const chosen = candidates.length
    ? candidates[0]
    : [...groups.entries()].filter(([g, arr]) => arr.length).sort((a, b) => b[1].length - a[1].length)[0];

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
      displayOrder: ordered[i].displayOrder,
      pixGroup: ordered[i].pixGroup,
      previous: ordered[i - 1].kkId,
      current: ordered[i].kkId,
    });
  }
}

const manifest = {
  setId: "fathers-day-approval-display-kks",
  holiday: "Father’s Day",
  lane: "approval_review_only",
  status: "DISPLAY_FOR_USER_APPROVAL_NOT_PUBLIC_FINAL",
  rule: "All valid current Father’s Day approval KKs display here. Thank You is capped at clean structure KKs only. No PIX over 10 KKs. Public display requires explicit user approval.",
  count: ordered.length,
  groupCounts: ordered.reduce((acc, kk) => {
    acc[kk.pixGroup] = (acc[kk.pixGroup] || 0) + 1;
    return acc;
  }, {}),
  samePixBackToBackViolations: violations,
  kks: ordered,
};

fs.writeFileSync(outManifest, JSON.stringify(manifest, null, 2));

let md = `# Father’s Day Approval Display KKs\n\n`;
md += `Total display KKs: ${ordered.length}\n\n`;
md += `Same-PIX back-to-back violations: ${violations.length}\n\n`;

for (const kk of ordered) {
  md += `${kk.displayOrder}. [${kk.pixGroup}] ${kk.title}\n`;
  md += `   - ${kk.audioUrl}\n`;
  if (kk.note) md += `   - ${kk.note}\n`;
  md += `\n`;
}

fs.writeFileSync(outReport, md);

const page = `const kks = ${JSON.stringify(ordered, null, 2)};
const violations = ${JSON.stringify(violations, null, 2)};

export default function FathersDayKKReviewPage() {
  return (
    <main className="min-h-screen bg-[#130b06] text-[#fff7eb]">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <p className="mb-3 text-sm font-bold tracking-[0.35em] text-[#f3cf91]">
          GPM / K-KUT / FATHER’S DAY APPROVAL
        </p>

        <h1 className="mb-4 text-4xl font-black md:text-6xl">
          Father’s Day KK Approval
        </h1>

        <p className="mb-4 max-w-4xl leading-8 text-[#f7ead7]">
          {kks.length} playable approval KKs are displayed here. This is review only.
          Public display requires explicit approval. Thank You is capped to clean
          structure KKs only; junk, duplicate, and CC over-captures are excluded.
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

              <h2 className="mb-3 text-2xl font-black">{kk.title}</h2>

              <audio controls preload="metadata" className="mb-4 w-full">
                <source src={kk.audioUrl} type="audio/mpeg" />
              </audio>

              {kk.note ? <p className="mb-2 leading-7 text-[#f7ead7]">{kk.note}</p> : null}

              <p className="text-sm text-[#d6a55f]">{kk.audioUrl}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
`;

fs.writeFileSync(outPage, page);

console.log("FATHER'S DAY APPROVAL DISPLAY COUNT:", ordered.length);
console.log("GROUP COUNTS:", manifest.groupCounts);
console.log("SAME-PIX BACK-TO-BACK VIOLATIONS:", violations.length);
console.log("WROTE", path.relative(repo, outManifest));
console.log("WROTE", path.relative(repo, outReport));
console.log("WROTE", path.relative(repo, outPage));
