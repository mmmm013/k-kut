import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CUSTOMER_PRIVATE_PREFIXES = [
  "/pix",
  "/mkut",
];

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
  ],
};
