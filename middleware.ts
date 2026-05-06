import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/Terms") {
    const url = request.nextUrl.clone();
    url.pathname = "/terms";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}
