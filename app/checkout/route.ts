import { NextRequest, NextResponse } from "next/server";

const MD_SECTION_KK_STRIPE_LINK =
  "https://buy.stripe.com/14AeVcawC9QCaq04xg4ow0p";

export async function GET(request: NextRequest) {
  const kk = request.nextUrl.searchParams.get("kk");

  if (!kk) {
    return NextResponse.redirect(new URL("/mothers-day/thank-you", request.url));
  }

  return NextResponse.redirect(MD_SECTION_KK_STRIPE_LINK);
}
