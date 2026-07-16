import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SmsPreferenceBody = {
  phone?: unknown;
  smsConsent?: unknown;
};

function normalizePhone(value: unknown) {
  const digits = String(value || "").replace(/\D/g, "");
  const normalized = digits.length === 10 ? `1${digits}` : digits;

  if (normalized.length !== 11 || !normalized.startsWith("1")) {
    return null;
  }

  return `+${normalized}`;
}

export async function POST(request: NextRequest) {
  let payload: SmsPreferenceBody;

  try {
    payload = (await request.json()) as SmsPreferenceBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid submission payload." },
      { status: 400 }
    );
  }

  const phone = normalizePhone(payload.phone);

  if (!phone) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid U.S. mobile phone number." },
      { status: 400 }
    );
  }

  const smsConsent = payload.smsConsent === true;
  const submissionId = crypto.randomUUID();
  const receivedAt = new Date().toISOString();
  const phoneHash = crypto.createHash("sha256").update(phone).digest("hex");
  const status = smsConsent ? "SMS_CONSENT_RECEIVED" : "SMS_NOT_ENABLED";
  const message = smsConsent
    ? "Request received. Your optional consent to K-KUT transactional SMS notifications was included."
    : "Request received. SMS notifications were not enabled because the optional SMS box was not checked.";

  console.info(
    "K_KUT_SMS_PREFERENCE_SUBMISSION",
    JSON.stringify({
      submissionId,
      receivedAt,
      phoneHash,
      smsConsent,
      status,
    })
  );

  return NextResponse.json(
    {
      ok: true,
      submissionId,
      receivedAt,
      status,
      message,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
