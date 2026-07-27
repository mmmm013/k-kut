import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CUSTOMER_PRIVATE_PREFIXES = [
  "/pix",
  "/mkut",
];

const SENTIMEANT_EVIDENCE_AUDIO_PREFIX = "/sentimeant/strict-kk-v001/";
const SENTIMEANT_STORY_PREFIX = "/sentimeant/";

const VEKTOR_HOSTS = new Set([
  "2gdp.com",
  "www.2gdp.com",
]);

const VEKTOR_URL = "https://mc-vektor.vercel.app/the-vektor";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.toLowerCase().split(":")[0] || "";

  if (VEKTOR_HOSTS.has(host) && (pathname === "/" || pathname === "")) {
    return NextResponse.redirect(VEKTOR_URL);
  }

  if (pathname.startsWith(SENTIMEANT_EVIDENCE_AUDIO_PREFIX)) {
    return new NextResponse("Sentimeant semantic-match hold: evidence audio is not public.", {
      status: 410,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "text/plain; charset=utf-8",
        "X-Sentimeant-Semantic-Hold": "active",
        "X-Sentimeant-Public-Audio": "0",
      },
    });
  }

  if (pathname.startsWith(SENTIMEANT_STORY_PREFIX)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  const isCustomerPrivatePath = CUSTOMER_PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isCustomerPrivatePath) {
    const url = request.nextUrl.clone();
    url.pathname = "/find";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/pix/:path*",
    "/mkut/:path*",
    "/sentimeant/:path*",
  ],
};
