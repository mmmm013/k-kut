import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const phone = String(formData.get("phone") || "").trim();
  const smsConsent = String(formData.get("smsConsent") || "").trim();

  const redirectUrl = new URL("/sms-optin", request.url);

  if (!phone || smsConsent !== "yes") {
    redirectUrl.searchParams.set("error", "missing-consent");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  redirectUrl.searchParams.set("submitted", "1");
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
