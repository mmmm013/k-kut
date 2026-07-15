import crypto from "node:crypto";

export function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const normalized = digits.length === 10 ? `1${digits}` : digits;

  if (normalized.length !== 11 || !normalized.startsWith("1")) {
    return null;
  }

  return `+${normalized}`;
}

export function buildSmsOptInSubmission(payload, options = {}) {
  const phone = normalizePhone(payload?.phone);

  if (!phone) {
    return {
      ok: false,
      httpStatus: 400,
      error: "Enter a valid U.S. mobile phone number.",
    };
  }

  const smsConsent = payload?.smsConsent === true;
  const receivedAt = options.receivedAt || new Date().toISOString();
  const submissionId = options.submissionId || crypto.randomUUID();
  const phoneHash = crypto.createHash("sha256").update(phone).digest("hex");

  return {
    ok: true,
    httpStatus: 200,
    submissionId,
    receivedAt,
    phoneHash,
    smsConsent,
    status: smsConsent ? "SMS_CONSENT_RECEIVED" : "SMS_NOT_ENABLED",
    message: smsConsent
      ? "Request received. Your optional consent to K-KUT transactional SMS notifications was included."
      : "Request received. SMS notifications were not enabled because the optional SMS box was not checked.",
  };
}
