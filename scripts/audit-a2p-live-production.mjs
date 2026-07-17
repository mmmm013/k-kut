const BASE_URL = "https://www.k-kut.com";

const routes = {
  optIn: "/sms-optin",
  privacy: "/privacy",
  terms: "/terms",
  api: "/api/sms-optin",
};

function stop(message) {
  console.error(`STOP: ${message}`);
  process.exit(1);
}

function normalize(value) {
  return value.replace(/\s+/gu, " ").trim();
}

async function fetchLive(path) {
  const url = new URL(path, BASE_URL);
  url.searchParams.set("a2p_audit", Date.now().toString());

  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache",
      "user-agent": "GPM-A2P-DMAIC-Live-Audit/1.0",
    },
  });

  if (!response.ok) stop(`${path} returned HTTP ${response.status}`);
  return normalize(await response.text());
}

function requireText(source, needle, label) {
  if (!source.includes(normalize(needle))) stop(`${label} missing: ${needle}`);
}

function forbidText(source, needle, label) {
  if (source.includes(normalize(needle))) stop(`${label} found: ${needle}`);
}

const [optIn, privacy, terms, api] = await Promise.all([
  fetchLive(routes.optIn),
  fetchLive(routes.privacy),
  fetchLive(routes.terms),
  fetchLive(routes.api),
]);

requireText(optIn, "Optional K-KUT SMS Updates", "live SMS page title");
requireText(optIn, "SMS consent is optional", "live optional consent rule");
requireText(optIn, "unchecked by default", "live unchecked-default rule");
requireText(optIn, "Leave the box unchecked", "live No-SMS path");
requireText(optIn, "Terms and Conditions", "live Terms link");
requireText(optIn, "Privacy Policy", "live Privacy link");

for (const [label, source] of [
  ["live Privacy", privacy],
  ["live Terms", terms],
]) {
  requireText(source, "Optional: I agree to receive transactional customer-care SMS messages from K-KUT", `${label} canonical consent`);
  requireText(source, "SMS consent is optional, unchecked by default", `${label} no-condition rule`);
  requireText(source, "Merely providing a phone number", `${label} no-implied-consent rule`);
  requireText(source, "Providing a phone number by itself never authorizes SMS", `${label} explicit phone-number rule`);
  forbidText(source, "If you provide your phone number, you agree", `${label} stale implied-consent wording`);
  forbidText(source, "By providing your phone number, you agree", `${label} stale implied-consent wording`);
  forbidText(source, "Consent to receive SMS messages is not a condition of any unrelated purchase", `${label} stale unrelated-purchase wording`);
}

requireText(api, '"consent_version":"k-kut-sms-consent-v003-2026-07-16"', "live API consent version");
requireText(api, '"checkbox_optional":true', "live API optional checkbox proof");
requireText(api, '"consent_not_condition_of_purchase":true', "live API no-condition proof");
requireText(api, '"sends_sms":false', "live API no-send proof");

console.log("A2P LIVE PRODUCTION INTEGRITY AUDIT PASS");
console.log(`AUTHORITY: ${BASE_URL}`);
console.log("OPT-IN PAGE CURRENT: 1");
console.log("PRIVACY PAGE CURRENT: 1");
console.log("TERMS PAGE CURRENT: 1");
console.log("API CURRENT: 1");
console.log("IMPLIED CONSENT WORDING: 0");
console.log("PRODUCTION CONSENT DRIFT: 0");
