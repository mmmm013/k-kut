import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const kk = request.nextUrl.searchParams.get("kk");

  if (!kk) {
    return NextResponse.redirect(new URL("/mothers-day/thank-you", request.url));
  }

  const apiUrl = new URL("/api/donate", request.url);
  apiUrl.searchParams.set("kk", kk);

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ kk }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.redirect(new URL("/mothers-day/thank-you", request.url));
  }

  const data = await response.json();

  if (!data?.url || typeof data.url !== "string") {
    return NextResponse.redirect(new URL("/mothers-day/thank-you", request.url));
  }

  return NextResponse.redirect(data.url);
}
