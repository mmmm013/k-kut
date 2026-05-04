import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function normalizePhone(input: string) {
  const raw = String(input || "").trim();
  if (raw.startsWith("+")) return raw;

  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  return raw;
}

export async function POST(req: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !from) {
      return NextResponse.json(
        {
          ok: false,
          error: "SMS is not configured. Missing Twilio env keys.",
          missing: {
            TWILIO_ACCOUNT_SID: !accountSid,
            TWILIO_AUTH_TOKEN: !authToken,
            TWILIO_FROM_NUMBER: !from,
          },
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const to = normalizePhone(body.to);
    const message = String(body.message || "").trim();

    if (!to || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: to, message" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams();
    params.set("From", from);
    params.set("To", to);
    params.set("Body", `${message}\n\nReply STOP to opt out.`);

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Twilio send failed", details: data },
        { status: res.status }
      );
    }

    return NextResponse.json({
      ok: true,
      sid: data.sid,
      status: data.status,
      to,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown SMS error",
      },
      { status: 500 }
    );
  }
}
