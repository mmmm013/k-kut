import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminSessionCookieValue, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";

// Same-origin form login keeps the owner token out of URLs and browser history.
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const body = await request.text();
  if (body.length > 4096) return new NextResponse("Request too large", { status: 413 });
  const token = new URLSearchParams(body).get("token");
  if (!validAdminToken(token)) return new NextResponse("Owner access could not be verified", {
    status: 401, headers: { "Cache-Control": "private, no-store" },
  });
  const response = NextResponse.redirect(new URL("/admin/stl-listen", request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, adminSessionCookieValue(), {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!validAdminToken(token)) return new NextResponse("Not found", { status: 404 });

  const destination = request.nextUrl.searchParams.get("next") || "/admin/kut-reviewer";
  const safeDestination = destination.startsWith("/admin/") ? destination : "/admin/kut-reviewer";
  const response = NextResponse.redirect(new URL(safeDestination, request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, adminSessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}
