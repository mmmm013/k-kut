import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminSessionCookieValue, validAdminToken } from "@/lib/admin/adminSession";

export const dynamic = "force-dynamic";

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
