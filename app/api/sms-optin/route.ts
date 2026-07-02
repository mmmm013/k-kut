import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const phone = String(formData.get("phone") || "").trim();
  const smsConsent = String(formData.get("smsConsent") || "").trim();

  const redirectUrl = new URL("/sms-optin", request.url);

  if (!phone) {
    redirectUrl.searchParams.set("error", "missing-phone");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  redirectUrl.searchParams.set("submitted", "1");
  redirectUrl.searchParams.set(
    "sms",
    smsConsent === "yes" ? "opted-in" : "not-requested",
  );

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
