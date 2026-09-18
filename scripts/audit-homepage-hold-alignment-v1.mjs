import fs from "node:fs";
import assert from "node:assert/strict";

const page = fs.readFileSync("app/_kkut-home.tsx", "utf8");
for (const destination of ["/find?mode=hug", "/find?mode=tug", "/find?mode=bug"]) {
  assert.ok(page.includes(destination), `Missing catalog destination: ${destination}`);
}
assert.ok(page.includes("Send the Sent-i-Meant."));
assert.ok(page.includes("PRODUCT_OFFER_LAW"), "Prices must use the locked product law");
assert.doesNotMatch(page, /comin.?true|comin&apos; true|101 .*published|15 .*live|49 .*live/i, "Storefront must not privilege a source or assert fixed release counts");
assert.doesNotMatch(page, /buy\.stripe\.com|<audio|action="\/checkout"/, "Storefront must delegate playback and checkout to approved inventory");
console.log("CATALOG-FIRST STOREFRONT AUDIT: PASS (app/_kkut-home.tsx)");
