import fs from "fs";
import path from "path";

const repo = process.cwd();

const thankYouDir = path.join(repo, "public/kks/thank-you/kks-expanded");

const preferred = [
  {
    kkId: "thank-you-sec-intro",
    title: "Thank You — Intro",
    audioUrl: "/kks/thank-you/kks-expanded/thank-you-sec-intro.mp3",
    pixGroup: "Thank You",
    use: "opening gratitude / setup",
  },
  {
    kkId: "thank-you-sec-v1a",
    title: "Thank You — Verse 1A",
    audioUrl: "/kks/thank-you/kks-expanded/thank-you-sec-v1a.mp3",
    pixGroup: "Thank You",
    use: "specific gratitude / first verse setup",
  },
  {
    kkId: "thank-you-sec-v1b",
    title: "Thank You — Verse 1B",
    audioUrl: "/kks/thank-you/kks-expanded/thank-you-sec-v1b.mp3",
    pixGroup: "Thank You",
    use: "specific gratitude / first verse continuation",
  },
  {
    kkId: "thank-you-sec-prech1",
    title: "Thank You — Pre-Chorus 1",
    audioUrl: "/kks/thank-you/kks-expanded/thank-you-sec-prech1.mp3",
    pixGroup: "Thank You",
    use: "lift into gratitude hook",
  },
  {
    kkId: "thank-you-sec-ch1",
    title: "Thank You — Chorus 1",
    audioUrl: "/kks/thank-you/kks-expanded/thank-you-sec-ch1.mp3",
    pixGroup: "Thank You",
    use: "clear gratitude hook",
  },
  {
    kkId: "thank-you-sec-v2a",
    title: "Thank You — Verse 2A",
    audioUrl: "/kks/thank-you/kks-expanded/thank-you-sec-v2a.mp3",
    pixGroup: "Thank You",
    use: "second gratitude detail",
  },
  {
    kkId: "thank-you-sec-v2b",
    title: "Thank You — Verse 2B",
    audioUrl: "/kks/thank-you/kks-expanded/thank-you-sec-v2b.mp3",
    pixGroup: "Thank You",
    use: "second gratitude continuation",
  },
  {
    kkId: "thank-you-sec-br",
    title: "Thank You — Bridge",
    audioUrl: "/kks/thank-you/kks-expanded/thank-you-sec-br.mp3",
    pixGroup: "Thank You",
    use: "gratitude turn / emotional pivot",
  },
  {
    kkId: "thank-you-sec-ch2",
    title: "Thank You — Chorus 2",
    audioUrl: "/kks/thank-you/kks-expanded/thank-you-sec-ch2.mp3",
    pixGroup: "Thank You",
    use: "strong gratitude return",
  },
  {
    kkId: "thank-you-sec-outro",
    title: "Thank You — Outro",
    audioUrl: "/kks/thank-you/kks-expanded/thank-you-sec-outro.mp3",
    pixGroup: "Thank You",
    use: "gratitude close / send-off",
  },
];

function existsPublic(audioUrl) {
  return fs.existsSync(path.join(repo, "public", audioUrl.replace(/^\//, "")));
}

const clean = preferred
  .filter((kk) => existsPublic(kk.audioUrl))
  .slice(0, 10)
  .map((kk, index) => ({
    displayOrder: index + 1,
    ...kk,
    sourceBucket: "public/kks/thank-you/kks-expanded",
    status: "CLEAN_THANK_YOU_STRUCTURE_KK_NEEDS_USER_APPROVAL",
  }));

const rejected = [];

if (fs.existsSync(thankYouDir)) {
  for (const file of fs.readdirSync(thankYouDir)) {
    if (!file.endsWith(".mp3")) continue;

    const audioUrl = `/kks/thank-you/kks-expanded/${file}`;
    const kkId = file.replace(/\.mp3$/, "");

    if (!clean.some((kk) => kk.kkId === kkId)) {
      rejected.push({
        kkId,
        audioUrl,
        reason: kkId.startsWith("thank-you-cc-")
          ? "Rejected from clean set: cc fragment / over-capture"
          : kkId.startsWith("thank-you-kk")
            ? "Rejected from clean set: older duplicate-style KK candidate"
            : "Rejected from clean set: not in preferred structure list",
      });
    }
  }
}

const manifest = {
  setId: "thank-you-clean-structure-kks",
  pixTitle: "Thank You",
  lane: "neutral_gratitude_theme_matched",
  holidayOwnership: false,
  status: "CLEAN_REVIEW_SET_NOT_PUBLIC_APPROVED",
  rule: "No PIX should exceed 10 KKs. Use only clean structure KKs, not cc fragments or duplicate/misfire candidates.",
  count: clean.length,
  kks: clean,
  rejectedCount: rejected.length,
  rejected,
};

fs.mkdirSync(path.join(repo, "data/kk-sets"), { recursive: true });
fs.mkdirSync(path.join(repo, "reports"), { recursive: true });

fs.writeFileSync(
  path.join(repo, "data/kk-sets/thank-you-clean-structure-kks.json"),
  JSON.stringify(manifest, null, 2)
);

let md = `# Thank You Clean KK Set\n\n`;
md += `Clean count: ${clean.length}\n`;
md += `Rejected junk/duplicates/misfires: ${rejected.length}\n\n`;
md += `## Clean KKs\n\n`;

for (const kk of clean) {
  md += `${kk.displayOrder}. ${kk.title}\n`;
  md += `   - ${kk.audioUrl}\n`;
  md += `   - ${kk.use}\n\n`;
}

md += `## Rejected From Clean Set\n\n`;

for (const r of rejected) {
  md += `- ${r.kkId}\n`;
  md += `  - ${r.audioUrl}\n`;
  md += `  - ${r.reason}\n`;
}

fs.writeFileSync(
  path.join(repo, "reports/thank-you-clean-structure-kks.md"),
  md
);

console.log("THANK YOU CLEAN KK COUNT:", clean.length);
console.log("THANK YOU REJECTED COUNT:", rejected.length);
for (const kk of clean) {
  console.log(`${kk.displayOrder}. ${kk.kkId} ${kk.audioUrl}`);
}
