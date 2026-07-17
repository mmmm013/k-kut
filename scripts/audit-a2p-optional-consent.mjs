import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function stop(message) {
  console.error(`STOP: ${message}`);
  process.exit(1);
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) stop(`${label} missing: ${needle}`);
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/gu, " ").trim();
}

function requireNormalizedText(source, needle, label) {
  if (!normalizeWhitespace(source).includes(normalizeWhitespace(needle))) {
    stop(`${label} missing after whitespace normalization: ${needle}`);
  }
}

const canonical = read("lib/a2p-consent.ts");
const page = read("app/sms-optin/page.tsx");
const form = read("app/sms-optin/SmsOptInForm.tsx");
const route = read("app/api/sms-optin/route.ts");
const terms = read("app/terms/page.tsx");
const privacy = read("app/privacy/page.tsx");
const migration = read(
  "supabase/migrations/20260715_gpm_sms_consent_records.sql",
);

requireText(
  canonical,
  'A2P_CONSENT_VERSION = "k-kut-sms-consent-v003-2026-07-16"',
  "canonical consent version",
);
requireNormalizedText(
  canonical,
  "Optional: I agree to receive transactional customer-care SMS messages from K-KUT",
  "canonical affirmative consent",
);
requireNormalizedText(
  canonical,
  "SMS consent is optional, unchecked by default, and is not a condition of purchase",
  "canonical no-condition rule",
);
requireNormalizedText(
  canonical,
  "Merely providing a phone number",
  "canonical no-implied-consent rule",
);
requireNormalizedText(
  canonical,
  "Leave the box unchecked to continue without SMS",
  "canonical decline path",
);
requireNormalizedText(canonical, "Reply STOP", "canonical STOP instruction");
requireNormalizedText(canonical, "Reply HELP", "canonical HELP instruction");
requireNormalizedText(
  canonical,
  "not sold, rented, or shared with third parties or affiliates",
  "canonical no-marketing-sharing rule",
);

for (const [label, source, requiredNames] of [
  [
    "SMS page",
    page,
    [
      "A2P_NO_CONDITION_DISCLOSURE",
      "A2P_MESSAGE_TYPES",
      "A2P_NO_MARKETING_SHARING_DISCLOSURE",
    ],
  ],
  [
    "SMS form",
    form,
    [
      "A2P_CONSENT_DISCLOSURE",
      "A2P_DECLINE_DISCLOSURE",
      "A2P_NO_CONDITION_DISCLOSURE",
    ],
  ],
  [
    "SMS route",
    route,
    [
      "A2P_CAMPAIGN_SID",
      "A2P_CONSENT_DISCLOSURE",
      "A2P_CONSENT_VERSION",
      "A2P_SOURCE_PAGE",
    ],
  ],
  [
    "Terms",
    terms,
    [
      "A2P_CONSENT_DISCLOSURE",
      "A2P_NO_CONDITION_DISCLOSURE",
      "A2P_NO_IMPLIED_CONSENT_DISCLOSURE",
    ],
  ],
  [
    "Privacy",
    privacy,
    [
      "A2P_CONSENT_DISCLOSURE",
      "A2P_DECLINE_DISCLOSURE",
      "A2P_NO_CONDITION_DISCLOSURE",
      "A2P_NO_IMPLIED_CONSENT_DISCLOSURE",
    ],
  ],
]) {
  requireText(source, "lib/a2p-consent", `${label} canonical import`);
  for (const name of requiredNames) requireText(source, name, `${label} ${name}`);
}

requireText(page, "Optional K-KUT SMS Updates", "SMS page title");
requireText(page, '<a href="/terms"', "SMS page Terms link");
requireText(page, '<a href="/privacy"', "SMS page Privacy link");
requireText(page, "<SmsOptInForm />", "SMS page working form");

requireText(form, "useState(false)", "unchecked checkbox default");
requireText(form, 'id="sms-consent"', "SMS checkbox");
requireText(form, 'type="checkbox"', "SMS checkbox type");
if (/disabled=\{!smsConsent\}/u.test(form)) {
  stop("phone field must remain clickable without SMS consent");
}
requireText(form, "required={smsConsent}", "phone conditional requirement");
requireText(form, 'placeholder="(555) 000-0000"', "phone field available by default");
requireText(
  form,
  'phone: smsConsent ? phone : ""',
  "no phone submitted to SMS record without consent",
);
requireNormalizedText(
  form,
  "Entering a phone number does not opt you in. SMS consent is given only by checking the optional consent box above.",
  "phone entry does not imply consent notice",
);
requireText(form, 'type="submit"', "functional submit button");
requireText(form, "Save My Choice", "neutral submit label");
requireText(form, 'fetch("/api/sms-optin"', "consent API submission");
requireNormalizedText(
  form,
  "No SMS consent was given. You can continue using K-KUT",
  "successful no-SMS path",
);

const checkboxStart = form.indexOf('id="sms-consent"');
const checkboxEnd = form.indexOf("/>", checkboxStart);
if (checkboxStart < 0 || checkboxEnd < 0) stop("SMS checkbox block not found");
const checkboxBlock = form.slice(checkboxStart, checkboxEnd);
if (/\brequired\b/u.test(checkboxBlock)) {
  stop("SMS consent checkbox must never be required");
}
if (/defaultChecked|checked=\{true\}/u.test(checkboxBlock)) {
  stop("SMS consent checkbox must never be preselected");
}

requireText(
  route,
  'const TABLE = "gpm_sms_consent_records"',
  "server consent table",
);
requireText(route, "SUPABASE_SERVICE_ROLE_KEY", "server-only Supabase authority");
requireText(
  route,
  "const smsConsent = body.sms_consent === true",
  "explicit affirmative consent test",
);
requireText(
  route,
  "const phoneE164 = smsConsent ? normalizeUsPhone(body.phone) : null",
  "no phone storage without SMS consent",
);
requireText(route, "if (smsConsent && !phoneE164)", "phone requirement only after opt-in");
requireText(
  route,
  "consent_not_condition_of_purchase: true",
  "route compliance status",
);
requireText(route, "sends_sms: false", "no-send route lock");
if (/\.messages\.create|messages\.create|TWILIO_AUTH_TOKEN/u.test(route)) {
  stop("SMS opt-in route must record consent only and must not send SMS");
}

const governedSources = [canonical, page, form, route, terms, privacy].join("\n");
for (const forbidden of [
  "If you provide your phone number, you agree",
  "By providing your phone number, you agree",
  "Consent to receive SMS messages is not a condition of any unrelated purchase",
]) {
  if (governedSources.includes(forbidden)) {
    stop(`forbidden implied-consent wording found: ${forbidden}`);
  }
}

requireText(
  migration,
  "create table if not exists public.gpm_sms_consent_records",
  "consent table migration",
);
requireText(migration, "sms_consent boolean not null", "consent choice field");
requireText(migration, "phone_e164 text", "phone field");
requireText(migration, "consent_version text not null", "disclosure version");
requireText(migration, "consent_text text not null", "exact disclosure text");
requireText(migration, "submitted_at timestamptz", "consent timestamp");
requireText(migration, "enable row level security", "RLS protection");
requireText(migration, "revoke all", "browser access revocation");
requireText(migration, "grant all", "service-role access");
if (!/sms_consent\s*=\s*false\s+and\s+phone_e164\s+is\s+null/gu.test(migration)) {
  stop("no phone retention for declined SMS is missing");
}

console.log("A2P DMAIC CANONICAL CONSENT AUDIT PASS");
console.log("ONE CONSENT AUTHORITY: 1");
console.log("CHECKBOX OPTIONAL: 1");
console.log("CHECKBOX DEFAULT UNCHECKED: 1");
console.log("NO-SMS SUBMISSION PATH: 1");
console.log("PHONE FIELD CLICKABLE WITHOUT CONSENT: 1");
console.log("PHONE REQUIRED ONLY AFTER OPT-IN: 1");
console.log("NO IMPLIED CONSENT WORDING: 1");
console.log("DURABLE CONSENT RECORD: 1");
console.log("TERMS AND PRIVACY ACCESSIBLE: 1");
console.log("CONSENT CONDITION OF PURCHASE: 0");
console.log("SMS SENT BY OPT-IN ROUTE: 0");
