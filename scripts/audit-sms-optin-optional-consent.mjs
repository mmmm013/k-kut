import assert from "node:assert/strict";
import fs from "node:fs";
import { buildSmsOptInSubmission } from "../lib/smsOptInSubmission.mjs";

const page = fs.readFileSync("app/sms-optin/page.tsx", "utf8");

assert.match(page, /<form[\s\S]*onSubmit=\{submitPreference\}/);
assert.match(page, /id="sms-consent"[\s\S]*type="checkbox"/);
assert.doesNotMatch(
  page.match(/<input[\s\S]*?id="sms-consent"[\s\S]*?\/>/)?.[0] || "",
  /\brequired\b/
);
assert.match(page, /unchecked by default/i);
assert.match(page, /submit this form without agreeing to SMS/i);
assert.match(page, /Consent is not a condition of purchase/i);
assert.match(page, /Reply <strong>STOP<\/strong>/);
assert.match(page, /Reply\{" "\}[\s\S]*<strong>HELP<\/strong>/);
assert.match(page, /href="\/terms"/);
assert.match(page, /href="\/privacy"/);

const fixedOptions = {
  receivedAt: "2026-07-15T12:00:00.000Z",
  submissionId: "SMS-AUDIT-001",
};

const unchecked = buildSmsOptInSubmission(
  { phone: "309-555-0100", smsConsent: false },
  fixedOptions
);

assert.equal(unchecked.ok, true);
assert.equal(unchecked.httpStatus, 200);
assert.equal(unchecked.smsConsent, false);
assert.equal(unchecked.status, "SMS_NOT_ENABLED");
assert.match(unchecked.message, /not enabled/i);

const checked = buildSmsOptInSubmission(
  { phone: "309-555-0100", smsConsent: true },
  { ...fixedOptions, submissionId: "SMS-AUDIT-002" }
);

assert.equal(checked.ok, true);
assert.equal(checked.httpStatus, 200);
assert.equal(checked.smsConsent, true);
assert.equal(checked.status, "SMS_CONSENT_RECEIVED");
assert.match(checked.message, /consent/i);

const invalid = buildSmsOptInSubmission(
  { phone: "123", smsConsent: false },
  fixedOptions
);

assert.equal(invalid.ok, false);
assert.equal(invalid.httpStatus, 400);

console.log("SMS OPT-IN OPTIONAL CONSENT AUDIT: PASS");
console.log("UNCHECKED PATH: HTTP 200 / SMS_NOT_ENABLED");
console.log("CHECKED PATH: HTTP 200 / SMS_CONSENT_RECEIVED");
console.log("INVALID PHONE PATH: HTTP 400");
