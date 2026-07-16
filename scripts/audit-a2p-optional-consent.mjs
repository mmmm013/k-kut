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

const page = read("app/sms-optin/page.tsx");
const form = read("app/sms-optin/SmsOptInForm.tsx");
const route = read("app/api/sms-optin/route.ts");
const terms = read("app/terms/page.tsx");
const privacy = read("app/privacy/page.tsx");
const migration = read(
  "supabase/migrations/20260715_gpm_sms_consent_records.sql",
);

requireText(page, "Optional K-KUT SMS Updates", "SMS page title");
requireNormalizedText(
  page,
  "You do not have to consent to SMS to buy, order, receive a digital HUG",
  "SMS page voluntary-use disclosure",
);
requireText(page, '<a href="/terms"', "SMS page Terms link");
requireText(page, '<a href="/privacy"', "SMS page Privacy link");
requireText(page, "<SmsOptInForm />", "SMS page working form");

requireText(form, "useState(false)", "unchecked checkbox default");
requireText(form, 'id="sms-consent"', "SMS checkbox");
requireText(form, 'type="checkbox"', "SMS checkbox type");
requireText(form, "Optional:", "optional checkbox label");
requireNormalizedText(
  form,
  "SMS consent is optional and is not a condition of purchase",
  "optional consent disclosure",
);
requireNormalizedText(
  form,
  "Leave the box unchecked to continue without SMS",
  "decline path disclosure",
);
requireText(form, "disabled={!smsConsent}", "phone disabled without consent");
requireText(form, "required={smsConsent}", "phone conditional requirement");
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
requireText(
  route,
  "CM9788370188c8c407e38f427fe849a70f",
  "campaign SID authority",
);
requireText(
  route,
  "SUPABASE_SERVICE_ROLE_KEY",
  "server-only Supabase authority",
);
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
requireText(
  route,
  "if (smsConsent && !phoneE164)",
  "phone requirement only after opt-in",
);
requireText(
  route,
  "consent_not_condition_of_purchase: true",
  "route compliance status",
);
requireText(route, "sends_sms: false", "no-send route lock");
if (/\.messages\.create|messages\.create|TWILIO_AUTH_TOKEN/u.test(route)) {
  stop("SMS opt-in route must record consent only and must not send SMS");
}

requireNormalizedText(
  terms,
  "SMS consent is optional",
  "Terms voluntary consent language",
);
requireNormalizedText(
  terms,
  "Consent to SMS is not a condition of purchase",
  "Terms no-condition language",
);
requireNormalizedText(
  terms,
  "Merely providing a phone number",
  "Terms no implied-consent language",
);
requireNormalizedText(
  privacy,
  "voluntarily check the separate optional SMS-consent box",
  "Privacy affirmative-consent language",
);
requireNormalizedText(
  privacy,
  "If you choose “No SMS,” no mobile number is required",
  "Privacy decline path",
);
requireNormalizedText(
  privacy,
  "SMS consent is optional, unchecked by default",
  "Privacy unchecked-default language",
);

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

console.log("A2P OPTIONAL SMS CONSENT AUDIT PASS");
console.log("CHECKBOX OPTIONAL: 1");
console.log("CHECKBOX DEFAULT UNCHECKED: 1");
console.log("NO-SMS SUBMISSION PATH: 1");
console.log("PHONE REQUIRED ONLY AFTER OPT-IN: 1");
console.log("DURABLE CONSENT RECORD: 1");
console.log("TERMS AND PRIVACY ACCESSIBLE: 1");
console.log("CONSENT CONDITION OF PURCHASE: 0");
console.log("SMS SENT BY OPT-IN ROUTE: 0");
