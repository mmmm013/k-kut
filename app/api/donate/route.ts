import { NextRequest, NextResponse } from "next/server";

const MS_DONATION_LINK = "https://buy.stripe.com/28EfZgdIO7Iuaq03tc4ow0m";

const VALID_KKS = new Set([
  "thank-you-kk1",
  "thank-you-kk2",
  "thank-you-kk3",
  "thank-you-kk4",
  "thank-you-kk5",
  "thank-you-kk6",
  "thank-you-kk7",
]);

export async function POST(req: NextRequest) {
  let kk = "";

  try {
    const body = await req.json();
    kk = String(body?.kk || "").trim();
  } catch {
    kk = "";
  }

  if (!VALID_KKS.has(kk)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid or missing K-KUT selection.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    kk,
    url: MS_DONATION_LINK,
    note:
      "Stripe link is currently generic. Selected K-KUT is handled by the site before redirect.",
  });
}
