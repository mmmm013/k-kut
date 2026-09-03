import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CUSTOMER_PRIVATE_PREFIXES = [
  "/pix",
  "/mkut",
];

const SENTIMEANT_EVIDENCE_AUDIO_PREFIX = "/sentimeant/strict-kk-v001/";
const SENTIMEANT_STORY_PREFIX = "/sentimeant/";

const HUGZ_HOSTS = new Set([
  "13hugz.com",
  "www.13hugz.com",
]);

const HUGZ_KKUT_ONLY_PREFIXES = [
  "/holiday",
  "/themes",
  "/kupid",
  "/wedding",
  "/hug",
  "/tug",
  "/bug",
  "/browse",
  "/pix",
  "/mkut",
  "/sentimeant",
];

const SENTIMEANT_DEFENSIVE_HOSTS = new Set([
  "sentimeants.com",
  "www.sentimeants.com",
]);

const SENTIMEANT_HOSTS = new Set([
  "sentimeant.com",
  "www.sentimeant.com",
]);

const SENTIMEANT_KKUT_ONLY_PREFIXES = [
  "/find",
  "/personal",
  "/holiday",
  "/themes",
  "/kupid",
  "/wedding",
  "/hug",
  "/hugz",
  "/tug",
  "/bug",
  "/browse",
  "/checkout",
  "/pix",
  "/mkut",
];

const CONVENTIONAL_ICON_PATHS = new Set([
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/apple-touch-icon-precomposed.png",
]);

const VEKTOR_HOSTS = new Set([
  "2gdp.com",
  "www.2gdp.com",
]);

const VEKTOR_URL = "https://mc-vektor.vercel.app/the-vektor";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (
    request.headers.get("x-vercel-forwarded-host") ||
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  )
    .split(",")[0]
    .trim()
    .toLowerCase()
    .split(":")[0];

  const [firstSegment, ...restSegments] = pathname.split("/");
  const normalizedFirst = firstSegment ? "" : (restSegments[0] || "");
  const canonicalPrefix = normalizedFirst.toLowerCase();
  const canonicalizePrefixes = new Set([
    "hugs",
    "hugz",
    "hug",
    "tug",
    "bug",
    "browse",
    "find",
    "personal",
    "holiday",
    "themes",
    "kupid",
    "wedding",
    "sentimeant",
    "checkout",
    "pix",
    "mkut",
  ]);

  if (canonicalizePrefixes.has(canonicalPrefix) && normalizedFirst !== canonicalPrefix) {
    const url = request.nextUrl.clone();
    const tail = restSegments.slice(1).join("/");
    url.pathname = `/${canonicalPrefix}${tail ? `/${tail}` : ""}`;
    return NextResponse.redirect(url, 308);
  }

  if (SENTIMEANT_DEFENSIVE_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = "sentimeant.com";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  if (CONVENTIONAL_ICON_PATHS.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/logo.png";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  if (HUGZ_HOSTS.has(host) && (pathname === "/" || pathname === "")) {
    const url = request.nextUrl.clone();
    url.pathname = "/hugz";
    url.search = "";

    const response = NextResponse.rewrite(url);
    response.headers.set("X-13HUGz-Route", "rotating-hugz");
    return response;
  }

  if (
    HUGZ_HOSTS.has(host) &&
    HUGZ_KKUT_ONLY_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  if (
    SENTIMEANT_HOSTS.has(host) &&
    SENTIMEANT_KKUT_ONLY_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

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
    {
      source: "/:path*",
      has: [{ type: "host", value: "sentimeants.com" }],
    },
    {
      source: "/:path*",
      has: [{ type: "host", value: "www.sentimeants.com" }],
    },
    "/",
    "/pix/:path*",
    "/mkut/:path*",
    "/sentimeant/:path*",
    "/find/:path*",
    "/personal/:path*",
    "/holiday/:path*",
    "/themes/:path*",
    "/kupid/:path*",
    "/wedding/:path*",
    "/hug/:path*",
    "/hugz/:path*",
    "/tug/:path*",
    "/bug/:path*",
    "/browse/:path*",
    "/checkout/:path*",
    "/favicon.ico",
    "/apple-touch-icon.png",
    "/apple-touch-icon-precomposed.png",
    "/:path*",
  ],
};
