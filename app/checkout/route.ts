import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const REDIRECT_STATUS = 303;

function returnToStore(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/browse";
  url.search = "?checkout=lemon-squeezy-direct-link-required";
  return NextResponse.redirect(url, REDIRECT_STATUS);
}

export async function GET(request: NextRequest) {
  return returnToStore(request);
}

export async function POST(request: NextRequest) {
  return returnToStore(request);
}
