import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function returnToStore(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/browse";
  url.search = "?checkout=locked-payment-link-required";
  return NextResponse.redirect(url, 303);
}

export async function GET(request: NextRequest) {
  return returnToStore(request);
}

export async function POST(request: NextRequest) {
  return returnToStore(request);
}
