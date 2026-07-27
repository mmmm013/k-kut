import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const STRICT_MUSIC_HOLD_REASON = "strict-music-emergency-hold";
const REDIRECT_STATUS = 303;

function redirectToHold(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/browse";
  url.search = `?checkout=${STRICT_MUSIC_HOLD_REASON}`;
  return NextResponse.redirect(url, REDIRECT_STATUS);
}

export async function GET(request: NextRequest) {
  return redirectToHold(request);
}

export async function POST(request: NextRequest) {
  return redirectToHold(request);
}
