const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const env = { NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-test-key" };
let calls = 0;
let status = 200;
let data = { ok: true, playback_url: "https://example.supabase.co/storage/v1/object/sign/gifts/exact.mp3?token=test", container_type: "TUG", plays_remaining: 2 };
const ctx = { exports: {}, URL, AbortSignal, process: { env }, require: () => ({
  NextResponse: { json: (body, options) => ({ body, ...options }) },
}), fetch: async (url, options) => {
  calls++;
  assert.equal(url.href, "https://example.supabase.co/functions/v1/play-recipient-delivery");
  assert.equal(JSON.parse(options.body).token, "a".repeat(64));
  assert.equal(options.headers.apikey, "public-test-key");
  return { ok: status === 200, status, json: async () => data };
}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("app/api/recipient-playback/route.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, ctx);
const post = token => ctx.exports.POST({ json: async () => ({ token }) });
(async () => {
  assert.equal((await post("bad")).status, 400);
  assert.equal(calls, 0);
  let r = await post("a".repeat(64));
  assert.equal(r.status, 200);
  assert.equal(r.body.container_type, "TUG");
  assert.equal(r.headers["Cache-Control"], "private, no-store");
  status = 401; assert.equal((await post("a".repeat(64))).status, 401);
  status = 500; assert.equal((await post("a".repeat(64))).status, 503);
  status = 200; data = { ...data, playback_url: "https://wrong.invalid/audio" };
  assert.equal((await post("a".repeat(64))).status, 503);
  data = { ...data, playback_url: "https://example.supabase.co/storage/v1/object/public/tracks/source.wav" };
  assert.equal((await post("a".repeat(64))).status, 503);
  delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assert.equal((await post("a".repeat(64))).status, 503);
  console.log("10 recipient playback assertions passed; no real grants consumed");
})().catch(error => { console.error(error); process.exitCode = 1; });
