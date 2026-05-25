import { NextRequest, NextResponse } from "next/server";

const PERSONAL_HUG_STRIPE_LINK =
  "https://buy.stripe.com/28EfZg6gme6S8hS1l44ow0r";

const WEDDING_TRACK_PACK_STRIPE_LINK =
  "https://buy.stripe.com/bJe5kCeMSd2OeGg4xg4ow0q";

const ROUTINE_PRODUCTS = new Set([
  "birthday",
  "anniversary",
  "apology",
  "thank-you",
  "personal",
  "love",
  "encouragement",
  "comfort",
  "missing-you",
  "friendship",
  "best-friend",
  "family",
  "new-baby",
  "get-well",
  "recovery",
  "sympathy",
  "grief",
  "memorial",
  "celebration-of-life",
  "graduation",
  "retirement",
  "congratulations",
  "hang-tough",
  "hope",
  "self-esteem",
  "thinking-of-you",
  "just-because"
]);

export async function GET(request: NextRequest) {
  const product = request.nextUrl.searchParams.get("product")?.trim() ?? "";
  const kk = request.nextUrl.searchParams.get("kk")?.trim() ?? "";
  const source = request.nextUrl.searchParams.get("source")?.trim() ?? "";

  if (product === "wedding") {
    return NextResponse.redirect(WEDDING_TRACK_PACK_STRIPE_LINK);
  }

  if (product && ROUTINE_PRODUCTS.has(product)) {
    return NextResponse.redirect(PERSONAL_HUG_STRIPE_LINK);
  }

  if (kk || source) {
    return NextResponse.redirect(PERSONAL_HUG_STRIPE_LINK);
  }

  return NextResponse.redirect(new URL("/hug", request.url));
}
