import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const expectedToken = process.env.ADMIN_PREVIEW_TOKEN?.trim();
  const suppliedToken = request.nextUrl.searchParams.get("token")?.trim();

  if (!expectedToken || suppliedToken !== expectedToken) {
    return new NextResponse("Not found", {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/pix", "/pix/:path*"],
};
