import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const REGULAR_HUG_PAYMENT_URL =
  "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";
const REGULAR_HUG_PRICE_CENTS = 799;
const PERSONAL_NOTE_WORD_LIMIT = 13;
const PERSONAL_NOTE_CHARACTER_LIMIT = 160;
const CLIENT_REFERENCE_LIMIT = 200;
const CLIENT_REFERENCE_PREFIX = "H1|";

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

function buildClientReference(inventoryId: string, personalNote: string) {
  if (!personalNote) return inventoryId;

  const reference = `${CLIENT_REFERENCE_PREFIX}${inventoryId}|${personalNote}`;
  return reference.length <= CLIENT_REFERENCE_LIMIT ? reference : "";
}

function regularHugCheckout(
  request: NextRequest,
  inventoryId: string,
  personalNote: string,
) {
  const personalNoteWordCount = countWords(personalNote);

  if (personalNoteWordCount > PERSONAL_NOTE_WORD_LIMIT) {
    return returnToBrowse(request, "personal-note-over-13-words");
  }

  const clientReference = buildClientReference(inventoryId, personalNote);
  if (!clientReference) {
    return returnToBrowse(request, "personal-note-reference-too-long");
  }

  const checkoutUrl = new URL(REGULAR_HUG_PAYMENT_URL);
  checkoutUrl.searchParams.set("client_reference_id", clientReference);
  checkoutUrl.searchParams.set("utm_source", "k-kut");
  checkoutUrl.searchParams.set("utm_medium", "storefront");
  checkoutUrl.searchParams.set("utm_campaign", "ii_catalog");
  checkoutUrl.searchParams.set("utm_content", personalNote ? "hug_with_note" : "hug");

  return NextResponse.redirect(checkoutUrl);
}

export function GET(request: NextRequest) {
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
