import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_HUG_PAYMENT_URL =
  "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";

const APPROVED_PAYMENT_LINKS = new Set([
  "https://buy.stripe.com/4gM6oG5cifaW41C7Js4ow0t",
  "https://buy.stripe.com/bJeaEW8ou2oa0PqfbU4ow0u",
  "https://buy.stripe.com/dRm6oG34agf0dCcaVE4ow0v",
  "https://buy.stripe.com/cNi28qfQW4wi41C7Js4ow0s",
  "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",
  "https://buy.stripe.com/28EfZg6gme6S8hS1l44ow0r",
  "https://buy.stripe.com/bJe5kCeMSd2OeGg4xg4ow0q",
  "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y",
  "https://buy.stripe.com/aFabJ0cEK5Amaq09RA4ow0A",
  "https://buy.stripe.com/aFadR8eMS5Am55G2p84ow0x",
]);

type CheckoutOffer = "short_kut" | "hug" | "big_hug";

function configuredLink(offer: CheckoutOffer) {
  if (offer === "short_kut") {
    return process.env.NEXT_PUBLIC_KKUT_SHORT_KUT_PAYMENT_URL || "";
  }

  if (offer === "big_hug") {
    return process.env.NEXT_PUBLIC_KKUT_BIG_HUG_PAYMENT_URL || "";
  }

  return (
    process.env.NEXT_PUBLIC_KKUT_HUG_PAYMENT_URL ||
    process.env.NEXT_PUBLIC_TAILORED_HUG_PAYMENT_URL ||
    DEFAULT_HUG_PAYMENT_URL
  );
}

function safeOffer(value: string | null): CheckoutOffer | null {
  if (value === "short_kut" || value === "hug" || value === "big_hug") {
    return value;
  }
  return null;
}

function returnToBrowse(request: NextRequest, reason: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/browse";
  url.search = `?checkout=${encodeURIComponent(reason)}`;
  return NextResponse.redirect(url);
}

export function GET(request: NextRequest) {
  const inventoryId = request.nextUrl.searchParams.get("ii") || "";
  const offer = safeOffer(request.nextUrl.searchParams.get("offer"));

  if (!/^[A-Za-z0-9_-]{1,200}$/.test(inventoryId)) {
    return returnToBrowse(request, "invalid-selection");
  }

  if (!offer) {
    return returnToBrowse(request, "invalid-offer");
  }

  const paymentLink = configuredLink(offer);
  if (!paymentLink || !APPROVED_PAYMENT_LINKS.has(paymentLink)) {
    return returnToBrowse(request, "offer-checkout-held");
  }

  const checkoutUrl = new URL(paymentLink);
  checkoutUrl.searchParams.set("client_reference_id", inventoryId);
  checkoutUrl.searchParams.set("utm_source", "k-kut");
  checkoutUrl.searchParams.set("utm_medium", "storefront");
  checkoutUrl.searchParams.set("utm_campaign", "ii_catalog");
  checkoutUrl.searchParams.set("utm_content", offer);

  return NextResponse.redirect(checkoutUrl);
}
