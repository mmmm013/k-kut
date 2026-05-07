import https from "node:https";

const slug = process.argv[2];
const name = process.argv[3];

if (!slug || !name) {
  console.error("Usage: node scripts/live-hug-gate.mjs <slug> <name>");
  console.error("Example: node scripts/live-hug-gate.mjs lu-long Lu");
  process.exit(2);
}

const url = `https://www.k-kut.com/hug/${slug}?live_gate=${Date.now()}`;

const requiredSafety = [
  "No checkout",
  "No download",
  "No searching",
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      })
      .on("error", reject);
  });
}

async function checkOnce() {
  const { status, body } = await fetch(url);

  const checks = [
    { label: `recipient name: ${name}`, ok: body.includes(name) },
    { label: "HUG language", ok: body.includes("HUG") },
    { label: "audio player", ok: body.includes("<audio") || body.includes("audio") },
    ...requiredSafety.map((text) => ({
      label: text,
      ok: body.includes(text),
    })),
  ];

  const missing = checks.filter((check) => !check.ok).map((check) => check.label);

  return {
    status,
    ok: status === 200 && missing.length === 0,
    missing,
  };
}

console.log("LIVE HUG GATE");
console.log("=============");
console.log(`URL: https://www.k-kut.com/hug/${slug}`);
console.log(`Expected recipient text includes: ${name}`);
console.log("");

for (let attempt = 1; attempt <= 30; attempt++) {
  const result = await checkOnce();

  if (result.ok) {
    console.log("LIVE_READY: YES");
    console.log("Safe to send.");
    process.exit(0);
  }

  console.log(
    `WAIT ${attempt}/30 — status=${result.status} missing=${result.missing.join(" | ")}`
  );

  await new Promise((resolve) => setTimeout(resolve, 10000));
}

console.log("");
console.log("LIVE_READY: NO");
console.log("Do NOT send this link yet. Check Vercel production deployment or page text.");
process.exit(1);
