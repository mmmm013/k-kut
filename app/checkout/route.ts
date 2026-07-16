import { NextRequest, NextResponse } from "next/server";
import { createPendingH2Order } from "@/lib/h2PendingOrder";

export const runtime = "nodejs";

const REGULAR_HUG_PAYMENT_URL =
  "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";
const SHORT_KUT_PRICE_CENTS = 499;
const REGULAR_HUG_PRICE_CENTS = 799;
const BIG_HUG_PRICE_CENTS = 1299;
const PERSONAL_NOTE_WORD_LIMIT = 13;
const PERSONAL_NOTE_CHARACTER_LIMIT = 160;
const CLIENT_REFERENCE_LIMIT = 200;
const H2_CLIENT_REFERENCE_PREFIX = "H2_";
const BF_PROFILE = "k-kut";
const STRIPE_REDIRECT_STATUS = 303;

const CURATED_SHORT_KUT_IDS = new Set(["thank-you-cc-012"]);
const CURATED_BIG_HUG_IDS = new Set(["thank-you-kk7"]);

type OfferCode = "short" | "hug" | "big";

type OfferConfig = {
  code: OfferCode;
  publicProductName: "Short KUT" | "HUG" | "Big HUG";
  priceCents: 499 | 799 | 1299;
  paymentUrl: string;
};

function configuredPaymentUrl(value: string | undefined) {
  const candidate = String(value || "").trim();
  if (!candidate) return "";

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && url.hostname === "buy.stripe.com"
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function offerConfig(offer: OfferCode): OfferConfig {
  if (offer === "short") {
    return {
      code: "short",
      publicProductName: "Short KUT",
      priceCents: SHORT_KUT_PRICE_CENTS,
      paymentUrl: configuredPaymentUrl(
        process.env.NEXT_PUBLIC_MD_MOMENT_KK_LINK,
      ),
    };
  }

  if (offer === "big") {
    return {
      code: "big",
      publicProductName: "Big HUG",
      priceCents: BIG_HUG_PRICE_CENTS,
      paymentUrl: configuredPaymentUrl(
        process.env.NEXT_PUBLIC_MD_FEATURED_KK_LINK,
      ),
    };
  }

  return {
    code: "hug",
    publicProductName: "HUG",
    priceCents: REGULAR_HUG_PRICE_CENTS,
    paymentUrl: REGULAR_HUG_PAYMENT_URL,
  };
}

function returnToStore(
  request: NextRequest,
  reason: string,
  offer: OfferCode | null,
) {
  const url = request.nextUrl.clone();
  url.pathname = offer === "hug" ? "/browse" : "/";
  url.search = `?checkout=${encodeURIComponent(reason)}`;
  return NextResponse.redirect(url, STRIPE_REDIRECT_STATUS);
}

function safeInventoryId(value: FormDataEntryValue | string | null) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z0-9_-]{1,200}$/.test(candidate) ? candidate : "";
}

function safeOffer(value: FormDataEntryValue | string | null): OfferCode | null {
  return value === "short" || value === "hug" || value === "big"
    ? value
    : null;
}

function offerAllowsInventory(offer: OfferCode, inventoryId: string) {
  if (offer === "short") return CURATED_SHORT_KUT_IDS.has(inventoryId);
  if (offer === "big") return CURATED_BIG_HUG_IDS.has(inventoryId);
  return Boolean(inventoryId);
}

function normalizePersonalNote(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/gu, " ").trim().slice(0, PERSONAL_NOTE_CHARACTER_LIMIT);
}

function countWords(value: string) {
  return value ? value.split(/\s+/u).filter(Boolean).length : 0;
}

function originDomain(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0];
  const host = (forwardedHost || request.headers.get("host") || "k-kut.com")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/u, "");

  return /^[A-Za-z0-9.-]{1,253}$/.test(host) ? host : "k-kut.com";
}

async function governedCheckout(
  request: NextRequest,
  inventoryId: string,
  offer: OfferCode,
  personalNote: string,
) {
  const personalNoteWordCount = countWords(personalNote);

  if (personalNoteWordCount > PERSONAL_NOTE_WORD_LIMIT) {
    return returnToStore(request, "personal-note-over-13-words", offer);
  }

  if (!offerAllowsInventory(offer, inventoryId)) {
    return returnToStore(request, "offer-inventory-mismatch", offer);
  }

  const config = offerConfig(offer);
  if (!config.paymentUrl) {
    return returnToStore(request, "payment-link-unavailable", offer);
  }

  let token: string;
  try {
    token = await createPendingH2Order({
      inventoryId,
      personalNote,
      bfProfile: BF_PROFILE,
      originDomain: originDomain(request),
      publicProductName: config.publicProductName,
    });
  } catch (reason) {
    console.error(
      "H2_PENDING_ORDER_CREATE_FAILED",
      reason instanceof Error ? reason.message : "unidentified_error",
    );
    return returnToStore(request, "pending-order-unavailable", offer);
  }

  const clientReference = `${H2_CLIENT_REFERENCE_PREFIX}${token}`;
  if (
    clientReference.length > CLIENT_REFERENCE_LIMIT ||
    !/^[A-Za-z0-9_-]+$/.test(clientReference)
  ) {
    return returnToStore(request, "pending-order-reference-invalid", offer);
  }

  const checkoutUrl = new URL(config.paymentUrl);
  checkoutUrl.searchParams.set("client_reference_id", clientReference);
  checkoutUrl.searchParams.set("utm_source", BF_PROFILE);
  checkoutUrl.searchParams.set("utm_medium", "storefront");
  checkoutUrl.searchParams.set("utm_campaign", `home_${config.code}`);
  checkoutUrl.searchParams.set(
    "utm_content",
    personalNote ? `${config.code}_with_note` : config.code,
  );

  // 303 converts the completed storefront POST into a normal GET for Stripe.
  // A 307 would preserve POST and Stripe CloudFront rejects that method with 403.
  return NextResponse.redirect(checkoutUrl, STRIPE_REDIRECT_STATUS);
}

export async function GET(request: NextRequest) {
  const inventoryId = safeInventoryId(request.nextUrl.searchParams.get("ii"));
  const offer = safeOffer(request.nextUrl.searchParams.get("offer"));

  if (!inventoryId) {
    return returnToStore(request, "invalid-selection", offer);
  }

  if (!offer) {
    return returnToStore(request, "invalid-offer", null);
  }

  return governedCheckout(request, inventoryId, offer, "");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const inventoryId = safeInventoryId(formData.get("ii"));
  const offer = safeOffer(formData.get("offer"));
  const personalNote = normalizePersonalNote(formData.get("personal_note"));

  if (!inventoryId) {
    return returnToStore(request, "invalid-selection", offer);
  }

  if (!offer) {
    return returnToStore(request, "invalid-offer", null);
  }

  return governedCheckout(request, inventoryId, offer, personalNote);
}
