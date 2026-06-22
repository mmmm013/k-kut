import fs from "node:fs";

const htmlPath = "review-sessions/formal-kut-review-set-001/FORMAL_KUT_REVIEW_SET_001.html";

if (!fs.existsSync(htmlPath)) {
  throw new Error(`Missing ${htmlPath}`);
}

let html = fs.readFileSync(htmlPath, "utf8");

html = html.replace(
  /<section id="sk-trim-doctrine-banner"[\s\S]*?<\/section>\n?/,
  ""
);

const banner = `
<section id="sk-trim-doctrine-banner" class="card">
<h2>sK TRIM LAW — LOCKED</h2>
<pre>APPROVE sK only when:
- starts fast
- carries usable meaning
- no music-only intro
- no music-only tail
- ends cleanly after the usable moment resolves

ADJUST when:
- trim music-only intro; start at first usable emotional/vocal/sonic moment
- trim music-only tail; end after phrase/moment resolves
- fix cutoff; do not cut phrase, final consonant, or sustaining note

No audio review player may be delivered unless the audio file exists and has duration greater than zero.</pre>
</section>
`;

if (html.includes("<main>")) {
  html = html.replace("<main>", "<main>\n" + banner);
} else if (html.includes("<body>")) {
  html = html.replace("<body>", "<body>\n<main>\n" + banner + "\n</main>");
} else {
  html = banner + "\n" + html;
}

fs.writeFileSync(htmlPath, html);
console.log("sK trim doctrine banner applied to Formal KUT Review room.");
