import fs from "node:fs/promises";

const urls = [
  "https://www.k-kut.com",
  "https://www.k-kut.com/hug",
  "https://www.k-kut.com/find",
  "https://www.k-kut.com/holiday",
  "https://www.k-kut.com/holiday/mothers-day",
  "https://www.k-kut.com/holiday/fathers-day",
  "https://www.k-kut.com/holiday/thanksgiving",
  "https://www.k-kut.com/holiday/christmas",
  "https://www.k-kut.com/personal/wedding",
  "https://www.k-kut.com/api/stripe/webhook"
];

const runsPerUrl = Number(process.env.RUNS_PER_URL || 100);
const concurrency = Number(process.env.CONCURRENCY || 10);
const regionLabel = process.env.REGION_LABEL || "local_mac_origin";
const results = [];

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testOnce(url, run) {
  const start = performance.now();
  let status = 0;
  let ok = false;
  let error = null;
  let attempts = 0;

  for (let attempt = 1; attempt <= 3; attempt++) {
    attempts = attempt;

    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          "User-Agent": "K-KUT-live-performance-test/1.0"
        }
      });

      status = res.status;
      ok = res.status >= 200 && res.status < 400;
      error = null;
      await res.arrayBuffer();

      if (ok) {
        break;
      }
    } catch (err) {
      status = 0;
      ok = false;
      error = String(err?.message || err);
    }

    await sleep(250 * attempt);
  }

  const ms = performance.now() - start;

  results.push({
    region_label: regionLabel,
    url,
    run,
    status,
    ok,
    attempts,
    ms: Number(ms.toFixed(2)),
    error
  });
}

const jobs = [];
for (const url of urls) {
  for (let i = 1; i <= runsPerUrl; i++) {
    jobs.push(() => testOnce(url, i));
  }
}

let index = 0;

async function worker() {
  while (index < jobs.length) {
    const job = jobs[index++];
    await job();
  }
}

console.log("START K-KUT live performance test");
console.log("urls:", urls.length);
console.log("runs_per_url:", runsPerUrl);
console.log("total_requests:", jobs.length);
console.log("region_label:", regionLabel);

await Promise.all(Array.from({ length: concurrency }, worker));

const passed = results.filter(r => r.ok).length;
const failed = results.length - passed;
const times = results.map(r => r.ms);

const summary = {
  tested_at: new Date().toISOString(),
  region_label: regionLabel,
  origin_description: regionLabel === "local_mac_origin"
    ? "Owner local Mac/network origin. Not true regional proof."
    : "Declared runner origin. Must be independently verified before regional claim.",
  total_requests: results.length,
  passed,
  failed,
  min_ms: Math.min(...times),
  median_ms: percentile(times, 50),
  p95_ms: percentile(times, 95),
  p99_ms: percentile(times, 99),
  max_ms: Math.max(...times),
  urls: urls.map(url => {
    const rows = results.filter(r => r.url === url);
    const urlTimes = rows.map(r => r.ms);
    return {
      url,
      requests: rows.length,
      passed: rows.filter(r => r.ok).length,
      failed: rows.filter(r => !r.ok).length,
      median_ms: percentile(urlTimes, 50),
      p95_ms: percentile(urlTimes, 95),
      max_ms: Math.max(...urlTimes)
    };
  })
};

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outFile = `recovery-review/performance/live-${results.length}-${regionLabel}-${stamp}.json`;

await fs.mkdir("recovery-review/performance", { recursive: true });
await fs.writeFile(outFile, JSON.stringify({ summary, results }, null, 2));

console.log(JSON.stringify(summary, null, 2));
console.log("saved_report:", outFile);

if (failed > 0) {
  process.exit(1);
}
