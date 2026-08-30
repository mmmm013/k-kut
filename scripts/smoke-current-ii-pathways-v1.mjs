import assert from "node:assert/strict";

const baseUrl = process.env.KKUT_TEST_BASE_URL || "http://127.0.0.1:3000";

async function request(pathname, {
  host = "k-kut.com",
  method = "GET",
  headers = {},
  body,
} = {}) {
  const response = await fetch(new URL(pathname, baseUrl), {
    method,
    headers: {
      "x-vercel-forwarded-host": host,
      ...headers,
    },
    body,
    redirect: "manual",
  });
  const text = await response.text();
  return { response, text };
}

const results = [];

async function check(name, run) {
  await run();
  results.push(name);
}

await check("K-KUT hub", async () => {
  const { response, text } = await request("/");
  assert.equal(response.status, 200);
  assert.match(text, /Send the sentimeant\./u);
});

await check("13HUGz host routing", async () => {
  const { response, text } = await request("/", { host: "13hugz.com" });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-13hugz-route"), "rotating-hugz");
  assert.match(text, /13HUGz/u);
});

for (const host of ["sentimeant.com", "sentimeants.com"]) {
  await check(`${host} semantic hold`, async () => {
    const { response, text } = await request("/", { host });
    assert.equal(response.status, 200);
    assert.match(text, /Semantic match hold/u);
    assert.match(text, /Public story audio: 0 · Checkout: blocked/u);
  });
}

await check("Sent-i-Meants evidence audio blocked", async () => {
  const { response, text } = await request(
    "/sentimeant/strict-kk-v001/bad-day.mp3",
  );
  assert.equal(response.status, 410);
  assert.equal(response.headers.get("x-sentimeant-semantic-hold"), "active");
  assert.match(text, /evidence audio is not public/u);
});

await check("single staged K-KUT is customer-visible", async () => {
  const { response, text } = await request(
    "/k/ii-romance-reuse-d3dfd13c-7421-4671-8261-0c735cb51f38",
  );
  assert.equal(response.status, 200);
  assert.match(text, /A LOVE LIKE THAT/u);
  assert.match(text, /<audio/u);
});

await check("legacy mini route customer-private", async () => {
  const { response } = await request("/mkut/legacy-example");
  assert.equal(response.status, 307);
  assert.equal(new URL(response.headers.get("location"), baseUrl).pathname, "/find");
});

await check("checkout disabled in preview", async () => {
  const form = new FormData();
  form.set("ii", "ii-romance-reuse-d3dfd13c-7421-4671-8261-0c735cb51f38");
  form.set(
    "public_option_id",
    "generated-love-sweet-d3dfd13c-7421-4671-8261-0c735cb51f38",
  );
  form.set("offer", "kk");
  const { response } = await request("/checkout", { method: "POST", body: form });
  assert.equal(response.status, 303);
  assert.equal(
    new URL(response.headers.get("location"), baseUrl).searchParams.get("checkout"),
    "preview-payment-disabled",
  );
});

await check("fulfillment accepts the exact staged II", async () => {
  const { response, text } = await request("/api/4pe/fulfillment", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      selected_hug_id:
        "ii-romance-reuse-d3dfd13c-7421-4671-8261-0c735cb51f38",
      selected_public_option_id:
        "generated-love-sweet-d3dfd13c-7421-4671-8261-0c735cb51f38",
    }),
  });
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(text).ok, true);
});

await check("public catalog exposes one controlled canary", async () => {
  const { response, text } = await request("/api/public-ii-catalog");
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(text).purchasableCount, 1);
  assert.equal(JSON.parse(text).records.length, 1);
});

await check("BOT inventory remains empty", async () => {
  const { response, text } = await request("/api/bot/moments?q=comfort");
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(text).count, 0);
});

const iMeant = await request("/", { host: "i-meant.com" });
const iMeantIdentity = /Send the sentimeant\./u.test(iMeant.text)
  ? "currently_falls_through_to_k_kut"
  : "separate_identity_detected";

console.log("CURRENT-II END-TO-END SMOKE: PASS");
console.log(`CHECKS: ${results.length}`);
for (const result of results) console.log(`PASS: ${result}`);
console.log(`I-MEANT OBSERVATION: ${iMeantIdentity}`);
