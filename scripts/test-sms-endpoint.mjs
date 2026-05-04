const to = process.argv[2];

if (!to) {
  console.error("Usage: node scripts/test-sms-endpoint.mjs +13095551212");
  process.exit(1);
}

const res = await fetch("http://localhost:3000/api/sms/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to,
    message:
      "G Putnam Music test: your Mother's Day K-KUT delivery by SMS is being verified.",
  }),
});

const data = await res.json();
console.log(JSON.stringify(data, null, 2));

if (!res.ok || !data.ok) process.exit(1);
