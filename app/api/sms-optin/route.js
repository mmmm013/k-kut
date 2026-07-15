import { NextResponse } from "next/server";
import { buildSmsOptInSubmission } from "../../../lib/smsOptInSubmission.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid submission payload." },
      { status: 400 }
    );
  }

  const result = buildSmsOptInSubmission(payload);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: result.httpStatus }
    );
  }

  console.info(
    "K_KUT_SMS_PREFERENCE_SUBMISSION",
    JSON.stringify({
      submissionId: result.submissionId,
      receivedAt: result.receivedAt,
      phoneHash: result.phoneHash,
      smsConsent: result.smsConsent,
      status: result.status,
    })
  );

  return NextResponse.json(
    {
      ok: true,
      submissionId: result.submissionId,
      receivedAt: result.receivedAt,
      status: result.status,
      message: result.message,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
