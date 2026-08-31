import { NextRequest, NextResponse } from "next/server";
import { findApprovedIiReleaseByPublicOptionId } from "@/lib/approvedIiRelease";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function returnToRelease(request: NextRequest, reason: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/approved-iis";
  url.search = `?checkout=${reason}`;
  return NextResponse.redirect(url, 303);
}

function lockedPaymentLink(value: string | undefined): URL | null {
  try {
    const url = new URL(String(value || "").trim());
    if (url.protocol !== "https:" || url.hostname !== "buy.stripe.com") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const publicOptionId = request.nextUrl.searchParams.get("id") || "";
  const item = findApprovedIiReleaseByPublicOptionId(publicOptionId);
  if (!item) return returnToRelease(request, "invalid-ii");

  const configured =
    item.container === "holiday_hug"
      ? process.env.K_KUT_HOLIDAY_HUG_STRIPE_PAYMENT_LINK
      : process.env.K_KUT_REGULAR_HUG_STRIPE_PAYMENT_LINK;
  const paymentLink = lockedPaymentLink(configured);
  if (!paymentLink) return returnToRelease(request, "held");

  paymentLink.searchParams.set("client_reference_id", item.publicOptionId);
  paymentLink.searchParams.set("utm_source", "k-kut");
  paymentLink.searchParams.set("utm_medium", "approved-ii-release");
  paymentLink.searchParams.set("utm_content", item.publicOptionId);

  const response = NextResponse.redirect(paymentLink, 303);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
