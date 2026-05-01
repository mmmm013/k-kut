import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    url: "mailto:?subject=MS Donation&body=Please send Zelle to: MICHAEL_EMAIL_OR_PHONE"
  });
}
