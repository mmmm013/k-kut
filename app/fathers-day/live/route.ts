import { NextRequest, NextResponse } from "next/server";

function redirectToFathersDay(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/fathers-day";

  return NextResponse.redirect(url, 308);
}

export const GET = redirectToFathersDay;
export const HEAD = redirectToFathersDay;
