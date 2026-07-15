import { NextRequest, NextResponse } from "next/server";
import { createPendingH2Order } from "@/lib/h2PendingOrder";

export const runtime = "nodejs";

const REGULAR_HUG_PAYMENT_URL =
  "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";
const REGULAR_HUG_PRICE_CENTS = 799;
const PERSONAL_NOTE_WORD_LIMIT = 13;
const PERSONAL_NOTE_CHARACTER_LIMIT = 160;
const CLIENT_REFERENCE_LIMIT = 200;
const H2_CLIENT_REFERENCE_PREFIX = "H2_";
const BF_PROFILE = "k-kut";
const PUBLIC_PRODUCT_NAME = "K-KUT HUG";

function returnToBrowse(request: NextRequest, reason: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/browse";
  url.search = `?checkout=${encodeURIComponent(reason)}`;
  return NextResponse.redirect(url);
}

function safeInventoryId(value: FormDataEntryValue | string | null) {
  const candidate = typeof value === "string" ? value.trim() : "";
  return /^[A-Za-z0-9_-]{1,200}$/.test(candidate) ? candidate : "";
}

function safeOffer(value: FormDataEntryValue | string | null) {
  return value === "hug" ? "hug" : null;
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

async function regularHugCheckout(
  request: NextRequest,
  inventoryId: string,
  personalNote: string,
) {
  const personalNoteWordCount = countWords(personalNote);

  if (personalNoteWordCount > PERSONAL_NOTE_WORD_LIMIT) {
    return returnToBrowse(request, "personal-note-over-13-words");
  }

  let token: string;
  try {
    token = await createPendingH2Order({
      inventoryId,
      personalNote,
      bfProfile: BF_PROFILE,
      originDomain: originDomain(request),
      publicProductName: PUBLIC_PRODUCT_NAME,
    });
  } catch (reason) {
    console.error(
      "H2_PENDING_ORDER_CREATE_FAILED",
      reason instanceof Error ? reason.message : "unidentified_error",
    );
    return returnToBrowse(request, "pending-order-unavailable");
  }

  const clientReference = `${H2_CLIENT_REFERENCE_PREFIX}${token}`;
  if (
    clientReference.length > CLIENT_REFERENCE_LIMIT ||
    !/^[A-Za-z0-9_-]+$/.test(clientReference)
  ) {
    return returnToBrowse(request, "pending-order-reference-invalid");
  }

  const checkoutUrl = new URL(REGULAR_HUG_PAYMENT_URL);
  checkoutUrl.searchParams.set("client_reference_id", clientReference);
  checkoutUrl.searchParams.set("utm_source", BF_PROFILE);
  checkoutUrl.searchParams.set("utm_medium", "storefront");
  checkoutUrl.searchParams.set("utm_campaign", "ii_catalog");
  checkoutUrl.searchParams.set("utm_content", personalNote ? "hug_with_note" : "hug");

  return NextResponse.redirect(checkoutUrl);
}

export async function GET(request: NextRequest) {
  const inventoryId = safeInventoryId(request.nextUrl.searchParams.get("ii"));
  const offer = safeOffer(request.nextUrl.searchParams.get("offer"));

  if (!inventoryId) {
    return returnToBrowse(request, "invalid-selection");
  }

  if (!offer) {
    return returnToBrowse(request, "invalid-offer");
  }

  return regularHugCheckout(request, inventoryId, "");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const inventoryId = safeInventoryId(formData.get("ii"));
  const offer = safeOffer(formData.get("offer"));
  const personalNote = normalizePersonalNote(formData.get("personal_note"));

  if (!inventoryId) {
    return returnToBrowse(request, "invalid-selection");
  }

  if (!offer) {
    return returnToBrowse(request, "invalid-offer");
  }

  return regularHugCheckout(request, inventoryId, personalNote);
}
