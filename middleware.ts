import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CUSTOMER_PRIVATE_PREFIXES = [
  "/pix",
  "/mkut",
];

const SENTIMEANT_STORY_PREFIX = "/sentimeant/";

const HUGZ_HOSTS = new Set([
  "13hugz.com",
  "www.13hugz.com",
]);

const VEKTOR_HOSTS = new Set([
  "2gdp.com",
  "www.2gdp.com",
]);

const VEKTOR_URL = "https://mc-vektor.vercel.app/the-vektor";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.toLowerCase().split(":")[0] || "";

  if (HUGZ_HOSTS.has(host) && (pathname === "/" || pathname === "")) {
    const url = request.nextUrl.clone();
    url.pathname = "/hugz";
    url.search = "";

    const response = NextResponse.rewrite(url);
    response.headers.set("X-13HUGz-Route", "rotating-hugz");
    return response;
  }

  if (VEKTOR_HOSTS.has(host) && (pathname === "/" || pathname === "")) {
    return NextResponse.redirect(VEKTOR_URL);
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
